export type Language = "en" | "fil";

export interface Translations {
  // Navigation & Core Sections
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
  orders: string;
  marketInsight: string;
  aiInsights: string;

  // Common UI Controls & Actions
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
  refresh: string;
  clear: string;
  close: string;
  actions: string;
  viewAll: string;
  viewMore: string;
  preview: string;
  open: string;
  edit: string;
  delete: string;
  status: string;
  date: string;
  price: string;
  quantity: string;
  details: string;
  noData: string;
  error: string;
  retry: string;

  // Onboarding
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
  quickNav: string;
  liveForecast: string;
  daReference: string;
  grownoxInsight: string;
  aiMarketBrief: string;
  viewMarketAnalysis: string;
  directFarmTrading: string;
  activeListingsNearYou: string;
  browseMarketplace: string;
  todaysTasks: string;
  scheduleActionItems: string;
  openPlanner: string;
  setFarmLocation: string;
  humidity: string;
  wind: string;
  live: string;
  trading: string;
  tasks: string;
  guides: string;
  aiAdvisor: string;

  // Market & Prices
  marketPricesTitle: string;
  daBantayPresyo: string;
  marketPricesSub: string;
  searchCommodityPlaceholder: string;
  allCategories: string;
  riceGrains: string;
  vegetables: string;
  fruits: string;
  spicesHerbs: string;
  marketInsightsTitle: string;
  marketInsightsSub: string;
  generatingInsight: string;
  priceTrend: string;
  increasing: string;
  decreasing: string;
  stable: string;
  fairRetailPrice: string;
  farmerSellingAdvice: string;
  commodity: string;
  pricePerKg: string;
  change24h: string;

  // Marketplace
  marketplaceTitle: string;
  createListingBtn: string;
  makeOffer: string;
  buyNow: string;
  filterByCrop: string;
  filterByRegion: string;
  askingPrice: string;
  sellerDetails: string;
  minAllowedOffer: string;
  aiAnalysisTitle: string;
  browseListings: string;
  farmerDashboard: string;
  buyerOrders: string;
  postHarvest: string;
  activeCropListings: string;
  daReferenceSafeguard: string;
  daSafeguardDesc: string;
  allRegions: string;
  quantityAvailable: string;
  sellerLocation: string;
  farmerAskingPrice: string;
  daBenchmarkPrice: string;
  makeOfferBtn: string;
  directOrderBtn: string;
  aiPriceEval: string;
  pendingOffers: string;
  completedOrders: string;
  myOffers: string;
  orderHistory: string;
  emptyListings: string;
  postNewListingTitle: string;
  cropNameLabel: string;
  varietyLabel: string;
  askingPriceLabel: string;
  stockAvailableLabel: string;
  qualityGradeLabel: string;
  submitListingBtn: string;

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

  // Weather Page
  weatherTitle: string;
  weatherSub: string;
  currentTemperature: string;
  feelsLike: string;
  hourlyForecast: string;
  dailyForecast: string;
  farmingImpact: string;

  // Crops Database
  cropsTitle: string;
  cropsSub: string;
  searchCropsPlaceholder: string;
  growthDays: string;
  optimalTemp: string;
  suitableSoils: string;
  commonPests: string;

  // Tutorials Page
  tutorialsTitle: string;
  tutorialsSub: string;
  searchTutorialsPlaceholder: string;
  aiRelevanceMatch: string;
  watchVideo: string;
  grownoxEvaluation: string;
  watchOnYoutube: string;

  // Chat Page
  chatTitle: string;
  chatSub: string;
  askPlaceholder: string;
  send: string;
  clearChat: string;
  workingState: string;
  newChat: string;
  history: string;

  // Settings
  settingsTitle: string;
  settingsSub: string;
  languagePreference: string;
  languagePrefDesc: string;
  locationSettings: string;
  themePreference: string;
  resetOnboarding: string;
  darkMode: string;
  darkModeDesc: string;
}

export const TRANSLATIONS: Record<Language, Translations> = {
  en: {
    // Navigation
    dashboard: "Dashboard",
    weather: "Weather",
    crops: "Crops",
    market: "Market Prices",
    marketplace: "Marketplace",
    farmingPlan: "Farm Planner",
    tutorials: "Agri Tutorials",
    chat: "Grownox AI Chat",
    settings: "Settings",
    profile: "Profile",
    orders: "Orders",
    marketInsight: "Market Insight",
    aiInsights: "AI Insights",

    // Common UI Controls
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
    refresh: "Refresh",
    clear: "Clear",
    close: "Close",
    actions: "Actions",
    viewAll: "View All",
    viewMore: "View More",
    preview: "Preview",
    open: "Open",
    edit: "Edit",
    delete: "Delete",
    status: "Status",
    date: "Date",
    price: "Price",
    quantity: "Quantity",
    details: "Details",
    noData: "No data available",
    error: "An error occurred",
    retry: "Try Again",

    // Onboarding
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

    // Dashboard
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
    quickNav: "Quick Navigation",
    liveForecast: "Live Forecast",
    daReference: "DA Reference",
    grownoxInsight: "Grownox Insight",
    aiMarketBrief: "AI Market Brief",
    viewMarketAnalysis: "View market analysis",
    directFarmTrading: "Direct Farm Trading",
    activeListingsNearYou: "active crop listings near you",
    browseMarketplace: "Browse marketplace",
    todaysTasks: "Today's Tasks",
    scheduleActionItems: "Schedule & Action Items",
    openPlanner: "Open planner",
    setFarmLocation: "Set Farm Location",
    humidity: "Humidity",
    wind: "Wind",
    live: "Live",
    trading: "Trading",
    tasks: "Tasks",
    guides: "Guides",
    aiAdvisor: "AI Advisor",

    // Market & Prices
    marketPricesTitle: "DA Market Prices",
    daBantayPresyo: "Official DA Bantay Presyo Retail Data",
    marketPricesSub: "Official retail price monitoring from the Department of Agriculture (DA).",
    searchCommodityPlaceholder: "Search crop or commodity...",
    allCategories: "All Categories",
    riceGrains: "Rice & Grains",
    vegetables: "Vegetables",
    fruits: "Fruits",
    spicesHerbs: "Spices & Herbs",
    marketInsightsTitle: "Grownox AI Market Insights",
    marketInsightsSub: "Real-time AI analysis of price trends, seasonal shifts, and profit advice for local growers.",
    generatingInsight: "Grownox is working...",
    priceTrend: "Price Trend",
    increasing: "Increasing",
    decreasing: "Decreasing",
    stable: "Stable",
    fairRetailPrice: "Fair Retail Price",
    farmerSellingAdvice: "Farmer Selling Advice",
    commodity: "Commodity",
    pricePerKg: "Price (₱/kg)",
    change24h: "24h Change",

    // Marketplace
    marketplaceTitle: "Farmer Marketplace",
    createListingBtn: "List Produce for Sale",
    makeOffer: "Make Buyer Offer",
    buyNow: "Direct Order",
    filterByCrop: "Filter Crop",
    filterByRegion: "Filter Region",
    askingPrice: "Farmer Asking Price",
    sellerDetails: "Seller Details",
    minAllowedOffer: "Minimum Allowed Offer (10% Rule)",
    aiAnalysisTitle: "Grownox AI Price Evaluation",
    browseListings: "Browse Produce",
    farmerDashboard: "Farmer Sales Dashboard",
    buyerOrders: "My Purchases & Offers",
    postHarvest: "List Produce for Sale",
    activeCropListings: "Active Farm Listings",
    daReferenceSafeguard: "DA Reference Safeguard",
    daSafeguardDesc: "Marketplace prices stay within a fair 10% tolerance threshold of official DA benchmark prices to protect both farmers and buyers.",
    allRegions: "All 17 PH Regions",
    quantityAvailable: "Quantity Available",
    sellerLocation: "Farm Location",
    farmerAskingPrice: "Farmer Price",
    daBenchmarkPrice: "DA Benchmark",
    makeOfferBtn: "Make Offer",
    directOrderBtn: "Direct Buy",
    aiPriceEval: "Grownox AI Price Evaluation",
    pendingOffers: "Pending Offers",
    completedOrders: "Completed Sales",
    myOffers: "My Active Offers",
    orderHistory: "Order History",
    emptyListings: "No active crop listings found in this category.",
    postNewListingTitle: "Post Harvest Listing",
    cropNameLabel: "Crop Name",
    varietyLabel: "Variety",
    askingPriceLabel: "Asking Price (₱/kg)",
    stockAvailableLabel: "Available Stock (kg)",
    qualityGradeLabel: "Quality Grade",
    submitListingBtn: "Publish Listing",

    // Farm Planner
    plannerTitle: "Farm Planner",
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

    // Weather
    weatherTitle: "Local Weather & Agricultural Climate",
    weatherSub: "Detailed temperature, precipitation, humidity, and wind conditions tailored for farming.",
    currentTemperature: "Current Temperature",
    feelsLike: "Feels Like",
    hourlyForecast: "24-Hour Forecast",
    dailyForecast: "7-Day Outlook",
    farmingImpact: "Agricultural Impact & Recommendation",

    // Crops
    cropsTitle: "Philippine Crop Database",
    cropsSub: "Optimal growing conditions, GDD requirements, pest guides, and DA recommended varieties.",
    searchCropsPlaceholder: "Search crops (e.g. Rice, Corn, Tomato)...",
    growthDays: "Growth Duration",
    optimalTemp: "Optimal Temp",
    suitableSoils: "Suitable Soils",
    commonPests: "Common Pests",

    // Tutorials
    tutorialsTitle: "Agri Video Tutorials",
    tutorialsSub: "YouTube agricultural tutorials ranked and evaluated by Grownox AI.",
    searchTutorialsPlaceholder: "Search tutorials (e.g. organic tomato farming, rice pest control)...",
    aiRelevanceMatch: "Grownox AI Relevance Rank",
    watchVideo: "Watch Video",
    grownoxEvaluation: "Grownox Evaluation",
    watchOnYoutube: "Watch on YouTube",

    // Chat
    chatTitle: "Grownox AI Agricultural Advisor",
    chatSub: "Your expert advisor for Philippine farming, crops, soil, pests, and market prices.",
    askPlaceholder: "Ask Grownox AI about fertilizer rates, pest control, planting dates, or prices...",
    send: "Send",
    clearChat: "Clear Chat",
    workingState: "Grownox is working...",
    newChat: "New Chat",
    history: "Chat History",

    // Settings
    settingsTitle: "Account & Application Settings",
    settingsSub: "Manage language preferences, location settings, and display modes.",
    languagePreference: "Language Preference",
    languagePrefDesc: "Select English or Filipino for the app interface and Grownox AI responses.",
    locationSettings: "Farm Location",
    themePreference: "Theme Mode",
    resetOnboarding: "Reset Setup / Re-configure Location",
    darkMode: "Dark Mode",
    darkModeDesc: "Default light theme active. Switch on to enable dark mode.",
  },
  fil: {
    // Navigation
    dashboard: "Pangkalahatang-tingin",
    weather: "Panahon",
    crops: "Mga Pananim",
    market: "Presyo sa Pamilihan",
    marketplace: "Pamilihan",
    farmingPlan: "Tagaplano ng Pagsasaka",
    tutorials: "Mga Aralin",
    chat: "Grownox AI Chat",
    settings: "Mga Setting",
    profile: "Profile",
    orders: "Mga Order",
    marketInsight: "Pagsusuri ng Pamilihan",
    aiInsights: "Mga Pagsusuri ng AI",

    // Common UI Controls
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
    refresh: "I-refresh",
    clear: "Burahin",
    close: "Isara",
    actions: "Mga Aksyon",
    viewAll: "Tingnan Lahat",
    viewMore: "Tingnan Pa",
    preview: "Panoorin Dito",
    open: "Buksan",
    edit: "Baguhin",
    delete: "Burahin",
    status: "Katayuan",
    date: "Petsa",
    price: "Presyo",
    quantity: "Dami",
    details: "Mga Detalye",
    noData: "Walang magagamit na datos",
    error: "Nagkaroon ng problema",
    retry: "Subukan Ulit",

    // Onboarding
    languageStepTitle: "Pumili ng Gustong Wika",
    languageStepSub: "Pumili sa Ingles o Filipino para sa buong website at sa mga sagot ng Grownox AI.",
    regionStepTitle: "Saang rehiyon ang iyong bukid?",
    regionStepSub: "Pumili sa mga opisyal na rehiyon ng Pilipinas ayon sa PSGC data.",
    provinceStepTitle: "Pumili ng iyong lalawigan / probinsya",
    provinceStepSub: "Pumili ng probinsya para sa tumpak na ulat ng panahon at presyo sa pamilihan.",
    cityStepTitle: "Pumili ng iyong lungsod o bayan",
    cityStepSub: "Gagamitin ang GPS coordinates ng bayan para sa eksaktong forecast ng panahon.",
    cropStepTitle: "Anong mga pananim ang iyong itinatanim?",
    cropStepSub: "Pumili ng kahit isang pananim para sa personalized na planting planner at babala sa pamilihan.",
    startFarming: "Magsimula sa Pagsasaka",

    // Dashboard
    welcomeBack: "Maligayang pagbabalik",
    overview: "Pangkalahatang Tanawin",
    currentWeather: "Kasalukuyang Panahon",
    topCropRec: "Inirerekomendang Pananim",
    marketAlert: "Faktor at Balita sa Pamilihan",
    dailyTip: "Payo sa Pagsasaka Ngayon",
    quickActions: "Mabilis na Aksyon",
    exploreMarket: "Suriin ang Presyo",
    createListing: "I-post ang Ani",
    askGrownox: "Magtanong sa Grownox AI",
    quickNav: "Mabilis na Mabilis na Nabigasyon",
    liveForecast: "Kasalukuyang Ulat ng Panahon",
    daReference: "Reperensya ng DA",
    grownoxInsight: "Pagsusuri ng Grownox",
    aiMarketBrief: "Mabilis na Pagsusuri ng AI",
    viewMarketAnalysis: "Tingnan ang buong pagsusuri",
    directFarmTrading: "Direktang Kalakalan mula sa Bukid",
    activeListingsNearYou: "mga aktibong pananim na ibinebenta malapit sa iyo",
    browseMarketplace: "Bumisita sa pamilihan",
    todaysTasks: "Mga Gawain Ngayon",
    scheduleActionItems: "Iskedyul at Gawain",
    openPlanner: "Buksan ang tagaplano",
    setFarmLocation: "Itakda ang Lokasyon ng Bukid",
    humidity: "Kelemchepan (Humidity)",
    wind: "Hangin",
    live: "Buhay na Datos",
    trading: "Kalakalan",
    tasks: "Mga Gawain",
    guides: "Mga Gabay",
    aiAdvisor: "Tagapayo na AI",

    // Market & Prices
    marketPricesTitle: "Presyo sa Pamilihan ng DA",
    daBantayPresyo: "Opisyal na Datos ng DA Bantay Presyo",
    marketPricesSub: "Opisyal na pagsubaybay sa presyo ng retail mula sa Kagawaran ng Pagsasaka (DA).",
    searchCommodityPlaceholder: "Maghanap ng pananim o kalakal...",
    allCategories: "Lahat ng Kategorya",
    riceGrains: "Bigas at Trigo",
    vegetables: "Mga Gulay",
    fruits: "Mga Prutas",
    spicesHerbs: "Mga Rekado at Halaman",
    marketInsightsTitle: "Mga Pagsusuri ng AI sa Pamilihan",
    marketInsightsSub: "Real-time na pagsusuri ng AI sa galaw ng presyo, panahon ng anihan, at payo sa kita para sa magsasaka.",
    generatingInsight: "Gumagana ang Grownox...",
    priceTrend: "Galaw ng Presyo",
    increasing: "Pataas",
    decreasing: "Pababa",
    stable: "Pantay / Walang Bago",
    fairRetailPrice: "Makatarungang Presyo sa Retail",
    farmerSellingAdvice: "Payo sa Pagbebenta ng Magsasaka",
    commodity: "Kalakal / Pananim",
    pricePerKg: "Presyo (₱/kg)",
    change24h: "Galaw sa 24-Oras",

    // Marketplace
    marketplaceTitle: "Pamilihan ng Magsasaka",
    createListingBtn: "Magbenta ng Ani",
    makeOffer: "Mag-alok ng Presyo",
    buyNow: "Direktang Order",
    filterByCrop: "I-filter ang Pananim",
    filterByRegion: "I-filter ang Rehiyon",
    askingPrice: "Presyo ng Magsasaka",
    sellerDetails: "Detalye ng Nagbebenta",
    minAllowedOffer: "Mababang Pinapayag na Alok (10% Rule)",
    aiAnalysisTitle: "Pagsusuri ng Presyo ng Grownox AI",
    browseListings: "Maghanap ng Pananim",
    farmerDashboard: "Dashboard ng Nagbebenta",
    buyerOrders: "Aking mga Order at Alok",
    postHarvest: "Magbenta ng Ani",
    activeCropListings: "Mga Aktibong Tinda sa Bukid",
    daReferenceSafeguard: "Safeguard sa Reperensya ng DA",
    daSafeguardDesc: "Ang mga presyo ay nananatili sa loob ng makatarungang 10% tolerance ng opisyal na presyo ng DA upang protektahan ang magsasaka at mamimili.",
    allRegions: "Lahat ng 17 Rehiyon sa PH",
    quantityAvailable: "Daming Mapagpipilian",
    sellerLocation: "Lokasyon ng Bukid",
    farmerAskingPrice: "Presyo ng Magsasaka",
    daBenchmarkPrice: "Reperensya ng DA",
    makeOfferBtn: "Mag-alok ng Presyo",
    directOrderBtn: "Direktang Bili",
    aiPriceEval: "Pagsusuri ng Presyo ng Grownox AI",
    pendingOffers: "Mga Nakabinbing Alok",
    completedOrders: "Mga Natapos na Benta",
    myOffers: "Aking mga Alok",
    orderHistory: "Kasaysayan ng Order",
    emptyListings: "Walang nahanap na aktibong tinda sa kategoryang ito.",
    postNewListingTitle: "Mag-post ng Tinda mula sa Ani",
    cropNameLabel: "Pangalan ng Pananim",
    varietyLabel: "Uri / Uri ng Pananim",
    askingPriceLabel: "Gusto Mong Presyo (₱/kg)",
    stockAvailableLabel: "Daming Mapagkukunan (kg)",
    qualityGradeLabel: "Antas ng Kalidad",
    submitListingBtn: "I-post ang Tinda",

    // Farm Planner
    plannerTitle: "Tagaplano ng Pagsasaka",
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

    // Weather
    weatherTitle: "Lokal na Panahon at Klima sa Pagsasaka",
    weatherSub: "Detalyadong ulat ng temperatura, ulan, kelemchepan, at hangin para sa pagsasaka.",
    currentTemperature: "Kasalukuyang Temperatura",
    feelsLike: "Nararamdamang Temperatura",
    hourlyForecast: "Ulat sa Susunod na 24 Oras",
    dailyForecast: "Ulat sa Susunod na 7 Araw",
    farmingImpact: "Epekto sa Pagsasaka at Payo",

    // Crops
    cropsTitle: "Database ng mga Pananim sa Pilipinas",
    cropsSub: "Kondisyon sa pagpapalaki, gabay sa peste, at inirerekomendang uri mula sa DA.",
    searchCropsPlaceholder: "Maghanap ng pananim (hal. Palay, Mais, Kamatis)...",
    growthDays: "Araw ng Paglaki",
    optimalTemp: "Magandang Temperatura",
    suitableSoils: "Angkop na Lupa",
    commonPests: "Karaniwang Peste",

    // Tutorials
    tutorialsTitle: "Mga Aralin sa Pagsasaka",
    tutorialsSub: "Mga video sa YouTube na sinuri at inayos ng Grownox AI para sa magsasaka.",
    searchTutorialsPlaceholder: "Maghanap ng aralin (hal. pagtatanim ng kamatis, pagsugpo sa peste)...",
    aiRelevanceMatch: "Antas ng Pagsusuri ng Grownox AI",
    watchVideo: "Panoorin ang Video",
    grownoxEvaluation: "Pagsusuri ng Grownox",
    watchOnYoutube: "Panoorin sa YouTube",

    // Chat
    chatTitle: "Grownox AI Kausap sa Pagsasaka",
    chatSub: "Ang iyong nakatutulong na tagapayo sa pagtatanim, lupa, peste, abono, at presyo sa Pilipinas.",
    askPlaceholder: "Magtanong sa Grownox AI tungkol sa pataba, peste, petsa ng pagtatanim, o presyo...",
    send: "Ipadala",
    clearChat: "Burahin ang Usapan",
    workingState: "Gumagana ang Grownox...",
    newChat: "Bagong Usapan",
    history: "Kasaysayan ng Usapan",

    // Settings
    settingsTitle: "Mga Setting at Konpigurasyon",
    settingsSub: "Pamahalaan ang iyong wika, lokasyon ng bukid, at tema ng website.",
    languagePreference: "Gustong Wika",
    languagePrefDesc: "Pumili ng Ingles o Filipino para sa buong website at sa mga tugon ng Grownox AI.",
    locationSettings: "Lokasyon ng Bukid",
    themePreference: "Tema ng Interface",
    resetOnboarding: "I-reset ang Setting / Baguhin ang Lokasyon",
    darkMode: "Dark Mode",
    darkModeDesc: "Naka-enable ang liwanag na tema. I-on para sa dark mode.",
  },
};

export function getTranslation(lang: Language = "en"): Translations {
  return TRANSLATIONS[lang] || TRANSLATIONS.en;
}
