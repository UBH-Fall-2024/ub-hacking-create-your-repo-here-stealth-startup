import * as vscode from "vscode";

export async function checkCodeSelection(): Promise<{ text: string; selection: vscode.Selection | null; language: string | null }> {
  const editor = vscode.window.activeTextEditor;
  if (editor) {
    const document = editor.document;
    const language = document.languageId; // Get the language ID of the document
    const selection = editor.selection;

    if (selection.isEmpty) {
      vscode.window.showInformationMessage("No text selected. Using the entire file.");
      // console.log("No text selected. Using the entire file.");
      return { text: document.getText(), selection: null, language }; // Return entire document content and language
    } else {
      vscode.window.showInformationMessage(`Using selected text from lines ${selection.start.line + 1} to ${selection.end.line + 1}.`);
      return { text: document.getText(selection), selection, language }; // Return selected text, selection range, and language
    }
  }

  return { text: "", selection: null, language: null }; // Return empty if no editor is active
}


export async function replaceSelectedText(newText: string, selection: vscode.Selection | null) {
  const editor = vscode.window.activeTextEditor;
  if (editor) {
    await editor.edit(editBuilder => {
      if (selection) {
        // Replace only the selected text
        editBuilder.replace(selection, newText);
      } else {
        // Replace entire document content
        const fullRange = new vscode.Range(
          editor.document.positionAt(0),
          editor.document.positionAt(editor.document.getText().length)
        );
        editBuilder.replace(fullRange, newText);
      }
    });
  }
}
