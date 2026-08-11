/**
 * AI Model Configuration for Grownox Application
 * 
 * Centralized model allocation management:
 * - AI Chat: gemini-3.5-flash-lite
 * - Market Insights: gemini-3.6-flash
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
  /** Model ID for AI Chat (Gemini 3.5 Flash Lite) */
  CHAT: cleanModelName(process.env.GEMINI_MODEL_CHAT, "gemini-3.5-flash-lite"),

  /** Model ID for Market Insights (Gemini 3.6 Flash for detailed reasoned insights) */
  MARKET_INSIGHTS: cleanModelName(process.env.GEMINI_MODEL_MARKET_INSIGHTS, "gemini-3.6-flash"),

  /** Model ID for Marketplace Evaluations (Gemini 3.5 Flash Lite) */
  MARKETPLACE_EVAL: cleanModelName(process.env.GEMINI_MODEL_MARKETPLACE_EVAL, "gemini-3.5-flash-lite"),
} as const;

export function getGenAI(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY || "";
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

