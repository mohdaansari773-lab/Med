import { GoogleGenAI } from "@google/genai";

if (typeof window !== "undefined") {
  throw new Error("src/lib/gemini.server.ts must only be run in a server-side environment.");
}

let geminiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env["GEMINI_API_KEY"];
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured in the server environment.");
  }
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return geminiClient;
}

export interface GeminiGenerateOptions {
  prompt: string;
  systemInstruction?: string;
  temperature?: number;
  model?: string;
  maxRetries?: number;
}

export interface GeminiResponse {
  ok: boolean;
  text?: string;
  errorMessage?: string;
}

/**
 * Executes a text generation request using the official @google/genai SDK on the server.
 * Standardizes responses and error recovery for pharmacology explanations and study modes.
 */
export async function generateGeminiContent(
  options: GeminiGenerateOptions,
): Promise<GeminiResponse> {
  const apiKey = process.env["GEMINI_API_KEY"];
  if (!apiKey) {
    return {
      ok: false,
      errorMessage:
        "Gemini API key is not configured on the server. Please ensure GEMINI_API_KEY is set.",
    };
  }

  const modelsToTry = [
    options.model ?? "gemini-3.1-flash-lite",
    "gemini-3.8-flash",
    "gemini-flash-latest",
  ];
  const client = getGeminiClient();

  let lastError: unknown = null;

  for (const model of modelsToTry) {
    try {
      const response = await client.models.generateContent({
        model,
        contents: options.prompt,
        config: {
          ...(options.systemInstruction ? { systemInstruction: options.systemInstruction } : {}),
          ...(typeof options.temperature === "number"
            ? { temperature: options.temperature }
            : { temperature: 0.2 }),
        },
      });

      const text = response.text?.trim();
      if (text) {
        return { ok: true, text };
      }
    } catch (error: unknown) {
      lastError = error;
      const errStr = String(error);
      // If client-level fatal error like 403 or 429, don't keep looping
      if (errStr.includes("403") || errStr.includes("429")) {
        break;
      }
      console.warn(`[Gemini Service] Model ${model} failed, attempting next model...`, errStr);
    }
  }

  console.error("[Gemini Service Error]", lastError);
  const errorStr = String(lastError);
  if (
    errorStr.includes("429") ||
    errorStr.toLowerCase().includes("quota") ||
    errorStr.toLowerCase().includes("rate limit")
  ) {
    return {
      ok: false,
      errorMessage: "Too many requests just now. Please try again in a moment.",
    };
  }

  if (
    errorStr.includes("403") ||
    errorStr.toLowerCase().includes("permission") ||
    errorStr.toLowerCase().includes("api key not valid")
  ) {
    return {
      ok: false,
      errorMessage: "Gemini API authentication failed. Please check the API key configuration.",
    };
  }

  return {
    ok: false,
    errorMessage:
      "The pharmacology explanation assistant is momentarily unavailable. Please try again.",
  };
}
