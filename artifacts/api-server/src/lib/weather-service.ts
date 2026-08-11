import { WMO_CONDITIONS } from "./wmo-codes";

export interface WeatherData {
  location: string;
  temperature: number;
  humidity: number;
  rainfall: number;
  condition: string;
  windSpeed: number;
  feelsLike: number;
  uvIndex: number;
  updatedAt: string;
  isLive: boolean;
}

const geoCache = new Map<string, { lat: number; lon: number; name: string }>();

export async function geocodeLocation(location: string): Promise<{ lat: number; lon: number; name: string } | null> {
  const key = location.trim().toLowerCase();
  if (geoCache.has(key)) return geoCache.get(key)!;

  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en&format=json`;
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) return null;
    const data: any = await res.json();
    const result = data.results?.[0];
    if (!result) return null;
    const geo = { lat: result.latitude, lon: result.longitude, name: result.name };
    geoCache.set(key, geo);
    return geo;
  } catch {
    return null;
  }
}

export function getWeatherFallback(location: string): WeatherData {
  const seed = location.length;
  const temp = 24 + (seed % 8);
  const conditions = ["Partly Cloudy", "Mainly Clear", "Light Rain", "Clear Sky", "Overcast"];
  const condition = conditions[seed % conditions.length];
  return {
    location,
    temperature: temp,
    humidity: 60 + (seed % 25),
    rainfall: condition.includes("Rain") ? 2.5 : 0,
    condition,
    windSpeed: 10 + (seed % 10),
    feelsLike: temp - 1,
    uvIndex: 6 + (seed % 4),
    updatedAt: new Date().toISOString(),
    isLive: false,
  };
}

export async function fetchCurrentWeather(
  location: string = "Butuan City, Agusan del Norte",
  lat?: number,
  lon?: number
): Promise<WeatherData> {
  try {
    let targetLat = lat;
    let targetLon = lon;
    let resolvedName = location;

    if (targetLat === undefined || targetLon === undefined || isNaN(targetLat) || isNaN(targetLon)) {
      const geo = await geocodeLocation(location);
      if (geo) {
        targetLat = geo.lat;
        targetLon = geo.lon;
        resolvedName = geo.name || location;
      } else {
        return getWeatherFallback(location);
      }
    }

    const wxUrl = `https://api.open-meteo.com/v1/forecast?latitude=${targetLat}&longitude=${targetLon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,apparent_temperature,precipitation,uv_index&timezone=auto`;
    const res = await fetch(wxUrl, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return getWeatherFallback(location);

    const data: any = await res.json();
    const c = data.current;
    if (!c) return getWeatherFallback(location);

    const code = c.weather_code ?? 0;
    const condition = WMO_CONDITIONS[code] ?? "Partly Cloudy";

    return {
      location: resolvedName,
      temperature: Math.round(c.temperature_2m ?? 28),
      humidity: Math.round(c.relative_humidity_2m ?? 65),
      rainfall: Math.round((c.precipitation ?? 0) * 10) / 10,
      condition,
      windSpeed: Math.round(c.wind_speed_10m ?? 12),
      feelsLike: Math.round(c.apparent_temperature ?? 27),
      uvIndex: Math.round(c.uv_index ?? 6),
      updatedAt: new Date().toISOString(),
      isLive: true,
    };
  } catch (err) {
    return getWeatherFallback(location);
  }
}
