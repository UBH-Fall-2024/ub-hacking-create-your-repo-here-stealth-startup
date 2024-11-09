import * as vscode from "vscode";
import { checkCodeSelection } from "../utils/checkCodeSelection";
import { promptForConfiguration } from "../utils/configHelpers";
import { checkAndRunLlama } from "../utils/ollamaHelpers";

export async function runVsCodeMama() {
  const config = vscode.workspace.getConfiguration("vscode-momma");
  const openaiKey = config.get("apiTokens.openai");
  const claudeKey = config.get("apiTokens.claudeAi");
  const ollamaSelected = config.get("apiTokens.ollamaSelected");

  if (openaiKey) {
    vscode.window.showInformationMessage("Using OpenAI with your configured API key.");
    runOpenAI();
  } else if (claudeKey) {
    vscode.window.showInformationMessage("Using Claude.ai with your configured API key.");
    runClaudeAI();
  } else if (ollamaSelected) {
    checkAndRunLlama();
  } else {
    promptForConfiguration(config);
  }
}

function runOpenAI() {
  vscode.window.showInformationMessage("Running OpenAI functionality...");
  checkCodeSelection();
}

function runClaudeAI() {
  vscode.window.showInformationMessage("Running Claude.ai functionality...");
}
