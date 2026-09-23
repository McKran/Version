import { Router } from "express";
import { getCached, setCached, TTL } from "../lib/db-cache";
import { GetDashboardSummaryQueryParams } from "@workspace/api-zod";
import { fetchCurrentWeather, getWeatherFallback } from "../lib/weather-service";
import { generateContentWithFallback, AI_MODELS } from "../lib/ai-config";

async function aiComplete(prompt: string, maxTokens: number): Promise<string | null> {
  try {
    const resp = await generateContentWithFallback({
      preferredModel: AI_MODELS.CHAT,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.4,
      },
    });
    if (resp?.text) return resp.text;
  } catch (e) {
    console.warn("[dashboard-ai] Gemini completions failed, using smart defaults:", (e as any)?.message);
  }
  return null;
}

const router = Router();

const WMO_CONDITIONS: Record<number, string> = {
  0: "Clear Sky", 1: "Mainly Clear", 2: "Partly Cloudy", 3: "Overcast",
  45: "Foggy", 51: "Light Drizzle", 61: "Light Rain", 63: "Moderate Rain",
  65: "Heavy Rain", 80: "Rain Showers", 95: "Thunderstorm",
};

const FARMING_TIPS = [
  "Rotate your crops each season to reduce pest buildup and improve soil health.",
  "Apply mulch around plants to conserve moisture and suppress weeds during dry periods.",
  "Test your soil every 2–3 years to optimize fertilizer application and reduce costs.",
  "Scout for pests early in the morning when they are most active and easier to spot.",
  "Keep detailed farm records — yields, costs, and weather — to make better decisions each season.",
  "Intercropping legumes with cereals improves nitrogen content and overall farm productivity.",
  "Irrigate in the early morning to minimize evaporation and reduce fungal disease risk.",
  "Use cover crops during the off-season to prevent soil erosion and fix nitrogen.",
  "Monitor commodity market prices weekly to choose the best selling window for your harvest.",
  "Healthy soils produce healthy crops — invest in compost and organic matter addition.",
  "Join a farmer cooperative to access better input prices and collective marketing power.",
  "GPS-based precision agriculture can reduce input costs by 15-20% on large farms.",
];

import { getDisasterAlertsForLocation } from "../lib/pagasa-service";

router.get("/dashboard/summary", async (req, res) => {
  const parsed = GetDashboardSummaryQueryParams.safeParse(req.query);
  const location = (parsed.success && parsed.data.location) ? parsed.data.location : "Nairobi, Kenya";

  try {
    // Run weather fetch, disaster alerts, and AI cache lookup in parallel
    const today = new Date().toDateString();
    const lang = ((req.query.lang as string) || "en").toLowerCase() === "fil" ? "fil" : "en";
    const cacheKey = `dashboard_ai_${location}_${today}_${lang}`;

    const lat = req.query.lat ? parseFloat(req.query.lat as string) : undefined;
    const lon = req.query.lon ? parseFloat(req.query.lon as string) : undefined;

    const [weather, disasterAlertsData, cachedAI] = await Promise.all([
      fetchCurrentWeather(location, lat, lon),
      getDisasterAlertsForLocation(location, lang),
      getCached<{ cropRecommendation: string; marketAlert: string; farmingTip: string }>(cacheKey),
    ]);

    const currentWeather = weather ?? getWeatherFallback(location);

    const isFil = lang === "fil";
    let cropRec = isFil
      ? "Suriin ang lokal na panahon — sumangguni sa tab ng Mga Pananim para sa rekomendasyon"
      : "Analyze your local season — consult Crops tab for recommendations";
    let marketAlert = isFil
      ? "Suriin ang Presyo sa Pamilihan para sa kasalukuyang presyo ng kalakal sa iyong rehiyon"
      : "Check the Market tab for live commodity prices in your region";
    let aiTip = FARMING_TIPS[new Date().getDate() % FARMING_TIPS.length];

    if (cachedAI) {
      cropRec = cachedAI.cropRecommendation ?? cropRec;
      marketAlert = cachedAI.marketAlert ?? marketAlert;
      aiTip = cachedAI.farmingTip ?? aiTip;
    } else {
      try {
        const langInstruction = isFil
          ? "CRITICAL: Write all 3 field values in natural, clear Filipino (Tagalog). Do not use English."
          : "Write all 3 field values in clear English.";

        const aiPrompt = `You are an expert agronomist. Given the location "${location}" and current date ${today}, respond with a JSON object with exactly these 3 fields:
{
  "cropRecommendation": "one sentence naming 1-2 best crops to focus on now and why",
  "marketAlert": "one sentence about a current market opportunity or risk for this region",
  "farmingTip": "one practical, specific farming tip for this region and season"
}
${langInstruction}
No markdown, just the JSON.`;

        const text = await aiComplete(aiPrompt, 300) ?? "{}";
        const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        const ai = JSON.parse(cleaned);
        cropRec = ai.cropRecommendation ?? cropRec;
        marketAlert = ai.marketAlert ?? marketAlert;
        aiTip = ai.farmingTip ?? aiTip;
        await setCached(cacheKey, { cropRecommendation: cropRec, marketAlert, farmingTip: aiTip }, TTL.DASHBOARD);
      } catch {}
    }

    const alertCount = (disasterAlertsData.hasActiveAlert ? disasterAlertsData.alerts.length : 0) + (currentWeather.rainfall > 5 ? 1 : 0) + (currentWeather.windSpeed > 30 ? 1 : 0);

    res.json({
      weather: currentWeather,
      disasterAlerts: disasterAlertsData,
      topCropRecommendation: cropRec,
      marketAlert,
      farmingTip: aiTip,
      alertCount,
    });
  } catch (err) {
    req.log.error({ err }, "Error fetching dashboard summary");
    res.status(500).json({ error: "Failed to fetch dashboard summary" });
  }
});

export default router;
