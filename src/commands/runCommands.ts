import * as vscode from "vscode";
import { promptForConfiguration } from "../utils/configHelpers";
import { callOpenAI } from "../utils/openaiHelpers";
import { callClaudeAI } from "../utils/claudeHelpers";
import OllamaService from "../utils/ollamaHelpers";
import { CLEAN_CODE_PROMPT } from "../utils/constants";
import {
  checkCodeSelection,
  replaceSelectedText,
} from "../utils/checkCodeSelection";

export async function runVsCodeMama() {
  const config = vscode.workspace.getConfiguration("vscode-momma");
  const openaiKey = config.get("apiTokens.openai");
  const claudeKey = config.get("apiTokens.claudeAi");
  const ollamaSelected = config.get<boolean>("apiTokens.ollamaSelected");

  const { text: codeText, selection, language } = await checkCodeSelection();
  const prompt = `${CLEAN_CODE_PROMPT}\n\nIn ${language} Programming Language\n\n${codeText}`;

  let aiResponse = "";

  // Show loading animation while the AI processes the code cleaning
  aiResponse = await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      cancellable: false,
    },
    async (progress, token) => {
      // We are using an asynchronous function to handle the progress
      let dots = 1;
      const loadingInterval = setInterval(() => {
        if (dots > 3) {
          dots = 1;
        }
        progress.report({ message: `Cleaning Code${".".repeat(dots)}` });
        dots++;
      }, 500);

      // Process the AI request based on the available keys
      if (openaiKey) {
        vscode.window.showInformationMessage(
          "Using OpenAI with your configured API key."
        );
        aiResponse = await callOpenAI(prompt);
      } else if (claudeKey) {
        vscode.window.showInformationMessage(
          "Using Claude.ai with your configured API key."
        );
        aiResponse = await callClaudeAI(prompt);
      } else if (ollamaSelected) {
        const ollamaService = new OllamaService();
        const ollamaReady = await ollamaService.checkAndRunLlama();

        if (ollamaReady) {
          const port = await ollamaService.findOllamaPort();
          if (port) {
            aiResponse = await ollamaService.sendMessage("llama3.2", prompt);
          } else {
            vscode.window.showErrorMessage(
              "Unable to connect to Ollama on the expected ports."
            );
          }
        }
      } else {
        promptForConfiguration(config);
      }

      // Clear the loading animation once the AI response is obtained
      clearInterval(loadingInterval);

      return aiResponse;
    }
  );

  // If AI returned a valid response, clean the AI output and replace text in the file
  if (aiResponse) {
    aiResponse = cleanAIResponse(aiResponse);
    await replaceSelectedText(aiResponse, selection);
  }
}

function cleanAIResponse(response: string): string {
  const lines = response.split("\n");
  if (lines[0].startsWith("```")) {
    lines.shift(); // Remove starting code block
  }
  if (lines[lines.length - 1].startsWith("```")) {
    lines.pop(); // Remove ending code block
  }
  return lines.join("\n").trim();
}
