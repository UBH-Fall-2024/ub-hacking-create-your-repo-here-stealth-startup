import * as vscode from "vscode";
import { promptForConfiguration } from "../utils/configHelpers";
import { callOpenAI } from "../utils/openaiHelpers";
import { callClaudeAI } from "../utils/claudeHelpers";
import OllamaService from "../utils/ollamaHelpers";
import { CLEAN_CODE_PROMPT } from "../utils/constants";
import { checkCodeSelection, replaceSelectedText } from "../utils/checkCodeSelection";

export async function runVsCodeMama() {
  const config = vscode.workspace.getConfiguration("vscode-momma");
  const openaiKey = config.get("apiTokens.openai");
  const claudeKey = config.get("apiTokens.claudeAi");
  const ollamaSelected = config.get<boolean>("apiTokens.ollamaSelected");

  const { text: codeText, selection, language } = await checkCodeSelection();
  const prompt = `${CLEAN_CODE_PROMPT}\n\nIn ${language} Programming Language\n\n${codeText}`;
  let aiResponse = "";

  if (openaiKey) {
    vscode.window.showInformationMessage("Using OpenAI with your configured API key.");
    aiResponse = await callOpenAI(prompt);
  } else if (claudeKey) {
    vscode.window.showInformationMessage("Using Claude.ai with your configured API key.");
    aiResponse = await callClaudeAI(prompt);
  } else if (ollamaSelected) {
    const ollamaService = new OllamaService();
    const ollamaReady = await ollamaService.checkAndRunLlama();

    if (ollamaReady) {
      const port = await ollamaService.findOllamaPort();
      if (port) {
        aiResponse = await ollamaService.sendMessage("llama3.2", prompt);
      } else {
        vscode.window.showErrorMessage("Unable to connect to Ollama on the expected ports.");
      }
    }
  } else {
    promptForConfiguration(config);
  }

  if (aiResponse) {
    aiResponse = cleanAIResponse(aiResponse);
    await replaceSelectedText(aiResponse, selection);
  }
}

function cleanAIResponse(response: string): string {
  const lines = response.split("\n");
  if (lines[0].startsWith("```")) {
    lines.shift();
  }
  if (lines[lines.length - 1].startsWith("```")) {
    lines.pop();
  }
  return lines.join("\n").trim();
}
