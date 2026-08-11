import { Router } from "express";
import { openrouter } from "@workspace/integrations-openrouter-ai";
import { getCached, setCached, TTL } from "../lib/db-cache";
import { fetchCurrentWeather } from "../lib/weather-service";
import { WMO_CONDITIONS, FARMING_NOTES } from "../lib/wmo-codes";
import {
  GetWeatherQueryParams,
  GetWeatherForecastQueryParams,
  GetFarmingAdviceQueryParams,
} from "@workspace/api-zod";

const AI_MODELS = [
  "deepseek/deepseek-chat-v3-0324:free",
  "meta-llama/llama-3.1-8b-instruct:free",
  "mistralai/mistral-7b-instruct:free",
];

async function aiComplete(prompt: string, maxTokens: number): Promise<string | null> {
  for (const model of AI_MODELS) {
    try {
      const resp = await (openrouter as any).chat.completions.create({
        model,
        max_tokens: maxTokens,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.4,
      });
      const content = resp.choices?.[0]?.message?.content as string | undefined;
      if (content) return content;
    } catch {}
  }
  return null;
}

const router = Router();

function getFarmingNote(condition: string): string {
  return FARMING_NOTES[condition] ?? "Monitor crops and adjust operations to conditions";
}

async function geocodeLocation(location: string): Promise<{ lat: number; lon: number; name: string } | null> {
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en&format=json`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    const data: any = await res.json();
    const result = data.results?.[0];
    if (!result) return null;
    return { lat: result.latitude, lon: result.longitude, name: result.name };
  } catch {
    return null;
  }
}

async function fetchLiveWeather(lat: number, lon: number) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,apparent_temperature,precipitation,uv_index&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto&forecast_days=7`;
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error("Weather fetch failed");
  return await res.json() as any;
}

async function resolveCoords(
  lat?: number,
  lon?: number,
  location?: string
): Promise<{ lat: number; lon: number; name: string } | null> {
  if (lat !== undefined && lon !== undefined && !isNaN(lat) && !isNaN(lon)) {
    return { lat, lon, name: location ?? "Your location" };
  }
  if (location) return geocodeLocation(location);
  return null;
}

function getWeatherFallback(location: string) {
  const seed = location.length;
  const temp = 18 + (seed % 15);
  const conditions = ["Partly Cloudy", "Mainly Clear", "Light Rain", "Clear Sky", "Overcast"];
  const condition = conditions[seed % conditions.length];
  return {
    location,
    temperature: temp,
    humidity: 55 + (seed % 35),
    rainfall: condition.includes("Rain") ? 2.5 : 0,
    condition,
    windSpeed: 8 + (seed % 12),
    feelsLike: temp - 2,
    uvIndex: 6 + (seed % 5),
    updatedAt: new Date().toISOString(),
    isLive: false,
  };
}

router.get("/weather/current", async (req, res) => {
  const parsed = GetWeatherQueryParams.safeParse(req.query);
  const location = (parsed.success && parsed.data.location) ? parsed.data.location : "Butuan City, Agusan del Norte";
  const lat = req.query.lat ? parseFloat(req.query.lat as string) : undefined;
  const lon = req.query.lon ? parseFloat(req.query.lon as string) : undefined;

  try {
    const weather = await fetchCurrentWeather(location, lat, lon);
    res.json(weather);
  } catch (err) {
    req.log.error({ err }, "Error fetching live weather, using fallback");
    res.json(getWeatherFallback(location));
  }
});

router.get("/weather/forecast", async (req, res) => {
  const parsed = GetWeatherForecastQueryParams.safeParse(req.query);
  const location = (parsed.success && parsed.data.location) ? parsed.data.location : "Nairobi, Kenya";
  const lat = req.query.lat ? parseFloat(req.query.lat as string) : undefined;
  const lon = req.query.lon ? parseFloat(req.query.lon as string) : undefined;

  try {
    const geo = await resolveCoords(lat, lon, location);
    if (!geo) {
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const fallback = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() + i);
        const seed = location.length + i;
        const conditions = ["Partly Cloudy", "Mainly Clear", "Light Rain", "Overcast", "Clear Sky", "Moderate Rain", "Mainly Clear"];
        const condition = conditions[seed % conditions.length];
        return {
          date: date.toISOString().split("T")[0],
          dayName: i === 0 ? "Today" : i === 1 ? "Tomorrow" : dayNames[date.getDay()],
          high: 22 + (seed % 10),
          low: 12 + (seed % 8),
          condition,
          humidity: 50 + (seed % 40),
          rainfall: condition.includes("Rain") ? 3 + (seed % 8) : 0,
          farmingNote: getFarmingNote(condition),
        };
      });
      res.json(fallback);
      return;
    }

    const raw = await fetchLiveWeather(geo.lat, geo.lon);
    const daily = raw.daily;
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const forecast = (daily.time as string[]).map((dateStr: string, i: number) => {
      const date = new Date(dateStr);
      const code = (daily.weather_code as number[])[i] ?? 0;
      const condition = WMO_CONDITIONS[code] ?? "Partly Cloudy";
      const rainfall = (daily.precipitation_sum as number[])[i] ?? 0;
      return {
        date: dateStr,
        dayName: i === 0 ? "Today" : i === 1 ? "Tomorrow" : dayNames[date.getDay()],
        high: Math.round((daily.temperature_2m_max as number[])[i] ?? 25),
        low: Math.round((daily.temperature_2m_min as number[])[i] ?? 15),
        condition,
        humidity: 55,
        rainfall: Math.round(rainfall * 10) / 10,
        farmingNote: getFarmingNote(condition),
      };
    });

    res.json(forecast);
  } catch (err) {
    req.log.error({ err }, "Error fetching live forecast");
    res.status(500).json({ error: "Failed to fetch forecast" });
  }
});

router.get("/weather/farming-advice", async (req, res) => {
  const parsed = GetFarmingAdviceQueryParams.safeParse(req.query);
  const location = (parsed.success && parsed.data.location) ? parsed.data.location : "Nairobi, Kenya";
  const crop = (parsed.success && parsed.data.crop) ? parsed.data.crop : "";
  const lat = req.query.lat ? parseFloat(req.query.lat as string) : undefined;
  const lon = req.query.lon ? parseFloat(req.query.lon as string) : undefined;

  const hour = new Date().getUTCHours();
  const cacheKey = `farming_advice_${location}_${crop}_${new Date().toISOString().slice(0, 13)}_${Math.floor(hour / 2)}`;

  try {
    const cached = await getCached<any>(cacheKey);
    if (cached) {
      res.json(cached);
      return;
    }

    const geo = await resolveCoords(lat, lon, location);
    let weatherDesc = "Partly Cloudy, 22°C, 65% humidity, 10 km/h wind";
    if (geo) {
      try {
        const raw = await fetchLiveWeather(geo.lat, geo.lon);
        const c = raw.current;
        const code = c.weather_code ?? 0;
        const condition = WMO_CONDITIONS[code] ?? "Partly Cloudy";
        weatherDesc = `${condition}, ${Math.round(c.temperature_2m ?? 22)}°C, ${Math.round(c.relative_humidity_2m ?? 65)}% humidity, ${Math.round(c.wind_speed_10m ?? 10)} km/h wind, ${Math.round((c.precipitation ?? 0) * 10) / 10}mm precipitation`;
      } catch {}
    }

    const prompt = `You are an expert agricultural advisor. Based on LIVE weather for ${location}${crop ? `, advise specifically on ${crop}` : ""}.

Live Weather: ${weatherDesc}

Respond ONLY with a JSON object (no markdown):
{
  "location": "${location}",
  "advice": "2-3 sentences of practical farming advice for these exact conditions",
  "urgentAlerts": ["critical alert if any — omit if none"],
  "recommendations": ["specific action 1", "specific action 2", "specific action 3"]
}`;

    const text = await aiComplete(prompt, 500);
    const cleaned = (text ?? "{}").replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const advice = JSON.parse(cleaned);

    await setCached(cacheKey, advice, TTL.WEATHER);
    res.json(advice);
  } catch (err) {
    req.log.error({ err }, "Error getting farming advice");
    res.json({
      location,
      advice: "Weather conditions are currently being analyzed. Monitor soil moisture levels and adjust irrigation accordingly.",
      urgentAlerts: [],
      recommendations: [
        "Check soil moisture before irrigation",
        "Monitor crop health daily",
        "Prepare for upcoming weather changes",
      ],
    });
  }
});

export default router;
