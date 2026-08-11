/**
 * AI Model Configuration for Grownox Application
 * 
 * Centralized model allocation management:
 * - AI Chat: gemini-3.1-flash-lite
 * - Market Insights: gemini-3.1-flash-lite
 * - Marketplace Evaluations: gemini-3.1-flash-lite
 */

import { GoogleGenAI } from "@google/genai";

function cleanModelName(envVal: string | undefined, defaultModel: string): string {
  if (!envVal) return defaultModel;
  const trimmed = envVal.trim();
  // Filter out outdated/invalid model names like gemini-3.5-flash-lite or gemini-3.5-flash
  if (trimmed === "gemini-3.5-flash-lite" || trimmed === "gemini-3.5-flash") {
    return defaultModel;
  }
  if (trimmed.startsWith("gemini-") || trimmed.startsWith("models/gemini-")) {
    return trimmed;
  }
  return defaultModel;
}

export const AI_MODELS = {
  /** Model ID for AI Chat (Gemini 3.1 Flash Lite) */
  CHAT: cleanModelName(process.env.GEMINI_MODEL_CHAT, "gemini-3.1-flash-lite"),

  /** Model ID for Market Insights (Gemini 3.1 Flash Lite for fast reasoned insights) */
  MARKET_INSIGHTS: cleanModelName(process.env.GEMINI_MODEL_MARKET_INSIGHTS, "gemini-3.1-flash-lite"),

  /** Model ID for Marketplace Evaluations (Gemini 3.1 Flash Lite) */
  MARKETPLACE_EVAL: cleanModelName(process.env.GEMINI_MODEL_MARKETPLACE_EVAL, "gemini-3.1-flash-lite"),
} as const;

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


