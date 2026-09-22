/**
 * Farming Plan Route
 *
 * All plans are generated using:
 *   1. Open-Meteo Historical Weather API — local GDD rates from real ERA5 reanalysis data
 *   2. Open-Meteo Forecast API — 16-day weather outlook
 *   3. Wikipedia REST API — crop information
 *   4. World Bank Open Data API — country context
 *   5. GDD-based rule engine — scientifically grounded, no AI calls
 *
 * Location: lat/lon coordinates only. Defaults to Manila (14.5995, 120.9842) if not provided.
 * No PSGC codes required — any Philippine location with coordinates works.
 *
 * NO AI models, NO hardcoded timelines, NO paid or restricted APIs.
 * Plans are persisted in PostgreSQL keyed by lat/lon to avoid redundant data fetches.
 */

import { Router } from "express";
import { db } from "@workspace/db";
import { farmingPlans, userPlantingPlans } from "@workspace/db";
import { and, eq, gt } from "drizzle-orm";
import {
  fetchHistoricalWeather,
  buildClimateProfile,
  fetchForecast,
  fetchCropWikiInfo,
  fetchCountryContext,
  type GeoResult,
} from "../lib/open-data-fetcher";
import { generateFarmingPlan, listAvailableCrops } from "../lib/gdd-engine";
import { getCached, setCached } from "../lib/db-cache";

const router = Router();

export interface UserPlanRecord {
  id: string;
  userKey: string;
  name: string;
  crop: string;
  plantingDate: string;
  status: "active" | "completed" | "archived";
  plan: any;
  completedTasks: Record<string, boolean>;
  createdAt: string;
  updatedAt: string;
}

const inMemoryPlansStore = new Map<string, UserPlanRecord[]>();

async function getUserPlans(userKey: string): Promise<UserPlanRecord[]> {
  try {
    const rows = await db
      .select()
      .from(userPlantingPlans)
      .where(eq(userPlantingPlans.userId, userKey));

    if (rows && rows.length > 0) {
      const mapped = rows.map((r: any) => ({
        id: r.id,
        userKey: r.userId,
        name: r.name,
        crop: r.crop,
        plantingDate: r.plantingDate,
        status: r.status as any,
        plan: r.planData,
        completedTasks: r.completedTasks || {},
        createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: r.updatedAt ? new Date(r.updatedAt).toISOString() : new Date().toISOString(),
      }));
      mapped.sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      return mapped;
    }
  } catch {
    // Non-fatal fallback
  }

  const cacheKey = `user_plans_index_${userKey}`;
  const cached = await getCached<UserPlanRecord[]>(cacheKey);
  if (cached && Array.isArray(cached) && cached.length > 0) {
    return cached;
  }

  return inMemoryPlansStore.get(userKey) || [];
}

async function saveUserPlanRecord(planRecord: UserPlanRecord): Promise<void> {
  const { id, userKey, name, crop, plantingDate, status, plan, completedTasks, createdAt, updatedAt } = planRecord;

  try {
    await db
      .insert(userPlantingPlans)
      .values({
        id,
        userId: userKey,
        name,
        crop,
        plantingDate,
        status,
        planData: plan,
        completedTasks,
        createdAt: new Date(createdAt),
        updatedAt: new Date(updatedAt),
      })
      .onConflictDoUpdate({
        target: userPlantingPlans.id,
        set: {
          name,
          crop,
          plantingDate,
          status,
          planData: plan,
          completedTasks,
          updatedAt: new Date(updatedAt),
        },
      });
  } catch {
    // Non-fatal
  }

  let existing = await getUserPlans(userKey);
  const index = existing.findIndex(p => p.id === id);
  if (index >= 0) {
    existing[index] = planRecord;
  } else {
    existing = [planRecord, ...existing];
  }

  inMemoryPlansStore.set(userKey, existing);
  const cacheKey = `user_plans_index_${userKey}`;
  await setCached(cacheKey, existing, 365 * 24 * 60 * 60 * 1000);
}

async function deleteUserPlanRecord(userKey: string, planId: string): Promise<boolean> {
  try {
    await db
      .delete(userPlantingPlans)
      .where(and(eq(userPlantingPlans.id, planId), eq(userPlantingPlans.userId, userKey)));
  } catch {}

  let existing = await getUserPlans(userKey);
  const updated = existing.filter(p => p.id !== planId);
  inMemoryPlansStore.set(userKey, updated);
  const cacheKey = `user_plans_index_${userKey}`;
  await setCached(cacheKey, updated, 365 * 24 * 60 * 60 * 1000);

  const mainPlanKey = `user_main_plan_id_${userKey}`;
  const currentMainId = await getCached<string>(mainPlanKey);
  if (currentMainId === planId) {
    const nextActive = updated.find(p => p.status === "active") || updated[0];
    if (nextActive) {
      await setCached(mainPlanKey, nextActive.id, 365 * 24 * 60 * 60 * 1000);
    } else {
      await setCached(mainPlanKey, "", 1000);
    }
  }

  return true;
}

// Default: Manila, Philippines
const PH_DEFAULT_LAT = 14.5995;
const PH_DEFAULT_LON = 120.9842;
const PLAN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/** Round to 2 decimal places to form a stable cache key from coordinates */
function toLocationKey(lat: number, lon: number): string {
  return `${lat.toFixed(2)}_${lon.toFixed(2)}`;
}

async function getCachedPlan(crop: string, locationKey: string, plantingDate: string) {
  try {
    const rows = await db
      .select()
      .from(farmingPlans)
      .where(
        and(
          eq(farmingPlans.crop, crop.toLowerCase()),
          eq(farmingPlans.location, locationKey),
          eq(farmingPlans.plantingDate, plantingDate),
          gt(farmingPlans.expiresAt, new Date())
        )
      )
      .limit(1);
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

async function savePlan(
  crop: string,
  locationKey: string,
  plantingDate: string,
  planData: any,
  climateProfile: any,
  dataSourcesUsed: string[]
) {
  try {
    await db.insert(farmingPlans).values({
      crop: crop.toLowerCase(),
      location: locationKey,
      plantingDate,
      planData,
      climateProfile,
      dataSourcesUsed,
      expiresAt: new Date(Date.now() + PLAN_TTL_MS),
    });
  } catch {
    // Non-fatal
  }
}

/**
 * POST /api/farming-plan/generate
 *
 * Body:
 *   crop         (required)  — crop name
 *   plantingDate (required)  — ISO date string
 *   lat          (optional)  — latitude, defaults to Manila
 *   lon          (optional)  — longitude, defaults to Manila
 *   locationName (optional)  — human-readable location label
 */
router.post("/farming-plan/generate", async (req, res) => {
  const {
    crop,
    plantingDate,
    lat: rawLat,
    lon: rawLon,
    locationName,
    lang = "en",
    // Legacy PSGC fields — accepted but not required, used for display only
    cityName,
    provinceName,
    regionName,
  } = req.body as {
    crop?: string;
    plantingDate?: string;
    lat?: number | null;
    lon?: number | null;
    locationName?: string;
    lang?: string;
    cityName?: string;
    provinceName?: string;
    regionName?: string;
  };

  if (!crop || !plantingDate) {
    res.status(400).json({ error: "crop and plantingDate are required" });
    return;
  }

  // Resolve coordinates — use provided or fall back to Manila
  const lat = rawLat != null && !isNaN(Number(rawLat)) ? Number(rawLat) : PH_DEFAULT_LAT;
  const lon = rawLon != null && !isNaN(Number(rawLon)) ? Number(rawLon) : PH_DEFAULT_LON;

  const locationKey = `${toLocationKey(lat, lon)}_${lang}`;

  // Best display name from whatever info is available
  const locationDisplay =
    locationName ||
    [cityName, provinceName, regionName, "Philippines"].filter(Boolean).join(", ") ||
    `${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E, Philippines`;

  try {
    // 1. Check PostgreSQL cache first
    const cached = await getCachedPlan(crop, locationKey, plantingDate);
    if (cached) {
      req.log.info({ crop, locationKey }, "Returning cached farming plan");
      res.json({
        plan: cached.planData,
        weatherData: null,
        generatedAt: cached.generatedAt.toISOString(),
        cached: true,
        dataSourcesUsed: cached.dataSourcesUsed,
        location: { display: locationDisplay, lat, lon },
      });
      return;
    }

    // 2. Build GeoResult from coordinates
    const geo: GeoResult = {
      lat,
      lon,
      name: locationDisplay,
      country: "Philippines",
      countryCode: "PH",
      elevation: 0,
      timezone: "Asia/Manila",
    };

    // 3. Fetch all open data sources in parallel
    const [historical, forecast, wikiInfo, countryCtx] = await Promise.allSettled([
      fetchHistoricalWeather(geo.lat, geo.lon),
      fetchForecast(geo.lat, geo.lon),
      fetchCropWikiInfo(crop),
      fetchCountryContext("PH"),
    ]);

    const historicalData = historical.status === "fulfilled" ? historical.value : null;
    const forecastData = forecast.status === "fulfilled" ? forecast.value : [];
    const wiki = wikiInfo.status === "fulfilled" ? wikiInfo.value : null;
    const country = countryCtx.status === "fulfilled" ? countryCtx.value : null;

    // 4. Build climate profile
    const climateProfile = buildClimateProfile(
      geo,
      historicalData ?? { dates: [], tempMax: [], tempMin: [], precipitation: [] }
    );

    // 5. Generate farming plan (GDD engine — no AI)
    const plan = generateFarmingPlan(
      crop,
      plantingDate,
      locationDisplay,
      climateProfile,
      forecastData,
      wiki?.extract ?? null,
      lang
    );

    if (country) {
      (plan as any).countryContext = {
        name: country.name,
        region: country.region,
        incomeLevel: country.incomeLevel,
        source: country.source,
      };
    }

    // 6. Save to PostgreSQL
    await savePlan(crop, locationKey, plantingDate, plan, climateProfile, plan.dataSourcesUsed);

    // 7. Build forecast response
    const forecastResponse =
      forecastData.length > 0
        ? {
            daily: {
              dates: forecastData.map((d) => d.date),
              maxTemps: forecastData.map((d) => d.tempMax),
              minTemps: forecastData.map((d) => d.tempMin),
              precipitation: forecastData.map((d) => d.precipitation),
              precipitationProbability: forecastData.map((d) => d.precipProbability),
              uvIndex: forecastData.map((d) => d.uvIndex),
            },
          }
        : null;

    req.log.info(
      { crop, lat, lon, locationKey, totalDays: plan.totalGrowingDays },
      "Generated farming plan"
    );

    res.json({
      plan,
      weatherData: forecastResponse,
      generatedAt: new Date().toISOString(),
      cached: false,
      dataSourcesUsed: plan.dataSourcesUsed,
      location: { display: locationDisplay, lat, lon },
    });
  } catch (err: any) {
    req.log.error({ err }, "Error generating farming plan");
    res.status(500).json({ error: "Failed to generate farming plan. Please try again." });
  }
});

/**
 * GET /api/farming-plan/list
 * Returns all saved planting plans for the given userKey.
 */
router.get("/farming-plan/list", async (req, res) => {
  const userKey = (req.query.userKey as string) || "default";
  try {
    const plans = await getUserPlans(userKey);
    res.json(plans);
  } catch (err: any) {
    req.log.error({ err, userKey }, "Error fetching user plans list");
    res.status(500).json({ error: "Failed to fetch saved plans" });
  }
});

/**
 * GET /api/farming-plan/get/:id
 * Retrieve a specific plan by ID for userKey.
 */
router.get("/farming-plan/get/:id", async (req, res) => {
  const userKey = (req.query.userKey as string) || "default";
  const planId = req.params.id;
  try {
    const plans = await getUserPlans(userKey);
    const plan = plans.find(p => p.id === planId);
    if (!plan) {
      res.status(404).json({ error: "Plan not found" });
      return;
    }
    res.json(plan);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch plan" });
  }
});

/**
 * POST /api/farming-plan/save
 * Save or update a planting plan record.
 * Generates a new unique plan ID if none is provided.
 */
router.post("/farming-plan/save", async (req, res) => {
  const {
    id: rawId,
    userKey = "default",
    name: rawName,
    crop,
    plantingDate,
    status = "active",
    plan,
    completedTasks = {},
  } = req.body;

  if (!crop || !plantingDate || !plan) {
    res.status(400).json({ error: "crop, plantingDate, and plan object are required" });
    return;
  }

  const id = rawId || `plan_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const defaultName = `${crop} Plan (${new Date(plantingDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })})`;
  const name = (rawName && rawName.trim().length > 0) ? rawName.trim() : defaultName;
  const now = new Date().toISOString();

  // If updating existing, preserve createdAt
  let createdAt = now;
  if (rawId) {
    const existingList = await getUserPlans(userKey);
    const existing = existingList.find(p => p.id === rawId);
    if (existing) createdAt = existing.createdAt;
  }

  const planRecord: UserPlanRecord = {
    id,
    userKey,
    name,
    crop,
    plantingDate,
    status: status as any,
    plan,
    completedTasks: completedTasks || {},
    createdAt,
    updatedAt: now,
  };

  try {
    await saveUserPlanRecord(planRecord);

    if (status === "active") {
      const mainPlanKey = `user_main_plan_id_${userKey}`;
      await setCached(mainPlanKey, id, 365 * 24 * 60 * 60 * 1000);
    }

    // Also update legacy active cache for backwards compat
    const legacyKey = `user_active_plan_${userKey}_${crop.toLowerCase()}`;
    await setCached(legacyKey, { crop, plantingDate, plan, completedTasks, updatedAt: now }, 30 * 24 * 60 * 60 * 1000);

    req.log.info({ userKey, planId: id, name, crop }, "Saved user planting plan");
    res.json({ success: true, plan: planRecord });
  } catch (err: any) {
    req.log.error({ err }, "Error saving user planting plan");
    res.status(500).json({ error: "Failed to save plan. Please try again." });
  }
});

/**
 * POST /api/farming-plan/toggle-task
 * Toggle completion of a task on a plan by plan id or crop.
 */
router.post("/farming-plan/toggle-task", async (req, res) => {
  const { id, userKey = "default", crop, taskId, completed } = req.body;
  if (!taskId) {
    res.status(400).json({ error: "taskId is required" });
    return;
  }

  try {
    const plans = await getUserPlans(userKey);
    let targetPlan = id ? plans.find(p => p.id === id) : null;

    if (!targetPlan && crop) {
      targetPlan = plans.find(p => p.crop.toLowerCase() === crop.toLowerCase());
    }

    if (targetPlan) {
      targetPlan.completedTasks = targetPlan.completedTasks || {};
      targetPlan.completedTasks[taskId] = !!completed;
      targetPlan.updatedAt = new Date().toISOString();
      await saveUserPlanRecord(targetPlan);
      res.json({ success: true, planId: targetPlan.id, taskId, completed: !!completed, completedTasks: targetPlan.completedTasks });
      return;
    }

    res.status(404).json({ error: "Plan not found to toggle task" });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to toggle task" });
  }
});

/**
 * POST /api/farming-plan/complete-day
 * Mark all tasks for a specific date as complete and save day completion status.
 */
router.post("/farming-plan/complete-day", async (req, res) => {
  const { id, userKey = "default", crop, dateStr, taskIds = [], completed = true } = req.body;
  if (!dateStr) {
    res.status(400).json({ error: "dateStr is required" });
    return;
  }

  try {
    const plans = await getUserPlans(userKey);
    let targetPlan = id ? plans.find(p => p.id === id) : null;

    if (!targetPlan && crop) {
      targetPlan = plans.find(p => p.crop.toLowerCase() === crop.toLowerCase());
    }

    if (targetPlan) {
      targetPlan.completedTasks = targetPlan.completedTasks || {};
      targetPlan.completedTasks[`day_${dateStr}`] = !!completed;
      if (Array.isArray(taskIds)) {
        taskIds.forEach((tId: string) => {
          targetPlan!.completedTasks[tId] = !!completed;
        });
      }
      targetPlan.updatedAt = new Date().toISOString();
      await saveUserPlanRecord(targetPlan);
      res.json({ success: true, planId: targetPlan.id, dateStr, completedTasks: targetPlan.completedTasks });
      return;
    }

    res.status(404).json({ error: "Plan not found to complete day" });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to complete day" });
  }
});

/**
 * DELETE /api/farming-plan/delete/:id or POST /api/farming-plan/delete
 */
router.delete("/farming-plan/delete/:id", async (req, res) => {
  const userKey = (req.query.userKey as string) || (req.body?.userKey as string) || "default";
  const planId = req.params.id;
  try {
    await deleteUserPlanRecord(userKey, planId);
    req.log.info({ userKey, planId }, "Deleted planting plan");
    res.json({ success: true, deletedId: planId });
  } catch (err: any) {
    req.log.error({ err, planId }, "Error deleting planting plan");
    res.status(500).json({ error: "Failed to delete plan" });
  }
});

router.post("/farming-plan/delete", async (req, res) => {
  const { id: planId, userKey = "default" } = req.body;
  if (!planId) {
    res.status(400).json({ error: "Plan ID is required" });
    return;
  }
  try {
    await deleteUserPlanRecord(userKey, planId);
    req.log.info({ userKey, planId }, "Deleted planting plan");
    res.json({ success: true, deletedId: planId });
  } catch (err: any) {
    req.log.error({ err, planId }, "Error deleting planting plan");
    res.status(500).json({ error: "Failed to delete plan" });
  }
});

/**
 * POST /api/farming-plan/save-active (Backward Compatibility)
 */
router.post("/farming-plan/save-active", async (req, res) => {
  const { userKey = "default", crop, plantingDate, name, plan, completedTasks } = req.body;
  if (!crop || !plan) {
    res.status(400).json({ error: "crop and plan are required" });
    return;
  }
  const id = `plan_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const planRecord: UserPlanRecord = {
    id,
    userKey,
    name: name || `${crop} Plan`,
    crop,
    plantingDate,
    status: "active",
    plan,
    completedTasks: completedTasks || {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await saveUserPlanRecord(planRecord);
  res.json({ success: true, savedAt: planRecord.updatedAt, plan: planRecord });
});

/**
 * POST /api/farming-plan/set-active
 * Sets a specific plan as the designated main/active plan for this user.
 */
router.post("/farming-plan/set-active", async (req, res) => {
  const { id, userKey = "default" } = req.body;
  if (!id) {
    res.status(400).json({ error: "Plan ID is required" });
    return;
  }
  try {
    const plans = await getUserPlans(userKey);
    const target = plans.find(p => p.id === id);
    if (!target) {
      res.status(404).json({ error: "Plan not found" });
      return;
    }

    target.status = "active";
    target.updatedAt = new Date().toISOString();
    await saveUserPlanRecord(target);

    const mainPlanKey = `user_main_plan_id_${userKey}`;
    await setCached(mainPlanKey, target.id, 365 * 24 * 60 * 60 * 1000);

    req.log.info({ userKey, planId: id }, "Set user active/main planting plan");
    res.json({ success: true, activePlan: target });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to set active plan" });
  }
});

/**
 * GET /api/farming-plan/get-active (Backward Compatibility and Dashboard Sync)
 */
router.get("/farming-plan/get-active", async (req, res) => {
  const userKey = (req.query.userKey as string) || "default";
  const crop = (req.query.crop as string) || "";
  const plans = await getUserPlans(userKey);
  if (!plans || plans.length === 0) {
    res.json(null);
    return;
  }

  if (crop) {
    const match = plans.find(p => p.crop.toLowerCase() === crop.toLowerCase() && p.status === "active");
    if (match) {
      res.json({ crop: match.crop, plantingDate: match.plantingDate, plan: match.plan, completedTasks: match.completedTasks, updatedAt: match.updatedAt, id: match.id, name: match.name, status: match.status });
      return;
    }
  }

  // First check explicitly designated main plan ID
  const mainPlanKey = `user_main_plan_id_${userKey}`;
  const mainPlanId = await getCached<string>(mainPlanKey);
  if (mainPlanId) {
    const designated = plans.find(p => p.id === mainPlanId && p.status === "active");
    if (designated) {
      res.json({ crop: designated.crop, plantingDate: designated.plantingDate, plan: designated.plan, completedTasks: designated.completedTasks, updatedAt: designated.updatedAt, id: designated.id, name: designated.name, status: designated.status });
      return;
    }
  }

  // Next prioritize active plans, sorted by latest update
  const activePlans = plans.filter(p => p.status === "active");
  if (activePlans.length > 0) {
    const latest = activePlans[0];
    res.json({ crop: latest.crop, plantingDate: latest.plantingDate, plan: latest.plan, completedTasks: latest.completedTasks, updatedAt: latest.updatedAt, id: latest.id, name: latest.name, status: latest.status });
    return;
  }

  // If no plans have active status, user has no active plan
  res.json(null);
});

/**
 * GET /api/farming-plan/crops
 * Returns all crops known to the GDD engine.
 */
router.get("/farming-plan/crops", (_req, res) => {
  res.json(listAvailableCrops());
});

/**
 * GET /api/farming-plan/data-sources
 */
router.get("/farming-plan/data-sources", (_req, res) => {
  res.json({
    description: "All agricultural intelligence is generated from free, open-source data only.",
    sources: [
      {
        name: "Open-Meteo Historical Weather API",
        url: "https://archive-api.open-meteo.com",
        description: "ERA5 reanalysis data — 1-year historical daily weather. Used for local GDD rates.",
        license: "CC BY 4.0",
        apiKey: false,
      },
      {
        name: "Open-Meteo Forecast API",
        url: "https://api.open-meteo.com",
        description: "16-day weather forecast for weather risk assessment.",
        license: "CC BY 4.0",
        apiKey: false,
      },
      {
        name: "Wikipedia REST API",
        url: "https://en.wikipedia.org/api/rest_v1",
        description: "Crop information and descriptions.",
        license: "CC BY-SA 3.0",
        apiKey: false,
      },
      {
        name: "World Bank Open Data API",
        url: "https://api.worldbank.org/v2",
        description: "Country-level agricultural and economic context.",
        license: "CC BY 4.0",
        apiKey: false,
      },
      {
        name: "FAO Paper No. 56 + GDD Crop Parameters",
        url: "https://www.fao.org/3/x0490e/x0490e00.htm",
        description: "Scientific basis for ET₀ calculation and crop coefficients from FAO, USDA, CIMMYT, IRRI.",
        license: "Open access",
        apiKey: false,
      },
    ],
  });
});

export default router;
