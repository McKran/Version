import { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Sprout, MapPin, Building2, Wheat, Check,
  ArrowLeft, Search, Loader2, AlertCircle, TreePine, Banana,
  ChevronRight, Grid3x3, List, X, Languages, Globe, User, Ban
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSettings, type Language } from "@/hooks/use-settings";
import { useLocationStore } from "@/hooks/use-location";

interface PSGCRegion {
  code: string;
  name: string;
  regionName: string;
  islandGroup: string;
}

interface PSGCProvince {
  code: string;
  name: string;
  regionCode: string;
}

interface PSGCCity {
  code: string;
  name: string;
  isCity: boolean;
  isMunicipality: boolean;
  isCapital: boolean;
  provinceCode: string | null;
}

interface PhCrop {
  id: number;
  cropName: string;
  localName: string | null;
  category: string;
  subCategory: string | null;
  emoji: string;
  growthDurationDays: string;
  waterRequirementLevel: string;
  notes: string | null;
}

const ISLAND_GROUP_LABELS: Record<string, string> = {
  luzon: "Luzon",
  visayas: "Visayas",
  mindanao: "Mindanao",
};
const ISLAND_GROUP_ORDER = ["Luzon", "Visayas", "Mindanao", "Other"];

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}`);
  return res.json();
}

const STEPS = [
  { id: 1, label: "Profile", labelFil: "Profile", icon: User },
  { id: 2, label: "Region", labelFil: "Rehiyon", icon: MapPin },
  { id: 3, label: "Province", labelFil: "Probinsya", icon: MapPin },
  { id: 4, label: "City", labelFil: "Lungsod/Bayan", icon: Building2 },
  { id: 5, label: "Crops", labelFil: "Pananim", icon: Wheat },
];

export default function Onboarding() {
  const { settings, completeOnboarding, setLanguage: setGlobalLanguage } = useSettings();
  const { setLocation } = useLocationStore();

  const [step, setStep] = useState(1);
  const [userName, setUserName] = useState(settings.userName || "");
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(settings.language || "en");

  const [regionSearch, setRegionSearch] = useState("");
  const [provinceSearch, setProvinceSearch] = useState("");
  const [citySearch, setCitySearch] = useState("");
  const [cropSearch, setCropSearch] = useState("");
  const [cropCategory, setCropCategory] = useState("all");
  const [cropView, setCropView] = useState<"grid" | "list">("grid");

  const [selectedRegion, setSelectedRegion] = useState<PSGCRegion | null>(null);
  const [selectedProvince, setSelectedProvince] = useState<PSGCProvince | null>(null);
  const [selectedCity, setSelectedCity] = useState<(PSGCCity & { lat: number | null; lon: number | null }) | null>(null);
  const [selectedCrops, setSelectedCrops] = useState<PhCrop[]>([]);
  const [isGeocodingCity, setIsGeocodingCity] = useState(false);

  const handleSelectLang = (lang: Language) => {
    setSelectedLanguage(lang);
    setGlobalLanguage(lang);
  };

  const { data: regions = [], isLoading: regionsLoading, error: regionsError } =
    useQuery<PSGCRegion[]>({
      queryKey: ["psgc-regions"],
      queryFn: () => fetchJSON("/api/psgc/regions"),
      staleTime: 7 * 24 * 60 * 60 * 1000,
    });

  const { data: provinces = [], isLoading: provincesLoading, error: provincesError } =
    useQuery<PSGCProvince[]>({
      queryKey: ["psgc-provinces", selectedRegion?.code],
      queryFn: () => fetchJSON(`/api/psgc/provinces?region_code=${selectedRegion!.code}`),
      enabled: !!selectedRegion && step === 3,
      staleTime: 7 * 24 * 60 * 60 * 1000,
    });

  const { data: cities = [], isLoading: citiesLoading, error: citiesError } =
    useQuery<PSGCCity[]>({
      queryKey: ["psgc-cities", selectedProvince?.code],
      queryFn: () => fetchJSON(`/api/psgc/cities?province_code=${selectedProvince!.code}`),
      enabled: !!selectedProvince && step === 4,
      staleTime: 7 * 24 * 60 * 60 * 1000,
    });

  const { data: allCrops = [], isLoading: cropsLoading } =
    useQuery<PhCrop[]>({
      queryKey: ["ph-crops"],
      queryFn: () => fetchJSON("/api/ph-crops"),
      staleTime: 24 * 60 * 60 * 1000,
    });

  const groupedRegions = useMemo(() => {
    const filtered = regions.filter(r =>
      r.name.toLowerCase().includes(regionSearch.toLowerCase()) ||
      r.regionName.toLowerCase().includes(regionSearch.toLowerCase())
    );
    const groups: Record<string, PSGCRegion[]> = {};
    for (const r of filtered) {
      const group = ISLAND_GROUP_LABELS[r.islandGroup] ?? "Other";
      if (!groups[group]) groups[group] = [];
      groups[group].push(r);
    }
    return ISLAND_GROUP_ORDER
      .filter(g => groups[g])
      .reduce((acc, g) => { acc[g] = groups[g]; return acc; }, {} as Record<string, PSGCRegion[]>);
  }, [regions, regionSearch]);

  const filteredProvinces = useMemo(() =>
    provinces.filter(p => p.name.toLowerCase().includes(provinceSearch.toLowerCase())),
    [provinces, provinceSearch]
  );

  const filteredCities = useMemo(() =>
    cities.filter(c => c.name.toLowerCase().includes(citySearch.toLowerCase())),
    [cities, citySearch]
  );

  const cropCategories = useMemo(() =>
    ["all", ...new Set(allCrops.map(c => c.category))],
    [allCrops]
  );

  const filteredCrops = useMemo(() => {
    let list = allCrops;
    if (cropCategory !== "all") list = list.filter(c => c.category === cropCategory);
    if (cropSearch) {
      const q = cropSearch.toLowerCase();
      list = list.filter(c =>
        c.cropName.toLowerCase().includes(q) ||
        (c.localName ?? "").toLowerCase().includes(q) ||
        (c.subCategory ?? "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [allCrops, cropCategory, cropSearch]);

  const handleRegionSelect = (region: PSGCRegion) => {
    setSelectedRegion(region);
    setSelectedProvince(null);
    setSelectedCity(null);
    setProvinceSearch("");
    setCitySearch("");
  };

  const handleProvinceSelect = (province: PSGCProvince) => {
    setSelectedProvince(province);
    setSelectedCity(null);
    setCitySearch("");
  };

  const handleCitySelect = useCallback(async (city: PSGCCity) => {
    setIsGeocodingCity(true);
    try {
      const res = await fetch(`/api/psgc/geocode?city=${encodeURIComponent(city.name)}`);
      const coords = res.ok ? await res.json() : null;
      setSelectedCity({ ...city, lat: coords?.lat ?? null, lon: coords?.lon ?? null });
    } catch {
      setSelectedCity({ ...city, lat: null, lon: null });
    }
    setIsGeocodingCity(false);
  }, []);

  const getCropKey = (crop: PhCrop) => crop.cropName;

  const toggleCrop = (crop: PhCrop) => {
    const key = getCropKey(crop);
    if (key === "None") {
      setSelectedCrops([crop]);
      return;
    }
    setSelectedCrops(prev => {
      const filtered = prev.filter(c => getCropKey(c) !== "None");
      return filtered.some(c => getCropKey(c) === key)
        ? filtered.filter(c => getCropKey(c) !== key)
        : [...filtered, crop];
    });
  };

  const removeCrop = (cropKey: number | string) => {
    setSelectedCrops(prev => prev.filter(c => getCropKey(c) !== cropKey));
  };

  const handleFinish = () => {
    const cityName = selectedCity?.name ?? "";
    const provinceName = selectedProvince?.name ?? "";
    const regionName = selectedRegion?.regionName ?? selectedRegion?.name ?? "";
    const locationParts = [cityName, provinceName, "Philippines"].filter(Boolean);
    const fullLocation = locationParts.join(", ");
    if (fullLocation) setLocation(fullLocation);

    completeOnboarding({
      userName: userName.trim(),
      language: selectedLanguage,
      countryCode: "PH",
      regionCode: selectedRegion?.code ?? "",
      regionName,
      provinceCode: selectedProvince?.code ?? "",
      provinceName,
      cityCode: selectedCity?.code ?? "",
      cityName,
      cityLat: selectedCity?.lat ?? null,
      cityLon: selectedCity?.lon ?? null,
      currency: "PHP",
      weightUnit: "kilogram",
      preferredCrops: selectedCrops.map(c => c.cropName),
      preferredCropIds: selectedCrops.map(c => c.id),
      targetMarket: "local",
      savedBuyerAddress: {
        region: regionName || "Davao Region",
        province: provinceName || "Davao Oriental",
        municipality: cityName || "Mati City",
        barangay: "Central",
        streetAddress: "",
      },
      savedSellerAddress: {
        region: regionName || "Davao Region",
        province: provinceName || "Davao Oriental",
        municipality: cityName || "Mati City",
        barangay: "Central",
        streetAddress: "",
      },
    });
  };

  const canProceed =
    step === 1 ? !!selectedLanguage :
    step === 2 ? !!selectedRegion :
    step === 3 ? !!selectedProvince :
    step === 4 ? true :
    selectedCrops.length > 0;

  const goNext = () => setStep(s => s + 1);
  const goBack = () => setStep(s => s - 1);

  return (
    <div className="min-h-[100dvh] w-full bg-gradient-to-br from-green-50 via-background to-emerald-50/50 dark:from-green-950/20 dark:via-background dark:to-emerald-950/10 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-3 mb-3">
            <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Sprout className="h-7 w-7 text-primary-foreground" />
            </div>
            <div className="text-left">
              <div className="text-2xl font-bold text-primary">Grownox</div>
              <div className="text-xs text-muted-foreground font-medium tracking-wide">Smart Farming Platform</div>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary">
            <span className="text-base">🇵🇭</span>
            <span>{selectedLanguage === "fil" ? "Pilipinas · ₱ PHP" : "Philippines · ₱ PHP"}</span>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-1 mb-6 flex-wrap px-2">
          {STEPS.map((s, i) => {
            const isActive = step === s.id;
            const isDone = step > s.id;
            const stepLabel = selectedLanguage === "fil" ? s.labelFil : s.label;
            return (
              <div key={s.id} className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => isDone ? setStep(s.id) : undefined}
                  disabled={!isDone}
                  className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    isActive ? "bg-primary text-primary-foreground shadow-sm" :
                    isDone ? "bg-primary/20 text-primary cursor-pointer hover:bg-primary/30" :
                    "bg-muted text-muted-foreground"
                  }`}
                >
                  {isDone ? <Check className="h-3 w-3 shrink-0" /> : <s.icon className="h-3 w-3 shrink-0" />}
                  <span className="hidden sm:inline">{stepLabel}</span>
                </button>
                {i < STEPS.length - 1 && (
                  <div className={`w-3 sm:w-4 h-px transition-colors ${step > s.id ? "bg-primary" : "bg-muted"}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Card */}
        <div className="bg-card border rounded-3xl shadow-xl overflow-hidden flex flex-col">

          {/* ─── STEP 1: PROFILE & LANGUAGE ─── */}
          {step === 1 && (
            <div className="p-5 sm:p-8 space-y-6">
              <div>
                <h1 className="text-2xl font-bold mb-1">
                  {selectedLanguage === "fil" ? "Maligayang Pagdating sa Grownox" : "Welcome to Grownox"}
                </h1>
                <p className="text-muted-foreground text-sm">
                  {selectedLanguage === "fil"
                    ? "Ilagay ang iyong pangalan at piliin ang iyong wika upang magsimula."
                    : "Enter your name and select your preferred language to get started."}
                </p>
              </div>

              {/* Name Input Field */}
              <div className="bg-muted/30 border border-border/80 rounded-2xl p-4 space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {selectedLanguage === "fil" ? "Pangalan Mo" : "Your Name"}
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={userName}
                    onChange={e => setUserName(e.target.value)}
                    placeholder={selectedLanguage === "fil" ? "Hal. Juan Dela Cruz" : "e.g. Maria Santos"}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                  {selectedLanguage === "fil" ? "Wika / Language" : "Preferred Language"}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => handleSelectLang("en")}
                    className={`flex flex-col items-start p-5 rounded-2xl border-2 text-left transition-all ${
                      selectedLanguage === "en"
                        ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100 shadow-md ring-2 ring-emerald-500/20"
                        : "border-border/80 hover:border-emerald-500/50 hover:bg-muted/50 text-foreground"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-3">
                      <span className="text-3xl">🇬🇧</span>
                      {selectedLanguage === "en" && (
                        <div className="h-6 w-6 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                          <Check className="h-3.5 w-3.5" />
                        </div>
                      )}
                    </div>
                    <div className="font-bold text-lg mb-1">English</div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Full English interface, controls, and Grownox AI responses.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectLang("fil")}
                    className={`flex flex-col items-start p-5 rounded-2xl border-2 text-left transition-all ${
                      selectedLanguage === "fil"
                        ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100 shadow-md ring-2 ring-emerald-500/20"
                        : "border-border/80 hover:border-emerald-500/50 hover:bg-muted/50 text-foreground"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-3">
                      <span className="text-3xl">🇵🇭</span>
                      {selectedLanguage === "fil" && (
                        <div className="h-6 w-6 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                          <Check className="h-3.5 w-3.5" />
                        </div>
                      )}
                    </div>
                    <div className="font-bold text-lg mb-1">Filipino</div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Filipino na wika para sa buong website at sa mga sagot ng Grownox AI.
                    </p>
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-muted/50 border border-border/60 flex items-center gap-3 text-xs text-muted-foreground">
                <Globe className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>
                  Selected: <strong className="text-foreground">{selectedLanguage === "en" ? "English" : "Filipino"}</strong>. You can change this at any time in Settings.
                </span>
              </div>
            </div>
          )}

          {/* ─── STEP 2: REGION ─── */}
          {step === 2 && (
            <div className="p-5 sm:p-8">
              <h1 className="text-xl sm:text-2xl font-bold mb-1">
                {selectedLanguage === "fil" ? "Saang rehiyon ang iyong bukid?" : "Select your region"}
              </h1>
              <p className="text-muted-foreground mb-4 text-xs sm:text-sm">
                {selectedLanguage === "fil"
                  ? "Pumili ng iyong rehiyon upang makita ang lokal na gabay sa pagsasaka."
                  : "Select your region to get localized farming guidance."}
              </p>

              {regionsLoading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm">{selectedLanguage === "fil" ? "Ikinakarga ang mga rehiyon…" : "Loading regions…"}</p>
                </div>
              ) : regionsError ? (
                <div className="flex flex-col items-center gap-3 py-10 text-center">
                  <AlertCircle className="h-8 w-8 text-amber-500" />
                  <p className="text-sm text-muted-foreground">
                    {selectedLanguage === "fil" ? "Hindi maikarga ang mga rehiyon. Pakisuri ang koneksyon." : "Could not load regions. Check your connection."}
                  </p>
                </div>
              ) : (
                <>
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text" placeholder={selectedLanguage === "fil" ? "Maghanap ng rehiyon…" : "Search regions…"}
                      value={regionSearch} onChange={e => setRegionSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 sm:py-3 rounded-xl border bg-muted/40 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-background"
                      autoFocus
                    />
                  </div>
                  <div className="h-64 sm:h-72 overflow-y-auto space-y-3 pr-1">
                    {Object.entries(groupedRegions).map(([group, groupRegions]) => (
                      <div key={group}>
                        <div className="flex items-center gap-2 mb-2 ml-1">
                          {group === "Luzon" && <TreePine className="h-3.5 w-3.5 text-green-600" />}
                          {group === "Visayas" && <span className="text-sm">🌊</span>}
                          {group === "Mindanao" && <Banana className="h-3.5 w-3.5 text-yellow-600" />}
                          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{group}</span>
                        </div>
                        <div className="space-y-1">
                          {groupRegions.map(r => {
                            const isSelected = selectedRegion?.code === r.code;
                            return (
                              <button key={r.code} type="button" onClick={() => handleRegionSelect(r)}
                                className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all border ${
                                  isSelected ? "bg-primary/10 border-primary/30 text-primary font-medium" : "hover:bg-muted/60 border-transparent"
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                                    <MapPin className="h-4 w-4" />
                                  </div>
                                  <div>
                                    <div className="font-medium text-sm">{r.name}</div>
                                    {r.regionName !== r.name && <div className="text-xs text-muted-foreground">{r.regionName}</div>}
                                  </div>
                                </div>
                                {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                    {Object.keys(groupedRegions).length === 0 && regionSearch && (
                      <p className="text-center text-muted-foreground text-sm py-8">
                        {selectedLanguage === "fil" ? `Walang tugmang rehiyon sa "${regionSearch}"` : `No regions match "${regionSearch}"`}
                      </p>
                    )}
                  </div>
                </>
              )}

              {selectedRegion && (
                <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-xl flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-primary shrink-0" />
                  <div className="flex-1">
                    <div className="text-sm font-semibold">{selectedRegion.name}</div>
                    {selectedRegion.regionName !== selectedRegion.name && (
                      <div className="text-xs text-muted-foreground">{selectedRegion.regionName}</div>
                    )}
                  </div>
                  <Check className="h-4 w-4 text-primary shrink-0" />
                </div>
              )}
            </div>
          )}

          {/* ─── STEP 3: PROVINCE ─── */}
          {step === 3 && (
            <div className="p-5 sm:p-8">
              <h1 className="text-xl sm:text-2xl font-bold mb-1">
                {selectedLanguage === "fil" ? "Pumili ng iyong lalawigan / probinsya" : "Select your province"}
              </h1>
              <p className="text-muted-foreground mb-4 text-xs sm:text-sm">
                {selectedLanguage === "fil" ? "Mga lalawigan para sa " : "Provinces for "}
                <span className="font-medium text-foreground">{selectedRegion?.regionName ?? selectedRegion?.name}</span>.
              </p>

              {provincesLoading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm">{selectedLanguage === "fil" ? `Ikinakarga ang mga lalawigan para sa ${selectedRegion?.name}…` : `Loading provinces for ${selectedRegion?.name}…`}</p>
                </div>
              ) : provincesError || provinces.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-10 text-center">
                  <AlertCircle className="h-8 w-8 text-amber-500" />
                  <p className="text-sm text-muted-foreground">
                    {provinces.length === 0 && !provincesLoading
                      ? (selectedLanguage === "fil" ? "Ang rehiyong ito ay walang hiwalay na probinsya (tulad ng NCR). Maaaring dumiretso sa lungsod." : "This region has no separate provinces (e.g. NCR). You can skip to city selection.")
                      : (selectedLanguage === "fil" ? "Hindi maikarga ang mga lalawigan. Maaaring laktawan ang hakbang na ito." : "Could not load provinces. You can skip this step.")}
                  </p>
                </div>
              ) : (
                <>
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text" placeholder={selectedLanguage === "fil" ? `Maghanap sa ${provinces.length} lalawigan…` : `Search ${provinces.length} provinces…`}
                      value={provinceSearch} onChange={e => setProvinceSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 sm:py-3 rounded-xl border bg-muted/40 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-background"
                      autoFocus
                    />
                  </div>
                  <div className="h-64 sm:h-72 overflow-y-auto space-y-1 pr-1">
                    {filteredProvinces.map(p => {
                      const isSelected = selectedProvince?.code === p.code;
                      return (
                        <button key={p.code} type="button" onClick={() => handleProvinceSelect(p)}
                          className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all border ${
                            isSelected ? "bg-primary/10 border-primary/30 text-primary font-medium" : "hover:bg-muted/60 border-transparent"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                              <MapPin className="h-4 w-4" />
                            </div>
                            <div className="font-medium text-sm">{p.name}</div>
                          </div>
                          {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
                        </button>
                      );
                    })}
                    {filteredProvinces.length === 0 && provinceSearch && (
                      <p className="text-center text-muted-foreground text-sm py-8">
                        {selectedLanguage === "fil" ? `Walang lalawigan na tumutugma sa "${provinceSearch}"` : `No provinces match "${provinceSearch}"`}
                      </p>
                    )}
                  </div>
                </>
              )}

              {selectedProvince && (
                <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-xl flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-primary shrink-0" />
                  <div className="flex-1 text-sm font-semibold">{selectedProvince.name}</div>
                  <Check className="h-4 w-4 text-primary shrink-0" />
                </div>
              )}
            </div>
          )}

          {/* ─── STEP 4: CITY / MUNICIPALITY ─── */}
          {step === 4 && (
            <div className="p-5 sm:p-8">
              <h1 className="text-xl sm:text-2xl font-bold mb-1">
                {selectedLanguage === "fil" ? "Pumili ng iyong lungsod o bayan" : "Select your city or municipality"}
              </h1>
              <p className="text-muted-foreground mb-4 text-xs sm:text-sm">
                {selectedLanguage === "fil" ? "Mga lungsod at bayan para sa " : "Cities and municipalities for "}
                <span className="font-medium text-foreground">{selectedProvince?.name ?? selectedRegion?.name}</span>.
              </p>

              {citiesLoading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm">{selectedLanguage === "fil" ? "Ikinakarga ang mga lungsod…" : "Loading cities…"}</p>
                </div>
              ) : citiesError || cities.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-10 text-center">
                  <AlertCircle className="h-8 w-8 text-amber-500" />
                  <p className="text-sm text-muted-foreground">
                    {selectedLanguage === "fil" ? "Hindi maikarga ang mga lungsod. Maaari itong laktawan." : "Could not load cities. You can skip — region data will be used."}
                  </p>
                </div>
              ) : (
                <>
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text" placeholder={selectedLanguage === "fil" ? `Maghanap sa ${cities.length} lungsod at bayan…` : `Search ${cities.length} cities & municipalities…`}
                      value={citySearch} onChange={e => setCitySearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 sm:py-3 rounded-xl border bg-muted/40 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-background"
                      autoFocus
                    />
                  </div>
                  <div className="h-64 sm:h-72 overflow-y-auto space-y-1 pr-1">
                    {filteredCities.map(city => {
                      const isSelected = selectedCity?.code === city.code;
                      const isGeocoding = isGeocodingCity && isSelected;
                      return (
                        <button key={city.code} type="button" onClick={() => handleCitySelect(city)}
                          disabled={isGeocodingCity}
                          className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all border ${
                            isSelected ? "bg-primary/10 border-primary/30 text-primary font-medium" : "hover:bg-muted/60 border-transparent"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                              {isGeocoding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Building2 className="h-4 w-4" />}
                            </div>
                            <div>
                              <div className="font-medium text-sm">{city.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {city.isCapital ? (selectedLanguage === "fil" ? "Kabisera ng Lalawigan · " : "Provincial Capital · ") : ""}
                                {city.isCity ? (selectedLanguage === "fil" ? "Lungsod" : "City") : (selectedLanguage === "fil" ? "Bayan" : "Municipality")}
                              </div>
                            </div>
                          </div>
                          {isSelected && !isGeocoding && (
                            <div className="flex items-center gap-1.5">
                              {selectedCity?.lat != null && (
                                <span className="text-xs text-primary/70 font-medium hidden sm:inline">GPS</span>
                              )}
                              <Check className="h-4 w-4 text-primary shrink-0" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                    {filteredCities.length === 0 && citySearch && (
                      <p className="text-center text-muted-foreground text-sm py-8">
                        {selectedLanguage === "fil" ? `Walang lungsod na tumutugma sa "${citySearch}"` : `No cities match "${citySearch}"`}
                      </p>
                    )}
                  </div>
                </>
              )}

              {selectedCity ? (
                <div className="mt-4 p-3.5 sm:p-4 bg-primary/5 border border-primary/20 rounded-2xl flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">{selectedCity.name}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {selectedProvince?.name} · {selectedRegion?.regionName ?? selectedRegion?.name} · Philippines
                    </div>
                  </div>
                  <Check className="h-4 w-4 text-primary ml-auto shrink-0" />
                </div>
              ) : (
                <p className="text-xs text-muted-foreground mt-4 text-center">
                  {selectedLanguage === "fil" ? "Opsyonal ang pagpili ng lungsod — gagamitin ang datos ng rehiyon kung lalaktawan." : "City selection is optional — province-level data will be used if skipped."}
                </p>
              )}
            </div>
          )}

          {/* ─── STEP 5: CROPS ─── */}
          {step === 5 && (
            <div className="p-4 sm:p-8 flex-1 flex flex-col">
              <div className="flex items-start justify-between mb-1.5 gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                  {selectedLanguage === "fil" ? "Anong mga pananim mo?" : "Select your crops or role"}
                </h1>
                <button
                  type="button"
                  onClick={() => setCropView(v => v === "grid" ? "list" : "grid")}
                  className="p-1.5 rounded-lg border border-border/70 hover:bg-muted transition-colors shrink-0 mt-0.5"
                  title={cropView === "grid" ? "List view" : "Grid view"}
                >
                  {cropView === "grid" ? <List className="h-4 w-4" /> : <Grid3x3 className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-muted-foreground mb-3 text-xs sm:text-sm leading-relaxed">
                {selectedLanguage === "fil"
                  ? "Pumili ng iyong mga pananim o piliin ang 'Walang Pananim' kung ikaw ay mamimili o pangkalahatang gumagamit."
                  : "Select the crops you grow, or choose 'None' if you are a buyer, trader, or not currently growing crops."}
              </p>

              {/* Special "None" Card for Buyers / Non-Growers */}
              <div className="mb-3">
                <button
                  type="button"
                  onClick={() => toggleCrop({ id: 0, cropName: "None", localName: "Buyer / Non-grower", category: "General", emoji: "🌱", growthDurationDays: "0", waterRequirementLevel: "Low", notes: null, subCategory: null })}
                  className={`w-full flex items-center justify-between p-3 sm:p-3.5 rounded-2xl border-2 text-left transition-all ${
                    selectedCrops.some(c => c.cropName === "None")
                      ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100 shadow-sm"
                      : "border-border/80 hover:border-emerald-500/50 hover:bg-muted/40 text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center text-lg sm:text-xl shrink-0">
                      🌱
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-xs sm:text-sm truncate">
                        {selectedLanguage === "fil" ? "Walang Pananim (Mamimili / Hindi Nagtatanim)" : "None (Buyer / Non-Grower)"}
                      </div>
                      <div className="text-[11px] sm:text-xs text-muted-foreground leading-snug">
                        {selectedLanguage === "fil"
                          ? "Para sa mga mamimili o pangkalahatang gumagamit."
                          : "For buyers, market users, or general non-farmers."}
                      </div>
                    </div>
                  </div>
                  {selectedCrops.some(c => c.cropName === "None") && (
                    <div className="h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    </div>
                  )}
                </button>
              </div>

              {/* Selected crops chips */}
              {selectedCrops.length > 0 && !selectedCrops.some(c => c.cropName === "None") && (
                <div className="flex flex-wrap gap-1.5 mb-3 p-2.5 bg-primary/5 rounded-xl border border-primary/20">
                  {selectedCrops.map(c => {
                    const key = getCropKey(c);
                    return (
                      <span key={key} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/15 text-primary text-xs font-medium">
                        {c.emoji} {c.cropName}
                        <button type="button" onClick={() => removeCrop(key)} className="ml-0.5 hover:text-red-500 transition-colors">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}

              {/* Search + category filter */}
              <div className="flex gap-2 mb-2.5">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    type="text" placeholder={selectedLanguage === "fil" ? "Maghanap ng pananim…" : "Search crops…"}
                    value={cropSearch} onChange={e => setCropSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 rounded-lg border bg-muted/40 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>

              {/* Category tabs */}
              <div className="flex gap-1 mb-2.5 overflow-x-auto pb-1">
                {cropCategories.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCropCategory(cat)}
                    className={`shrink-0 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                      cropCategory === cat
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/60 text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {cat === "all" ? (selectedLanguage === "fil" ? "Lahat ng Pananim" : "All Crops") : cat}
                  </button>
                ))}
              </div>

              {cropsLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                <div className={`h-56 sm:h-64 overflow-y-auto pr-1 ${cropView === "grid" ? "grid grid-cols-2 sm:grid-cols-3 gap-2 content-start" : "space-y-1"}`}>
                  {filteredCrops.map(crop => {
                    const key = getCropKey(crop);
                    const isSelected = selectedCrops.some(c => getCropKey(c) === key);
                    if (cropView === "grid") {
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => toggleCrop(crop)}
                          className={`flex items-center gap-2 p-2 sm:px-3 sm:py-2.5 rounded-xl text-xs sm:text-sm text-left transition-all border min-w-0 ${
                            isSelected
                              ? "bg-primary/10 border-primary/40 text-primary font-medium"
                              : "bg-muted/30 border-transparent hover:bg-muted/60"
                          }`}
                        >
                          <span className="text-base sm:text-lg leading-none shrink-0">{crop.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <div className="truncate text-xs font-medium">{crop.cropName}</div>
                            {crop.localName && <div className="truncate text-[10px] text-muted-foreground">{crop.localName}</div>}
                          </div>
                          {isSelected && <Check className="h-3.5 w-3.5 shrink-0 text-primary" />}
                        </button>
                      );
                    }
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => toggleCrop(crop)}
                        className={`w-full flex items-center gap-3 p-2.5 sm:px-3 sm:py-2.5 rounded-xl text-left transition-all border min-w-0 ${
                          isSelected
                            ? "bg-primary/10 border-primary/30 text-primary"
                            : "hover:bg-muted/60 border-transparent"
                        }`}
                      >
                        <span className="text-lg sm:text-xl leading-none shrink-0">{crop.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-xs sm:text-sm truncate">{crop.cropName}</div>
                          <div className="text-[11px] sm:text-xs text-muted-foreground truncate">
                            {crop.localName && <span>{crop.localName} · </span>}
                            {crop.growthDurationDays} {selectedLanguage === "fil" ? "araw" : "days"}
                          </div>
                        </div>
                        {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
                      </button>
                    );
                  })}
                  {filteredCrops.length === 0 && (
                    <p className="col-span-2 sm:col-span-3 text-center text-muted-foreground text-xs sm:text-sm py-8">
                      {cropSearch ? (selectedLanguage === "fil" ? `Walang pananim na tumutugma sa "${cropSearch}"` : `No crops match "${cropSearch}"`) : (selectedLanguage === "fil" ? "Walang pananim sa kategoryang ito" : "No crops in this category")}
                    </p>
                  )}
                </div>
              )}

              <p className="text-xs text-muted-foreground mt-2.5 mb-1 text-center">
                {selectedCrops.length === 0
                  ? (selectedLanguage === "fil" ? "Pumili ng hindi bababa sa 1 pananim upang magpatuloy" : "Select at least 1 crop to continue")
                  : (selectedLanguage === "fil"
                      ? `${selectedCrops.length} pananim ang napili · ${allCrops.length} kabuuan sa database`
                      : `${selectedCrops.length} crop${selectedCrops.length !== 1 ? "s" : ""} selected · ${allCrops.length} total in database`)}
              </p>
            </div>
          )}

          {/* Footer Nav */}
          <div className="border-t border-border/50 px-4 sm:px-8 py-3.5 sm:py-4 flex items-center justify-between gap-2.5 sm:gap-4 bg-muted/20">
            {step > 1 ? (
              <Button
                variant="outline"
                type="button"
                onClick={goBack}
                className="h-10 sm:h-11 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 sm:gap-2 shrink-0 cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4 shrink-0" />
                <span>{selectedLanguage === "fil" ? "Bumalik" : "Back"}</span>
              </Button>
            ) : (
              <div />
            )}

            {step < STEPS.length ? (
              <Button
                type="button"
                onClick={goNext}
                disabled={!canProceed}
                className="h-10 sm:h-11 px-4 sm:px-6 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 sm:gap-2 ml-auto shrink-0 cursor-pointer"
              >
                <span>{selectedLanguage === "fil" ? "Magpatuloy" : "Continue"}</span>
                <ChevronRight className="h-4 w-4 shrink-0" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleFinish}
                disabled={selectedCrops.length === 0}
                className="h-10 sm:h-11 px-3.5 sm:px-6 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 sm:gap-2 ml-auto bg-green-600 hover:bg-green-700 text-white shadow-sm shrink-0 cursor-pointer whitespace-nowrap text-center"
              >
                <Sprout className="h-4 w-4 shrink-0" />
                <span>{selectedLanguage === "fil" ? "Simulan ang Pagsasaka" : "Start Farming"}</span>
              </Button>
            )}
          </div>
        </div>

        {/* Location summary pill shown from step 2+ */}
        {step >= 2 && (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <span className="px-2 py-1 rounded-full bg-muted/60">🇵🇭 {selectedLanguage === "fil" ? "Pilipinas" : "Philippines"}</span>
            {selectedRegion && (
              <span className="px-2 py-1 rounded-full bg-primary/10 text-primary flex items-center gap-1">
                <Check className="h-2.5 w-2.5" /> {selectedRegion.name}
              </span>
            )}
            {selectedProvince && step >= 3 && (
              <span className="px-2 py-1 rounded-full bg-primary/10 text-primary flex items-center gap-1">
                <Check className="h-2.5 w-2.5" /> {selectedProvince.name}
              </span>
            )}
            {selectedCity && step >= 4 && (
              <span className="px-2 py-1 rounded-full bg-primary/10 text-primary flex items-center gap-1">
                <Check className="h-2.5 w-2.5" /> {selectedCity.name}
              </span>
            )}
          </div>
        )}

        <p className="text-center text-xs text-muted-foreground/60 mt-4">
          {selectedLanguage === "fil" ? "Grownox · Gabay sa Matalinong Pagsasaka" : "Grownox · Smart Farming Platform"}
        </p>
      </div>
    </div>
  );
}
