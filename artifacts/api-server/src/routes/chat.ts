/**
 * AI Chat Route — Gemini
 *
 * Uses Gemini API with gemini-3.5-flash-lite model.
 * Specialized for Philippine agriculture assistance only.
 * Conversation history stored in Postgres via Drizzle ORM (or in-memory if DB missing).
 */

import { Router } from "express";
import { db, conversations, messages } from "@workspace/db";
import { desc, eq } from "drizzle-orm";
import { AI_MODELS, getGenAI } from "../lib/ai-config";

const router = Router();

const isDbMocked = !process.env.DATABASE_URL;
let mockConvIdCounter = 1;
let mockMsgIdCounter = 1;
const mockConvs: any[] = [];
const mockMsgs: any[] = [];


const MODEL = AI_MODELS.CHAT;

function buildSystemPrompt(ctx: {
  cityName?: string;
  provinceName?: string;
  regionName?: string;
  regionCode?: string;
  provinceCode?: string;
  cityCode?: string;
  preferredCrops?: string[];
  weather?: { temperature?: number; condition?: string; humidity?: number } | null;
  language?: string;
}): string {
  const location = [ctx.cityName, ctx.provinceName, ctx.regionName, "Philippines"]
    .filter(Boolean)
    .join(", ") || "Philippines";
  const crops =
    ctx.preferredCrops && ctx.preferredCrops.length > 0
      ? ctx.preferredCrops.join(", ")
      : "general crops";
  const weatherInfo = ctx.weather
    ? `Current weather: ${ctx.weather.temperature ?? "?"}°C, ${ctx.weather.condition ?? "unknown"}, Humidity: ${ctx.weather.humidity ?? "?"}%`
    : "";

  const isFilipino = ctx.language === "fil";
  const languageInstruction = isFilipino
    ? `CRITICAL LANGUAGE INSTRUCTION: The user prefers FILIPINO (Tagalog/Taglish). You MUST write your entire response in clear, natural Filipino. Do not translate official crop names, technical terms, or chemical names, but structure all explanations and advice in conversational, respectful Filipino.`
    : `LANGUAGE INSTRUCTION: Respond in clear, concise English.`;

  return `You are Grownox, an expert agricultural advisor exclusively for Filipino farmers.

FARMER PROFILE:
- Location: ${location}
- Primary Crops: ${crops}
${weatherInfo ? `- ${weatherInfo}` : ""}

${languageInstruction}

YOUR ROLE:
You provide expert, practical agriculture guidance ONLY. You specialize in:
1. Crop advice (planting, care, variety selection for the farmer's climate)
2. Pest and disease diagnosis (identification, treatment, prevention)
3. Fertilizer scheduling (nutrient management, timing, rates)
4. Irrigation guidance (scheduling, water management)
5. Weather interpretation (how current/forecasted weather affects crops)
6. Farm planning (season planning, crop rotation, intercropping)
7. Market explanation (price trends, when to sell)

STRICT RULES:
- ONLY answer questions about agriculture, farming, crops, soil, weather for farming, pests, fertilizers, and market prices.
- If asked about ANYTHING unrelated to agriculture, politely decline and steer the conversation back to agriculture.
- Always tailor advice to the farmer's location (${location}) and crops (${crops}).
- Give concise, practical, actionable answers in clear language.
- Format with bullet points and numbered steps when listing tasks.
- Do not hallucinate — if unsure, recommend consulting a local agronomist.`;
}

/** GET /api/chat/status */
router.get("/chat/status", (_req, res) => {
  const ready = !!process.env.GEMINI_API_KEY;
  res.json({ ready, model: MODEL, provider: "google" });
});

/** GET /api/chat/conversations */
router.get("/chat/conversations", async (_req, res) => {
  try {
    if (isDbMocked) {
      res.json([...mockConvs].reverse().slice(0, 50));
      return;
    }
    const convs = await db
      .select()
      .from(conversations)
      .orderBy(desc(conversations.createdAt))
      .limit(50);
    res.json(convs);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
});

/** POST /api/chat/conversations */
router.post("/chat/conversations", async (req, res) => {
  const { title = "New Chat" } = req.body ?? {};
  try {
    if (isDbMocked) {
      const conv = { id: mockConvIdCounter++, title, createdAt: new Date().toISOString() };
      mockConvs.push(conv);
      res.status(201).json(conv);
      return;
    }
    const [conv] = await db
      .insert(conversations)
      .values({ title })
      .returning();
    res.status(201).json(conv);
  } catch (err) {
    res.status(500).json({ error: "Failed to create conversation" });
  }
});

/** DELETE /api/chat/conversations/:id */
router.delete("/chat/conversations/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isDbMocked) {
      const idx = mockConvs.findIndex(c => c.id === id);
      if (idx !== -1) mockConvs.splice(idx, 1);
      res.status(204).send();
      return;
    }
    await db.delete(conversations).where(eq(conversations.id, id));
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Failed to delete conversation" });
  }
});

/** GET /api/chat/conversations/:id/messages */
router.get("/chat/conversations/:id/messages", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isDbMocked) {
      const msgs = mockMsgs.filter(m => m.conversationId === id);
      res.json(msgs);
      return;
    }
    const msgs = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, id))
      .orderBy(messages.createdAt);
    res.json(msgs);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

/** POST /api/chat/conversations/:id/messages — SSE streaming via Gemini */
router.post("/chat/conversations/:id/messages", async (req, res) => {
  const conversationId = parseInt(req.params.id, 10);

  const { content, context } = req.body as {
    content?: string;
    context?: any;
  };

  if (!content?.trim()) {
    res.status(400).json({ error: "Message content is required" });
    return;
  }

  if (!process.env.GEMINI_API_KEY) {
    res.status(503).json({ error: "AI service not configured. Please add GEMINI_API_KEY." });
    return;
  }

  let userInsertedId: number | null = null;
  try {
    // Save user message
    if (isDbMocked) {
      const msgObj = {
        id: mockMsgIdCounter++,
        conversationId,
        role: "user",
        content: content.trim(),
        createdAt: new Date().toISOString()
      };
      mockMsgs.push(msgObj);
      userInsertedId = msgObj.id;
    } else {
      const [inserted] = await db.insert(messages).values({
        conversationId,
        role: "user",
        content: content.trim(),
      }).returning();
      if (inserted) userInsertedId = inserted.id;
    }

    // Load conversation history
    let history: any[];
    if (isDbMocked) {
      history = mockMsgs.filter(m => m.conversationId === conversationId).slice(-20);
    } else {
      const rawHistory = await db
        .select()
        .from(messages)
        .where(eq(messages.conversationId, conversationId))
        .orderBy(desc(messages.createdAt))
        .limit(20);
      history = rawHistory.reverse();
    }

    const systemPrompt = buildSystemPrompt(context ?? {});
    
    const chatConfig = {
      systemInstruction: systemPrompt,
      temperature: 0.6,
      maxOutputTokens: 2048,
    };

    // Combine contiguous roles to satisfy Gemini API constraints
    const geminiContents: any[] = [];
    for (const msg of history) {
      const role = msg.role === "assistant" ? "model" : "user";
      if (geminiContents.length > 0 && geminiContents[geminiContents.length - 1].role === role) {
        geminiContents[geminiContents.length - 1].parts[0].text += `\n\n${msg.content}`;
      } else {
        geminiContents.push({
          role,
          parts: [{ text: msg.content }]
        });
      }
    }

    // Ensure the last role is user (it should be since we just inserted it, but just in case)
    if (geminiContents.length > 0 && geminiContents[geminiContents.length - 1].role !== "user") {
        geminiContents.push({ role: "user", parts: [{ text: "Please continue." }]});
    }

    // Set up SSE
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders?.();

    const ai = getGenAI();
    let stream: any = null;
    let streamErr: any = null;

    try {
      stream = await ai.models.generateContentStream({
        model: AI_MODELS.CHAT,
        contents: geminiContents as any,
        config: chatConfig,
      });
    } catch (err: any) {
      console.warn(`[chat] Model ${AI_MODELS.CHAT} error: ${err?.message || err}. Trying fallback model gemini-3.6-flash...`);
      try {
        stream = await ai.models.generateContentStream({
          model: "gemini-3.6-flash",
          contents: geminiContents as any,
          config: chatConfig,
        });
      } catch (err2) {
        streamErr = err2;
      }
    }

    if (!stream) {
      throw streamErr || new Error("Failed to initialize Gemini stream");
    }

    let fullResponse = "";

    for await (const chunk of stream) {
      const delta = chunk.text;
      if (!delta) continue;
      fullResponse += delta;
      res.write(`data: ${JSON.stringify({ content: delta })}\n\n`);
    }

    const savedContent = fullResponse.trim();

    if (savedContent) {
      if (isDbMocked) {
        mockMsgs.push({
          id: mockMsgIdCounter++,
          conversationId,
          role: "assistant",
          content: savedContent,
          createdAt: new Date().toISOString()
        });
        const conv = mockConvs.find(c => c.id === conversationId);
        if (conv && conv.title === "New Chat") {
          conv.title = content.trim().slice(0, 60) + (content.trim().length > 60 ? "…" : "");
        }
      } else {
        await db.insert(messages).values({
          conversationId,
          role: "assistant",
          content: savedContent,
        });

        const [conv] = await db.select().from(conversations).where(eq(conversations.id, conversationId));
        if (conv && conv.title === "New Chat") {
          const newTitle = content.trim().slice(0, 60) + (content.trim().length > 60 ? "…" : "");
          await db.update(conversations).set({ title: newTitle }).where(eq(conversations.id, conversationId));
        }
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err: any) {
    console.error("FULL CHAT CATCH ERROR:", err);
    const errMsg = err?.message ?? String(err);
    const errStatus = err?.status ?? err?.statusCode ?? null;
    console.error("[chat] AI error:", errStatus, errMsg);
    
    // Clean up orphan user message if failed completely without response
    if (userInsertedId) {
      if (isDbMocked) {
        const idx = mockMsgs.findIndex(m => m.id === userInsertedId);
        if (idx !== -1) mockMsgs.splice(idx, 1);
      } else {
        await db.delete(messages).where(eq(messages.id, userInsertedId)).catch(() => {});
      }
    }

    let userFriendlyErr = "Grownox AI encountered an issue. Please try again.";
    if (errMsg.includes("429") || errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("Quota exceeded") || errMsg.includes("quota")) {
      userFriendlyErr = "Grownox AI rate limit reached. Please wait a few seconds and try again.";
    } else if (errMsg.includes("503") || errMsg.includes("UNAVAILABLE")) {
      userFriendlyErr = "Grownox AI is busy right now. Please try again in a moment.";
    }

    if (res.headersSent) {
      res.write(`data: ${JSON.stringify({ error: userFriendlyErr })}\n\n`);
      res.end();
    } else {
      res.status(503).json({ error: userFriendlyErr });
    }
  }
});

export default router;
