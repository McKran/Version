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
  marketNav: string;
  farmerNav: string;
  marketPage: string;
  farmerPage: string;
  marketplaceNav: string;
  farmerNavHeader: string;
  locationPlaceholder: string;
  quickAccess: string;
  navigation: string;
  intMarket: string;
  regionalMarket: string;
  localMarket: string;
  pricing: string;

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
  savePreferences: string;
  preferencesSaved: string;
  saved: string;
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
  confirm: string;
  filter: string;
  all: string;
  status: string;
  date: string;
  price: string;
  quantity: string;
  details: string;
  noData: string;
  error: string;
  retry: string;
  createPlan: string;
  noActivePlan: string;
  yes: string;
  no: string;
  remove: string;
  update: string;
  download: string;
  share: string;
  print: string;
  select: string;
  typeMessage: string;
  copy: string;

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

  // Dashboard & Farmer Dashboard
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
  newFarmPlan: string;
  logTask: string;
  viewMarket: string;
  optimalHealth: string;
  noCropsBadge: string;
  activeCrops: string;
  noCropsSelected: string;
  myCropsList: string;
  view: string;
  activePlanCount: string;
  noActivePlanCount: string;
  farmPlans: string;
  createCustomPlan: string;
  progress: string;
  active: string;
  ready: string;
  pendingTasksCount: string;
  upcomingTasks: string;
  farmAdvice: string;
  allTasksCompleted: string;
  noActiveTasksQueued: string;
  pendingSchedule: string;
  upToDate: string;
  priority: string;
  fieldWeatherStation: string;
  openWeatherAdvisory: string;
  hourlyOutlook: string;
  sevenDayOutlook: string;
  cropLifecycleTimeline: string;
  dayCount: string;
  startsInDays: string;
  targetHarvestWindow: string;
  estimatedCycle: string;
  expectedYieldTarget: string;
  synchronizedPlanner: string;
  openInFarmPlanner: string;
  noActiveFarmPlanTitle: string;
  noActiveFarmPlanDesc: string;
  openFarmPlanner: string;
  recommendedTutorials: string;
  recommendedTutorialsSub: string;
  viewAllTutorials: string;
  watchTutorial: string;
  daEngine: string;
  aiAssistantOnline: string;
  aiAnalyzingFields: string;
  aiCardDefaultPrompt: string;
  quickInquiries: string;
  ask: string;
  openFullAiChat: string;
  identifyRiceBlast: string;
  onionFertilizerRate: string;
  nextSprayWindow: string;
  commodityMarketplace: string;

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
  consultationHistory: string;
  newTopicChat: string;
  recentSessions: string;
  noSessionsYet: string;
  deleteSession: string;
  discussing: string;
  soilClayLoam: string;
  tailoredFor: string;
  agricultureAiAssistant: string;
  startNewTopic: string;
  historyBtn: string;
  farmStationSettings: string;
  changeFieldContext: string;
  welcomeToGrownox: string;
  welcomeSubtitle: string;
  askAnythingPlaceholder: string;
  regulatoryDisclaimer: string;
  lotContext: string;
  logInFarmPlanner: string;
  viewAgriTutorials: string;
  copyProtocol: string;
  copied: string;
  sentFromFieldStation: string;
  agronomicDiagnosis: string;
  grownoxAssistant: string;
  liveAgroMet: string;
  analyzingPrompt: string;

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
    marketNav: "MARKET",
    farmerNav: "FARMER",
    marketPage: "MARKET PAGE",
    farmerPage: "FARMER PAGE",
    marketplaceNav: "Marketplace Navigation",
    farmerNavHeader: "Farmer Tools & Advisory",
    locationPlaceholder: "Your location...",
    quickAccess: "Quick Access",
    navigation: "Navigation",
    intMarket: "Int'l Market",
    regionalMarket: "Regional Market",
    localMarket: "Local Market",
    pricing: "pricing",

    // Common UI Controls
    language: "Language",
    selectLanguage: "Select Language",
    english: "English",
    filipino: "Filipino (Tagalog)",
    chooseLanguageDesc: "Choose your preferred language for the application interface and Grownox AI responses.",
    location: "Location",
    smartFarmingPlatform: "Smart Farming Platform",
    continue: "Continue",
    back: "Back",
    save: "Save",
    savePreferences: "Save Preferences",
    preferencesSaved: "Preferences saved successfully!",
    saved: "Saved",
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
    confirm: "Confirm",
    filter: "Filter",
    all: "All",
    status: "Status",
    date: "Date",
    price: "Price",
    quantity: "Quantity",
    details: "Details",
    noData: "No data available",
    error: "An error occurred",
    retry: "Try Again",
    createPlan: "Create Plan",
    noActivePlan: "No Active Plan",
    yes: "Yes",
    no: "No",
    remove: "Remove",
    update: "Update",
    download: "Download",
    share: "Share",
    print: "Print",
    select: "Select",
    typeMessage: "Type a message...",
    copy: "Copy",

    // Onboarding
    languageStepTitle: "Select Preferred Language",
    languageStepSub: "Choose the language you prefer for interface controls and AI farming insights.",
    regionStepTitle: "Select your farm's region",
    regionStepSub: "Select your region to get localized farming guidance.",
    provinceStepTitle: "Select your province",
    provinceStepSub: "Choose your province for localized weather and market tracking.",
    cityStepTitle: "Select your city or municipality",
    cityStepSub: "Location coordinates are used for precise weather forecasting.",
    cropStepTitle: "What crops do you farm?",
    cropStepSub: "Select at least one crop to personalize your farming planner and market alerts.",
    startFarming: "Start Farming",

    // Dashboard & Farmer Dashboard
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
    newFarmPlan: "New Farm Plan",
    logTask: "Log Task",
    viewMarket: "View Market",
    optimalHealth: "OPTIMAL HEALTH",
    noCropsBadge: "NO CROPS",
    activeCrops: "Active Crops",
    noCropsSelected: "No crops selected yet",
    myCropsList: "My Crops List",
    view: "View",
    activePlanCount: "1 ACTIVE PLAN",
    noActivePlanCount: "NO ACTIVE PLAN",
    farmPlans: "Farm Plans",
    createCustomPlan: "Create a customized plan",
    progress: "Progress",
    active: "Active",
    ready: "Ready",
    pendingTasksCount: "PENDING TASKS",
    upcomingTasks: "Upcoming Tasks",
    farmAdvice: "Farm Advice",
    allTasksCompleted: "All tasks completed!",
    noActiveTasksQueued: "No active tasks queued",
    pendingSchedule: "Pending Schedule",
    upToDate: "Up to date",
    priority: "Priority",
    fieldWeatherStation: "Field Weather Station",
    openWeatherAdvisory: "Open Weather Advisory",
    hourlyOutlook: "Hourly Outlook",
    sevenDayOutlook: "7-Day Outlook",
    cropLifecycleTimeline: "Crop Lifecycle & Field Timeline",
    dayCount: "Day",
    startsInDays: "Starts in {n} days",
    targetHarvestWindow: "Target Harvest Window",
    estimatedCycle: "Estimated Cycle",
    expectedYieldTarget: "Expected Yield Target",
    synchronizedPlanner: "Synchronized with Farm Planner",
    openInFarmPlanner: "Open in Farm Planner",
    noActiveFarmPlanTitle: "No active farm plan",
    noActiveFarmPlanDesc: "Create or activate a planting plan in the Farm Planner to monitor your crop's cycle day, task completions, and seasonal progress here.",
    openFarmPlanner: "Open Farm Planner",
    recommendedTutorials: "Recommended Field Tutorials & Guides",
    recommendedTutorialsSub: "Validated agronomic procedures tailored to your currently cultivated crops",
    viewAllTutorials: "View All Tutorials",
    watchTutorial: "Watch Tutorial",
    daEngine: "DA Engine",
    aiAssistantOnline: "Agriculture AI Assistant Online",
    aiAnalyzingFields: "Grownox is analyzing your fields...",
    aiCardDefaultPrompt: "Ask questions about crop pests, fertilizer dosages, soil acidity, or weather advisories for your fields.",
    quickInquiries: "Quick Inquiries",
    ask: "Ask",
    openFullAiChat: "Open Full AI Chat Interface",
    identifyRiceBlast: "Identify Rice Leaf Blast",
    onionFertilizerRate: "Onion Fertilizer Rate / Ha",
    nextSprayWindow: "Next Spray Window",
    commodityMarketplace: "Commodity Marketplace",

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
    consultationHistory: "Consultation History",
    newTopicChat: "New Topic / Chat",
    recentSessions: "Recent Sessions",
    noSessionsYet: "No previous consult sessions yet.",
    deleteSession: "Delete session",
    discussing: "Discussing:",
    soilClayLoam: "Soil Clay-Loam",
    tailoredFor: "Tailored for",
    agricultureAiAssistant: "Agriculture AI Assistant",
    startNewTopic: "New Topic",
    historyBtn: "History",
    farmStationSettings: "Farm Station Settings",
    changeFieldContext: "Change Field Context",
    welcomeToGrownox: "Welcome to Grownox",
    welcomeSubtitle: "Your intelligent agricultural conversational assistant. Ask any question about your crops, pest treatment, soil nutrition, or farm management.",
    askAnythingPlaceholder: "Ask Grownox about crop diseases, planting calendar, fertilizer dose, or market prices...",
    regulatoryDisclaimer: "Grownox AI provides evidence-grounded agronomic advisory compliant with DA, PhilRice, and ATI agricultural protocols.",
    lotContext: "Field Lot 1",
    logInFarmPlanner: "Log in Farm Planner",
    viewAgriTutorials: "View Agri Tutorials",
    copyProtocol: "Copy",
    copied: "Copied!",
    sentFromFieldStation: "Sent from Field Station",
    agronomicDiagnosis: "Agronomic Diagnosis & Protocol",
    grownoxAssistant: "Grownox Assistant",
    liveAgroMet: "Grownox AI",
    analyzingPrompt: "Grownox is preparing your personalized recommendation...",

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
    dashboard: "Talaan",
    weather: "Panahon",
    crops: "Mga Pananim",
    market: "Presyo sa Pamilihan",
    marketplace: "Pamilihan",
    farmingPlan: "Tagaplano ng Sakahan",
    tutorials: "Mga Tutorial sa Agrikultura",
    chat: "Grownox AI Chat",
    settings: "Mga Setting",
    profile: "Profile",
    orders: "Mga Order",
    marketInsight: "Pagsusuri ng Pamilihan",
    aiInsights: "Mga Pagsusuri ng AI",
    marketNav: "PAMILIHAN",
    farmerNav: "MAGSASAKA",
    marketPage: "PAHINA NG PAMILIHAN",
    farmerPage: "PAHINA NG MAGSASAKA",
    marketplaceNav: "Nabigasyon sa Pamilihan",
    farmerNavHeader: "Mga Gamit at Gabay sa Pagsasaka",
    locationPlaceholder: "Iyong lokasyon...",
    quickAccess: "Mabilis na Pag-access",
    navigation: "Nabigasyon",
    intMarket: "Pandaigdigang Pamilihan",
    regionalMarket: "Rehiyonal na Pamilihan",
    localMarket: "Lokal na Pamilihan",
    pricing: "pagpepresyo",

    // Common UI Controls
    language: "Wika",
    selectLanguage: "Pumili ng Wika",
    english: "Ingles (English)",
    filipino: "Filipino (Tagalog)",
    chooseLanguageDesc: "Pumili ng iyong gustong wika para sa buong interface ng application at sa mga tugon ng Grownox AI.",
    location: "Lokasyon",
    smartFarmingPlatform: "Makabagong Platform sa Pagsasaka",
    continue: "Magpatuloy",
    back: "Bumalik",
    save: "I-save",
    savePreferences: "I-save ang mga Setting",
    preferencesSaved: "Matagumpay na na-save ang mga setting!",
    saved: "Nai-save na",
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
    delete: "Tanggalin",
    confirm: "Kumpirmahin",
    filter: "I-filter",
    all: "Lahat",
    status: "Katayuan",
    date: "Petsa",
    price: "Presyo",
    quantity: "Dami",
    details: "Mga Detalye",
    noData: "Walang magagamit na datos",
    error: "Nagkaroon ng problema",
    retry: "Subukan Ulit",
    createPlan: "Gumawa ng Plano",
    noActivePlan: "Walang Aktibong Plano",
    yes: "Oo",
    no: "Hindi",
    remove: "Alisin",
    update: "I-update",
    download: "I-download",
    share: "Ibahagi",
    print: "I-print",
    select: "Pumili",
    typeMessage: "Mag-type ng mensahe...",
    copy: "Kopyahin",

    // Onboarding
    languageStepTitle: "Pumili ng Gustong Wika",
    languageStepSub: "Pumili sa Ingles o Filipino para sa buong website at sa mga sagot ng Grownox AI.",
    regionStepTitle: "Saang rehiyon ang iyong bukid?",
    regionStepSub: "Pumili ng iyong rehiyon upang makita ang lokal na gabay sa pagsasaka.",
    provinceStepTitle: "Pumili ng iyong lalawigan / probinsya",
    provinceStepSub: "Pumili ng probinsya para sa tumpak na ulat ng panahon at presyo sa pamilihan.",
    cityStepTitle: "Pumili ng iyong lungsod o bayan",
    cityStepSub: "Gagamitin ang GPS coordinates ng bayan para sa eksaktong forecast ng panahon.",
    cropStepTitle: "Anong mga pananim ang iyong itinatanim?",
    cropStepSub: "Pumili ng kahit isang pananim para sa personalized na planting planner at babala sa pamilihan.",
    startFarming: "Magsimula sa Pagsasaka",

    // Dashboard & Farmer Dashboard
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
    quickNav: "Mabilis na Nabigasyon",
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
    humidity: "Halumigmig",
    wind: "Hangin",
    live: "Buhay na Datos",
    trading: "Kalakalan",
    tasks: "Mga Gawain",
    guides: "Mga Gabay",
    aiAdvisor: "Tagapayo na AI",
    newFarmPlan: "Bagong Plano ng Sakahan",
    logTask: "I-tala ang Gawain",
    viewMarket: "Tingnan ang Pamilihan",
    optimalHealth: "MAAYOS NA KALUSUGAN",
    noCropsBadge: "WALANG PANANIM",
    activeCrops: "Aktibong Pananim",
    noCropsSelected: "Wala pang napiling pananim",
    myCropsList: "Listahan ng Aking Pananim",
    view: "Tingnan",
    activePlanCount: "1 AKTIBONG PLANO",
    noActivePlanCount: "WALANG AKTIBONG PLANO",
    farmPlans: "Mga Plano ng Sakahan",
    createCustomPlan: "Gumawa ng sariling plano",
    progress: "Pagsulong",
    active: "Aktibo",
    ready: "Handa",
    pendingTasksCount: "MGA NAIWANG GAWAIN",
    upcomingTasks: "Mga Parating na Gawain",
    farmAdvice: "Payo sa Bukid",
    allTasksCompleted: "Lahat ng gawain ay tapos na!",
    noActiveTasksQueued: "Walang nakapilang gawain",
    pendingSchedule: "Nakatakdang Gawain",
    upToDate: "Napapanahon",
    priority: "Priyoridad",
    fieldWeatherStation: "Estasyon ng Panahon sa Bukid",
    openWeatherAdvisory: "Buksan ang Ulat ng Panahon",
    hourlyOutlook: "Ulat Bawat Oras",
    sevenDayOutlook: "7-Araw na Ulat",
    cropLifecycleTimeline: "Yugto ng Buhay ng Pananim at Talaorasan",
    dayCount: "Araw",
    startsInDays: "Magsisimula sa {n} araw",
    targetHarvestWindow: "Target na Panahon ng Pag-ani",
    estimatedCycle: "Tinatayang Siklo",
    expectedYieldTarget: "Target na Inaasahang Ani",
    synchronizedPlanner: "Naka-synchronize sa Tagaplano ng Sakahan",
    openInFarmPlanner: "Buksan sa Tagaplano ng Sakahan",
    noActiveFarmPlanTitle: "Walang aktibong plano sa sakahan",
    noActiveFarmPlanDesc: "Gumawa o mag-aktibo ng plano sa pagtatanim sa Tagaplano ng Sakahan upang masubaybayan ang araw ng siklo, natapos na gawain, at pagsulong sa panahon dito.",
    openFarmPlanner: "Buksan ang Tagaplano ng Sakahan",
    recommendedTutorials: "Inirerekomendang mga Tutorial at Gabay sa Sakahan",
    recommendedTutorialsSub: "Mga napatunayang pamamaraan sa agrikultura na angkop sa iyong mga itinatanim",
    viewAllTutorials: "Tingnan Lahat ng Tutorial",
    watchTutorial: "Panoorin ang Tutorial",
    daEngine: "DA Engine",
    aiAssistantOnline: "Online ang AI Assistant sa Agrikultura",
    aiAnalyzingFields: "Sinusuri ng Grownox ang iyong sakahan...",
    aiCardDefaultPrompt: "Magtanong tungkol sa peste ng pananim, sukat ng abono, asido ng lupa, o ulat ng panahon para sa iyong bukid.",
    quickInquiries: "Mabilis na Katanungan",
    ask: "Itanong",
    openFullAiChat: "Buksan ang Buong AI Chat",
    identifyRiceBlast: "Tukuyin ang Rice Leaf Blast",
    onionFertilizerRate: "Sukat ng Abono sa Sibuyas / Ha",
    nextSprayWindow: "Susunod na Oras ng Pag-spray",
    commodityMarketplace: "Pamilihan ng mga Kalakal",

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
    plannerTitle: "Tagaplano ng Sakahan",
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
    weatherSub: "Detalyadong ulat ng temperatura, ulan, halumigmig, at hangin para sa pagsasaka.",
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
    tutorialsTitle: "Mga Tutorial sa Agrikultura",
    tutorialsSub: "Mga video sa YouTube na sinuri at inayos ng Grownox AI para sa magsasaka.",
    searchTutorialsPlaceholder: "Maghanap ng tutorial (hal. pagtatanim ng kamatis, pagsugpo sa peste)...",
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
    consultationHistory: "Kasaysayan ng Konsulta",
    newTopicChat: "Bagong Paksa / Chat",
    recentSessions: "Mga Nakaraang Pag-uusap",
    noSessionsYet: "Wala pang mga nakaraang pag-uusap.",
    deleteSession: "Tanggalin ang usapan",
    discussing: "Pinag-uusapan:",
    soilClayLoam: "Lupang Clay-Loam",
    tailoredFor: "Iniakma para sa",
    agricultureAiAssistant: "AI Assistant sa Agrikultura",
    startNewTopic: "Bagong Paksa",
    historyBtn: "Kasaysayan",
    farmStationSettings: "Mga Setting ng Bukid",
    changeFieldContext: "Baguhin ang Datos ng Bukid",
    welcomeToGrownox: "Maligayang pagdating sa Grownox",
    welcomeSubtitle: "Ang iyong matalinong katulong sa agrikultura. Magtanong tungkol sa iyong mga pananim, lunas sa peste, pataba sa lupa, o pamamahala ng bukid.",
    askAnythingPlaceholder: "Magtanong sa Grownox tungkol sa sakit ng pananim, kalendaryo ng pagtatanim, sukat ng abono, o presyo sa merkado...",
    regulatoryDisclaimer: "Nagbibigay ang Grownox AI ng gabay sa agrikultura batay sa opisyal na pamantayan ng DA, PhilRice, at ATI.",
    lotContext: "Lote ng Bukid 1",
    logInFarmPlanner: "I-tala sa Tagaplano ng Sakahan",
    viewAgriTutorials: "Tingnan ang mga Tutorial",
    copyProtocol: "Kopyahin",
    copied: "Nakopya na!",
    sentFromFieldStation: "Ipinadala mula sa Estasyon ng Bukid",
    agronomicDiagnosis: "Pagsusuri at Gabay sa Agrikultura",
    grownoxAssistant: "Grownox Gabay",
    liveAgroMet: "Grownox AI",
    analyzingPrompt: "Inihahanda ng Grownox ang iyong gabay...",

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

/**
 * Returns a robust Translations dictionary with automatic English fallback and string proxy
 * so missing keys never evaluate to undefined or break the UI.
 */
export function getTranslation(lang: Language = "en"): Translations & Record<string, string> {
  const currentDict = TRANSLATIONS[lang] || TRANSLATIONS.en;
  const fallbackDict = TRANSLATIONS.en;

  return new Proxy(currentDict as any, {
    get(target, prop: string) {
      if (typeof prop === "symbol") return (target as any)[prop];
      if (prop in target && target[prop] !== undefined && target[prop] !== "") {
        return target[prop];
      }
      if (prop in fallbackDict && (fallbackDict as any)[prop] !== undefined) {
        return (fallbackDict as any)[prop];
      }
      return prop;
    },
  });
}
