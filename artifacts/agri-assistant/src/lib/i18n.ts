export type Language = "en" | "fil";

export interface Translations {
  // Navigation & General
  dashboard: string;
  weather: string;
  crops: string;
  market: string;
  marketplace: string;
  farmingPlan: string;
  tutorials: string;
  chat: string;
  settings: string;
  profile: string;
  language: string;
  selectLanguage: string;
  english: string;
  filipino: string;
  chooseLanguageDesc: string;
  location: string;
  smartFarmingPlatform: string;
  continue: string;
  back: string;
  save: string;
  cancel: string;
  search: string;
  loading: string;

  // Onboarding / Login
  languageStepTitle: string;
  languageStepSub: string;
  regionStepTitle: string;
  regionStepSub: string;
  provinceStepTitle: string;
  provinceStepSub: string;
  cityStepTitle: string;
  cityStepSub: string;
  cropStepTitle: string;
  cropStepSub: string;
  startFarming: string;

  // Farm Planner
  plannerTitle: string;
  plannerSub: string;
  detailedMode: string;
  summarizedMode: string;
  viewModeLabel: string;
  viewMode: string;
  detailed: string;
  summarized: string;
  generatePlan: string;
  generatingPlan: string;
  selectCrop: string;
  plantingDate: string;
  totalGrowingDays: string;
  stages: string;
  expectedYield: string;
  weatherRisk: string;
  keyMilestones: string;
  keyActionsToday: string;
  timeline: string;
  weatherForecast: string;
  fertilizerSchedule: string;
  pestsAlerts: string;
  adjustments: string;
  quickSummary: string;
  harvestTarget: string;
  stageProgress: string;

  // Dashboard
  welcomeBack: string;
  overview: string;
  currentWeather: string;
  topCropRec: string;
  marketAlert: string;
  dailyTip: string;
  quickActions: string;
  exploreMarket: string;
  createListing: string;
  askGrownox: string;

  // Market & Marketplace
  marketPricesTitle: string;
  daBantayPresyo: string;
  marketplaceTitle: string;
  createListingBtn: string;
  makeOffer: string;
  buyNow: string;
  filterByCrop: string;
  filterByRegion: string;
  askingPrice: string;
  daReference: string;
  sellerDetails: string;
  minAllowedOffer: string;
  aiAnalysisTitle: string;

  // Chat
  chatTitle: string;
  chatSub: string;
  askPlaceholder: string;
  send: string;
  clearChat: string;

  // Tutorials
  tutorialsTitle: string;
  tutorialsSub: string;
  searchTutorialsPlaceholder: string;
  aiRelevanceMatch: string;
  watchVideo: string;

  // Settings
  settingsTitle: string;
  settingsSub: string;
  languagePreference: string;
  languagePrefDesc: string;
  locationSettings: string;
  themePreference: string;
  resetOnboarding: string;
}

export const TRANSLATIONS: Record<Language, Translations> = {
  en: {
    dashboard: "Dashboard",
    weather: "Weather",
    crops: "Crops",
    market: "Market Prices",
    marketplace: "Marketplace",
    farmingPlan: "Planting Planner",
    tutorials: "Agri Tutorials",
    chat: "Grownox AI Chat",
    settings: "Settings",
    profile: "Profile",
    language: "Language",
    selectLanguage: "Select Language",
    english: "English",
    filipino: "Filipino",
    chooseLanguageDesc: "Choose your preferred language for the application interface and Grownox AI responses.",
    location: "Location",
    smartFarmingPlatform: "Smart Farming Platform",
    continue: "Continue",
    back: "Back",
    save: "Save Preferences",
    cancel: "Cancel",
    search: "Search...",
    loading: "Loading...",

    languageStepTitle: "Select Preferred Language",
    languageStepSub: "Choose the language you prefer for interface controls and AI farming insights.",
    regionStepTitle: "Select your farm's region",
    regionStepSub: "Choose your region sourced from official Philippine PSGC data.",
    provinceStepTitle: "Select your province",
    provinceStepSub: "Choose your province for localized weather and market tracking.",
    cityStepTitle: "Select your city or municipality",
    cityStepSub: "Location coordinates are used for precise weather forecasting.",
    cropStepTitle: "What crops do you farm?",
    cropStepSub: "Select at least one crop to personalize your farming planner and market alerts.",
    startFarming: "Start Farming",

    plannerTitle: "Planting Planner",
    plannerSub: "GDD-based planting schedules using real open climate data — clear science, no guesswork.",
    detailedMode: "Detailed View",
    summarizedMode: "Summarized View",
    viewModeLabel: "Viewing Mode",
    viewMode: "View Mode",
    detailed: "Detailed",
    summarized: "Summarized",
    generatePlan: "Generate Planting Plan",
    generatingPlan: "Generating Plan...",
    selectCrop: "Select Crop",
    plantingDate: "Planting Date",
    totalGrowingDays: "Total Growth Days",
    stages: "Growth Stages",
    expectedYield: "Expected Yield",
    weatherRisk: "Weather Risk Level",
    keyMilestones: "Key Milestones",
    keyActionsToday: "Immediate Action Items",
    timeline: "Timeline & Stages",
    weatherForecast: "16-Day Weather",
    fertilizerSchedule: "Fertilizer Schedule",
    pestsAlerts: "Pests & Diseases",
    adjustments: "Weather Adjustments",
    quickSummary: "Quick Plan Summary",
    harvestTarget: "Target Harvest Window",
    stageProgress: "Current Focus Stage",

    welcomeBack: "Welcome back",
    overview: "Overview",
    currentWeather: "Current Weather",
    topCropRec: "Crop Focus Recommendation",
    marketAlert: "Market Opportunity Alert",
    dailyTip: "Daily Agronomy Tip",
    quickActions: "Quick Actions",
    exploreMarket: "Explore Prices",
    createListing: "Post Harvest",
    askGrownox: "Ask Grownox AI",

    marketPricesTitle: "DA Market Prices",
    daBantayPresyo: "Official DA Bantay Presyo Retail Data",
    marketplaceTitle: "Farmer Marketplace",
    createListingBtn: "List Produce for Sale",
    makeOffer: "Make Buyer Offer",
    buyNow: "Direct Order",
    filterByCrop: "Filter Crop",
    filterByRegion: "Filter Region",
    askingPrice: "Farmer Asking Price",
    daReference: "DA Reference Benchmark",
    sellerDetails: "Seller Details",
    minAllowedOffer: "Minimum Allowed Offer (10% Rule)",
    aiAnalysisTitle: "Grownox AI Price Evaluation",

    chatTitle: "Grownox AI Agricultural Advisor",
    chatSub: "Your expert advisor for Philippine farming, crops, soil, pests, and market prices.",
    askPlaceholder: "Ask Grownox AI about fertilizer rates, pest control, planting dates, or prices...",
    send: "Send",
    clearChat: "Clear Chat",

    tutorialsTitle: "Agri Video Tutorials",
    tutorialsSub: "YouTube agricultural tutorials ranked and evaluated by Grownox AI.",
    searchTutorialsPlaceholder: "Search tutorials (e.g. organic tomato farming, rice pest control)...",
    aiRelevanceMatch: "Grownox AI Relevance Rank",
    watchVideo: "Watch Video",

    settingsTitle: "Account & Application Settings",
    settingsSub: "Manage language preferences, location settings, and display modes.",
    languagePreference: "Language Preference",
    languagePrefDesc: "Select English or Filipino for the app interface and Grownox AI responses.",
    locationSettings: "Farm Location",
    themePreference: "Interface Theme",
    resetOnboarding: "Reset Setup / Re-configure Location",
  },
  fil: {
    dashboard: "Impormasyon",
    weather: "Panahon",
    crops: "Mga Pananim",
    market: "Presyo sa Merkado",
    marketplace: "Pamilihan",
    farmingPlan: "Plano sa Pagsasaka",
    tutorials: "Mga Aralin",
    chat: "Kausap na AI",
    settings: "Mga Setting",
    profile: "Profile",
    language: "Wika",
    selectLanguage: "Pumili ng Wika",
    english: "Ingles (English)",
    filipino: "Filipino",
    chooseLanguageDesc: "Pumili ng iyong gustong wika para sa mga nakasulat sa application at sa mga tugon ng Grownox AI.",
    location: "Lokasyon",
    smartFarmingPlatform: "Makabagong Platform sa Pagsasaka",
    continue: "Magpatuloy",
    back: "Bumalik",
    save: "I-save ang Setting",
    cancel: "Kanselahin",
    search: "Maghanap...",
    loading: "Kasalukuyang naglo-load...",

    languageStepTitle: "Pumili ng Gustong Wika",
    languageStepSub: "Pumili sa Ingles o Filipino para sa buong website at sa mga sagot ng Grownox AI.",
    regionStepTitle: "Saang rehiyon ang iyong bukid?",
    regionStepSub: "Pumili sa mga opisyal na rehiyon ng Pilipinas ayon sa PSGC data.",
    provinceStepTitle: "Pumili ng iyong lalawigan / probinsya",
    provinceStepSub: "Pumili ng probinsya para sa tumpak na ulat ng panahon at presyo sa merkado.",
    cityStepTitle: "Pumili ng iyong lungsod o bayan",
    cityStepSub: "Gagamitin ang GPS coordinates ng bayan para sa eksaktong forecast ng panahon.",
    cropStepTitle: "Anong mga pananim ang iyong itinatanim?",
    cropStepSub: "Pumili ng kahit isang pananim para sa personalized na planting planner at babala sa merkado.",
    startFarming: "Magsimula sa Pagsasaka",

    plannerTitle: "Plano sa Pagsasaka",
    plannerSub: "Iskedyul ng pagtatanim batay sa GDD at tunay na datos ng klima — malinaw at walang hula.",
    detailedMode: "Kumpletong Tingin",
    summarizedMode: "Buod na Tingin",
    viewModeLabel: "Tingin sa Plano",
    viewMode: "Tingin sa Plano",
    detailed: "Kumpleto",
    summarized: "Pinaikling Buod",
    generatePlan: "Gumawa ng Plano sa Pagsasaka",
    generatingPlan: "Gumagawa ng Plano...",
    selectCrop: "Pumili ng Pananim",
    plantingDate: "Petsa ng Pagtatanim",
    totalGrowingDays: "Kabuuang Araw ng Paglaki",
    stages: "Mga Yugto ng Paglaki",
    expectedYield: "Inaasahang Ani",
    weatherRisk: "Antas ng Panganib sa Panahon",
    keyMilestones: "Mga Pangunahing Yugto",
    keyActionsToday: "Mga Tungkulin Ngayon",
    timeline: "Talaorasan at Yugto",
    weatherForecast: "Ulat sa Panahon (16 Araw)",
    fertilizerSchedule: "Iskedyul ng Abono",
    pestsAlerts: "Mga Peste at Sakit",
    adjustments: "Pag-aangkop sa Panahon",
    quickSummary: "Mabilis na Buod ng Plano",
    harvestTarget: "Target na Inaasahang Anihan",
    stageProgress: "Pangunahing Yugto Ngayon",

    welcomeBack: "Maligayang pagbabalik",
    overview: "Pangkalahatang Tanawin",
    currentWeather: "Kasalukuyang Panahon",
    topCropRec: "Inirerekomendang Pananim",
    marketAlert: "Faktor at Balita sa Merkado",
    dailyTip: "Payo sa Pagsasaka Ngayon",
    quickActions: "Mabilis na Aksyon",
    exploreMarket: "Suriin ang Presyo",
    createListing: "I-post ang Ani",
    askGrownox: "Magtanong sa Grownox AI",

    marketPricesTitle: "Mga Presyo ng DA sa Merkado",
    daBantayPresyo: "Opisyal na Datos ng DA Bantay Presyo",
    marketplaceTitle: "Pamilihan ng mga Magsasaka",
    createListingBtn: "Magbenta ng Ani",
    makeOffer: "Mag-alok ng Presyo",
    buyNow: "Direktang Order",
    filterByCrop: "I-filter ang Pananim",
    filterByRegion: "I-filter ang Rehiyon",
    askingPrice: "Presyo ng Magsasaka",
    daReference: "Presyo ng DA Benchmark",
    sellerDetails: "Detalye ng Nagbebenta",
    minAllowedOffer: "Mababang Pinapayag na Alok (10% Rule)",
    aiAnalysisTitle: "Pagsusuri ng Presyo ng Grownox AI",

    chatTitle: "Grownox AI Kausap sa Pagsasaka",
    chatSub: "Ang iyong nakatutulong na tagapayo sa pagtatanim, lupa, peste, abono, at presyo sa Pilipinas.",
    askPlaceholder: "Magtanong sa Grownox AI tungkol sa pataba, peste, petsa ng pagtatanim, o presyo...",
    send: "Ipadala",
    clearChat: "Burahin ang Usapan",

    tutorialsTitle: "Mga Aralin sa Pagsasaka",
    tutorialsSub: "Mga video sa YouTube na sinuri at inayos ng Grownox AI para sa magsasaka.",
    searchTutorialsPlaceholder: "Maghanap ng aralin (hal. pagtatanim ng kamatis, pagsugpo sa peste)...",
    aiRelevanceMatch: "Antas ng Pagsusuri ng Grownox AI",
    watchVideo: "Panoorin ang Video",

    settingsTitle: "Mga Setting at Profile",
    settingsSub: "Pamahalaan ang iyong wika, lokasyon ng bukid, at tema ng website.",
    languagePreference: "Gustong Wika",
    languagePrefDesc: "Pumili ng Ingles o Filipino para sa buong website at sa mga tugon ng Grownox AI.",
    locationSettings: "Lokasyon ng Bukid",
    themePreference: "Tema ng Interface",
    resetOnboarding: "I-reset ang Setting / Baguhin ang Lokasyon",
  },
};

export function getTranslation(lang: Language = "en"): Translations {
  return TRANSLATIONS[lang] || TRANSLATIONS.en;
}
