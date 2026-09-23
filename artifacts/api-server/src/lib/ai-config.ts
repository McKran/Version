/**
 * AI Model Configuration for Grownox Application
 * 
 * Centralized model allocation management:
 * - AI Chat: gemini-3.5-flash-lite
 * - Market Insights: gemini-3.5-flash-lite
 * - Marketplace Evaluations: gemini-3.5-flash-lite
 */

import { GoogleGenAI } from "@google/genai";

function cleanModelName(envVal: string | undefined, defaultModel: string): string {
  if (!envVal) return defaultModel;
  const trimmed = envVal.trim();
  if (trimmed.startsWith("gemini-") || trimmed.startsWith("models/gemini-")) {
    return trimmed;
  }
  return defaultModel;
}

export const AI_MODELS = {
  /** Model ID for AI Chat (Gemini 3.5 Flash-Lite) */
  CHAT: cleanModelName(process.env.GEMINI_MODEL_CHAT, "gemini-3.5-flash-lite"),

  /** Model ID for Market Insights (Gemini 3.5 Flash-Lite) */
  MARKET_INSIGHTS: cleanModelName(process.env.GEMINI_MODEL_MARKET_INSIGHTS, "gemini-3.5-flash-lite"),

  /** Model ID for Marketplace Evaluations (Gemini 3.5 Flash-Lite) */
  MARKETPLACE_EVAL: cleanModelName(process.env.GEMINI_MODEL_MARKETPLACE_EVAL, "gemini-3.5-flash-lite"),
} as const;

/** Ordered list of resilient models to try in case of 503 / 429 high-demand spikes */
export const FALLBACK_MODELS = [
  "gemini-3.5-flash-lite",
  "gemini-3.6-flash",
  "gemini-3.1-flash-lite",
] as const;

export function getGeminiApiKey(): string {
  return (
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.REPLIT_GEMINI_API_KEY ||
    process.env.AI_INTEGRATIONS_GEMINI_API_KEY ||
    process.env.GEMINI_KEY ||
    ""
  ).trim();
}

export function getGenAI(): GoogleGenAI {
  const apiKey = getGeminiApiKey();
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

/**
 * Executes a generateContent call with automatic model cascading on 503 (high demand) / 429 errors.
 */
export async function generateContentWithFallback(options: {
  contents: any;
  config?: any;
  preferredModel?: string;
  maxRetriesPerModel?: number;
}): Promise<any> {
  const ai = getGenAI();
  const preferred = options.preferredModel || AI_MODELS.CHAT;
  
  // Build unique model sequence starting with preferred model
  const modelsToTry = [
    preferred,
    ...FALLBACK_MODELS.filter((m) => m !== preferred),
  ];

  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      const resp = await ai.models.generateContent({
        model,
        contents: options.contents,
        config: options.config,
      });
      return resp;
    } catch (err: any) {
      lastError = err;
      const errMsg = err?.message || String(err);
      const isOverloadedOrUnavailable =
        errMsg.includes("503") ||
        errMsg.includes("UNAVAILABLE") ||
        errMsg.includes("high demand") ||
        errMsg.includes("429") ||
        errMsg.includes("RESOURCE_EXHAUSTED");

      console.warn(
        `[gemini-ai] Model ${model} encountered error: ${errMsg}. ${
          isOverloadedOrUnavailable ? "Attempting next fallback model in cascade..." : "Trying alternative..."
        }`
      );
      
      // Small pause before trying next fallback if high demand
      if (isOverloadedOrUnavailable) {
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    }
  }

  throw lastError || new Error("All Gemini models in fallback sequence failed");
}

/**
 * Executes a generateContentStream call with automatic model cascading on 503 / 429 errors.
 */
export async function generateContentStreamWithFallback(options: {
  contents: any;
  config?: any;
  preferredModel?: string;
}): Promise<{ stream: any; modelUsed: string }> {
  const ai = getGenAI();
  const preferred = options.preferredModel || AI_MODELS.CHAT;

  const modelsToTry = [
    preferred,
    ...FALLBACK_MODELS.filter((m) => m !== preferred),
  ];

  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      const stream = await ai.models.generateContentStream({
        model,
        contents: options.contents,
        config: options.config,
      });
      return { stream, modelUsed: model };
    } catch (err: any) {
      lastError = err;
      const errMsg = err?.message || String(err);
      console.warn(`[gemini-ai-stream] Model ${model} failed to start stream: ${errMsg}. Trying fallback...`);
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }

  throw lastError || new Error("Failed to initialize Gemini stream across all models");
}


