import * as vscode from "vscode";

export async function promptForConfiguration(config: vscode.WorkspaceConfiguration) {
  const selectedProvider = await vscode.window.showQuickPick(["OpenAI", "Claude.ai", "Ollama (local)"], {
    placeHolder: "Select the LLM provider to configure"
  });

  if (selectedProvider) {
    if (selectedProvider === "Ollama (local)") {
      await config.update("apiTokens.ollamaSelected", true, vscode.ConfigurationTarget.Global);
      vscode.window.showInformationMessage("Ollama selected for local usage.");
    } else {
      const apiKey = await vscode.window.showInputBox({
        prompt: `Enter your API key for ${selectedProvider}`,
        ignoreFocusOut: true,
        password: true,
      });

      if (apiKey) {
        const keyName = selectedProvider === "OpenAI" ? "apiTokens.openai" : "apiTokens.claudeAi";
        await config.update(keyName, apiKey, vscode.ConfigurationTarget.Global);
        vscode.window.showInformationMessage(`API key for ${selectedProvider} saved successfully!`);
      } else {
        vscode.window.showWarningMessage("API key input was canceled.");
      }
    }
  } else {
    vscode.window.showWarningMessage("No provider selected. Please configure an API key to proceed.");
  }
}
