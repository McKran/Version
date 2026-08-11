import { Router } from "express";
import {
  GetCropRecommendationsQueryParams,
  GetCropCalendarQueryParams,
} from "@workspace/api-zod";

const router = Router();

const ALL_CROP_DATA = [
  { cropName: "Maize", suitability: "Excellent", riskLevel: "Low", estimatedYield: "4-8 tons/ha", plantingWindow: "Mar–May", notes: "Primary staple crop worldwide. Performs well in loam soils with adequate rainfall. Intercrop with beans for better soil nitrogen.", icon: "🌽", season: "long-rains", climate: ["tropical", "temperate", "continental"] },
  { cropName: "Wheat", suitability: "Excellent", riskLevel: "Low", estimatedYield: "3-7 tons/ha", plantingWindow: "Oct–Dec", notes: "Major cereal for global markets. Requires cool temperatures and well-drained soils. Good export potential.", icon: "🌾", season: "dry", climate: ["temperate", "continental", "mediterranean"] },
  { cropName: "Rice", suitability: "Excellent", riskLevel: "Medium", estimatedYield: "3-6 tons/ha", plantingWindow: "Apr–Jun", notes: "Key staple in Asia and Africa. Paddy varieties require flooded conditions; upland rice needs good moisture.", icon: "🍚", season: "long-rains", climate: ["tropical"] },
  { cropName: "Sorghum", suitability: "Excellent", riskLevel: "Low", estimatedYield: "2-4 tons/ha", plantingWindow: "Apr–Jun", notes: "Drought-tolerant. Ideal for semi-arid regions. Both grain and fodder uses.", icon: "🌾", season: "short-rains", climate: ["tropical", "arid"] },
  { cropName: "Millet", suitability: "Good", riskLevel: "Low", estimatedYield: "1.5-3 tons/ha", plantingWindow: "May–Jul", notes: "Highly drought-tolerant. Excellent for food security in dry climates. Short growing season.", icon: "🌾", season: "short-rains", climate: ["tropical", "arid"] },
  { cropName: "Barley", suitability: "Good", riskLevel: "Low", estimatedYield: "3-6 tons/ha", plantingWindow: "Sep–Nov", notes: "Cold-tolerant cereal for highland areas. High demand for malt and animal feed.", icon: "🌾", season: "dry", climate: ["temperate", "continental", "mediterranean"] },
  { cropName: "Teff", suitability: "Excellent", riskLevel: "Low", estimatedYield: "1-2 tons/ha", plantingWindow: "May–Jul", notes: "Ethiopian superfood grain. Gluten-free, high in iron. Growing export demand to health markets.", icon: "🌾", season: "long-rains", climate: ["tropical"] },
  { cropName: "Cassava", suitability: "Excellent", riskLevel: "Low", estimatedYield: "15-35 tons/ha", plantingWindow: "Mar–May", notes: "Key food security crop in Africa. Drought-tolerant after establishment. High carbohydrate content.", icon: "🥔", season: "long-rains", climate: ["tropical"] },
  { cropName: "Yam", suitability: "Good", riskLevel: "Medium", estimatedYield: "10-20 tons/ha", plantingWindow: "Feb–Apr", notes: "High-value crop in West Africa. Requires staking and well-drained fertile soils.", icon: "🍠", season: "long-rains", climate: ["tropical"] },
  { cropName: "Sweet Potato", suitability: "Excellent", riskLevel: "Low", estimatedYield: "10-20 tons/ha", plantingWindow: "Apr–May", notes: "Highly nutritious and fast-maturing. Orange-fleshed varieties rich in Vitamin A.", icon: "🍠", season: "long-rains", climate: ["tropical", "temperate"] },
  { cropName: "Potatoes", suitability: "Excellent", riskLevel: "Low", estimatedYield: "15-30 tons/ha", plantingWindow: "Feb–Apr", notes: "Thrives in cool highlands. Requires well-drained fertile soil. High market demand year-round.", icon: "🥔", season: "long-rains", climate: ["temperate", "continental", "tropical"] },
  { cropName: "Beans", suitability: "Excellent", riskLevel: "Low", estimatedYield: "1.5-3 tons/ha", plantingWindow: "Mar–Apr", notes: "Nitrogen fixer. Excellent for soil health. Wide market demand. Intercrop with maize.", icon: "🫘", season: "long-rains", climate: ["tropical", "temperate"] },
  { cropName: "Soybeans", suitability: "Excellent", riskLevel: "Low", estimatedYield: "2-4 tons/ha", plantingWindow: "Apr–Jun", notes: "Major global commodity. Strong export market. Used for oil, meal, and animal feed.", icon: "🫘", season: "long-rains", climate: ["tropical", "temperate", "continental"] },
  { cropName: "Groundnuts", suitability: "Good", riskLevel: "Low", estimatedYield: "1.5-3 tons/ha", plantingWindow: "Mar–May", notes: "High protein and oil content. Good drought tolerance after establishment.", icon: "🥜", season: "long-rains", climate: ["tropical", "arid"] },
  { cropName: "Cowpeas", suitability: "Excellent", riskLevel: "Low", estimatedYield: "1-2 tons/ha", plantingWindow: "May–Jun", notes: "Drought-tolerant legume for semi-arid areas. Leaves used as vegetables. Improves soil fertility.", icon: "🫘", season: "short-rains", climate: ["tropical", "arid"] },
  { cropName: "Chickpeas", suitability: "Good", riskLevel: "Low", estimatedYield: "1-2.5 tons/ha", plantingWindow: "Oct–Nov", notes: "High-value legume for export. Cool-season crop. Good for Mediterranean and highland climates.", icon: "🫘", season: "dry", climate: ["mediterranean", "temperate"] },
  { cropName: "Tomatoes", suitability: "Excellent", riskLevel: "Medium", estimatedYield: "20-50 tons/ha", plantingWindow: "Feb–Apr", notes: "High-value vegetable. Requires irrigation and intensive management. Excellent market prices.", icon: "🍅", season: "dry", climate: ["tropical", "temperate", "mediterranean"] },
  { cropName: "Onions", suitability: "Good", riskLevel: "Medium", estimatedYield: "10-25 tons/ha", plantingWindow: "Jun–Aug", notes: "Good dry-season crop. High and consistent market demand.", icon: "🧅", season: "dry", climate: ["tropical", "temperate", "arid"] },
  { cropName: "Garlic", suitability: "Good", riskLevel: "Medium", estimatedYield: "5-15 tons/ha", plantingWindow: "Sep–Nov", notes: "High-value crop with strong local and export demand. Prefers well-drained soils.", icon: "🧄", season: "dry", climate: ["mediterranean", "temperate"] },
  { cropName: "Cabbage", suitability: "Good", riskLevel: "Low", estimatedYield: "20-50 tons/ha", plantingWindow: "Apr–Jun", notes: "Cool-season vegetable with consistent market. Short rotation cycle.", icon: "🥬", season: "short-rains", climate: ["tropical", "temperate"] },
  { cropName: "Carrots", suitability: "Good", riskLevel: "Low", estimatedYield: "20-40 tons/ha", plantingWindow: "Mar–May", notes: "High nutrition value. Requires deep loose soil. Good processing and fresh market value.", icon: "🥕", season: "long-rains", climate: ["temperate", "tropical"] },
  { cropName: "Avocado", suitability: "Excellent", riskLevel: "Low", estimatedYield: "8-15 tons/ha", plantingWindow: "Year-round", notes: "Perennial with high export value. Growing global demand. Requires 3-5 years to first harvest.", icon: "🥑", season: "long-rains", climate: ["tropical", "mediterranean"] },
  { cropName: "Bananas", suitability: "Excellent", riskLevel: "Low", estimatedYield: "20-40 tons/ha", plantingWindow: "Year-round", notes: "Year-round producer. Key staple and export commodity. Requires sufficient water and nutrients.", icon: "🍌", season: "long-rains", climate: ["tropical"] },
  { cropName: "Mangoes", suitability: "Good", riskLevel: "Low", estimatedYield: "5-15 tons/ha", plantingWindow: "Oct–Dec", notes: "Perennial tree crop. Drought-tolerant once established. Good domestic and export markets.", icon: "🥭", season: "dry", climate: ["tropical", "arid"] },
  { cropName: "Coffee", suitability: "Excellent", riskLevel: "Medium", estimatedYield: "0.5-2 tons/ha", plantingWindow: "Year-round", notes: "Premium export crop. Shade-grown arabica fetches highest prices. 3-4 years to first harvest.", icon: "☕", season: "long-rains", climate: ["tropical"] },
  { cropName: "Tea", suitability: "Excellent", riskLevel: "Low", estimatedYield: "2-4 tons/ha (dry leaf)", plantingWindow: "Year-round", notes: "Perennial with consistent global demand. Best in high-altitude tropical regions.", icon: "🍵", season: "long-rains", climate: ["tropical"] },
  { cropName: "Cotton", suitability: "Good", riskLevel: "Medium", estimatedYield: "1-3 tons/ha", plantingWindow: "Apr–Jun", notes: "Major cash crop for textile industry. Requires 180-200 frost-free days.", icon: "🪤", season: "long-rains", climate: ["tropical", "arid"] },
  { cropName: "Sugarcane", suitability: "Excellent", riskLevel: "Low", estimatedYield: "60-120 tons/ha", plantingWindow: "Mar–Apr", notes: "Long-cycle crop (12-18 months). High biomass for sugar and ethanol production.", icon: "🎋", season: "long-rains", climate: ["tropical"] },
  { cropName: "Sunflower", suitability: "Good", riskLevel: "Low", estimatedYield: "1.5-3 tons/ha", plantingWindow: "Mar–Apr", notes: "Drought-tolerant oil crop. Stable prices. Good rotational crop for soil health.", icon: "🌻", season: "long-rains", climate: ["temperate", "tropical", "continental"] },
  { cropName: "Cocoa", suitability: "Excellent", riskLevel: "Medium", estimatedYield: "0.5-1.5 tons/ha", plantingWindow: "Year-round", notes: "Premium commodity with surging global prices. Requires humid tropical climate.", icon: "🍫", season: "long-rains", climate: ["tropical"] },
  { cropName: "Rubber", suitability: "Good", riskLevel: "Low", estimatedYield: "1-2 tons/ha latex", plantingWindow: "Year-round", notes: "Perennial tree crop for industrial rubber. Good returns after initial 6-7 year wait.", icon: "🌳", season: "long-rains", climate: ["tropical"] },
  { cropName: "Sesame", suitability: "Good", riskLevel: "Low", estimatedYield: "0.5-1.5 tons/ha", plantingWindow: "Jun–Jul", notes: "High-value oil crop. Drought tolerant. Growing export demand for food and oil sectors.", icon: "🌿", season: "short-rains", climate: ["tropical", "arid"] },
  { cropName: "Cashew", suitability: "Good", riskLevel: "Low", estimatedYield: "1-3 tons/ha", plantingWindow: "Year-round", notes: "Perennial tree crop suited to tropical coastal areas. High export value.", icon: "🥜", season: "dry", climate: ["tropical"] },
  { cropName: "Ginger", suitability: "Good", riskLevel: "Medium", estimatedYield: "10-20 tons/ha", plantingWindow: "Mar–Apr", notes: "High-value spice with strong export demand. Requires shade and well-drained soils.", icon: "🫚", season: "long-rains", climate: ["tropical"] },
];

const CALENDAR_EVENTS = [
  { crop: "Maize", activity: "Land preparation and plowing", daysFromNow: 2, priority: "high" },
  { crop: "Beans", activity: "Seed procurement and treatment", daysFromNow: 5, priority: "medium" },
  { crop: "Tomatoes", activity: "Nursery bed preparation", daysFromNow: 7, priority: "high" },
  { crop: "Maize", activity: "Planting — optimal window opens", daysFromNow: 10, priority: "high" },
  { crop: "Potatoes", activity: "Seed potato preparation", daysFromNow: 12, priority: "medium" },
  { crop: "Beans", activity: "Planting alongside maize", daysFromNow: 14, priority: "medium" },
  { crop: "Tomatoes", activity: "Transplanting to main field", daysFromNow: 21, priority: "high" },
  { crop: "All crops", activity: "First fertilizer top-dressing", daysFromNow: 28, priority: "medium" },
  { crop: "Maize", activity: "Pest scouting — stem borer check", daysFromNow: 35, priority: "low" },
  { crop: "Soybeans", activity: "Inoculation and planting", daysFromNow: 8, priority: "medium" },
  { crop: "Sorghum", activity: "Variety selection and seed prep", daysFromNow: 15, priority: "medium" },
  { crop: "Coffee", activity: "Pruning and canopy management", daysFromNow: 3, priority: "medium" },
  { crop: "Avocado", activity: "Irrigation schedule assessment", daysFromNow: 7, priority: "low" },
  { crop: "Cassava", activity: "Stem cutting selection", daysFromNow: 10, priority: "medium" },
  { crop: "All crops", activity: "Soil pH testing and lime application", daysFromNow: 45, priority: "medium" },
];

const CROP_NAMES_FIL: Record<string, string> = {
  Maize: "Mais",
  Wheat: "Trigo",
  Rice: "Palay",
  Sorghum: "Batad / Sorghum",
  Millet: "Mijo / Millet",
  Barley: "Barli",
  Teff: "Teff",
  Cassava: "Kamoteng Kahoy",
  Yam: "Ubi / Yam",
  "Sweet Potato": "Kamote",
  Potatoes: "Patatas",
  Beans: "Sitaw / Mungo",
  Soybeans: "Soya / Soybeans",
  Groundnuts: "Mani",
  Cowpeas: "Paayap",
  Chickpeas: "Garbanzos",
  Tomatoes: "Kamatis",
  Onions: "Sibuyas",
  Garlic: "Bawang",
  Cabbage: "Repolyo",
  Carrots: "Karot",
  Avocado: "Abokado",
  Bananas: "Saging",
  Mangoes: "Mangga",
  Coffee: "Kape",
  Tea: "Tsaa",
  Cotton: "Bulak",
  Sugarcane: "Tubo",
  Sunflower: "Mirasol",
  Cocoa: "Kakaw",
  Rubber: "Goma",
  Sesame: "Lenga",
  Cashew: "Kasuy",
  Ginger: "Luya",
  "All crops": "Lahat ng pananim",
};

const CROP_NOTES_FIL: Record<string, string> = {
  Maize: "Pangunahing pananim na pagkain sa buong mundo. Mahusay sa lupang loam na may sapat na ulan. Isabay ang sitaw o mungo para sa mas magandang nitraheno sa lupa.",
  Wheat: "Pangunahing siryal para sa pandaigdigang merkado. Nangangailangan ng malamig na temperatura at maayos na basang lupa. Magandang potensyal sa pagluwas.",
  Rice: "Pangunahing pagkain sa Asya at Africa. Ang mga uri sa padak ay nangangailangan ng tubig; ang palay sa mataas na lupa ay kailangan ng sapat na halumigmig.",
  Sorghum: "Matatag sa tagtuyot. Tamang-tama para sa mga tuyong rehiyon. Ginagamit bilang pagkain at pakain sa hayop.",
  Millet: "Napakatatag sa tagtuyot. Napakahusay para sa seguridad sa pagkain sa tuyong klima. Maikling panahon ng paglaki.",
  Barley: "Malamig na klima siryal para sa mataas na lugar. Mataas ang demand para sa malt at pakain sa hayop.",
  Teff: "Grap ng Ethiopia na walang gluten, mayaman sa bakal. Lumalaking demand sa merkado ng kalusugan.",
  Cassava: "Pangunahing pananim sa seguridad sa pagkain. Matatag sa tagtuyot pagkaraang maitanim. Mataas ang nilalamang carbohydrates.",
  Yam: "Mataas ang halagang pananim. Nangangailangan ng suporta at matabang lupa na may maayos na patubig.",
  "Sweet Potato": "Mataas ang sustansya at mabilis lumaki. Ang mga kulay kahel na uri ay mayaman sa Bitamina A.",
  Potatoes: "Lumalago sa malamig na kabundukan. Nangangailangan ng maayos na lupang pataba. Mataas ang demand sa merkado buong taon.",
  Beans: "Nagpapataas ng nitraheno sa lupa. Napakahusay para sa kalusugan ng lupa. Malawak ang demand sa merkado.",
  Soybeans: "Pangunahing pandaigdigang kalakal. Malakas na merkado sa pagluwas. Ginagamit para sa langis at pakain sa hayop.",
  Groundnuts: "Mataas ang protina at langis. Magandang katatagan sa tagtuyot kapag nakatanim na.",
  Cowpeas: "Matatag sa tagtuyot na halaman para sa tuyong lugar. Ang mga dahon ay ginagawang gulay. Nagpapaganda ng lupa.",
  Chickpeas: "Mataas ang halaga na legumbre para sa pagluwas. Pananim para sa malamig na panahon.",
  Tomatoes: "Mataas ang halaga na gulay. Nangangailangan ng patubig at maingat na pamamahala. Magandang presyo sa merkado.",
  Onions: "Magandang pananim sa tag-araw. Mataas at pare-parehong demand sa merkado.",
  Garlic: "Mataas ang halaga na pananim na may malakas na demand sa lokal at labas ng bansa.",
  Cabbage: "Gulay sa malamig na panahon na may pare-parehong merkado. Maikling siklo ng pagtatanim.",
  Carrots: "Mataas ang halagang pampalusog. Nangangailangan ng malalim at malambot na lupa.",
  Avocado: "Perennial na may mataas na halaga sa pagluwas. Lumalaking demand sa buong mundo. 3-5 taon bago ang unang ani.",
  Bananas: "Nagbibigay ng ani buong taon. Pangunahing pagkain at produktong iniluluwas. Nangangailangan ng sapat na tubig at pataba.",
  Mangoes: "Puno ng prutas na matatag sa tagtuyot kapag nakatanim na. Magandang merkado sa lokal at ibang bansa.",
  Coffee: "Premyong pananim sa pagluwas. Ang arabica sa lilim ang may pinakamataas na presyo.",
  Tea: "Perennial na may pare-parehong demand sa buong mundo. Pinakamainam sa mataas na lugar.",
  Cotton: "Pangunahing cash crop para sa industriya ng tela. Nangangailangan ng 180-200 araw na walang yelo.",
  Sugarcane: "Mahabang siklo ng pananim (12-18 buwan). Mataas na biomasa para sa asukal at etanol.",
  Sunflower: "Matatag sa tagtuyot na pananim para sa langis. Tiyak ang presyo. Maganda para sa kalusugan ng lupa.",
  Cocoa: "Premyong kalakal na may tumataas na presyo sa mundo. Nangangailangan ng basang klimang tropikal.",
  Rubber: "Perennial na puno para sa industriyal na goma. Magandang kita pagkalipas ng 6-7 taon.",
  Sesame: "Mataas ang halaga na pananim para sa langis. Matatag sa tagtuyot. Lumalaking demand sa pagluwas.",
  Cashew: "Puno ng prutas na angkop sa tropikal na baybayin. Mataas ang halaga sa pagluwas.",
  Ginger: "Mataas ang halaga na pampalasa na may malakas na demand. Nangangailangan ng lilim at basang lupa.",
};

const CROP_WINDOWS_FIL: Record<string, string> = {
  "Mar–May": "Mar–Mayo",
  "Oct–Dec": "Okt–Dis",
  "Apr–Jun": "Abr–Hun",
  "May–Jul": "Mayo–Hul",
  "Sep–Nov": "Set–Nob",
  "Feb–Apr": "Peb–Abr",
  "Jun–Aug": "Hun–Ago",
  "Jun–Jul": "Hun–Hul",
  "Mar–Apr": "Mar–Abr",
  "Year-round": "Buong taon",
};

const CALENDAR_ACTIVITIES_FIL: Record<string, string> = {
  "Land preparation and plowing": "Paghahanda ng lupa at pag-aararo",
  "Seed procurement and treatment": "Pagbili ng binhi at paggamot",
  "Nursery bed preparation": "Paghahanda ng kama ng punlaan",
  "Planting — optimal window opens": "Pagtatanim — bukas ang pinakamainam na panahon",
  "Seed potato preparation": "Paghahanda ng binhing patatas",
  "Planting alongside maize": "Pagtatanim kasabay ng mais",
  "Transplanting to main field": "Pagtatipat sa pangunahing bukid",
  "First fertilizer top-dressing": "Unang pag-aabono (top-dressing)",
  "Pest scouting — stem borer check": "Pagsusuri sa peste — pag-inspeksyon sa stem borer",
  "Inoculation and planting": "Inokulasyon at pagtatanim",
  "Variety selection and seed prep": "Pagpili ng uri at paghahanda ng binhi",
  "Pruning and canopy management": "Pagpuksa/pagtatabas ng sanga at pamamahala ng puno",
  "Irrigation schedule assessment": "Pagtataya ng iskedyul ng pagpapatubig",
  "Stem cutting selection": "Pagpili ng mga putol ng stem",
  "Soil pH testing and lime application": "Pagsusuri ng pH ng lupa at paglalagay ng apog",
};

router.get("/crops/recommendations", async (req, res) => {
  const parsed = GetCropRecommendationsQueryParams.safeParse(req.query);
  const season = (parsed.success && parsed.data.season) ? parsed.data.season : "long-rains";
  const climate = req.query.climate as string || "";
  const lang = (req.query.lang as string) || "en";
  const isFil = lang === "fil";

  try {
    let filtered = ALL_CROP_DATA.filter(c => c.season === season || season === "all");
    if (climate && filtered.length > 0) {
      const climateFiltered = filtered.filter(c => c.climate.includes(climate as any));
      if (climateFiltered.length >= 3) filtered = climateFiltered;
    }
    const rawResults = filtered.length > 0 ? filtered : ALL_CROP_DATA;
    const results = rawResults.map(({ season: _s, climate: _c, ...crop }) => {
      if (!isFil) return crop;
      return {
        ...crop,
        cropName: CROP_NAMES_FIL[crop.cropName] || crop.cropName,
        notes: CROP_NOTES_FIL[crop.cropName] || crop.notes,
        plantingWindow: CROP_WINDOWS_FIL[crop.plantingWindow] || crop.plantingWindow,
        estimatedYield: crop.estimatedYield.replace("tons/ha", "tonelada/ha"),
      };
    });
    res.json(results);
  } catch (err) {
    req.log.error({ err }, "Error getting crop recommendations");
    res.status(500).json({ error: "Failed to fetch crop recommendations" });
  }
});

router.get("/crops/calendar", async (req, res) => {
  const lang = (req.query.lang as string) || "en";
  const isFil = lang === "fil";

  try {
    const events = CALENDAR_EVENTS.map(event => {
      if (!isFil) return event;
      return {
        ...event,
        crop: CROP_NAMES_FIL[event.crop] || event.crop,
        activity: CALENDAR_ACTIVITIES_FIL[event.activity] || event.activity,
      };
    });
    res.json(events);
  } catch (err) {
    req.log.error({ err }, "Error getting crop calendar");
    res.status(500).json({ error: "Failed to fetch crop calendar" });
  }
});

export default router;
