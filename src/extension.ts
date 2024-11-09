import * as vscode from "vscode";
import { exec } from "child_process";

// Function to check if there's a code selection
async function checkCodeSelection() {
  const editor = vscode.window.activeTextEditor;
  if (editor) {
    const selection = editor.selection;

    // If no text is selected, assume entire file is selected
    if (selection.isEmpty) {
      console.log("No text selected. Assuming entire file is selected.");
      const document = editor.document;
      const fullText = document.getText(); // Get the entire document text
      console.log("Entire document content:\n", fullText); // Print entire document content
      vscode.window.showInformationMessage(
        "No text selected. Assuming entire file is selected."
      );
    } else {
      // If text is selected, log the range and the actual selected code
      const selectedText = editor.document.getText(selection); // Get the selected block of code
      console.log(
        `Text selected from line ${selection.start.line + 1} to line ${
          selection.end.line + 1
        }.`
      );
      console.log("Selected code:\n", selectedText); // Print the selected code block
      vscode.window.showInformationMessage(
        `Text selected from line ${selection.start.line + 1} to line ${
          selection.end.line + 1
        }.`
      );
    }
  }
}

// Function to run OpenAI functionality (stub)
function runOpenAI() {
  vscode.window.showInformationMessage("Running OpenAI functionality...");
	checkCodeSelection();

}

// Function to run Claude AI functionality (stub)
function runClaudeAI() {
  vscode.window.showInformationMessage("Running Claude.ai functionality...");
}

// Function to run Llama locally (stub)
function runLlamaLocally() {
  vscode.window.showInformationMessage("Running Llama locally...");
}

// Function to prompt the user to configure LLM API keys
async function promptForConfiguration(config: vscode.WorkspaceConfiguration) {
  const selectedProvider = await vscode.window.showQuickPick(
    ["OpenAI", "Claude.ai", "Ollama (local)"],
    { placeHolder: "Select the LLM provider to configure" }
  );

  if (selectedProvider) {
    if (selectedProvider === "Ollama (local)") {
      await config.update(
        "apiTokens.ollamaSelected",
        true,
        vscode.ConfigurationTarget.Global
      );
      vscode.window.showInformationMessage("Ollama selected for local usage.");
      // Run Llama installation check
      exec("llama --version", (error, stdout, stderr) => {
        if (error) {
          vscode.window
            .showWarningMessage(
              "Llama LLM is not installed. Would you like to download it?",
              "Download"
            )
            .then((selection) => {
              if (selection === "Download") {
                vscode.env.openExternal(
                  vscode.Uri.parse("https://ollama.com/download")
                ); // Replace with actual download URL
              }
            });
        } else {
          runLlamaLocally();
        }
      });
    } else {
      const apiKey = await vscode.window.showInputBox({
        prompt: `Enter your API key for ${selectedProvider}`,
        ignoreFocusOut: true,
        password: true,
      });
      // Save the API key to selected Provider in config
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

// This method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {
  console.log('Your extension "vscode-momma" is now active!');


  // Register the main command to configure API keys and run LLM models
  const disposable = vscode.commands.registerCommand(
    "vscode-momma.VsCodeMama",
    async () => {
      const config = vscode.workspace.getConfiguration("vscode-momma");
      const openaiKey = config.get("apiTokens.openai");
      const claudeKey = config.get("apiTokens.claudeAi");
      const ollamaSelected = config.get("apiTokens.ollamaSelected");

      // Check which configuration is available
      if (openaiKey) {
        vscode.window.showInformationMessage(
          "Using OpenAI with your configured API key."
        );
        runOpenAI();
      } else if (claudeKey) {
        vscode.window.showInformationMessage(
          "Using Claude.ai with your configured API key."
        );
        runClaudeAI();
      } else if (ollamaSelected) {
        // Check if Llama is installed locally
        exec("ollama -v", (error, stdout, stderr) => {
          if (error) {
            vscode.window
              .showWarningMessage(
                "Llama LLM is not installed. Would you like to download it?",
                "Download"
              )
              .then((selection) => {
                if (selection === "Download") {
                  vscode.env.openExternal(
                    vscode.Uri.parse("https://ollama.com/download")
                  ); // Replace with actual download URL
                }
              });
            return;
          }

          vscode.window.showInformationMessage(
            "Llama LLM is installed and ready to use locally!"
          );
          // Call function for Llama if it's installed
          runLlamaLocally();
        });
      } else {
        promptForConfiguration(config);
      }
    }
  );

  // Reset configuration command
  const resetDisposable = vscode.commands.registerCommand(
    "vscode-momma.resetConfig",
    async () => {
      const config = vscode.workspace.getConfiguration("vscode-momma");

      // Prompt the user for confirmation
      const confirm = await vscode.window.showWarningMessage(
        "Are you sure you want to reset VsCode Momma configuration?",
        { modal: true },
        "Yes",
        "No"
      );

      if (confirm === "Yes") {
        // Clear the configuration settings
        await config.update(
          "apiTokens.openai",
          undefined,
          vscode.ConfigurationTarget.Global
        );
        await config.update(
          "apiTokens.claudeAi",
          undefined,
          vscode.ConfigurationTarget.Global
        );
        await config.update(
          "apiTokens.ollamaSelected",
          false,
          vscode.ConfigurationTarget.Global
        );
        vscode.window.showInformationMessage(
          "VsCode Momma configuration has been reset."
        );
      } else {
        vscode.window.showInformationMessage("Reset configuration cancelled.");
      }
    }
  );

  // Add all commands to the subscriptions
  context.subscriptions.push(disposable);
  context.subscriptions.push(resetDisposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
