import * as vscode from "vscode";

export async function promptForConfiguration(
  config: vscode.WorkspaceConfiguration
) {
  // Display a loading animation while the user is selecting an AI provider
  const selectedProvider = await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      cancellable: false,
    },
    async (progress, token) => {
      // We are using an asynchronous function to handle the progress
      // Create the dots animation
      let dots = 1;
      const loadingInterval = setInterval(() => {
        if (dots > 3) {
          dots = 1;
        }
        progress.report({ message: `Loading${".".repeat(dots)}` });
        dots++;
      }, 500);

      // Wait for the user to select an AI provider
      const selectedProvider = await vscode.window.showQuickPick(
        ["OpenAI", "Claude.ai", "Ollama (local)"],
        {
          placeHolder: "Select the LLM provider to configure",
        }
      );

      // Clear the loading animation once the user selects an option
      clearInterval(loadingInterval);

      // Return the selected provider to proceed with the configuration
      return selectedProvider;
    }
  );

  if (selectedProvider) {
    if (selectedProvider === "Ollama (local)") {
      await config.update(
        "apiTokens.ollamaSelected",
        true,
        vscode.ConfigurationTarget.Global
      );
      vscode.window.showInformationMessage("Ollama selected for local usage.");
    } else {
      // Display a loading animation while waiting for the user to input the API key
      const apiKey = await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          cancellable: false,
        },
        async (progress, token) => {
          // We are using an asynchronous function to handle the progress
          // Create the dots animation
          let dots = 1;
          const loadingInterval = setInterval(() => {
            if (dots > 3) {
              dots = 1;
            }
            progress.report({ message: `Loading${".".repeat(dots)}` });
            dots++;
          }, 500);

          // Wait for the user to enter their API key
          const apiKey = await vscode.window.showInputBox({
            prompt: `Enter your API key for ${selectedProvider}`,
            ignoreFocusOut: true,
            password: true,
          });

          // Clear the loading animation once the user inputs the API key or cancels
          clearInterval(loadingInterval);

          return apiKey;
        }
      );

      if (apiKey) {
        const keyName =
          selectedProvider === "OpenAI"
            ? "apiTokens.openai"
            : "apiTokens.claudeAi";
        await config.update(keyName, apiKey, vscode.ConfigurationTarget.Global);
        vscode.window.showInformationMessage(
          `API key for ${selectedProvider} saved successfully!`
        );
      } else {
        vscode.window.showWarningMessage("API key input was canceled.");
      }
    }
  } else {
    vscode.window.showWarningMessage(
      "No provider selected. Please configure an API key to proceed."
    );
  }
}
