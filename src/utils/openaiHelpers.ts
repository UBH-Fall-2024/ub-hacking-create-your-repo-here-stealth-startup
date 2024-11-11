import * as vscode from "vscode";
import OpenAI from "openai";

export async function callOpenAI(prompt: string): Promise<string> {
  try {
    // Access the OpenAI API key from the VS Code settings
    const config = vscode.workspace.getConfiguration("vscode-momma");
    const apiKey = config.get<string>("apiTokens.openai");

    if (!apiKey) {
      throw new Error("OpenAI API key is not set. Please configure it in the extension settings.");
    }

    // Initialize the OpenAI client with the API key
    const openai = new OpenAI({ apiKey });

    // Create the completion with gpt-4o-mini
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: prompt }
      ]
    });
    // console.log(completion);

    // Return the response content from the OpenAI API
    return completion.choices[0].message?.content ?? "";
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    throw error;
  }
}
