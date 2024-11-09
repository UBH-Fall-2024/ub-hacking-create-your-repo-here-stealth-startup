import * as vscode from "vscode";

async function checkCodeSelection() {
  const editor = vscode.window.activeTextEditor;
  if (editor) {
    const selection = editor.selection;

    if (selection.isEmpty) {
      console.log("No text selected. Assuming entire file is selected.");
      const document = editor.document;
      const fullText = document.getText();
      console.log("Entire document content:\n", fullText);
      vscode.window.showInformationMessage(
        "No text selected. Assuming entire file is selected."
      );
    } else {
      const selectedText = editor.document.getText(selection);
      console.log(
        `Text selected from line ${selection.start.line + 1} to line ${
          selection.end.line + 1
        }.`
      );
      console.log("Selected code:\n", selectedText);
      vscode.window.showInformationMessage(
        `Text selected from line ${selection.start.line + 1} to line ${
          selection.end.line + 1
        }.`
      );
    }
  }
}

export function activate(context: vscode.ExtensionContext) {
  console.log('Your extension "vscode-momma" is now active!');

  // Register the command to check code selection
  const disposable = vscode.commands.registerCommand(
    "vscode-momma.VsCodeMama",
    () => {
      checkCodeSelection();
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
