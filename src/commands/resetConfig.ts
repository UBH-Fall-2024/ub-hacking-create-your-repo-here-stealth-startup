import * as vscode from "vscode";

export async function resetConfig() {
  const config = vscode.workspace.getConfiguration("vscode-momma");

  const confirm = await vscode.window.showWarningMessage(
    "Are you sure you want to reset VsCode Momma configuration?",
    { modal: true },
    "Yes",
    "No"
  );

  if (confirm === "Yes") {
    await config.update("apiTokens.openai", undefined, vscode.ConfigurationTarget.Global);
    await config.update("apiTokens.claudeAi", undefined, vscode.ConfigurationTarget.Global);
    await config.update("apiTokens.ollamaSelected", false, vscode.ConfigurationTarget.Global);
    vscode.window.showInformationMessage("VsCode Momma configuration has been reset.");
  } else {
    vscode.window.showInformationMessage("Reset configuration cancelled.");
  }
}
