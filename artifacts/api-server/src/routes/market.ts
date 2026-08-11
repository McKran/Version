import { Router } from "express";
import { getCached, setCached, TTL } from "../lib/db-cache";
import {
  getLatestDAPrices,
  getDAHistoricalPrices,
  calculatePriceStatistics,
  generateGeminiMarketInsight,
  DAPriceRecord,
  DAMarketInsight,
} from "../lib/da-price-engine";

const router = Router();

/**
 * 1. GET /api/prices/latest & GET /api/prices
 * Query parameters: commodity, category, region, province, limit
 * Returns Philippine DA Bantay Presyo market prices.
 */
async function handlePricesLatest(req: any, res: any) {
  try {
    const commodity = (req.query.commodity as string) || undefined;
    const category = (req.query.category as string) || undefined;
    const region = (req.query.region as string) || undefined;
    const province = (req.query.province as string) || undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;

    const prices = getLatestDAPrices({ commodity, category, region, province, limit });
    res.json(prices);
  } catch (err) {
    req.log?.error({ err }, "Error fetching DA market prices");
    res.status(500).json({ error: "Failed to fetch DA market prices" });
  }
}

router.get("/prices/latest", handlePricesLatest);
router.get("/prices", handlePricesLatest);

/**
 * 2. GET /api/prices/history
 * Query parameters: commodity (required), region, days (default: 30)
 * Returns daily historical time-series for chart rendering.
 */
router.get("/prices/history", async (req, res) => {
  try {
    const commodity = (req.query.commodity as string) || "Rice";
    const region = (req.query.region as string) || undefined;
    const days = req.query.days ? parseInt(req.query.days as string, 10) : 30;

    const history = getDAHistoricalPrices(commodity, region, days);
    res.json(history);
  } catch (err) {
    req.log?.error({ err }, "Error fetching price history");
    res.status(500).json({ error: "Failed to fetch price history" });
  }
});

/**
 * 3. GET /api/prices/insights & POST /api/prices/insights
 * Query parameters / body: commodity (required), region, province
 * Calculates statistics first, then generates Gemini AI Market Insights.
 */
async function handlePricesInsights(req: any, res: any) {
  try {
    const commodity = (req.query.commodity || req.body?.commodity || "Rice") as string;
    const region = (req.query.region || req.body?.region || "") as string;
    const province = (req.query.province || req.body?.province || "") as string;
    const mode = ((req.query.mode || req.body?.mode || "simplified") as string).toLowerCase() === "detailed" ? "detailed" : "simplified";
    const lang = ((req.query.lang || req.body?.lang || "en") as string).toLowerCase() === "fil" ? "fil" : "en";

    const history = getDAHistoricalPrices(commodity, region, 30);

    const todayStr = new Date().toISOString().split("T")[0];
    const cacheKey = `da_insight_${commodity}_${region}_${province}_${mode}_${lang}_${todayStr}`;

    const cached = await getCached<DAMarketInsight>(cacheKey);
    if (cached) {
      res.json({ insight: cached, history });
      return;
    }

    const insight = await generateGeminiMarketInsight(commodity, region, province, mode, lang);
    await setCached(cacheKey, insight, TTL.MARKET_INSIGHT);
    res.json({ insight, history });
  } catch (err) {
    req.log?.error({ err }, "Error generating market insight");
    res.status(500).json({ error: "Failed to generate market insight" });
  }
}

router.get("/prices/insights", handlePricesInsights);
router.post("/prices/insights", handlePricesInsights);

/**
 * 4. GET /api/prices/statistics
 * Query parameters: commodity (required), region
 * Returns calculated DA statistics before AI processing.
 */
router.get("/prices/statistics", async (req, res) => {
  try {
    const commodity = (req.query.commodity as string) || "Rice";
    const region = (req.query.region as string) || undefined;

    const stats = calculatePriceStatistics(commodity, region);
    res.json(stats);
  } catch (err) {
    req.log?.error({ err }, "Error calculating price statistics");
    res.status(500).json({ error: "Failed to calculate price statistics" });
  }
});

/**
 * Legacy & Compatibility Endpoints (/api/market/*)
 */
router.get("/market/prices", async (req, res) => {
  try {
    const category = (req.query.category as string) || undefined;
    const location = (req.query.location as string) || "CARAGA";

    const prices = getLatestDAPrices({ category, region: location });
    // Map to format expected by legacy frontend calls if needed
    const mapped = prices.map((p) => ({
      crop: p.commodity,
      localPrice: p.pricePhpKg,
      internationalPrice: Math.round(p.pricePhpKg * 1.15),
      unit: p.unit,
      trend: p.trend.toLowerCase(),
      changePercent: p.changePercent24h,
      category: p.category,
      aiInsight: `DA Bantay Presyo price in ${p.region} (${p.marketName})`,
      source: p.source,
      date: p.date,
    }));

    res.json(mapped);
  } catch (err) {
    req.log?.error({ err }, "Error fetching legacy market prices");
    res.status(500).json({ error: "Failed to fetch market prices" });
  }
});

router.get("/market/insights", async (req, res) => {
  try {
    const crop = (req.query.crop as string) || "Rice";
    const location = (req.query.location as string) || "";

    const insight = await generateGeminiMarketInsight(crop, location);
    res.json({
      crop: insight.commodity,
      currentPrice: insight.currentPrice,
      priceDirection: insight.trend.toLowerCase(),
      changePercent: insight.calculatedStats.pctDiffFrom30dAvg,
      localAnalysis: insight.whyIsItHighLow,
      globalAnalysis: `DA Bantay Presyo monitoring across 16 Philippine regions indicates a national average of ₱${insight.calculatedStats.avg30Day}/${insight.unit}.`,
      keyDrivers: insight.possibleFactors,
      futureOutlook: insight.expectedTrend,
      seasonalNote: insight.historicalComparison,
      confidence: insight.confidence.toLowerCase(),
      factsAndDerived: insight.factsAndDerived,
      source: insight.source,
      generatedAt: insight.lastUpdated,
    });
  } catch (err) {
    req.log?.error({ err }, "Error fetching legacy market insight");
    res.status(500).json({ error: "Failed to fetch market insight" });
  }
});

router.get("/market/trends", async (req, res) => {
  try {
    const prices = getLatestDAPrices({ region: "CARAGA" });
    const rising = prices.filter((p) => p.trend === "Increasing").sort((a, b) => b.changePercent24h - a.changePercent24h);
    const falling = prices.filter((p) => p.trend === "Decreasing").sort((a, b) => a.changePercent24h - b.changePercent24h);
    const stable = prices.filter((p) => p.trend === "Stable");

    res.json({
      topGainer: rising[0]?.commodity ?? "Red Onion",
      topLoser: falling[0]?.commodity ?? "Tomato",
      mostStable: stable[0]?.commodity ?? "Rice",
      marketSentiment: rising.length > falling.length ? "bullish" : falling.length > rising.length ? "bearish" : "neutral",
      source: "Philippine Department of Agriculture (DA) - Bantay Presyo",
      lastUpdated: new Date().toISOString(),
    });
  } catch (err) {
    req.log?.error({ err }, "Error fetching market trends");
    res.status(500).json({ error: "Failed to fetch market trends" });
  }
});

export default router;
