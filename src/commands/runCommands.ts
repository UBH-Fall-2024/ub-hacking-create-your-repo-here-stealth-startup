import * as vscode from "vscode";
import { promptForConfiguration } from "../utils/configHelpers";
import { checkAndRunLlama } from "../utils/ollamaHelpers";
import { callOpenAI } from "../utils/openaiHelpers";
import { callClaudeAI } from "../utils/claudeHelpers";
import { CLEAN_CODE_PROMPT } from "../utils/constants";
import { checkCodeSelection, replaceSelectedText } from "../utils/checkCodeSelection";
import OllamaService from "../ollamaService";


export async function runVsCodeMama() {
  const config = vscode.workspace.getConfiguration("vscode-momma");
  const openaiKey = config.get("apiTokens.openai");
  const claudeKey = config.get("apiTokens.claudeAi");
  const ollamaSelected = config.get<boolean>("apiTokens.ollamaSelected");

  const { text: codeText, selection, language } = await checkCodeSelection();
  const prompt = `${CLEAN_CODE_PROMPT}\n\nIn ${language} Programming Language\n\n${codeText}`;
//   console.log("Prompt:", prompt);   
  
  let aiResponse = "";

  if (openaiKey) {
    vscode.window.showInformationMessage("Using OpenAI with your configured API key.");
    // console.log("OpenAI key is set");
    aiResponse = await callOpenAI(prompt);
  } else if (claudeKey) {
    vscode.window.showInformationMessage("Using Claude.ai with your configured API key.");
    aiResponse = await callClaudeAI(prompt); 
  } else if (ollamaSelected) {
    checkAndRunLlama();
  } else {
    promptForConfiguration(config);
  }

  // Replace selected text or entire document with the AI response
  if (aiResponse) {
    // console.log("AI response:", aiResponse);
    aiResponse = cleanAIResponse(aiResponse);
    await replaceSelectedText(aiResponse, selection);
  }
}

function cleanAIResponse(response: string): string {
    const lines = response.split("\n");
  
    // Check if the first line contains a code fence
    if (lines[0].startsWith("```")) {
      lines.shift(); // Remove the first line
    }
  
    // Check if the last line contains a code fence
    if (lines[lines.length - 1].startsWith("```")) {
      lines.pop(); // Remove the last line
    }
  
    return lines.join("\n").trim(); // Join the lines back and trim whitespace
  }
  
