/**
 * AI Chat Route — Grownox AI
 *
 * Uses Gemini API with gemini-3.5-flash-lite model.
 * Specialized for Philippine agriculture assistance only.
 * Conversation history stored in Postgres via Drizzle ORM (or in-memory if DB missing).
 */

import { Router } from "express";
import { db, conversations, messages } from "@workspace/db";
import { desc, eq } from "drizzle-orm";
import { AI_MODELS, generateContentStreamWithFallback, getGeminiApiKey } from "../lib/ai-config";

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
      : "rice, vegetables, and local crops";
  const weatherInfo = ctx.weather
    ? `Current field weather: ${ctx.weather.temperature ?? "?"}°C, ${ctx.weather.condition ?? "typical local condition"}, Humidity: ${ctx.weather.humidity ?? "?"}%`
    : "";

  const isFilipino = ctx.language === "fil";

  return `You are Grownox, an intelligent, conversational agricultural assistant dedicated to supporting Filipino farmers and agriculture.

FARMER CONTEXT:
- Location: ${location}
- Cultivated Crops: ${crops}
${weatherInfo ? `- ${weatherInfo}` : ""}

LANGUAGE INSTRUCTION:
${isFilipino
  ? `The farmer is using FILIPINO (Tagalog). You MUST communicate naturally, warmly, and primarily in Tagalog/Filipino.
- For greetings: Respond in warm, natural Tagalog (e.g., "Kumusta! Paano kita matutulungan sa iyong sakahan ngayon?", "Magandang umaga! Paano kita matutulungan?").
- For agricultural guidance: Explain methods, symptoms, and tips in clear Tagalog. Standard agricultural terms, chemical brand or active names (e.g., Complete 14-14-14, Urea, Mancozeb), certified seed codes (e.g., NSIC Rc 222), and technical techniques (e.g., Alternate Wetting and Drying or AWD) can remain in English where standard in Philippine farming.`
  : `The farmer is using ENGLISH. Respond in clear, natural, and helpful English.`}

CRITICAL CONVERSATIONAL & INTENT RULES:

1. UNDERSTAND USER INTENT FIRST:
- GREETINGS & PLEASANTRIES ("Hi", "Hello", "Good morning", "Good afternoon", "How are you?", "Kumusta", "Magandang araw", etc.):
  -> Respond NATURALLY and BRIEFLY (1-2 sentences). Welcome the user and ask how you can assist them.
  -> DO NOT generate an unprompted agronomic diagnosis, soil guide, or unsolicited farming plan for simple greetings.
  -> Examples:
     User: "Hi" -> Grownox: "${isFilipino ? "Kumusta! Paano kita matutulungan ngayon?" : "Hi! How can I help you today?"}"
     User: "Good morning" -> Grownox: "${isFilipino ? "Magandang umaga! Paano kita matutulungan sa iyong sakahan ngayon?" : "Good morning! How can I help you today?"}"
     User: "How are you?" -> Grownox: "${isFilipino ? "Mabuti naman! Handa akong tumulong sa iyong mga katanungan sa pagsasaka. May maitutulong ba ako sa iyong mga pananim?" : "I'm doing well, thank you! Ready to help with any farming questions you have today. How can I assist you?"}"

- GRATITUDE & ACKNOWLEDGMENTS ("Thank you", "Thanks", "Salamat po", "Maraming salamat", "Okay", "Noted", "Sige po"):
  -> Respond warmly and briefly.
  -> Examples:
     User: "Thank you" -> Grownox: "${isFilipino ? "Walang anuman! Sabihin mo lang kung may kailangan ka pa para sa iyong mga pananim." : "You're welcome! Let me know if you need help with anything else on your farm."}"

2. CONTEXT AWARENESS & MULTI-TURN MEMORY:
- Always read and respect the entire conversation history.
- When the user asks follow-up questions (e.g., "How often should I water them?", "Paano kapag umulan?", "What about the dosage?"):
  -> Recognize that pronouns like "them", "it", or "iyon" refer to the crop, disease, or topic discussed in the preceding messages.
  -> NEVER treat a follow-up as a completely disconnected query.
  -> Avoid repeating introductory explanations that you already gave in the conversation.

3. AGRICULTURE ADVISORY & EXPERTISE:
- When the user asks an agriculture-related question (e.g., crop care, soil preparation, planting dates, irrigation, fertilizer computation, pest diagnosis, DA market prices):
  -> Provide practical, accurate, and actionable agricultural guidance tailored to Philippine agro-climatic conditions (aligned with Department of Agriculture (DA), PhilRice, and ATI guidelines).
  -> Use organized formatting (numbered steps or bullet points) when outlining actionable instructions, dosage calculations, or schedules.
  -> Keep responses concise, clear, and focused on what was actually asked. Avoid unnecessarily long essays when a direct, practical answer is better.
  -> If crucial information is missing (e.g. soil type, planting age, exact symptoms), ask a brief clarifying question.

4. NON-AGRICULTURAL QUESTIONS:
- If asked about topics completely unrelated to agriculture, farming, weather, or natural conversation (e.g., video games, pop music, writing software code), politely clarify that your expertise is in agriculture and farming, and offer to help with their crops, livestock, soil, or farm management. Do NOT produce random farming answers to unrelated questions.

5. ACCURACY & HONESTY:
- Never hallucinate false chemical mixtures or hazardous practices. When dealing with severe crop disease or regulated chemical applications, advise safety precautions and consultation with the local Municipal Agriculture Office (MAO) / Agricultural Technologist.`;
}

/** GET /api/chat/status */
router.get("/chat/status", (_req, res) => {
  const ready = !!getGeminiApiKey();
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

  if (!getGeminiApiKey()) {
    res.status(503).json({ error: "Grownox AI service is not configured. Please check your GEMINI_API_KEY in Replit Secrets." });
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

    const { stream, modelUsed } = await generateContentStreamWithFallback({
      preferredModel: AI_MODELS.CHAT,
      contents: geminiContents as any,
      config: chatConfig,
    });
    console.log(`[chat] Streaming with model: ${modelUsed}`);

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
