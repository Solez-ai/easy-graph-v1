import { GoogleGenAI } from "@google/genai";
import { ChartConfiguration, GenAIResponse, Message } from "../types";
import { getStoredApiKey } from "../utils/apiKeyStorage";

/**
 * Get the API key to use - prioritize user's custom key from localStorage,
 * fallback to environment variable
 */
const getApiKey = (): string => {
  const customKey = getStoredApiKey();
  if (customKey) {
    return customKey;
  }

  // Fallback to environment variable
  const envKey = process.env.API_KEY;
  if (!envKey) {
    throw new Error('No API key configured. Please add your Gemini API key in Settings.');
  }

  return envKey;
};

const SYSTEM_INSTRUCTION = `
You are EasyGraph, an expert data visualization AI. Your goal is to generate JSON configurations for Chart.js.

CRITICAL RULES:
1. OUTPUT PURE VALID JSON ONLY. No markdown, no \`\`\`json blocks.
2. DO NOT include comments (// or /* */) in the JSON.
3. DO NOT use JavaScript functions. Use 'null' if a value cannot be serializable.
4. Ensure all strings are properly escaped.
5. STYLING & COLORS:
   - If the user requests a SPECIFIC BACKGROUND or "Dark Mode":
     - YOU MUST set 'options.customCanvasBackgroundColor' to the valid HEX string (e.g., '#1e293b' or '#000000').
     - YOU MUST set text colors ('options.scales.x.ticks.color', 'options.plugins.legend.labels.color', etc.) to a contrasting color (e.g., '#ffffff') so they are visible.
   - For standard charts, default to a white background (do not set customCanvasBackgroundColor).

The JSON structure:
{
  "chartConfig": {
    "type": "line" | "bar" | "pie" | "doughnut" | "etc",
    "data": { ... },
    "options": {
      "customCanvasBackgroundColor": "#hexcode", // Optional: Only if user asks for bg change
      "scales": { ... },
      "plugins": { ... }
    }
  },
  "extractedData": { ... },
  "userRequest": "string",
  "summary": "string"
}
`;

const cleanJsonOutput = (text: string): string => {
  if (!text) return "{}";

  let cleaned = text;

  // 1. Remove Markdown code blocks
  cleaned = cleaned.replace(/```json/g, '').replace(/```/g, '');

  // 2. Remove single-line comments // ...
  cleaned = cleaned.replace(/\/\/.*$/gm, '');

  // 3. Attempt to find the main JSON object {}
  const firstOpen = cleaned.indexOf('{');
  const lastClose = cleaned.lastIndexOf('}');

  if (firstOpen !== -1 && lastClose !== -1 && lastClose > firstOpen) {
    cleaned = cleaned.substring(firstOpen, lastClose + 1);
  }

  // 4. Handle "undefined" which is invalid JSON
  cleaned = cleaned.replace(/:\s*undefined/g, ': null');

  // 5. Basic cleanup for common trailing comma errors (simple heuristic)
  cleaned = cleaned.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');

  return cleaned.trim();
};

export const generateChartFromInput = async (
  prompt: string,
  files: { mimeType: string; data: string }[] = [],
  history: Message[] = []
): Promise<GenAIResponse> => {
  try {
    // Create AI client with current API key (supports dynamic switching)
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const model = 'gemini-2.5-flash';

    // Simplify history to reduce token usage and potential confusion
    const chatHistoryContext = history
      .filter(h => h.content && h.content.length < 5000) // Skip massive messages
      .map(h => `${h.role.toUpperCase()}: ${h.content}`)
      .join('\n');

    const fullPrompt = `
      ${chatHistoryContext ? `PREVIOUS CONTEXT:\n${chatHistoryContext}\n\n` : ''}
      CURRENT REQUEST: ${prompt}
      
      Generate a valid JSON object for Chart.js.
      - Extract data.
      - Configure "chartConfig".
      - Provide a "summary".
      - Ensure JSON is valid (no comments, no functions, no trailing commas).
      - If modifying style, ensure all colors (background AND text) are updated for visibility.
    `;

    const parts: any[] = [{ text: fullPrompt }];

    files.forEach(file => {
      parts.push({
        inlineData: {
          mimeType: file.mimeType,
          data: file.data
        }
      });
    });

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        role: 'user',
        parts: parts
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    const cleanJson = cleanJsonOutput(text);

    try {
      return JSON.parse(cleanJson) as GenAIResponse;
    } catch (parseError) {
      console.error("JSON Parse failed:", parseError);
      console.log("Failed JSON text:", cleanJson);

      // Fallback: If strict parsing fails, return a safe error state instead of crashing
      return {
        chartConfig: { type: 'bar', data: { labels: [], datasets: [] }, options: {} },
        extractedData: {},
        userRequest: prompt,
        summary: "I understood your request but encountered an error formatting the data structure. Please try again or rephrase."
      };
    }

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};