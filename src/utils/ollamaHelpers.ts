import * as vscode from "vscode";
import { exec } from "child_process";

export function checkAndRunLlama(): Promise<boolean> {
  return new Promise((resolve) => {
    exec("ollama -v", (error, stdout, stderr) => {
      if (error) {
        console.error(stderr);
        console.log("ERROR");
        vscode.window.showWarningMessage("Llama LLM is not installed. Would you like to download it?", "Download").then(selection => {
          if (selection === "Download") {
            vscode.env.openExternal(vscode.Uri.parse("https://ollama.com/download"));
          }
        });
        resolve(false);
      } else {
        vscode.window.showInformationMessage("Llama LLM is installed and ready to use locally!");
        runLlamaLocally();
        resolve(true);
      }
    });
  });
}

function runLlamaLocally() {
  exec("ollama run llama3.2", (error, stdout, stderr) => {
    if (error) {
      vscode.window.showErrorMessage("Failed to run Llama locally.");
      console.error(stderr);
    } else {
      vscode.window.showInformationMessage("Llama 3.2 is running locally!");
      console.log(stdout);
    }
  });
}
