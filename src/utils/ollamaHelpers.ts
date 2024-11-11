import * as vscode from "vscode";
import { exec } from "child_process";
import axios from 'axios';
import net from 'net';

class OllamaService {
  private OLLAMA_PORTS: number[];
  private port: number | null;

  constructor() {
    this.OLLAMA_PORTS = [11434, 8080, 3000];
    this.port = null;
  }

  async checkAndRunLlama(): Promise<boolean> {
    return new Promise((resolve) => {
        exec("/usr/local/bin/ollama -v", (error, stdout, stderr) => {
        if (error) {
            console.log("ERRORRR");
            console.error(error);
          vscode.window.showWarningMessage("Llama LLM is not installed. Would you like to download it?", "Download").then(selection => {
            if (selection === "Download") {
              vscode.env.openExternal(vscode.Uri.parse("https://ollama.com/download"));
            }
          });
          resolve(false);
        } else {
          vscode.window.showInformationMessage("Llama LLM is installed and ready to use locally!");
          resolve(true);
        }
      });
    });
  }

  async findOllamaPort(): Promise<number | null> {
    for (const port of this.OLLAMA_PORTS) {
      try {
        await new Promise<void>((resolve, reject) => {
          const socket = new net.Socket();
          socket.setTimeout(1000);
          socket.on('connect', () => {
            socket.destroy();
            resolve();
          });
          socket.on('timeout', () => {
            socket.destroy();
            reject(new Error('timeout'));
          });
          socket.on('error', reject);
          socket.connect(port, 'localhost');
        });
        this.port = port;
        console.log('Ollama port found:', port);
        return port;
      } catch (error) {
        continue;
      }
    }
    return null;
  }

  async sendMessage(model: string, message: string): Promise<string> {
    console.log('Sending message to Ollama:', message);
    if (!this.port) {
      return "Error: Ollama port not found.";
    }
    console.log('Ollama port:', this.port);

    try {
      const response = await axios.post(`http://localhost:${this.port}/api/generate`, {
        model: model,
        prompt: message
      }, {
        responseType: 'text'
      });
      console.log('Received response from Ollama:', response.data);

      const lines = response.data.split('\n');
      let finalResponse = '';
      console.log('Lines:', lines);

      for (const line of lines) {
        if (line.trim()) {
          const json = JSON.parse(line);
          finalResponse += json.response;
          if (json.done) {
            break;
          }
        }
      }
      console.log('Received response from Ollama:', finalResponse);
      return finalResponse;
    } catch (error) {
      console.error('Error sending message to Ollama:', error);
      return "Error: Unable to get response from Ollama";
    }
  }
}

export default OllamaService;
