import * as vscode from "vscode";
import axios from "axios";

export async function callClaudeAI(prompt: string): Promise<string> {
  try {
    // Access the Claude.ai API key from the VS Code settings
    const config = vscode.workspace.getConfiguration("vscode-momma");
    const apiKey = config.get<string>("apiTokens.claudeAi");

    if (!apiKey) {
      throw new Error("Claude.ai API key is not set. Please configure it in the extension settings.");
    }

    // API endpoint for Claude's completions
    const endpoint = "https://api.claude.ai/v1/complete"; // Update with the correct Claude endpoint

    // Make the API request to Claude
    const response = await axios.post(
      endpoint,
      {
        model: "claude-2", // Specify Claude model, if required
        prompt: prompt,
        max_tokens_to_sample: 1024,
        temperature: 0.7,
      },
      {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Return the response content from Claude
    return response.data.completion ?? "";
  } catch (error) {
    console.error("Error calling Claude.ai API:", error);
    throw error;
  }
}
