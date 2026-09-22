import { getCached, setCached, TTL } from "./db-cache";

export interface DisasterAlert {
  id: string;
  title: string;
  eventType:
    | "Typhoon"
    | "Tropical Cyclone"
    | "Heavy Rain"
    | "Torrential Rainfall"
    | "Flooding Risk"
    | "Strong Winds"
    | "Storm Surge"
    | "Thunderstorm"
    | "Severe Weather";
  severity: "Severe Warning" | "Warning" | "Watch" | "Information";
  affectedAreas: string[];
  issuedAt: string;
  validPeriod?: string;
  warningLevel?: string; // e.g. "Signal No. 2", "Red Rainfall Warning", "Yellow Alert"
  expectedRainfall?: string;
  expectedWinds?: string;
  stormLocation?: string;
  stormMovement?: string;
  officialInstructions?: string;
  source: string;
  updatedAt: string;
  active: boolean;
}

export interface DisasterAlertsResponse {
  location: string;
  hasActiveAlert: boolean;
  alerts: DisasterAlert[];
  message: string;
  updatedAt: string;
  source: string;
}

// Map of Philippines Provinces to Regions / Regions to Provinces for exact area matching
const PHILIPPINES_REGIONS_MAP: Record<string, string[]> = {
  "REGION I": ["Ilocos Norte", "Ilocos Sur", "La Union", "Pangasinan"],
  "REGION II": ["Batanes", "Cagayan", "Isabela", "Nueva Vizcaya", "Quirino"],
  "REGION III": ["Bataan", "Bulacan", "Nueva Ecija", "Pampanga", "Tarlac", "Zambales", "Aurora"],
  "REGION IV-A": ["Batangas", "Cavite", "Laguna", "Quezon", "Rizal", "Calabarzon"],
  "REGION IV-B": ["Marinduque", "Occidental Mindoro", "Oriental Mindoro", "Palawan", "Romblon", "Mimaropa"],
  "REGION V": ["Albay", "Camarines Norte", "Camarines Sur", "Catanduanes", "Masbate", "Sorsogon", "Bicol"],
  "REGION VI": ["Aklan", "Antique", "Capiz", "Guimaras", "Iloilo", "Negros Occidental"],
  "REGION VII": ["Bohol", "Cebu", "Negros Oriental", "Siquijor"],
  "REGION VIII": ["Biliran", "Eastern Samar", "Leyte", "Northern Samar", "Samar", "Southern Leyte", "Tacloban"],
  "REGION IX": ["Zamboanga del Norte", "Zamboanga del Sur", "Zamboanga Sibugay", "Zamboanga City"],
  "REGION X": ["Bukidnon", "Camiguin", "Lanao del Norte", "Misamis Occidental", "Misamis Oriental", "Cagayan de Oro"],
  "REGION XI": ["Davao de Oro", "Davao del Norte", "Davao del Sur", "Davao Occidental", "Davao Oriental", "Davao City", "Mati"],
  "REGION XII": ["Cotabato", "Sarangani", "South Cotabato", "Sultan Kudarat", "General Santos"],
  "REGION XIII": ["Agusan del Norte", "Agusan del Sur", "Dinagat Islands", "Surigao del Norte", "Surigao del Sur", "Butuan", "Caraga"],
  "CAR": ["Abra", "Apayao", "Benguet", "Ifugao", "Kalinga", "Mountain Province", "Baguio"],
  "NCR": ["Metro Manila", "Manila", "Quezon City", "Kaloocan", "Makati", "Pasig", "Taguig"],
  "BARMM": ["Basilan", "Lanao del Sur", "Maguindanao", "Sulu", "Tawi-Tawi"],
};

/**
  Checks whether a PAGASA alert's affectedAreas matches the user's location string.
 */
export function isLocationInAffectedArea(userLocation: string, affectedAreas: string[]): boolean {
  if (!affectedAreas || affectedAreas.length === 0) return true; // Nationwide
  
  const locUpper = userLocation.toUpperCase();
  
  // Check if any area explicitly mentioned in alert matches user location
  for (const area of affectedAreas) {
    const areaUpper = area.toUpperCase();
    if (areaUpper === "PHILIPPINES" || areaUpper === "NATIONWIDE" || areaUpper === "ALL AREAS") {
      return true;
    }
    if (locUpper.includes(areaUpper) || areaUpper.includes(locUpper)) {
      return true;
    }
    // Check region mappings
    for (const [region, provinces] of Object.entries(PHILIPPINES_REGIONS_MAP)) {
      const matchRegion = areaUpper.includes(region) || region.includes(areaUpper);
      if (matchRegion) {
        if (provinces.some(p => locUpper.includes(p.toUpperCase()))) {
          return true;
        }
      }
      const matchProvinceInRegion = provinces.some(p => areaUpper.includes(p.toUpperCase()));
      if (matchProvinceInRegion) {
        if (locUpper.includes(region) || provinces.some(p => locUpper.includes(p.toUpperCase()))) {
          return true;
        }
      }
    }
  }

  return false;
}

/**
 * Fetch official PAGASA severe weather bulletins from PAGASA DOST public feeds
 */
export async function fetchPAGASAOfficialAlerts(): Promise<DisasterAlert[]> {
  const cacheKey = "pagasa_official_alerts_raw_v2";
  const cached = await getCached<DisasterAlert[]>(cacheKey);
  if (cached) return cached;

  const alerts: DisasterAlert[] = [];
  const nowStr = new Date().toISOString();

  try {
    // 1. Fetch official PAGASA RSS / Bulletin XML
    const pagasaRssUrl = "https://pubfiles.pagasa.dost.gov.ph/pagasaffws/weather.xml";
    const res = await fetch(pagasaRssUrl, { signal: AbortSignal.timeout(6000) });

    if (res.ok) {
      const xmlText = await res.text();
      // Parse XML items for weather advisories or severe weather signals
      const itemMatches = xmlText.match(/<item>([\s\S]*?)<\/item>/gi) || [];

      for (let i = 0; i < itemMatches.length; i++) {
        const item = itemMatches[i];
        const titleMatch = item.match(/<title>(.*?)<\/title>/i);
        const descMatch = item.match(/<description>(.*?)<\/description>/i);
        const pubDateMatch = item.match(/<pubDate>(.*?)<\/pubDate>/i);

        const title = titleMatch ? titleMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1").trim() : "";
        const desc = descMatch ? descMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1").trim() : "";
        const pubDate = pubDateMatch ? pubDateMatch[1].trim() : nowStr;

        if (title && (title.toLowerCase().includes("bulletin") || title.toLowerCase().includes("warning") || title.toLowerCase().includes("advisory") || title.toLowerCase().includes("signal"))) {
          let severity: "Severe Warning" | "Warning" | "Watch" | "Information" = "Information";
          let eventType: DisasterAlert["eventType"] = "Severe Weather";

          if (title.toLowerCase().includes("typhoon") || title.toLowerCase().includes("tcws") || title.toLowerCase().includes("signal no. 3") || title.toLowerCase().includes("signal no. 4") || title.toLowerCase().includes("signal no. 5")) {
            severity = "Severe Warning";
            eventType = "Typhoon";
          } else if (title.toLowerCase().includes("signal no. 2") || title.toLowerCase().includes("red rainfall")) {
            severity = "Warning";
            eventType = "Heavy Rain";
          } else if (title.toLowerCase().includes("signal no. 1") || title.toLowerCase().includes("orange rainfall") || title.toLowerCase().includes("flood")) {
            severity = "Watch";
            eventType = "Flooding Risk";
          }

          alerts.push({
            id: `pagasa_xml_${i}_${Date.now()}`,
            title: title || "PAGASA Weather Advisory",
            eventType,
            severity,
            affectedAreas: extractProvincesFromText(desc || title),
            issuedAt: pubDate,
            officialInstructions: desc ? cleanHtml(desc) : "Follow official DOST-PAGASA safety guidelines and local DRRMC announcements.",
            source: "DOST-PAGASA Weather Division (Official RSS)",
            updatedAt: nowStr,
            active: true,
          });
        }
      }
    }
  } catch (err) {
    // Gracefully handle network timeouts without breaking
  }

  // Cache alerts for 10 minutes
  await setCached(cacheKey, alerts, TTL.WEATHER);
  return alerts;
}

/**
 * Extracts province/city names mentioned in PAGASA bulletin text
 */
function extractProvincesFromText(text: string): string[] {
  const found: string[] = [];
  const textUpper = text.toUpperCase();

  for (const provinces of Object.values(PHILIPPINES_REGIONS_MAP)) {
    for (const p of provinces) {
      if (textUpper.includes(p.toUpperCase())) {
        if (!found.includes(p)) found.push(p);
      }
    }
  }

  return found.length > 0 ? found : ["Nationwide"];
}

function cleanHtml(html: string): string {
  return html.replace(/<[^>]*>?/gm, "").replace(/&nbsp;/g, " ").trim();
}

/**
 * Get Disaster Alerts tailored for the user's location
 */
export async function getDisasterAlertsForLocation(
  userLocation: string,
  lang: string = "en"
): Promise<DisasterAlertsResponse> {
  const rawAlerts = await fetchPAGASAOfficialAlerts();
  
  // Filter alerts that match user location
  const matchingAlerts = rawAlerts.filter(alert => 
    isLocationInAffectedArea(userLocation, alert.affectedAreas)
  );

  const isFil = lang === "fil";
  const hasActiveAlert = matchingAlerts.length > 0;

  return {
    location: userLocation,
    hasActiveAlert,
    alerts: matchingAlerts,
    message: hasActiveAlert
      ? (isFil ? "Mayroong opisyal na babala sa masamang panahon mula sa PAGASA para sa iyong lugar." : "Official PAGASA severe weather alert in effect for your location.")
      : (isFil ? "Walang aktibong babala sa masamang panahon." : "No active severe weather alerts."),
    updatedAt: new Date().toISOString(),
    source: "DOST-PAGASA (Philippine Atmospheric, Geophysical and Astronomical Services Administration)",
  };
}
