/**
 * GDD-Based Farming Plan Engine
 *
 * Generates farming plans using the Growing Degree Day (GDD) method.
 *
 * SCIENTIFIC BASIS:
 *   GDD = max(0, (Tmax + Tmin) / 2 - Tbase)
 *
 *   Crop growth stage thresholds (GDD values) are sourced from:
 *   - FAO Irrigation and Drainage Paper No. 56 (Allen et al., 1998)
 *     https://www.fao.org/3/x0490e/x0490e00.htm
 *   - USDA Agricultural Handbook No. 8 (open access)
 *   - CIMMYT (International Maize and Wheat Improvement Center) open data
 *   - Agronomy Journal publications (open access)
 *
 * IMPORTANT: The GDD thresholds below are biological CONSTANTS (not timelines).
 * The actual day numbers are computed at runtime from real local climate data,
 * making every plan location-specific and dynamically generated.
 */

import { ClimateProfile, ForecastDay } from "./open-data-fetcher";

export interface CropGDDProfile {
  name: string;
  category: string;
  emoji: string;
  gddBase: number;
  gddPhases: {
    germination: number;
    establishment: number;
    vegetative: number;
    flowering: number;
    fruitOrGrainSet: number;
    maturity: number;
  };
  tempRange: { min: number; optimal: number; max: number };
  waterRequirementMm: number;
  criticalWaterStages: string[];
  fertilizerProfile: {
    n_kg_ha: number;
    p_kg_ha: number;
    k_kg_ha: number;
    splitApplications: number;
  };
  commonPests: Array<{ name: string; tempTriggerMin: number; tempTriggerMax: number; humidityTrigger?: number }>;
  source: string;
}

const CROP_GDD_PROFILES: Record<string, CropGDDProfile> = {
  // ── Cereals / Grains ───────────────────────────────────────────────────────
  "rice": {
    name: "Rice", category: "Cereals", emoji: "🌾",
    gddBase: 10,
    gddPhases: { germination: 80, establishment: 200, vegetative: 600, flowering: 900, fruitOrGrainSet: 1100, maturity: 1400 },
    tempRange: { min: 10, optimal: 27, max: 38 },
    waterRequirementMm: 1200,
    criticalWaterStages: ["tillering", "flowering", "grain-fill"],
    fertilizerProfile: { n_kg_ha: 120, p_kg_ha: 60, k_kg_ha: 60, splitApplications: 3 },
    commonPests: [
      { name: "Rice Blast", tempTriggerMin: 24, tempTriggerMax: 28, humidityTrigger: 85 },
      { name: "Brown Planthopper", tempTriggerMin: 26, tempTriggerMax: 32 },
      { name: "Stem Borer", tempTriggerMin: 22, tempTriggerMax: 30 },
    ],
    source: "FAO Paper 56 (Allen 1998), IRRI Open Data",
  },
  "maize": {
    name: "Maize", category: "Cereals", emoji: "🌽",
    gddBase: 10,
    gddPhases: { germination: 60, establishment: 180, vegetative: 500, flowering: 750, fruitOrGrainSet: 1000, maturity: 1400 },
    tempRange: { min: 10, optimal: 25, max: 35 },
    waterRequirementMm: 500,
    criticalWaterStages: ["silking", "grain-fill"],
    fertilizerProfile: { n_kg_ha: 150, p_kg_ha: 75, k_kg_ha: 50, splitApplications: 3 },
    commonPests: [
      { name: "Fall Armyworm", tempTriggerMin: 20, tempTriggerMax: 32 },
      { name: "Stalk Borer", tempTriggerMin: 22, tempTriggerMax: 30 },
      { name: "Northern Leaf Blight", tempTriggerMin: 18, tempTriggerMax: 27, humidityTrigger: 80 },
    ],
    source: "USDA Agronomy Handbook, CIMMYT Open Data",
  },
  "wheat": {
    name: "Wheat", category: "Cereals", emoji: "🌾",
    gddBase: 0,
    gddPhases: { germination: 80, establishment: 200, vegetative: 600, flowering: 1000, fruitOrGrainSet: 1300, maturity: 1700 },
    tempRange: { min: 3, optimal: 18, max: 30 },
    waterRequirementMm: 450,
    criticalWaterStages: ["tillering", "heading"],
    fertilizerProfile: { n_kg_ha: 100, p_kg_ha: 60, k_kg_ha: 40, splitApplications: 2 },
    commonPests: [
      { name: "Rust (Stripe/Leaf)", tempTriggerMin: 10, tempTriggerMax: 20, humidityTrigger: 75 },
      { name: "Aphids", tempTriggerMin: 15, tempTriggerMax: 25 },
    ],
    source: "FAO Paper 56, CIMMYT Wheat Research Open Data",
  },
  "sorghum": {
    name: "Sorghum", category: "Cereals", emoji: "🌾",
    gddBase: 10,
    gddPhases: { germination: 60, establishment: 170, vegetative: 450, flowering: 700, fruitOrGrainSet: 950, maturity: 1250 },
    tempRange: { min: 12, optimal: 30, max: 40 },
    waterRequirementMm: 300,
    criticalWaterStages: ["boot-stage", "grain-fill"],
    fertilizerProfile: { n_kg_ha: 80, p_kg_ha: 40, k_kg_ha: 40, splitApplications: 2 },
    commonPests: [
      { name: "Sorghum Aphid", tempTriggerMin: 22, tempTriggerMax: 34 },
      { name: "Shoot Fly", tempTriggerMin: 26, tempTriggerMax: 35 },
    ],
    source: "ICRISAT Sorghum Open Research Data",
  },

  // ── Vegetables ────────────────────────────────────────────────────────────
  "tomato": {
    name: "Tomato", category: "Vegetables", emoji: "🍅",
    gddBase: 10,
    gddPhases: { germination: 80, establishment: 200, vegetative: 450, flowering: 700, fruitOrGrainSet: 950, maturity: 1200 },
    tempRange: { min: 10, optimal: 22, max: 32 },
    waterRequirementMm: 600,
    criticalWaterStages: ["flowering", "fruit-set", "fruit-sizing"],
    fertilizerProfile: { n_kg_ha: 180, p_kg_ha: 90, k_kg_ha: 200, splitApplications: 4 },
    commonPests: [
      { name: "Early Blight", tempTriggerMin: 24, tempTriggerMax: 30, humidityTrigger: 80 },
      { name: "Late Blight", tempTriggerMin: 12, tempTriggerMax: 20, humidityTrigger: 90 },
      { name: "Whitefly", tempTriggerMin: 22, tempTriggerMax: 33 },
    ],
    source: "FAO Horticultural Crops, AVRDC open datasets",
  },
  "eggplant": {
    name: "Eggplant", category: "Vegetables", emoji: "🍆",
    gddBase: 10,
    gddPhases: { germination: 90, establishment: 220, vegetative: 480, flowering: 720, fruitOrGrainSet: 950, maturity: 1150 },
    tempRange: { min: 15, optimal: 27, max: 35 },
    waterRequirementMm: 500,
    criticalWaterStages: ["flowering", "fruit-set"],
    fertilizerProfile: { n_kg_ha: 120, p_kg_ha: 60, k_kg_ha: 100, splitApplications: 3 },
    commonPests: [
      { name: "Eggplant Fruit & Shoot Borer", tempTriggerMin: 22, tempTriggerMax: 34 },
      { name: "Spider Mites", tempTriggerMin: 26, tempTriggerMax: 35 },
      { name: "Phomopsis Blight", tempTriggerMin: 20, tempTriggerMax: 30, humidityTrigger: 85 },
    ],
    source: "AVRDC (WorldVeg) Eggplant Research, open data",
  },
  "onion": {
    name: "Onion", category: "Vegetables", emoji: "🧅",
    gddBase: 7,
    gddPhases: { germination: 100, establishment: 250, vegetative: 600, flowering: 900, fruitOrGrainSet: 1100, maturity: 1400 },
    tempRange: { min: 7, optimal: 20, max: 28 },
    waterRequirementMm: 350,
    criticalWaterStages: ["bulb-initiation", "bulb-development"],
    fertilizerProfile: { n_kg_ha: 100, p_kg_ha: 60, k_kg_ha: 80, splitApplications: 3 },
    commonPests: [
      { name: "Thrips", tempTriggerMin: 22, tempTriggerMax: 32 },
      { name: "Purple Blotch", tempTriggerMin: 20, tempTriggerMax: 28, humidityTrigger: 80 },
    ],
    source: "AVRDC Vegetable Research Data",
  },
  "garlic": {
    name: "Garlic", category: "Vegetables", emoji: "🧄",
    gddBase: 7,
    gddPhases: { germination: 80, establishment: 200, vegetative: 550, flowering: 900, fruitOrGrainSet: 1100, maturity: 1450 },
    tempRange: { min: 5, optimal: 18, max: 26 },
    waterRequirementMm: 300,
    criticalWaterStages: ["bulb-development"],
    fertilizerProfile: { n_kg_ha: 80, p_kg_ha: 50, k_kg_ha: 80, splitApplications: 2 },
    commonPests: [
      { name: "Thrips", tempTriggerMin: 20, tempTriggerMax: 30 },
      { name: "Purple Blotch", tempTriggerMin: 18, tempTriggerMax: 26, humidityTrigger: 80 },
    ],
    source: "FAO Vegetable Production Guidelines",
  },
  "cabbage": {
    name: "Cabbage", category: "Vegetables", emoji: "🥬",
    gddBase: 7,
    gddPhases: { germination: 80, establishment: 200, vegetative: 450, flowering: 700, fruitOrGrainSet: 850, maturity: 1100 },
    tempRange: { min: 5, optimal: 16, max: 25 },
    waterRequirementMm: 380,
    criticalWaterStages: ["head-formation"],
    fertilizerProfile: { n_kg_ha: 120, p_kg_ha: 80, k_kg_ha: 100, splitApplications: 3 },
    commonPests: [
      { name: "Diamondback Moth", tempTriggerMin: 20, tempTriggerMax: 30 },
      { name: "Cabbage Aphid", tempTriggerMin: 15, tempTriggerMax: 25 },
    ],
    source: "FAO Vegetable Production Guidelines",
  },
  "carrot": {
    name: "Carrot", category: "Vegetables", emoji: "🥕",
    gddBase: 4,
    gddPhases: { germination: 90, establishment: 220, vegetative: 500, flowering: 800, fruitOrGrainSet: 950, maturity: 1150 },
    tempRange: { min: 7, optimal: 17, max: 25 },
    waterRequirementMm: 350,
    criticalWaterStages: ["root-thickening"],
    fertilizerProfile: { n_kg_ha: 60, p_kg_ha: 80, k_kg_ha: 120, splitApplications: 2 },
    commonPests: [
      { name: "Carrot Fly", tempTriggerMin: 12, tempTriggerMax: 20 },
      { name: "Alternaria Leaf Blight", tempTriggerMin: 20, tempTriggerMax: 28, humidityTrigger: 80 },
    ],
    source: "FAO Horticultural Crop Guidelines",
  },
  "ampalaya": {
    name: "Ampalaya (Bitter Melon)", category: "Vegetables", emoji: "🥒",
    gddBase: 12,
    gddPhases: { germination: 70, establishment: 190, vegetative: 420, flowering: 620, fruitOrGrainSet: 820, maturity: 1050 },
    tempRange: { min: 18, optimal: 28, max: 36 },
    waterRequirementMm: 450,
    criticalWaterStages: ["flowering", "fruit-set"],
    fertilizerProfile: { n_kg_ha: 80, p_kg_ha: 50, k_kg_ha: 80, splitApplications: 3 },
    commonPests: [
      { name: "Fruit Fly", tempTriggerMin: 24, tempTriggerMax: 34 },
      { name: "Powdery Mildew", tempTriggerMin: 18, tempTriggerMax: 28, humidityTrigger: 60 },
    ],
    source: "PCARRD / DA Philippines Crop Guides",
  },
  "okra": {
    name: "Okra", category: "Vegetables", emoji: "🫛",
    gddBase: 12,
    gddPhases: { germination: 60, establishment: 160, vegetative: 380, flowering: 580, fruitOrGrainSet: 760, maturity: 950 },
    tempRange: { min: 18, optimal: 28, max: 38 },
    waterRequirementMm: 300,
    criticalWaterStages: ["flowering", "pod-development"],
    fertilizerProfile: { n_kg_ha: 70, p_kg_ha: 40, k_kg_ha: 60, splitApplications: 2 },
    commonPests: [
      { name: "Aphids", tempTriggerMin: 20, tempTriggerMax: 30 },
      { name: "Root Knot Nematode", tempTriggerMin: 24, tempTriggerMax: 32 },
    ],
    source: "AVRDC Vegetable Research, open data",
  },
  "squash": {
    name: "Squash", category: "Vegetables", emoji: "🎃",
    gddBase: 10,
    gddPhases: { germination: 60, establishment: 170, vegetative: 400, flowering: 600, fruitOrGrainSet: 800, maturity: 1050 },
    tempRange: { min: 15, optimal: 26, max: 35 },
    waterRequirementMm: 400,
    criticalWaterStages: ["flowering", "fruit-set"],
    fertilizerProfile: { n_kg_ha: 80, p_kg_ha: 50, k_kg_ha: 80, splitApplications: 3 },
    commonPests: [
      { name: "Squash Vine Borer", tempTriggerMin: 22, tempTriggerMax: 32 },
      { name: "Powdery Mildew", tempTriggerMin: 20, tempTriggerMax: 28, humidityTrigger: 60 },
    ],
    source: "USDA Cucurbit Research, open-access",
  },
  "cucumber": {
    name: "Cucumber", category: "Vegetables", emoji: "🥒",
    gddBase: 10,
    gddPhases: { germination: 55, establishment: 160, vegetative: 380, flowering: 570, fruitOrGrainSet: 750, maturity: 950 },
    tempRange: { min: 15, optimal: 25, max: 34 },
    waterRequirementMm: 400,
    criticalWaterStages: ["flowering", "fruit-sizing"],
    fertilizerProfile: { n_kg_ha: 80, p_kg_ha: 50, k_kg_ha: 100, splitApplications: 3 },
    commonPests: [
      { name: "Downy Mildew", tempTriggerMin: 15, tempTriggerMax: 22, humidityTrigger: 85 },
      { name: "Cucumber Beetle", tempTriggerMin: 20, tempTriggerMax: 30 },
    ],
    source: "USDA Cucurbit Research, open-access",
  },
  "bell pepper": {
    name: "Bell Pepper", category: "Vegetables", emoji: "🫑",
    gddBase: 10,
    gddPhases: { germination: 90, establishment: 230, vegetative: 500, flowering: 750, fruitOrGrainSet: 1000, maturity: 1250 },
    tempRange: { min: 15, optimal: 22, max: 30 },
    waterRequirementMm: 500,
    criticalWaterStages: ["flowering", "fruit-set", "fruit-sizing"],
    fertilizerProfile: { n_kg_ha: 120, p_kg_ha: 70, k_kg_ha: 140, splitApplications: 4 },
    commonPests: [
      { name: "Phytophthora Blight", tempTriggerMin: 20, tempTriggerMax: 28, humidityTrigger: 90 },
      { name: "Pepper Weevil", tempTriggerMin: 22, tempTriggerMax: 32 },
    ],
    source: "FAO Horticultural Crops, AVRDC",
  },
  "chili": {
    name: "Chili", category: "Vegetables", emoji: "🌶️",
    gddBase: 10,
    gddPhases: { germination: 90, establishment: 220, vegetative: 480, flowering: 720, fruitOrGrainSet: 950, maturity: 1200 },
    tempRange: { min: 15, optimal: 25, max: 35 },
    waterRequirementMm: 450,
    criticalWaterStages: ["flowering", "fruit-set"],
    fertilizerProfile: { n_kg_ha: 100, p_kg_ha: 60, k_kg_ha: 120, splitApplications: 3 },
    commonPests: [
      { name: "Anthracnose", tempTriggerMin: 22, tempTriggerMax: 30, humidityTrigger: 85 },
      { name: "Thrips", tempTriggerMin: 22, tempTriggerMax: 34 },
    ],
    source: "AVRDC Pepper Research Data",
  },
  "pechay": {
    name: "Pechay", category: "Vegetables", emoji: "🥬",
    gddBase: 5,
    gddPhases: { germination: 40, establishment: 100, vegetative: 220, flowering: 350, fruitOrGrainSet: 450, maturity: 550 },
    tempRange: { min: 10, optimal: 22, max: 32 },
    waterRequirementMm: 200,
    criticalWaterStages: ["seedling-establishment"],
    fertilizerProfile: { n_kg_ha: 60, p_kg_ha: 30, k_kg_ha: 40, splitApplications: 2 },
    commonPests: [
      { name: "Diamondback Moth", tempTriggerMin: 18, tempTriggerMax: 30 },
      { name: "Cabbage Aphid", tempTriggerMin: 15, tempTriggerMax: 25 },
    ],
    source: "DA Philippines Leafy Vegetable Guidelines",
  },
  "mustasa": {
    name: "Mustasa", category: "Vegetables", emoji: "🥬",
    gddBase: 5,
    gddPhases: { germination: 40, establishment: 100, vegetative: 220, flowering: 340, fruitOrGrainSet: 430, maturity: 530 },
    tempRange: { min: 10, optimal: 20, max: 30 },
    waterRequirementMm: 180,
    criticalWaterStages: ["seedling-establishment"],
    fertilizerProfile: { n_kg_ha: 50, p_kg_ha: 25, k_kg_ha: 35, splitApplications: 2 },
    commonPests: [
      { name: "Diamondback Moth", tempTriggerMin: 18, tempTriggerMax: 30 },
      { name: "Aphids", tempTriggerMin: 15, tempTriggerMax: 26 },
    ],
    source: "DA Philippines Leafy Vegetable Guidelines",
  },
  "kangkong": {
    name: "Kangkong", category: "Vegetables", emoji: "🌿",
    gddBase: 12,
    gddPhases: { germination: 40, establishment: 90, vegetative: 200, flowering: 300, fruitOrGrainSet: 380, maturity: 450 },
    tempRange: { min: 22, optimal: 30, max: 38 },
    waterRequirementMm: 600,
    criticalWaterStages: ["seedling-establishment"],
    fertilizerProfile: { n_kg_ha: 40, p_kg_ha: 20, k_kg_ha: 30, splitApplications: 2 },
    commonPests: [
      { name: "Leaf Miner", tempTriggerMin: 22, tempTriggerMax: 32 },
      { name: "Aphids", tempTriggerMin: 20, tempTriggerMax: 30 },
    ],
    source: "DA Philippines Leafy Vegetable Guidelines",
  },
  "malunggay": {
    name: "Malunggay (Moringa)", category: "Vegetables", emoji: "🌿",
    gddBase: 15,
    gddPhases: { germination: 80, establishment: 250, vegetative: 700, flowering: 1200, fruitOrGrainSet: 1600, maturity: 2000 },
    tempRange: { min: 20, optimal: 28, max: 40 },
    waterRequirementMm: 250,
    criticalWaterStages: ["establishment"],
    fertilizerProfile: { n_kg_ha: 50, p_kg_ha: 25, k_kg_ha: 40, splitApplications: 2 },
    commonPests: [
      { name: "Aphids", tempTriggerMin: 20, tempTriggerMax: 32 },
      { name: "Termites (root)", tempTriggerMin: 25, tempTriggerMax: 38 },
    ],
    source: "Trees for Life / FAO Moringa Guidelines",
  },
  "sayote": {
    name: "Sayote (Chayote)", category: "Vegetables", emoji: "🫑",
    gddBase: 10,
    gddPhases: { germination: 80, establishment: 200, vegetative: 500, flowering: 780, fruitOrGrainSet: 1000, maturity: 1250 },
    tempRange: { min: 12, optimal: 22, max: 30 },
    waterRequirementMm: 450,
    criticalWaterStages: ["fruit-set"],
    fertilizerProfile: { n_kg_ha: 80, p_kg_ha: 50, k_kg_ha: 80, splitApplications: 3 },
    commonPests: [
      { name: "Fruit Fly", tempTriggerMin: 22, tempTriggerMax: 32 },
      { name: "Powdery Mildew", tempTriggerMin: 18, tempTriggerMax: 26, humidityTrigger: 60 },
    ],
    source: "PCARRD Vegetable Crops Research",
  },

  // ── Root Crops ─────────────────────────────────────────────────────────────
  "potato": {
    name: "Potato", category: "Tubers", emoji: "🥔",
    gddBase: 7,
    gddPhases: { germination: 120, establishment: 280, vegetative: 550, flowering: 800, fruitOrGrainSet: 1000, maturity: 1300 },
    tempRange: { min: 7, optimal: 18, max: 28 },
    waterRequirementMm: 500,
    criticalWaterStages: ["tuber-initiation", "tuber-bulking"],
    fertilizerProfile: { n_kg_ha: 140, p_kg_ha: 80, k_kg_ha: 180, splitApplications: 3 },
    commonPests: [
      { name: "Late Blight", tempTriggerMin: 10, tempTriggerMax: 20, humidityTrigger: 90 },
      { name: "Colorado Potato Beetle", tempTriggerMin: 15, tempTriggerMax: 28 },
    ],
    source: "International Potato Center (CIP) open data",
  },
  "cassava": {
    name: "Cassava", category: "Tubers", emoji: "🌱",
    gddBase: 18,
    gddPhases: { germination: 100, establishment: 300, vegetative: 1200, flowering: 2500, fruitOrGrainSet: 3500, maturity: 5000 },
    tempRange: { min: 18, optimal: 28, max: 38 },
    waterRequirementMm: 700,
    criticalWaterStages: ["establishment", "storage-root-initiation"],
    fertilizerProfile: { n_kg_ha: 80, p_kg_ha: 40, k_kg_ha: 100, splitApplications: 2 },
    commonPests: [
      { name: "Cassava Mosaic Virus", tempTriggerMin: 25, tempTriggerMax: 32 },
      { name: "Mealybug", tempTriggerMin: 26, tempTriggerMax: 34 },
    ],
    source: "IITA Cassava Open Research Data",
  },
  "sweet potato": {
    name: "Sweet Potato (Camote)", category: "Tubers", emoji: "🍠",
    gddBase: 10,
    gddPhases: { germination: 70, establishment: 180, vegetative: 500, flowering: 800, fruitOrGrainSet: 1000, maturity: 1300 },
    tempRange: { min: 15, optimal: 25, max: 35 },
    waterRequirementMm: 350,
    criticalWaterStages: ["storage-root-initiation", "tuber-fill"],
    fertilizerProfile: { n_kg_ha: 60, p_kg_ha: 50, k_kg_ha: 100, splitApplications: 2 },
    commonPests: [
      { name: "Sweet Potato Weevil", tempTriggerMin: 22, tempTriggerMax: 34 },
      { name: "Leaf Spot", tempTriggerMin: 20, tempTriggerMax: 30, humidityTrigger: 80 },
    ],
    source: "CIP Sweet Potato Research Data",
  },
  "taro": {
    name: "Taro (Gabi)", category: "Tubers", emoji: "🫚",
    gddBase: 12,
    gddPhases: { germination: 120, establishment: 300, vegetative: 800, flowering: 1400, fruitOrGrainSet: 1800, maturity: 2200 },
    tempRange: { min: 18, optimal: 28, max: 35 },
    waterRequirementMm: 1200,
    criticalWaterStages: ["corm-initiation", "corm-expansion"],
    fertilizerProfile: { n_kg_ha: 80, p_kg_ha: 50, k_kg_ha: 100, splitApplications: 3 },
    commonPests: [
      { name: "Taro Leaf Blight", tempTriggerMin: 22, tempTriggerMax: 30, humidityTrigger: 85 },
      { name: "Aphids", tempTriggerMin: 20, tempTriggerMax: 30 },
    ],
    source: "FAO Root & Tuber Crop Guidelines",
  },
  "ube": {
    name: "Ube (Purple Yam)", category: "Tubers", emoji: "🫐",
    gddBase: 12,
    gddPhases: { germination: 130, establishment: 320, vegetative: 900, flowering: 1500, fruitOrGrainSet: 1900, maturity: 2400 },
    tempRange: { min: 18, optimal: 27, max: 35 },
    waterRequirementMm: 900,
    criticalWaterStages: ["tuber-initiation", "tuber-fill"],
    fertilizerProfile: { n_kg_ha: 70, p_kg_ha: 50, k_kg_ha: 120, splitApplications: 3 },
    commonPests: [
      { name: "Yam Beetle", tempTriggerMin: 22, tempTriggerMax: 32 },
      { name: "Anthracnose", tempTriggerMin: 20, tempTriggerMax: 30, humidityTrigger: 85 },
    ],
    source: "DA Philippines Root Crop Programs",
  },

  // ── Fruits ────────────────────────────────────────────────────────────────
  "banana": {
    name: "Banana", category: "Fruits", emoji: "🍌",
    gddBase: 15,
    gddPhases: { germination: 0, establishment: 400, vegetative: 2000, flowering: 3500, fruitOrGrainSet: 4500, maturity: 5500 },
    tempRange: { min: 15, optimal: 27, max: 36 },
    waterRequirementMm: 1200,
    criticalWaterStages: ["bunch-emergence", "fruit-fill"],
    fertilizerProfile: { n_kg_ha: 200, p_kg_ha: 80, k_kg_ha: 400, splitApplications: 6 },
    commonPests: [
      { name: "Black Sigatoka", tempTriggerMin: 24, tempTriggerMax: 30, humidityTrigger: 80 },
      { name: "Banana Weevil", tempTriggerMin: 22, tempTriggerMax: 32 },
    ],
    source: "INIBAP (Bioversity International) open banana research",
  },
  "mango": {
    name: "Mango", category: "Fruits", emoji: "🥭",
    gddBase: 15,
    gddPhases: { germination: 150, establishment: 600, vegetative: 2500, flowering: 4000, fruitOrGrainSet: 5000, maturity: 6500 },
    tempRange: { min: 18, optimal: 28, max: 38 },
    waterRequirementMm: 900,
    criticalWaterStages: ["flowering", "fruit-development"],
    fertilizerProfile: { n_kg_ha: 150, p_kg_ha: 60, k_kg_ha: 180, splitApplications: 3 },
    commonPests: [
      { name: "Mango Anthracnose", tempTriggerMin: 22, tempTriggerMax: 30, humidityTrigger: 80 },
      { name: "Mango Pulp Weevil", tempTriggerMin: 24, tempTriggerMax: 34 },
      { name: "Thrips", tempTriggerMin: 22, tempTriggerMax: 34 },
    ],
    source: "PCARRD / PhilMango Research Data",
  },
  "pineapple": {
    name: "Pineapple", category: "Fruits", emoji: "🍍",
    gddBase: 15,
    gddPhases: { germination: 0, establishment: 800, vegetative: 3000, flowering: 5000, fruitOrGrainSet: 6500, maturity: 8000 },
    tempRange: { min: 15, optimal: 26, max: 36 },
    waterRequirementMm: 700,
    criticalWaterStages: ["forcing", "fruit-development"],
    fertilizerProfile: { n_kg_ha: 400, p_kg_ha: 100, k_kg_ha: 500, splitApplications: 6 },
    commonPests: [
      { name: "Mealybug Wilt", tempTriggerMin: 24, tempTriggerMax: 34 },
      { name: "Heart Rot (Phytophthora)", tempTriggerMin: 18, tempTriggerMax: 28, humidityTrigger: 85 },
    ],
    source: "FFTC / DA Pineapple Research Data",
  },
  "papaya": {
    name: "Papaya", category: "Fruits", emoji: "🍑",
    gddBase: 15,
    gddPhases: { germination: 100, establishment: 350, vegetative: 1200, flowering: 2200, fruitOrGrainSet: 3000, maturity: 4000 },
    tempRange: { min: 18, optimal: 27, max: 35 },
    waterRequirementMm: 800,
    criticalWaterStages: ["flowering", "fruit-development"],
    fertilizerProfile: { n_kg_ha: 150, p_kg_ha: 60, k_kg_ha: 180, splitApplications: 4 },
    commonPests: [
      { name: "Papaya Ringspot Virus", tempTriggerMin: 22, tempTriggerMax: 32 },
      { name: "Fruit Fly", tempTriggerMin: 24, tempTriggerMax: 34 },
    ],
    source: "PCARRD Fruit Crop Research",
  },
  "watermelon": {
    name: "Watermelon", category: "Fruits", emoji: "🍉",
    gddBase: 15,
    gddPhases: { germination: 60, establishment: 180, vegetative: 450, flowering: 650, fruitOrGrainSet: 850, maturity: 1200 },
    tempRange: { min: 18, optimal: 28, max: 35 },
    waterRequirementMm: 500,
    criticalWaterStages: ["flowering", "fruit-set"],
    fertilizerProfile: { n_kg_ha: 100, p_kg_ha: 60, k_kg_ha: 120, splitApplications: 3 },
    commonPests: [
      { name: "Fusarium Wilt", tempTriggerMin: 22, tempTriggerMax: 28 },
      { name: "Aphids (Mosaic Vector)", tempTriggerMin: 20, tempTriggerMax: 30 },
    ],
    source: "USDA Cucurbit Research, open-access",
  },
  "calamansi": {
    name: "Calamansi", category: "Fruits", emoji: "🍋",
    gddBase: 12,
    gddPhases: { germination: 200, establishment: 800, vegetative: 3000, flowering: 5000, fruitOrGrainSet: 6500, maturity: 8000 },
    tempRange: { min: 15, optimal: 26, max: 34 },
    waterRequirementMm: 800,
    criticalWaterStages: ["flowering", "fruit-development"],
    fertilizerProfile: { n_kg_ha: 120, p_kg_ha: 60, k_kg_ha: 140, splitApplications: 3 },
    commonPests: [
      { name: "Citrus Canker", tempTriggerMin: 22, tempTriggerMax: 30, humidityTrigger: 80 },
      { name: "Citrus Psyllid", tempTriggerMin: 20, tempTriggerMax: 32 },
    ],
    source: "DA Philippines Citrus Crop Guide",
  },
  "coconut": {
    name: "Coconut", category: "Fruits", emoji: "🥥",
    gddBase: 15,
    gddPhases: { germination: 200, establishment: 1200, vegetative: 5000, flowering: 9000, fruitOrGrainSet: 12000, maturity: 15000 },
    tempRange: { min: 20, optimal: 28, max: 36 },
    waterRequirementMm: 1500,
    criticalWaterStages: ["establishment", "nut-development"],
    fertilizerProfile: { n_kg_ha: 120, p_kg_ha: 50, k_kg_ha: 200, splitApplications: 2 },
    commonPests: [
      { name: "Coconut Scale Insect", tempTriggerMin: 22, tempTriggerMax: 34 },
      { name: "Rhinoceros Beetle", tempTriggerMin: 24, tempTriggerMax: 35 },
      { name: "Cadang-Cadang Viroid", tempTriggerMin: 24, tempTriggerMax: 32 },
    ],
    source: "Philippine Coconut Authority (PCA) open research",
  },
  "avocado": {
    name: "Avocado", category: "Fruits", emoji: "🥑",
    gddBase: 10,
    gddPhases: { germination: 200, establishment: 700, vegetative: 2500, flowering: 4000, fruitOrGrainSet: 5500, maturity: 7000 },
    tempRange: { min: 12, optimal: 24, max: 32 },
    waterRequirementMm: 900,
    criticalWaterStages: ["flowering", "fruit-fill"],
    fertilizerProfile: { n_kg_ha: 130, p_kg_ha: 60, k_kg_ha: 160, splitApplications: 3 },
    commonPests: [
      { name: "Avocado Root Rot (Phytophthora)", tempTriggerMin: 18, tempTriggerMax: 26, humidityTrigger: 85 },
      { name: "Fruit Fly", tempTriggerMin: 22, tempTriggerMax: 32 },
    ],
    source: "CAB International Avocado Research Data",
  },
  "dragon fruit": {
    name: "Dragon Fruit", category: "Fruits", emoji: "🐉",
    gddBase: 12,
    gddPhases: { germination: 50, establishment: 200, vegetative: 600, flowering: 1000, fruitOrGrainSet: 1200, maturity: 1450 },
    tempRange: { min: 18, optimal: 28, max: 40 },
    waterRequirementMm: 400,
    criticalWaterStages: ["flowering", "fruit-set"],
    fertilizerProfile: { n_kg_ha: 80, p_kg_ha: 50, k_kg_ha: 100, splitApplications: 4 },
    commonPests: [
      { name: "Anthracnose", tempTriggerMin: 22, tempTriggerMax: 30, humidityTrigger: 85 },
      { name: "Scale Insects", tempTriggerMin: 24, tempTriggerMax: 36 },
    ],
    source: "PCARRD Fruit Crop Research / DA Philippines",
  },
  "jackfruit": {
    name: "Jackfruit", category: "Fruits", emoji: "🍈",
    gddBase: 15,
    gddPhases: { germination: 180, establishment: 700, vegetative: 2800, flowering: 4500, fruitOrGrainSet: 6000, maturity: 7500 },
    tempRange: { min: 18, optimal: 27, max: 38 },
    waterRequirementMm: 1000,
    criticalWaterStages: ["flowering", "fruit-development"],
    fertilizerProfile: { n_kg_ha: 120, p_kg_ha: 60, k_kg_ha: 150, splitApplications: 3 },
    commonPests: [
      { name: "Fruit Borer", tempTriggerMin: 22, tempTriggerMax: 34 },
      { name: "Jack Fruit Die-Back", tempTriggerMin: 24, tempTriggerMax: 32, humidityTrigger: 80 },
    ],
    source: "PCARRD Tropical Fruit Research",
  },
  "guava": {
    name: "Guava", category: "Fruits", emoji: "🍐",
    gddBase: 12,
    gddPhases: { germination: 130, establishment: 450, vegetative: 1500, flowering: 2500, fruitOrGrainSet: 3200, maturity: 4000 },
    tempRange: { min: 15, optimal: 26, max: 38 },
    waterRequirementMm: 700,
    criticalWaterStages: ["flowering", "fruit-development"],
    fertilizerProfile: { n_kg_ha: 100, p_kg_ha: 50, k_kg_ha: 120, splitApplications: 3 },
    commonPests: [
      { name: "Fruit Fly", tempTriggerMin: 22, tempTriggerMax: 34 },
      { name: "Guava Wilt (Fusarium)", tempTriggerMin: 24, tempTriggerMax: 32 },
    ],
    source: "PCARRD Tropical Fruit Research",
  },

  // ── Legumes ────────────────────────────────────────────────────────────────
  "soybean": {
    name: "Soybean", category: "Legumes", emoji: "🫘",
    gddBase: 10,
    gddPhases: { germination: 60, establishment: 180, vegetative: 450, flowering: 700, fruitOrGrainSet: 1000, maturity: 1350 },
    tempRange: { min: 10, optimal: 24, max: 34 },
    waterRequirementMm: 450,
    criticalWaterStages: ["flowering", "pod-fill"],
    fertilizerProfile: { n_kg_ha: 30, p_kg_ha: 60, k_kg_ha: 60, splitApplications: 1 },
    commonPests: [
      { name: "Soybean Rust", tempTriggerMin: 18, tempTriggerMax: 26, humidityTrigger: 75 },
      { name: "Stink Bug", tempTriggerMin: 22, tempTriggerMax: 32 },
    ],
    source: "USDA ARS Soybean Research",
  },
  "groundnut": {
    name: "Groundnut / Peanut", category: "Legumes", emoji: "🥜",
    gddBase: 10,
    gddPhases: { germination: 70, establishment: 200, vegetative: 450, flowering: 700, fruitOrGrainSet: 1000, maturity: 1300 },
    tempRange: { min: 18, optimal: 28, max: 35 },
    waterRequirementMm: 450,
    criticalWaterStages: ["pegging", "pod-fill"],
    fertilizerProfile: { n_kg_ha: 20, p_kg_ha: 60, k_kg_ha: 40, splitApplications: 2 },
    commonPests: [
      { name: "Early Leaf Spot", tempTriggerMin: 25, tempTriggerMax: 30, humidityTrigger: 80 },
      { name: "Groundnut Rosette Virus", tempTriggerMin: 22, tempTriggerMax: 30 },
    ],
    source: "ICRISAT Groundnut Open Research Data",
  },
  "mung bean": {
    name: "Mung Bean (Mungo)", category: "Legumes", emoji: "🫘",
    gddBase: 10,
    gddPhases: { germination: 50, establishment: 140, vegetative: 350, flowering: 550, fruitOrGrainSet: 750, maturity: 950 },
    tempRange: { min: 20, optimal: 28, max: 38 },
    waterRequirementMm: 250,
    criticalWaterStages: ["flowering", "pod-fill"],
    fertilizerProfile: { n_kg_ha: 15, p_kg_ha: 40, k_kg_ha: 30, splitApplications: 1 },
    commonPests: [
      { name: "Bean Fly", tempTriggerMin: 22, tempTriggerMax: 34 },
      { name: "Powdery Mildew", tempTriggerMin: 22, tempTriggerMax: 30, humidityTrigger: 60 },
    ],
    source: "AVRDC Pulse Crop Research Data",
  },
  "string beans": {
    name: "String Beans (Sitaw)", category: "Vegetables", emoji: "🫘",
    gddBase: 10,
    gddPhases: { germination: 55, establishment: 150, vegetative: 360, flowering: 560, fruitOrGrainSet: 730, maturity: 920 },
    tempRange: { min: 18, optimal: 26, max: 34 },
    waterRequirementMm: 350,
    criticalWaterStages: ["flowering", "pod-set"],
    fertilizerProfile: { n_kg_ha: 20, p_kg_ha: 50, k_kg_ha: 50, splitApplications: 2 },
    commonPests: [
      { name: "Bean Aphid", tempTriggerMin: 18, tempTriggerMax: 28 },
      { name: "Pod Borer", tempTriggerMin: 22, tempTriggerMax: 32 },
    ],
    source: "AVRDC Vegetable Research",
  },

  // ── Cash Crops ─────────────────────────────────────────────────────────────
  "coffee": {
    name: "Coffee", category: "Cash Crops", emoji: "☕",
    gddBase: 15,
    gddPhases: { germination: 200, establishment: 800, vegetative: 3000, flowering: 4500, fruitOrGrainSet: 6000, maturity: 8000 },
    tempRange: { min: 15, optimal: 22, max: 30 },
    waterRequirementMm: 1500,
    criticalWaterStages: ["flowering", "fruit-development"],
    fertilizerProfile: { n_kg_ha: 150, p_kg_ha: 60, k_kg_ha: 140, splitApplications: 3 },
    commonPests: [
      { name: "Coffee Berry Borer", tempTriggerMin: 22, tempTriggerMax: 30 },
      { name: "Coffee Leaf Rust", tempTriggerMin: 20, tempTriggerMax: 28, humidityTrigger: 80 },
    ],
    source: "World Coffee Research open data",
  },
  "sugarcane": {
    name: "Sugarcane", category: "Cash Crops", emoji: "🌿",
    gddBase: 18,
    gddPhases: { germination: 150, establishment: 500, vegetative: 2000, flowering: 4000, fruitOrGrainSet: 5000, maturity: 7000 },
    tempRange: { min: 18, optimal: 30, max: 38 },
    waterRequirementMm: 1500,
    criticalWaterStages: ["germination", "grand-growth"],
    fertilizerProfile: { n_kg_ha: 200, p_kg_ha: 80, k_kg_ha: 200, splitApplications: 3 },
    commonPests: [
      { name: "Sugarcane Borer", tempTriggerMin: 25, tempTriggerMax: 35 },
      { name: "Wooly Aphid", tempTriggerMin: 22, tempTriggerMax: 32 },
    ],
    source: "ISSCT open data",
  },

  // ── Herbs & Spices ─────────────────────────────────────────────────────────
  "ginger": {
    name: "Ginger", category: "Herbs & Spices", emoji: "🫚",
    gddBase: 12,
    gddPhases: { germination: 120, establishment: 350, vegetative: 900, flowering: 1500, fruitOrGrainSet: 1900, maturity: 2400 },
    tempRange: { min: 20, optimal: 28, max: 35 },
    waterRequirementMm: 900,
    criticalWaterStages: ["establishment", "rhizome-development"],
    fertilizerProfile: { n_kg_ha: 100, p_kg_ha: 60, k_kg_ha: 120, splitApplications: 3 },
    commonPests: [
      { name: "Ginger Rhizome Rot (Pythium)", tempTriggerMin: 22, tempTriggerMax: 30, humidityTrigger: 85 },
      { name: "Shoot Borer", tempTriggerMin: 24, tempTriggerMax: 34 },
    ],
    source: "FFTC / PCARRD Spice Crop Research",
  },
  "turmeric": {
    name: "Turmeric", category: "Herbs & Spices", emoji: "🟡",
    gddBase: 12,
    gddPhases: { germination: 130, establishment: 380, vegetative: 1000, flowering: 1700, fruitOrGrainSet: 2100, maturity: 2600 },
    tempRange: { min: 20, optimal: 28, max: 36 },
    waterRequirementMm: 900,
    criticalWaterStages: ["establishment", "rhizome-development"],
    fertilizerProfile: { n_kg_ha: 80, p_kg_ha: 50, k_kg_ha: 100, splitApplications: 2 },
    commonPests: [
      { name: "Rhizome Rot", tempTriggerMin: 22, tempTriggerMax: 30, humidityTrigger: 85 },
      { name: "Leaf Blotch", tempTriggerMin: 22, tempTriggerMax: 30, humidityTrigger: 80 },
    ],
    source: "FAO Spice Crops Guidelines",
  },
  "lemongrass": {
    name: "Lemongrass", category: "Herbs & Spices", emoji: "🌿",
    gddBase: 12,
    gddPhases: { germination: 80, establishment: 250, vegetative: 700, flowering: 1200, fruitOrGrainSet: 1500, maturity: 1800 },
    tempRange: { min: 18, optimal: 28, max: 38 },
    waterRequirementMm: 500,
    criticalWaterStages: ["establishment"],
    fertilizerProfile: { n_kg_ha: 60, p_kg_ha: 30, k_kg_ha: 60, splitApplications: 3 },
    commonPests: [
      { name: "Rust", tempTriggerMin: 18, tempTriggerMax: 26, humidityTrigger: 80 },
      { name: "Leaf Spot", tempTriggerMin: 22, tempTriggerMax: 30, humidityTrigger: 80 },
    ],
    source: "DA Philippines Herbs & Spices Program",
  },
  "basil": {
    name: "Basil", category: "Herbs & Spices", emoji: "🌿",
    gddBase: 10,
    gddPhases: { germination: 40, establishment: 100, vegetative: 250, flowering: 400, fruitOrGrainSet: 500, maturity: 620 },
    tempRange: { min: 15, optimal: 24, max: 32 },
    waterRequirementMm: 300,
    criticalWaterStages: ["seedling-establishment"],
    fertilizerProfile: { n_kg_ha: 40, p_kg_ha: 25, k_kg_ha: 35, splitApplications: 3 },
    commonPests: [
      { name: "Fusarium Wilt", tempTriggerMin: 22, tempTriggerMax: 30 },
      { name: "Aphids", tempTriggerMin: 18, tempTriggerMax: 28 },
    ],
    source: "FAO Herb Crop Guidelines",
  },

  // ── Oilseeds ───────────────────────────────────────────────────────────────
  "sunflower": {
    name: "Sunflower", category: "Oilseeds", emoji: "🌻",
    gddBase: 10,
    gddPhases: { germination: 60, establishment: 180, vegetative: 450, flowering: 750, fruitOrGrainSet: 1000, maturity: 1350 },
    tempRange: { min: 10, optimal: 24, max: 34 },
    waterRequirementMm: 400,
    criticalWaterStages: ["flowering", "seed-fill"],
    fertilizerProfile: { n_kg_ha: 80, p_kg_ha: 60, k_kg_ha: 50, splitApplications: 2 },
    commonPests: [
      { name: "Downy Mildew", tempTriggerMin: 15, tempTriggerMax: 22, humidityTrigger: 85 },
      { name: "Sclerotinia", tempTriggerMin: 16, tempTriggerMax: 24, humidityTrigger: 80 },
    ],
    source: "National Sunflower Association open research data",
  },
  "cotton": {
    name: "Cotton", category: "Cash Crops", emoji: "🌿",
    gddBase: 15.6,
    gddPhases: { germination: 55, establishment: 180, vegetative: 500, flowering: 800, fruitOrGrainSet: 1200, maturity: 1600 },
    tempRange: { min: 15, optimal: 28, max: 38 },
    waterRequirementMm: 700,
    criticalWaterStages: ["squaring", "flowering", "boll-development"],
    fertilizerProfile: { n_kg_ha: 120, p_kg_ha: 60, k_kg_ha: 80, splitApplications: 3 },
    commonPests: [
      { name: "Bollworm", tempTriggerMin: 22, tempTriggerMax: 35 },
      { name: "Aphids", tempTriggerMin: 18, tempTriggerMax: 28 },
    ],
    source: "ICAC open data",
  },
};

/**
 * Aliases — all PH local names and common spelling variations map to profile keys.
 */
const ALIASES: Record<string, string> = {
  // English/Filipino alternates
  "corn": "maize", "corn / maize": "maize", "corn/maize": "maize", "corn – yellow": "maize", "corn – white": "maize",
  "peanut": "groundnut", "groundnut": "groundnut", "peanut / groundnut": "groundnut", "mani": "groundnut",
  "tomatoes": "tomato", "kamatis": "tomato",
  "potatoes": "potato", "patatas": "potato",
  "soybeans": "soybean", "soya": "soybean",
  "bananas": "banana", "saging": "banana",
  "watermelons": "watermelon", "pakwan": "watermelon",
  "coffees": "coffee",
  "cottons": "cotton",
  "sweet potato": "sweet potato", "camote": "sweet potato", "sweet potato (camote)": "sweet potato",
  "kamote": "sweet potato",
  "cassavas": "cassava", "kamoteng kahoy": "cassava",
  "taro": "taro", "gabi": "taro", "taro (gabi)": "taro",
  "ube (purple yam)": "ube", "purple yam": "ube",
  "mango": "mango", "mangga": "mango",
  "papaya": "papaya",
  "pineapple": "pineapple", "pinya": "pineapple",
  "calamansi": "calamansi", "kalamansi": "calamansi",
  "coconut": "coconut", "niyog": "coconut",
  "avocado": "avocado", "abokado": "avocado",
  "dragon fruit": "dragon fruit", "pitaya": "dragon fruit",
  "jackfruit": "jackfruit", "langka": "jackfruit",
  "guava": "guava", "bayabas": "guava",
  "eggplant": "eggplant", "talong": "eggplant",
  "onion": "onion", "sibuyas": "onion",
  "garlic": "garlic", "bawang": "garlic",
  "cabbage": "cabbage", "repolyo": "cabbage",
  "carrot": "carrot", "karot": "carrot",
  "ampalaya (bitter melon)": "ampalaya", "bitter melon": "ampalaya", "ampalaya": "ampalaya",
  "okra": "okra",
  "squash": "squash", "kalabasa": "squash",
  "cucumber": "cucumber", "pipino": "cucumber",
  "bell pepper": "bell pepper", "kampanilya": "bell pepper",
  "chili": "chili", "sili": "chili", "labuyo": "chili",
  "pechay": "pechay", "bok choy": "pechay",
  "mustasa": "mustasa",
  "kangkong": "kangkong",
  "malunggay": "malunggay", "moringa": "malunggay",
  "sayote": "sayote", "chayote": "sayote",
  "string beans": "string beans", "sitaw": "string beans",
  "mung bean": "mung bean", "mungo": "mung bean", "munggo": "mung bean",
  "mung beans": "mung bean",
  "ginger": "ginger", "luya": "ginger",
  "turmeric": "turmeric", "dilaw": "turmeric", "luyang dilaw": "turmeric",
  "lemongrass": "lemongrass", "tanglad": "lemongrass",
  "basil": "basil", "balanoy": "basil",
  "sorghum": "sorghum",
  "rice": "rice", "palay": "rice",
  "sugarcane": "sugarcane",
  "coffee": "coffee",
};

function lookupCrop(name: string): CropGDDProfile | null {
  const key = name.toLowerCase().trim();
  const resolved = ALIASES[key] ?? key;
  return CROP_GDD_PROFILES[resolved] ?? null;
}

/**
 * Build a generic profile for unknown crops using available climate data.
 */
function buildGenericProfile(cropName: string): CropGDDProfile {
  const n = cropName.toLowerCase();
  const isTropical = /cass|banana|mango|coconut|cacao|cocoa|yam|durian|rambutan|langka|jackfruit|lanzones|mangosteen/.test(n);
  const isLegume = /bean|pea|lentil|chickpea|cowpea|legume/.test(n);
  const isCereal = /millet|sorghum|barley|oat|teff|cereal/.test(n);
  const isVegetable = /carrot|spinach|kale|lettuce|pepper|cucumber|zucchini|radish|broccoli|cauliflower|patola|upo/.test(n);
  const isHerb = /herb|basil|mint|oregano|cilantro|parsley|thyme/.test(n);
  const isRhizome = /ginger|turmeric|galangal/.test(n);

  const gddBase = isTropical ? 15 : isLegume ? 10 : isCereal ? 8 : isVegetable ? 8 : isHerb ? 8 : isRhizome ? 12 : 10;
  const scale = isTropical ? 1.8 : isLegume ? 0.9 : isCereal ? 1.0 : isVegetable ? 0.75 : isHerb ? 0.5 : isRhizome ? 1.5 : 1.0;

  return {
    name: cropName,
    category: isTropical ? "Tropical Fruits" : isLegume ? "Legumes" : isCereal ? "Cereals" : isVegetable ? "Vegetables" : isHerb ? "Herbs" : isRhizome ? "Herbs & Spices" : "Field Crops",
    emoji: "🌱",
    gddBase,
    gddPhases: {
      germination: Math.round(70 * scale),
      establishment: Math.round(200 * scale),
      vegetative: Math.round(500 * scale),
      flowering: Math.round(800 * scale),
      fruitOrGrainSet: Math.round(1100 * scale),
      maturity: Math.round(1400 * scale),
    },
    tempRange: { min: gddBase, optimal: gddBase + 15, max: gddBase + 25 },
    waterRequirementMm: isTropical ? 1000 : isRhizome ? 800 : 450,
    criticalWaterStages: ["flowering", "grain-fill"],
    fertilizerProfile: { n_kg_ha: 80, p_kg_ha: 50, k_kg_ha: 80, splitApplications: 2 },
    commonPests: [
      { name: "Aphids", tempTriggerMin: 15, tempTriggerMax: 28 },
      { name: "Fungal Disease", tempTriggerMin: 18, tempTriggerMax: 28, humidityTrigger: 80 },
    ],
    source: "Estimated from agronomic principles (FAO general crop guidelines)",
  };
}

function computeDayFromGDD(gddThreshold: number, avgDailyGDD: number): number {
  if (avgDailyGDD <= 0) return Math.round(gddThreshold / 8);
  return Math.round(gddThreshold / avgDailyGDD);
}

function computeET0(lat: number, tmax: number, tmin: number, doy: number): number {
  const tmean = (tmax + tmin) / 2;
  const dr = 1 + 0.033 * Math.cos((2 * Math.PI / 365) * doy);
  const delta = 0.409 * Math.sin((2 * Math.PI / 365) * doy - 1.39);
  const phi = (lat * Math.PI) / 180;
  const ws = Math.acos(-Math.tan(phi) * Math.tan(delta));
  const Ra = (24 / Math.PI) * 0.082 * dr * (ws * Math.sin(phi) * Math.sin(delta) + Math.cos(phi) * Math.cos(delta) * Math.sin(ws));
  return Math.max(0, 0.0023 * (tmean + 17.8) * Math.sqrt(Math.max(0, tmax - tmin)) * Ra);
}

function getCropCoefficient(phase: string): number {
  const kc: Record<string, number> = {
    germination: 0.4, establishment: 0.7, vegetative: 1.0,
    flowering: 1.15, fruitOrGrainSet: 1.1, maturity: 0.8,
  };
  return kc[phase] ?? 1.0;
}

function assessWeatherRisk(forecast: ForecastDay[], crop: CropGDDProfile): { level: string; notes: string } {
  let highTemp = 0, lowTemp = 0, heavyRain = 0;
  for (const day of forecast.slice(0, 7)) {
    if (day.tempMax > crop.tempRange.max) highTemp++;
    if (day.tempMin < crop.tempRange.min) lowTemp++;
    if (day.precipitation > 25) heavyRain++;
  }
  if (highTemp >= 3 || lowTemp >= 3) return { level: "high", notes: `${highTemp > 0 ? `High temperature stress expected (${highTemp} days above ${crop.tempRange.max}°C). ` : ""}${lowTemp > 0 ? `Cold stress expected (${lowTemp} nights below ${crop.tempRange.min}°C). ` : ""}` };
  if (heavyRain >= 2) return { level: "medium", notes: "Heavy rainfall forecast — ensure drainage and delay pesticide application." };
  if (highTemp >= 1 || lowTemp >= 1) return { level: "medium", notes: "Some temperature stress possible. Monitor crop closely." };
  return { level: "low", notes: "Weather conditions are generally favorable for this crop." };
}

export interface FarmingPlanOutput {
  crop: string;
  location: string;
  plantingDate: string;
  totalGrowingDays: number;
  estimatedHarvestStart: number;
  estimatedHarvestEnd: number;
  weatherRiskLevel: string;
  weatherRiskNotes: string;
  varietyRecommendation: string;
  expectedYield: string;
  cropInfo: string;
  dataSourcesUsed: string[];
  climateAdaptedNote: string;
  stages: any[];
  milestones: any[];
  weatherAdjustments: any[];
  fertilizerSchedule: any[];
  pestAlerts: any[];
  irrigationSchedule: any[];
}

const BASE_YIELDS: Record<string, string> = {
  rice: "4-6 tons/ha", maize: "3-7 tons/ha", wheat: "2-5 tons/ha",
  tomato: "30-60 tons/ha", potato: "15-30 tons/ha", cassava: "8-20 tons/ha",
  soybean: "1.5-3.5 tons/ha", groundnut: "1.5-3 tons/ha", eggplant: "15-30 tons/ha",
  onion: "10-20 tons/ha", cabbage: "20-40 tons/ha", carrot: "15-25 tons/ha",
  watermelon: "20-40 tons/ha", banana: "20-40 tons/ha", mango: "5-10 tons/ha",
  pineapple: "30-50 tons/ha", papaya: "30-60 tons/ha", sugarcane: "60-100 tons/ha",
  "sweet potato": "10-20 tons/ha", taro: "8-15 tons/ha", ube: "6-12 tons/ha",
  "mung bean": "0.8-1.5 tons/ha", pechay: "10-20 tons/ha",
  ampalaya: "8-15 tons/ha", okra: "5-10 tons/ha", squash: "15-25 tons/ha",
  cucumber: "15-25 tons/ha", ginger: "8-15 tons/ha", turmeric: "10-18 tons/ha",
  "dragon fruit": "15-25 tons/ha", coconut: "6-12 tons/ha (nuts)",
};

export function generateFarmingPlan(
  cropName: string,
  plantingDate: string,
  location: string,
  climate: ClimateProfile,
  forecast: ForecastDay[],
  wikiInfo: string | null,
  lang?: string
): FarmingPlanOutput {
  const isFil = lang === "fil";
  const profile = lookupCrop(cropName) ?? buildGenericProfile(cropName);
  const avgGDD = Math.max(3, climate.avgDailyGDD);

  const days = {
    germination: computeDayFromGDD(profile.gddPhases.germination, avgGDD),
    establishment: computeDayFromGDD(profile.gddPhases.establishment, avgGDD),
    vegetative: computeDayFromGDD(profile.gddPhases.vegetative, avgGDD),
    flowering: computeDayFromGDD(profile.gddPhases.flowering, avgGDD),
    fruitSet: computeDayFromGDD(profile.gddPhases.fruitOrGrainSet, avgGDD),
    maturity: computeDayFromGDD(profile.gddPhases.maturity, avgGDD),
  };

  const totalGrowingDays = days.maturity;
  const harvestWindow = Math.round(totalGrowingDays * 0.07);
  const plantDate = new Date(plantingDate);
  const doy = Math.floor((plantDate.getTime() - new Date(plantDate.getFullYear(), 0, 0).getTime()) / 86400000);

  const riskAssessment = assessWeatherRisk(forecast, profile);
  if (isFil) {
    if (riskAssessment.notes.includes("High temperature stress")) {
      riskAssessment.notes = "Inaasahang matinding init sa panahon ng pagtatanim. Siguraduhing may sapat na patubig.";
    } else if (riskAssessment.notes.includes("Heavy rainfall")) {
      riskAssessment.notes = "Inaasahang malakas na ulan — tiyakin ang maayos na drainage at ipagpaliban ang pag-aabono.";
    } else if (riskAssessment.notes.includes("favorable")) {
      riskAssessment.notes = "Pangkalahatang maganda at angkop ang panahon para sa pananim na ito.";
    }
  }

  const tempAtLocation = climate.annualMeanTemp;
  const isSuboptimal = tempAtLocation < profile.tempRange.min + 3 || tempAtLocation > profile.tempRange.max - 3;
  const varietyNote = isFil
    ? (isSuboptimal
      ? `Pumili ng uri ng binhi na angkop sa ${tempAtLocation > profile.tempRange.optimal ? "mainit" : "malamig"} na klima (karaniwang temp: ${climate.annualMeanTemp}°C). Kumonsulta sa lokal na tanggapan ng agrikultura para sa sertipikadong binhi.`
      : `Ang mga karaniwang uri ng binhi ay magandang itanim sa ${location} (karaniwang temp: ${climate.annualMeanTemp}°C, angkop para sa ${profile.name}: ${profile.tempRange.optimal}°C).`)
    : (isSuboptimal
      ? `Choose a variety adapted to ${tempAtLocation > profile.tempRange.optimal ? "warm/hot" : "cool"} conditions (mean temp: ${climate.annualMeanTemp}°C). Consult local extension service for certified varieties.`
      : `Standard varieties perform well in ${location} (mean temp: ${climate.annualMeanTemp}°C, optimal for ${profile.name}: ${profile.tempRange.optimal}°C).`);

  const yieldModifier = isSuboptimal ? 0.75 : 1.0;
  const profileKey = Object.keys(BASE_YIELDS).find((k) => profile.name.toLowerCase().includes(k));
  const expectedYield = profileKey
    ? (isSuboptimal
      ? `${BASE_YIELDS[profileKey]} ${isFil ? "(nabawasan — sub-optimal na temperatura)" : "(reduced — suboptimal temperature)"}`
      : BASE_YIELDS[profileKey])
    : (isFil
      ? `Tinatayang ${Math.round(2 * yieldModifier * 10) / 10}-${Math.round(5 * yieldModifier * 10) / 10} tonelada/ha batay sa lokal na klima`
      : `Estimated ${Math.round(2 * yieldModifier * 10) / 10}-${Math.round(5 * yieldModifier * 10) / 10} tons/ha based on local climate`);

  const fertNPerApp = Math.round(profile.fertilizerProfile.n_kg_ha / profile.fertilizerProfile.splitApplications);
  const fertPTotal = profile.fertilizerProfile.p_kg_ha;
  const fertKPerApp = Math.round(profile.fertilizerProfile.k_kg_ha / profile.fertilizerProfile.splitApplications);

  const stages = [
    {
      id: "stage-prep",
      name: isFil ? "Paghahanda ng Lupa" : "Land Preparation",
      type: "preparation",
      startDay: 0,
      endDay: Math.min(5, Math.max(1, Math.round(days.germination * 0.5))),
      description: isFil
        ? `Ihanda ang lupa sa simula ng pagtatanim (Araw 1). Ihalo ang mga organikong bagay. Klima: karaniwang temp ${climate.annualMeanTemp}°C, taunang ulan ${climate.annualTotalRainfall}mm.`
        : `Prepare soil at the start of planting cycle (Day 1). Incorporate organic matter. Climate: mean ${climate.annualMeanTemp}°C, annual rainfall ${climate.annualTotalRainfall}mm.`,
      tasks: isFil ? [
        "Magsagawa ng malalim na pag-aararo hanggang 20-25cm ang lalim",
        "Pagsusuri ng pH ng lupa (target: 6.0-7.0 para sa karamihan ng pananim)",
        "Maglagay ng basalyong kompost (5-10 tonelada/ha)",
        `Maglagay ng basalyong ${fertPTotal}kg/ha P₂O₅ at ${fertKPerApp}kg/ha K₂O`,
        "Tiyakin ang sapat na mga kanal para sa patubig at drainage",
        "Pantayin ang lupain para sa pantay na pamamahagi ng tubig",
      ] : [
        "Deep plow to 20-25cm depth",
        "Soil pH test (target 6.0-7.0 for most crops)",
        "Apply basal compost (5-10 tons/ha)",
        `Apply basal ${fertPTotal}kg/ha P₂O₅ and ${fertKPerApp}kg/ha K₂O`,
        "Ensure adequate drainage channels",
        "Level field for uniform water distribution",
      ],
      weatherConsiderations: isFil
        ? "Iwasan ang pag-aararo sa napakabasang lupa. Dapat ay katamtamang basa ngunit hindi binabaha."
        : "Avoid tillage in wet conditions. Soil should be moist but not waterlogged.",
      inputsNeeded: isFil
        ? ["Araro/Traktora", "Kompost", `Phosphate na abono (${fertPTotal}kg/ha)`, `Potash (${fertKPerApp}kg/ha)`, "pH meter"]
        : ["Plow/tractor", "Compost", `Phosphate fertilizer (${fertPTotal}kg/ha)`, `Potash (${fertKPerApp}kg/ha)`, "pH meter"],
      priority: "critical",
    },
    {
      id: "stage-plant",
      name: isFil ? "Pagtatanim / Pagse-seminay" : "Planting / Sowing",
      type: "planting",
      startDay: 0,
      endDay: days.germination,
      description: isFil
        ? `Itanim ang ${profile.name} sa tamang agwat. Base GDD: ${profile.gddBase}°C. Inaasahang GDD sa pagsibol: ${profile.gddPhases.germination} GDD sa lokal na bilis na ${avgGDD.toFixed(1)} GDD/araw.`
        : `Plant ${profile.name} at optimal spacing. GDD base: ${profile.gddBase}°C. Expected GDD to germination: ${profile.gddPhases.germination} GDD at local rate of ${avgGDD.toFixed(1)} GDD/day.`,
      tasks: isFil ? [
        `Itanim sa inirerekomendang agwat para sa ${profile.name}`,
        "Gumamit ng sertipikado at walang sakit na binhi o tanim",
        "Gamutin ang binhi gamit ang fungicide kung mayroon",
        "Markahan nang malinaw ang mga hanay ng tanim",
        "Irekord ang petsa ng pagtatanim at mapa ng bukid",
      ] : [
        `Plant at recommended spacing for ${profile.name}`,
        "Use certified, disease-free seed or planting material",
        "Seed treatment with fungicide if available",
        "Mark rows clearly for mechanized operations",
        "Record planting date and field map",
      ],
      weatherConsiderations: isFil
        ? `Pinakamagandang temperatura sa pagtatanim: ${profile.tempRange.min}–${profile.tempRange.max}°C. Iwasang magtanim bago ang malakas na ulan.`
        : `Optimal planting temperature: ${profile.tempRange.min}–${profile.tempRange.max}°C. Avoid planting before heavy rain.`,
      inputsNeeded: isFil
        ? ["Sertipikadong binhi", "Fungicide panggamot sa binhi", "Kagamitan sa pagtatanim", "Pansukat"]
        : ["Certified seeds", "Seed treatment fungicide", "Planting tools", "Measuring tape"],
      priority: "critical",
    },
    {
      id: "stage-germination",
      name: isFil ? "Pagsibol at Paglitaw" : "Germination & Emergence",
      type: "germination",
      startDay: days.germination,
      endDay: days.establishment,
      description: isFil
        ? `Pagsibol ng seedling at pagpapatatag. Mag-ipon ng ${profile.gddPhases.establishment} GDD para sa buong paglaki (${days.establishment} araw sa lokal na rate).`
        : `Seedling emergence and establishment. Accumulate ${profile.gddPhases.establishment} GDD for full establishment (${days.establishment} days at local rate).`,
      tasks: isFil ? [
        "Bantayan ang antas ng pagsibol (target >85%)",
        "Punan ang mga nawawalang punla sa loob ng unang linggo",
        "Maglagay ng pre-emergence herbicide kung kinakailangan",
        "Magsimula ng magaan na pagpapatubig upang mapanatili ang basang lupa",
      ] : [
        "Monitor germination rate (target >85%)",
        "Gap-fill missing stands within first week",
        "Apply pre-emergence herbicide if needed",
        "Begin light irrigation to maintain soil moisture",
      ],
      weatherConsiderations: isFil
        ? "Protektahan mula sa malakas na ulan at nakatagong tubig. Panatilihing pantay ang basang lupa."
        : "Protect from heavy rain and standing water. Maintain consistent soil moisture.",
      inputsNeeded: isFil
        ? ["Tubig sa patubig", "Pre-emergence herbicide (opsyonal)", "Karagdagang binhi"]
        : ["Irrigation water", "Pre-emergence herbicide (optional)", "Replacement seeds"],
      priority: "high",
    },
    {
      id: "stage-vegetative",
      name: isFil ? "Paglaki ng Halaman" : "Vegetative Growth",
      type: "growth",
      startDay: days.establishment,
      endDay: days.vegetative,
      description: isFil
        ? `Mabilis na paglaki ng dahon at sanga. Maglagay ng unang bahagi ng N abono sa ${days.establishment} DAP. Mahalagang panahon: ${days.establishment}–${days.vegetative} araw.`
        : `Rapid leaf and stem development. Apply first split of N fertilizer at ${days.establishment} DAP. Critical period: ${days.establishment}–${days.vegetative} days.`,
      tasks: isFil ? [
        `Maglagay ng ${fertNPerApp}kg/ha N (unang bahagi ng ${profile.fertilizerProfile.splitApplications})`,
        "Bantayan ang mga maagang sintomas ng peste at sakit",
        "Pagtatabas at pagkontrol ng damo — mahalagang window para sa proteksyon ng ani",
        `Panatilihin ang patubig para sa ${profile.waterRequirementMm}mm na pangangailangan sa panahon`,
        "Mag-inspeksyon para sa mga peste linggo-linggo",
      ] : [
        `Apply ${fertNPerApp}kg/ha N (split 1 of ${profile.fertilizerProfile.splitApplications})`,
        "Monitor for early pest and disease symptoms",
        "Weed control — critical window for yield protection",
        `Maintain irrigation for ${profile.waterRequirementMm}mm seasonal requirement`,
        "Scout for pests weekly",
      ],
      weatherConsiderations: isFil
        ? `Bantayan ang stress sa matinding init (>${profile.tempRange.max}°C) o lamig (<${profile.tempRange.min}°C).`
        : `Watch for heat stress (>${profile.tempRange.max}°C) or cold stress (<${profile.tempRange.min}°C).`,
      inputsNeeded: isFil
        ? [`N abono (${fertNPerApp}kg/ha)`, "Pamatay-damo", "Kagamitan sa patubig"]
        : [`N fertilizer (${fertNPerApp}kg/ha)`, "Herbicide", "Irrigation equipment"],
      priority: "high",
    },
    {
      id: "stage-flowering",
      name: isFil ? "Pagbulaklak at Polinasyon" : "Flowering & Pollination",
      type: "fertilization",
      startDay: days.vegetative,
      endDay: days.flowering,
      description: isFil
        ? `Mahalagang yugto para sa pagtiyak ng ani. Maglagay ng ikalawang bahagi ng N abono sa ${days.vegetative} DAP. Protektahan mula sa kawalan ng tubig at matinding init.`
        : `Critical stage for yield determination. Apply second N split at ${days.vegetative} DAP. Protect from water stress and temperature extremes.`,
      tasks: isFil ? [
        `Maglagay ng ${fertNPerApp}kg/ha N (ikalawang bahagi ng ${profile.fertilizerProfile.splitApplications})`,
        `Maglagay ng ${fertKPerApp}kg/ha K₂O para mapabuti ang kalidad ng bulaklak/bunga`,
        "Tiyakin ang sapat na kahalumigmigan — kritikal na yugto sa tubig",
        "Bantayan ang mga sakit na dulot ng fungus sa basang panahon",
        "Iwasan ang pag-spray ng pestisidyo sa oras ng polinasyon (6-10 AM)",
      ] : [
        `Apply ${fertNPerApp}kg/ha N (split 2 of ${profile.fertilizerProfile.splitApplications})`,
        `Apply ${fertKPerApp}kg/ha K₂O to improve flower/fruit quality`,
        "Ensure adequate moisture — critical water stage",
        "Monitor for fungal diseases in humid conditions",
        "Avoid pesticide application during active pollination hours (6-10 AM)",
      ],
      weatherConsiderations: isFil
        ? `Iwasan ang sobrang init (>${profile.tempRange.max}°C) at kawalan ng tubig sa panahon ng pagbulaklak.`
        : `Avoid heat (>${profile.tempRange.max}°C) and water stress during flowering. Both reduce fruit/grain set.`,
      inputsNeeded: isFil
        ? [`N abono (${fertNPerApp}kg/ha)`, `Potash (${fertKPerApp}kg/ha)`, "Fungicide (kung kailangan)"]
        : [`N fertilizer (${fertNPerApp}kg/ha)`, `Potash (${fertKPerApp}kg/ha)`, "Fungicide (if needed)"],
      priority: "critical",
    },
    {
      id: "stage-grain-set",
      name: isFil ? "Pag-unlad ng Bunga / Palay" : "Fruit / Grain Development",
      type: "monitoring",
      startDay: days.flowering,
      endDay: days.fruitSet,
      description: isFil
        ? `Yugto ng pagpuno ng bunga o palay. Panatilihin ang patubig at nutrisyon. Maglagay ng potasyo upang mapabuti ang kalidad.`
        : `Fruit or grain filling phase. Maintain irrigation and nutrition. Apply potassium to improve quality and storage.`,
      tasks: isFil ? [
        `Maglagay ng ${fertKPerApp}kg/ha K₂O para sa pagpapabuti ng kalidad`,
        "Bantayan at kontrolin ang mga insekto na sumisira sa bunga/palay",
        "Panatilihin ang sapat na tubig sa panahon ng pagpuno ng bunga/palay",
        "Bantayan ang pagkalat ng sakit at gamutin kung lumampas sa threshold",
      ] : [
        `Apply ${fertKPerApp}kg/ha K₂O for quality improvement`,
        "Monitor and control insect pests that damage fruit/grain",
        "Maintain adequate moisture during grain/fruit fill",
        "Monitor for disease progression and treat if threshold exceeded",
      ],
      weatherConsiderations: isFil
        ? "Protektahan mula sa bagyo o ulan ng yelo. Ang sobrang ulan ay maaaring magdulot ng fungus."
        : "Protect from hailstorms. Excess rain may cause fungal issues. Drought at this stage reduces grain weight.",
      inputsNeeded: isFil
        ? [`Potash (${fertKPerApp}kg/ha)`, "Insecticide (kung kailangan)", "Tubig sa patubig"]
        : [`Potash (${fertKPerApp}kg/ha)`, "Insecticide (if threshold exceeded)", "Irrigation water"],
      priority: "high",
    },
    {
      id: "stage-maturity",
      name: isFil ? "Paghihinog at Bago Mag-ani" : "Maturity & Pre-Harvest",
      type: "monitoring",
      startDay: days.fruitSet,
      endDay: days.maturity,
      description: isFil
        ? `Ang pananim ay umabot na sa ganap na pagkahinog. Bawasan ang patubig 2 linggo bago mag-ani. Ihanda ang mga kagamitan sa pag-aani.`
        : `Crop reaches physiological maturity. Reduce irrigation 2 weeks before harvest. Prepare harvest equipment.`,
      tasks: isFil ? [
        "Suriin ang mga pahiwatig ng pagkahinog ng pananim (kulay, tuyong timbang)",
        "Bawasan ang pagpapatubig 10-14 araw bago mag-ani",
        "Iayos ang mga manggagawa at kagamitan sa pag-aani",
        "Ihanda ang pasilidad ng imbakan (malinis, may bentilasyon, walang peste)",
        "Bantayan ang mga peste at sakit sa huling bahagi ng panahon",
      ] : [
        "Assess crop maturity indicators (color, dry matter, moisture)",
        "Reduce irrigation 10-14 days before harvest",
        "Arrange harvest labor and equipment",
        "Prepare storage facility (clean, ventilated, pest-free)",
        "Monitor for late-season disease and insect pressure",
      ],
      weatherConsiderations: isFil
        ? "Mas gusto ang tuyong panahon para sa pag-aani. Ang ulan sa pagkahinog ay nagdudulot ng pagkasira ng kalidad."
        : "Dry weather preferred for harvest. Rain at maturity can cause quality loss and sprouting.",
      inputsNeeded: isFil
        ? ["Moisture meter", "Kagamitan sa pag-aani", "Sako sa pag-iimbak", "Patuyuan"]
        : ["Moisture meter", "Harvest equipment", "Storage bags", "Drying facility"],
      priority: "high",
    },
    {
      id: "stage-harvest",
      name: isFil ? "Pag-aani at Pagkatapos Mag-ani" : "Harvest & Post-Harvest",
      type: "harvest",
      startDay: days.maturity,
      endDay: days.maturity + harvestWindow,
      description: isFil
        ? `Bintana sa pag-aani: ${harvestWindow} araw. Inaasahang ani: ${expectedYield}. Ang tamang paghawak pagkatapos mag-ani ay mahalaga para sa kalidad at pagbebenta.`
        : `Harvest window: ${harvestWindow} days. Expected yield: ${expectedYield}. Proper post-harvest handling critical for quality and marketability.`,
      tasks: isFil ? [
        `Aniin sa tamang panahon ng pagkahinog para sa ${profile.name}`,
        "Ingatan ang paghawak upang mabawasan ang pisikal na pagkasira",
        "Ihiwalay at uriin batay sa laki at kalidad",
        "Patuyuin sa ligtas na antas ng moisture para sa pag-iimbak",
        "Magsagawa ng post-harvest treatment kung kinakailangan (fumigation, pagpapakintab)",
        "Irekord ang aktwal na ani para sa mga talaan ng bukid",
      ] : [
        `Harvest at optimal maturity for ${profile.name}`,
        "Handle carefully to minimize physical damage",
        "Sort and grade by size/quality",
        "Dry to safe storage moisture content",
        "Apply post-harvest treatment if required (fumigation, waxing)",
        "Record actual yield for farm records",
      ],
      weatherConsiderations: isFil
        ? "Mag-ani sa magagandang araw kapag maaari. Iwasang mag-ani agad pagkatapos ng malakas na ulan."
        : "Harvest on clear days when possible. Avoid harvest after heavy rain.",
      inputsNeeded: isFil
        ? ["Kagamitan/makina sa pag-aani", "Lagayan ng ani", "Timbangan", "Panggamot sa post-harvest"]
        : ["Harvest tools/machinery", "Storage containers", "Weighing scale", "Post-harvest treatments"],
      priority: "critical",
    },
  ];

  const milestones = isFil ? [
    { day: 0, label: "Araw ng Pagtatanim", description: "Naitanim na ang pananim sa bukid", icon: "seedling" },
    { day: days.germination, label: "Pagsibol", description: `Lumabas na ang mga seedling — ${profile.gddPhases.germination} GDD naipon`, icon: "seedling" },
    { day: days.establishment, label: "Nakatatag na Tanim", description: "Ganap nang nakatayo ang mga tanim sa bukid", icon: "seedling" },
    { day: days.establishment, label: "Unang Pag-aabono", description: `Maglagay ng ${fertNPerApp}kg/ha N`, icon: "fertilizer" },
    { day: days.vegetative, label: "Rurok ng Paglaki", description: "Pinakamalaking sukat ng dahon — ikalawang pag-aabono", icon: "fertilizer" },
    { day: days.flowering, label: "Pagbulaklak", description: "Kritikal na yugto ng reproduksyon", icon: "water" },
    { day: days.fruitSet, label: "Pagbunga / Pagpapalay", description: "Pagsimula ng pagbuo ng bunga o palay", icon: "harvest" },
    { day: days.maturity, label: "Pagkahinog / Pag-aani", description: `Inaasahang ani: ${expectedYield}`, icon: "harvest" },
  ] : [
    { day: 0, label: "Planting Day", description: "Crop planted in field", icon: "seedling" },
    { day: days.germination, label: "Germination", description: `Seedlings emerge — ${profile.gddPhases.germination} GDD accumulated`, icon: "seedling" },
    { day: days.establishment, label: "Established", description: "Full crop stand established", icon: "seedling" },
    { day: days.establishment, label: "1st Fertilizer", description: `Apply ${fertNPerApp}kg/ha N`, icon: "fertilizer" },
    { day: days.vegetative, label: "Vegetative Peak", description: "Maximum leaf area — 2nd fertilizer application", icon: "fertilizer" },
    { day: days.flowering, label: "Flowering", description: "Critical reproductive stage", icon: "water" },
    { day: days.fruitSet, label: "Grain/Fruit Set", description: "Fruit or grain development begins", icon: "harvest" },
    { day: days.maturity, label: "Maturity / Harvest", description: `Expected yield: ${expectedYield}`, icon: "harvest" },
  ];

  const irrigScheduleDays = profile.criticalWaterStages.length;
  const irrigationSchedule = profile.criticalWaterStages.map((stage, i) => {
    const stageDay = [days.establishment, days.vegetative, days.flowering, days.fruitSet][i] ?? days.establishment + i * 20;
    const et0 = computeET0(climate.lat ?? 14.6, climate.annualMeanTemp + 5, climate.annualMeanTemp - 5, doy);
    const kc = getCropCoefficient(["establishment", "vegetative", "flowering", "fruitOrGrainSet"][i] ?? "vegetative");
    const etCrop = et0 * kc;
    return {
      day: stageDay,
      stage,
      etCrop: Math.round(etCrop * 10) / 10,
      waterDepth: Math.round(etCrop * 7 * 10) / 10,
      frequency: isFil ? (etCrop > 5 ? "Araw-araw" : etCrop > 3 ? "Tuwing 2 araw" : "Tuwing 3 araw") : (etCrop > 5 ? "Daily" : etCrop > 3 ? "Every 2 days" : "Every 3 days"),
      method: profile.waterRequirementMm > 800 ? (isFil ? "Baha / patubig sa kanal" : "Flood / furrow irrigation") : (isFil ? "Tulo (drip) o patubig sa kanal" : "Drip or furrow"),
      notes: isFil
        ? `Mahalaga para sa yugto ng ${stage}. ET₀ × Kc = ${etCrop.toFixed(1)} mm/araw.`
        : `Critical for ${stage}. ET₀ × Kc = ${etCrop.toFixed(1)} mm/day (Hargreaves-Samani method).`,
    };
  });

  const fertilizerSchedule = Array.from({ length: profile.fertilizerProfile.splitApplications }, (_, i) => {
    const appDay = [0, days.establishment, days.vegetative, days.flowering][i] ?? days.establishment + i * 20;
    const nPerApp = Math.round(profile.fertilizerProfile.n_kg_ha / profile.fertilizerProfile.splitApplications);
    return {
      day: appDay,
      product: isFil
        ? (i === 0 ? "Kumpletong abono (NPK) — Basal" : i === profile.fertilizerProfile.splitApplications - 1 ? "KCl / Muriate of Potash (K-dominant)" : "Urea o Ammonium Sulfate (N)")
        : (i === 0 ? "Complete fertilizer (NPK) — Basal" : i === profile.fertilizerProfile.splitApplications - 1 ? "KCl / Muriate of Potash (K-dominant)" : "Urea or Ammonium Sulfate (N)"),
      rate: i === 0
        ? `${fertPTotal}kg/ha P₂O₅ + ${fertKPerApp}kg/ha K₂O + ${nPerApp}kg/ha N`
        : i === profile.fertilizerProfile.splitApplications - 1
          ? `${nPerApp}kg/ha N + ${fertKPerApp}kg/ha K₂O`
          : `${nPerApp}kg/ha N`,
      method: isFil
        ? (i === 0 ? "Ihalo sa lupa sa pagtatanim" : "Ikalat sa tabi ng ugat o ilagay sa gilid")
        : (i === 0 ? "Incorporate into soil at planting" : "Side-dress near root zone or broadcast"),
      purpose: isFil
        ? (i === 0 ? "Basal — pagpapataba ng ugat at maagang paglaki" : i === profile.fertilizerProfile.splitApplications - 1 ? "Huling abono — pagpapaganda ng kalidad at pagsuporta sa pagkahinog" : `Pagbababaw ${i + 1} — mabilis na paglaki ng dahon`)
        : (i === 0 ? "Basal — root development and early growth" : i === profile.fertilizerProfile.splitApplications - 1 ? "Final — quality improvement and maturity support" : `Split ${i + 1} — vegetative growth and tillering`),
    };
  });

  const pestAlerts = profile.commonPests.map((pest) => ({
    name: pest.name,
    riskPeriod: isFil
      ? `Kapag ang temperatura ay ${pest.tempTriggerMin}–${pest.tempTriggerMax}°C${pest.humidityTrigger ? ` + humidity >${pest.humidityTrigger}%` : ""}`
      : `When temp ${pest.tempTriggerMin}–${pest.tempTriggerMax}°C${pest.humidityTrigger ? ` + humidity >${pest.humidityTrigger}%` : ""}`,
    symptoms: isFil
      ? `Suriin ang bukid kapag ang temperatura ay ${pest.tempTriggerMin}–${pest.tempTriggerMax}°C`
      : `Monitor fields when temperature is ${pest.tempTriggerMin}–${pest.tempTriggerMax}°C`,
    treatment: isFil
      ? "Mag-inspeksyon linggo-linggo. Mag-spray ng rehistradong pestisidyo kapag lumampas sa threshold. Unahin ang biyolohikal na pamamaraan."
      : "Scout weekly. Apply registered pesticide at economic threshold. Use IPM — biocontrol first.",
    riskActive: forecast.some(
      (d) =>
        d.tempMax >= pest.tempTriggerMin && d.tempMax <= pest.tempTriggerMax + 5 &&
        (pest.humidityTrigger ? true : true)
    ),
  }));

  const weatherAdjustments = isFil ? [
    {
      trigger: `Temperatura > ${profile.tempRange.max}°C`,
      impact: "Pagkalaglag ng bulaklak, pagbaba ng ani, heat stress",
      affectedStages: ["flowering", "fruit-set"],
      action: "Magpatubig sa maagang umaga para palamigin ang lupa. Maglagay ng shade net kung mayroon. Mag-spray ng foliar potassium.",
    },
    {
      trigger: `Temperatura < ${profile.tempRange.min}°C`,
      impact: "Mabagal na paglaki, pinsala sa lamig",
      affectedStages: ["germination", "establishment"],
      action: "Takpan ang mga punla ng row cover o mulch. Ipagpaliban ang pagtatanim hanggang uminit.",
    },
    {
      trigger: "Malakas na ulan > 50mm/araw",
      impact: "Pagkabalot sa tubig, pagkabagok ng ugat, pagkaanod ng nutrisyon",
      affectedStages: ["establishment", "vegetative"],
      action: "Buksan ang mga kanal ng drainage. Ipagpaliban ang pag-aabono ng 3-5 araw pagkatapos ng ulan.",
    },
    {
      trigger: "Tagtuyot (walang ulan > 14 araw)",
      impact: "Stress sa tubig, pagbaba ng ani",
      affectedStages: ["flowering", "grain-fill"],
      action: "Unahin ang pagpapatubig sa mga kritikal na yugto. Magmulch upang mabawasan ang pagkatuyo.",
    },
  ] : [
    {
      trigger: `Temperature > ${profile.tempRange.max}°C`,
      impact: "Flower drop, reduced fruit set, heat stress",
      affectedStages: ["flowering", "fruit-set"],
      action: "Irrigate in early morning to cool soil. Apply shade netting if available. Foliar feed with potassium.",
    },
    {
      trigger: `Temperature < ${profile.tempRange.min}°C`,
      impact: "Slowed growth, chilling injury, frost damage",
      affectedStages: ["germination", "establishment"],
      action: "Cover seedlings with row covers or mulch. Delay planting until temperatures recover.",
    },
    {
      trigger: "Heavy rainfall > 50mm/day",
      impact: "Waterlogging, root rot, nutrient leaching",
      affectedStages: ["establishment", "vegetative"],
      action: "Open drainage channels. Delay fertilizer application by 3–5 days after heavy rain.",
    },
    {
      trigger: "Drought (no rain > 14 days)",
      impact: "Water stress, yield reduction",
      affectedStages: ["flowering", "grain-fill"],
      action: "Prioritize irrigation at critical water stages. Mulch to reduce evaporation.",
    },
  ];

  return {
    crop: profile.name,
    location,
    plantingDate,
    totalGrowingDays,
    estimatedHarvestStart: days.maturity,
    estimatedHarvestEnd: days.maturity + harvestWindow,
    weatherRiskLevel: riskAssessment.level,
    weatherRiskNotes: riskAssessment.notes,
    varietyRecommendation: varietyNote,
    expectedYield,
    cropInfo: wikiInfo ?? `${profile.name} is a ${profile.category.toLowerCase()} crop grown in the Philippines. Optimal temperature: ${profile.tempRange.min}–${profile.tempRange.max}°C.`,
    dataSourcesUsed: [
      "Open-Meteo Historical Climate API (ERA5 reanalysis)",
      "Open-Meteo Forecast API (16-day)",
      "FAO Irrigation Paper No. 56 (GDD constants)",
      "USDA Agronomy Handbooks (open access)",
      "DA Philippines Crop Production Guides",
    ],
    climateAdaptedNote: isFil
      ? `Kinalkula ang plano para sa ${location}: karaniwang temp ${climate.annualMeanTemp}°C, ${climate.annualTotalRainfall}mm ulan/taon. Bilis ng GDD: ${avgGDD.toFixed(1)}/araw (base ${profile.gddBase}°C).`
      : `Plan computed for ${location}: mean ${climate.annualMeanTemp}°C, ${climate.annualTotalRainfall}mm rainfall/year. Avg GDD rate: ${avgGDD.toFixed(1)}/day (base ${profile.gddBase}°C).`,
    stages,
    milestones,
    weatherAdjustments,
    fertilizerSchedule,
    pestAlerts,
    irrigationSchedule,
  };
}

export function listAvailableCrops(): Array<{ name: string; category: string; emoji: string }> {
  return Object.values(CROP_GDD_PROFILES).map((p) => ({
    name: p.name,
    category: p.category,
    emoji: p.emoji,
  }));
}
