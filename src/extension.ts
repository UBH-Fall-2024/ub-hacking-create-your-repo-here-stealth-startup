import * as vscode from "vscode";
import { runVsCodeMama } from "./commands/runCommands";
import { resetConfig } from "./commands/resetConfig";

export function activate(context: vscode.ExtensionContext) {
  console.log('Your extension "vscode-momma" is now active!');

  const disposable = vscode.commands.registerCommand("vscode-momma.VsCodeMama", runVsCodeMama);
  const resetDisposable = vscode.commands.registerCommand("vscode-momma.resetConfig", resetConfig);

  context.subscriptions.push(disposable);
  context.subscriptions.push(resetDisposable);
}

export function deactivate() {}
