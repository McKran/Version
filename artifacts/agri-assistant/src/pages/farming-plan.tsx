import { useState, useEffect, useCallback } from "react";
import { useSettings } from "@/hooks/use-settings";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sprout, Calendar, MapPin, Loader2, AlertCircle, ChevronDown, ChevronUp,
  Droplets, Bug, Wheat, Cloud, FlaskConical, Shield, Activity,
  TriangleAlert, Info, RefreshCw, ClipboardList, CheckCircle2,
  Clock, Zap, Leaf, ThermometerSun
} from "lucide-react";

const BASE_URL = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";

const STAGE_TYPE_CONFIG: Record<string, { color: string; bg: string; icon: React.ElementType }> = {
  preparation:   { color: "text-amber-700 dark:text-amber-400",   bg: "bg-amber-50/80 dark:bg-amber-950/30 border-amber-200/80 dark:border-amber-800",   icon: Sprout },
  planting:      { color: "text-emerald-800 dark:text-emerald-400", bg: "bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200/80 dark:border-emerald-800", icon: Leaf },
  germination:   { color: "text-lime-700 dark:text-lime-400",     bg: "bg-lime-50/80 dark:bg-lime-950/30 border-lime-200/80 dark:border-lime-800",       icon: Sprout },
  growth:        { color: "text-green-800 dark:text-green-400",   bg: "bg-green-50/80 dark:bg-green-950/30 border-green-200/80 dark:border-green-800",   icon: Leaf },
  fertilization: { color: "text-teal-700 dark:text-teal-400",     bg: "bg-teal-50/80 dark:bg-teal-950/30 border-teal-200/80 dark:border-teal-800",     icon: FlaskConical },
  pest_control:  { color: "text-rose-700 dark:text-rose-400",     bg: "bg-rose-50/80 dark:bg-rose-950/30 border-rose-200/80 dark:border-rose-800",     icon: Shield },
  irrigation:    { color: "text-cyan-700 dark:text-cyan-400",     bg: "bg-cyan-50/80 dark:bg-cyan-950/30 border-cyan-200/80 dark:border-cyan-800",     icon: Droplets },
  monitoring:    { color: "text-emerald-900 dark:text-emerald-300", bg: "bg-stone-100 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800", icon: Activity },
  harvest:       { color: "text-amber-800 dark:text-amber-400", bg: "bg-amber-100/60 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800", icon: Wheat },
};

const MILESTONE_ICON_MAP: Record<string, React.ElementType> = {
  seedling: Sprout, water: Droplets, fertilizer: FlaskConical,
  pest: Bug, harvest: Wheat, monitor: Activity,
};

// Categories to highlight in the crop selector
const FEATURED_CATEGORIES = [
  "Grains & Staples",
  "Vegetables",
  "Fruits",
  "Root Crops",
  "Legumes & Others",
  "Herbs & Spices",
];

interface PhCrop { id: number; cropName: string; localName?: string | null; category: string; emoji: string; }

interface FarmingStage {
  id: string; name: string; type: string;
  startDay: number; endDay: number; description: string;
  tasks: string[]; weatherConsiderations: string;
  inputsNeeded?: string[]; priority: string;
}
interface Milestone { day: number; label: string; description: string; icon: string; }
interface WeatherAdjustment { trigger: string; impact: string; affectedStages: string[]; action: string; }
interface FertilizerItem { day: number; product: string; rate: string; method: string; purpose: string; }
interface PestAlert { name: string; riskPeriod: string; symptoms: string; treatment: string; riskActive?: boolean; }
interface FarmingPlan {
  crop: string; location: string; plantingDate: string;
  totalGrowingDays: number; estimatedHarvestStart: number; estimatedHarvestEnd: number;
  weatherRiskLevel: "low" | "medium" | "high"; weatherRiskNotes: string;
  varietyRecommendation?: string; expectedYield?: string;
  stages: FarmingStage[]; milestones: Milestone[];
  weatherAdjustments: WeatherAdjustment[];
  fertilizerSchedule?: FertilizerItem[];
  pestAlerts?: PestAlert[];
  climateAdaptedNote?: string;
}
interface PlanResponse {
  plan: FarmingPlan;
  weatherData: {
    daily: {
      dates: string[]; maxTemps: number[]; minTemps: number[];
      precipitation: number[]; precipitationProbability: number[]; uvIndex?: number[];
    } | null;
  } | null;
  generatedAt: string;
  location?: { display: string; lat?: number; lon?: number };
}

function RiskBadge({ level }: { level: string }) {
  if (level === "high") return <Badge className="bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 gap-1"><TriangleAlert className="h-3 w-3" /> High Risk</Badge>;
  if (level === "medium") return <Badge className="bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 gap-1"><TriangleAlert className="h-3 w-3" /> Medium Risk</Badge>;
  return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 gap-1"><CheckCircle2 className="h-3 w-3" /> Low Risk</Badge>;
}

function PriorityDot({ priority }: { priority: string }) {
  if (priority === "critical") return <span className="h-2 w-2 rounded-full bg-rose-500 inline-block" />;
  if (priority === "high") return <span className="h-2 w-2 rounded-full bg-amber-500 inline-block" />;
  return <span className="h-2 w-2 rounded-full bg-blue-400 inline-block" />;
}

function StageCard({ stage, plantingDate }: { stage: FarmingStage; plantingDate: string }) {
  const [expanded, setExpanded] = useState(false);
  const config = STAGE_TYPE_CONFIG[stage.type] ?? STAGE_TYPE_CONFIG.monitoring;
  const Icon = config.icon;
  const startDate = new Date(plantingDate); startDate.setDate(startDate.getDate() + stage.startDay);
  const endDate = new Date(plantingDate); endDate.setDate(endDate.getDate() + stage.endDay);
  const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return (
    <div className={`rounded-2xl border p-4 ${config.bg} transition-all`}>
      <div className="flex items-start gap-3 cursor-pointer select-none" onClick={() => setExpanded(e => !e)}>
        <div className={`mt-0.5 h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${config.color} bg-white/60 dark:bg-black/20`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm">{stage.name}</span>
            <PriorityDot priority={stage.priority} />
          </div>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className={`text-xs font-medium ${config.color}`}>Day {stage.startDay}–{stage.endDay}</span>
            <span className="text-xs text-muted-foreground">· {fmt(startDate)} → {fmt(endDate)}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">{stage.description}</p>
        </div>
        <button className={`shrink-0 mt-1 ${config.color} opacity-60`}>
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>
      {expanded && (
        <div className="mt-4 space-y-3 border-t border-white/40 dark:border-black/20 pt-4">
          {stage.tasks.length > 0 && (
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Tasks</div>
              <ul className="space-y-1.5">
                {stage.tasks.map((task, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs">
                    <CheckCircle2 className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${config.color}`} />
                    <span>{task}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {stage.inputsNeeded && stage.inputsNeeded.length > 0 && (
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Inputs Needed</div>
              <div className="flex flex-wrap gap-1.5">
                {stage.inputsNeeded.map((input, i) => <Badge key={i} variant="secondary" className="text-xs font-normal">{input}</Badge>)}
              </div>
            </div>
          )}
          {stage.weatherConsiderations && (
            <div className="flex items-start gap-2 text-xs bg-white/50 dark:bg-black/20 rounded-xl p-3">
              <Cloud className="h-3.5 w-3.5 mt-0.5 text-blue-500 shrink-0" />
              <span className="text-muted-foreground">{stage.weatherConsiderations}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TimelineBar({ plan }: { plan: FarmingPlan }) {
  const total = plan.totalGrowingDays;
  const colors: Record<string, string> = {
    preparation: "bg-amber-400", planting: "bg-green-500", germination: "bg-lime-400",
    growth: "bg-emerald-500", fertilization: "bg-blue-500", pest_control: "bg-rose-400",
    irrigation: "bg-cyan-400", monitoring: "bg-violet-400", harvest: "bg-orange-500",
  };
  return (
    <div>
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
        <span>Day 0 · Planting</span><span>Day {total} · Harvest</span>
      </div>
      <div className="relative h-6 bg-muted rounded-full overflow-hidden flex">
        {plan.stages.map((stage) => {
          const width = ((stage.endDay - stage.startDay) / total) * 100;
          const left = (stage.startDay / total) * 100;
          return (
            <div key={stage.id} className={`absolute h-full ${colors[stage.type] ?? "bg-gray-400"} opacity-80`}
              style={{ left: `${left}%`, width: `${width}%` }}
              title={`${stage.name} (Day ${stage.startDay}–${stage.endDay})`}
            />
          );
        })}
      </div>
      <div className="flex flex-wrap gap-2 mt-2">
        {Object.entries(colors).map(([type, color]) => {
          if (!plan.stages.some(s => s.type === type)) return null;
          return (
            <span key={type} className="flex items-center gap-1 text-[10px] text-muted-foreground capitalize">
              <span className={`h-2 w-2 rounded-full ${color} opacity-80`} />
              {type.replace("_", " ")}
            </span>
          );
        })}
      </div>
    </div>
  );
}

export default function FarmingPlan() {
  const { settings, t } = useSettings();
  const [viewMode, setViewMode] = useState<"detailed" | "summarized">("detailed");

  // Location — use stored coordinates if available, else Manila default
  const lat = settings.cityLat ?? 14.5995;
  const lon = settings.cityLon ?? 120.9842;
  const locationDisplay = [settings.cityName, settings.provinceName, settings.regionName, "Philippines"]
    .filter(Boolean).join(", ") || "Philippines";

  // Crops loaded dynamically from PostgreSQL via API
  const [allCrops, setAllCrops] = useState<PhCrop[]>([]);
  const [cropsLoading, setCropsLoading] = useState(true);
  const [activeCatFilter, setActiveCatFilter] = useState<string>("all");
  const [showAllCrops, setShowAllCrops] = useState(false);

  useEffect(() => {
    fetch(`${BASE_URL}/api/ph-crops`)
      .then(r => r.ok ? r.json() : [])
      .then((data: PhCrop[]) => { setAllCrops(data); setCropsLoading(false); })
      .catch(() => setCropsLoading(false));
  }, []);

  // Visible crops in selector grid
  const filteredCrops = activeCatFilter === "all"
    ? allCrops
    : allCrops.filter(c => c.category === activeCatFilter);
  const GRID_LIMIT = 24;
  const visibleCrops = showAllCrops ? filteredCrops : filteredCrops.slice(0, GRID_LIMIT);
  const categoriesInDb = [...new Set(allCrops.map(c => c.category))];

  const [crop, setCrop] = useState(settings.preferredCrops[0] ?? "");
  const [plantingDate, setPlantingDate] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 7);
    return d.toISOString().split("T")[0];
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PlanResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"timeline" | "weather" | "fertilizer" | "pests" | "adjustments">("timeline");

  const handleGenerate = useCallback(async () => {
    if (!crop || !plantingDate) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`${BASE_URL}/api/farming-plan/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          crop,
          plantingDate,
          lat,
          lon,
          locationName: locationDisplay,
          // Pass legacy display fields for a richer label if available
          cityName: settings.cityName || undefined,
          provinceName: settings.provinceName || undefined,
          regionName: settings.regionName || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to generate plan.");
        return;
      }
      setResult(data);
      setActiveTab("timeline");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [crop, plantingDate, lat, lon, locationDisplay, settings]);

  const plan = result?.plan;

  const tabs = [
    { id: "timeline", label: "Timeline", icon: Clock },
    { id: "weather", label: "Weather", icon: Cloud },
    { id: "fertilizer", label: "Fertilizer", icon: FlaskConical },
    { id: "pests", label: "Pests", icon: Bug },
    { id: "adjustments", label: "Adjustments", icon: RefreshCw },
  ] as const;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2 text-stone-900 dark:text-stone-100">
          <ClipboardList className="h-6 w-6 text-emerald-800 dark:text-emerald-400" /> Farm Planner
        </h1>
        <p className="text-stone-600 dark:text-stone-400 text-sm mt-1">
          GDD-based farming schedules using real open climate data — no AI, no guesswork.
        </p>
      </div>

      {/* Location indicator */}
      <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 rounded-2xl shadow-xs">
        <MapPin className="h-4 w-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold truncate text-emerald-950 dark:text-emerald-200">{locationDisplay}</div>
          <div className="text-xs text-emerald-800/80 dark:text-emerald-300 flex items-center gap-1.5 flex-wrap mt-0.5">
            <ThermometerSun className="h-3 w-3 text-emerald-700 dark:text-emerald-400" />
            <span>Weather data from Open-Meteo for {lat.toFixed(3)}°N, {lon.toFixed(3)}°E</span>
            {settings.cityLat != null && (
              <Badge variant="secondary" className="text-[10px] bg-emerald-100 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200">GPS set</Badge>
            )}
          </div>
        </div>
      </div>

      {/* Plan Generator Card */}
      <Card className="border border-emerald-100 dark:border-emerald-900/40 shadow-xs">
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2 text-stone-900 dark:text-stone-100">
            <Sprout className="h-4 w-4 text-emerald-800 dark:text-emerald-400" /> Generate Farming Plan
          </CardTitle>
          <CardDescription className="text-xs text-stone-500 dark:text-stone-400">
            Real ERA5 climate data for your location · GDD engine · No AI — pure science.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">

          {/* Crop Selection */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 block mb-2">
              Select Crop
            </label>

            {/* Category filter tabs */}
            {!cropsLoading && categoriesInDb.length > 0 && (
              <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3">
                <button
                  onClick={() => { setActiveCatFilter("all"); setShowAllCrops(false); }}
                  className={`shrink-0 text-xs px-3 py-1.5 rounded-full border transition-all ${
                    activeCatFilter === "all"
                      ? "bg-emerald-800 text-white border-emerald-800 shadow-xs"
                      : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-200 dark:hover:bg-stone-700"
                  }`}
                >All</button>
                {categoriesInDb.map(cat => (
                  <button key={cat}
                    onClick={() => { setActiveCatFilter(cat); setShowAllCrops(false); }}
                    className={`shrink-0 text-xs px-3 py-1.5 rounded-full border transition-all whitespace-nowrap ${
                      activeCatFilter === cat
                        ? "bg-emerald-800 text-white border-emerald-800 shadow-xs"
                        : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-200 dark:hover:bg-stone-700"
                    }`}
                  >{cat}</button>
                ))}
              </div>
            )}

            {/* Crop grid */}
            {cropsLoading ? (
              <div className="flex items-center gap-2 text-sm text-stone-500 py-4">
                <Loader2 className="h-4 w-4 animate-spin text-emerald-700" /> Loading crops from database…
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 mb-2">
                  {visibleCrops.map((c) => (
                    <button key={c.id} onClick={() => setCrop(c.cropName)}
                      className={`flex flex-col items-center gap-1 p-2.5 rounded-xl text-xs border transition-all ${
                        crop === c.cropName
                          ? "bg-emerald-100 dark:bg-emerald-950/80 border-emerald-400 dark:border-emerald-600 text-emerald-950 dark:text-emerald-100 font-bold shadow-xs"
                          : "bg-stone-50 dark:bg-stone-800/50 border-stone-100 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300"
                      }`}
                    >
                      <span className="text-xl">{c.emoji}</span>
                      <span className="text-center leading-tight">{c.cropName.split(" (")[0].split(" / ")[0]}</span>
                    </button>
                  ))}
                </div>
                {filteredCrops.length > GRID_LIMIT && (
                  <button
                    onClick={() => setShowAllCrops(v => !v)}
                    className="text-xs text-emerald-800 dark:text-emerald-400 font-medium hover:underline mt-1"
                  >
                    {showAllCrops
                      ? "Show fewer crops"
                      : `Show all ${filteredCrops.length} crops in this category`}
                  </button>
                )}
              </>
            )}

            <input
              type="text" value={crop} onChange={(e) => setCrop(e.target.value)}
              placeholder="Or type any crop name…"
              className="w-full mt-3 px-3 py-2 rounded-xl border bg-muted/40 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-background"
            />
          </div>

          {/* Planting Date */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">
              Planting Date
            </label>
            <div className="relative max-w-xs">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input type="date" value={plantingDate} onChange={(e) => setPlantingDate(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border bg-muted/40 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-background"
              />
            </div>
          </div>

          {/* Preferred crops from profile */}
          {settings.preferredCrops.length > 0 && (
            <div>
              <label className="text-xs text-muted-foreground block mb-2">Your crops from profile:</label>
              <div className="flex flex-wrap gap-1.5">
                {settings.preferredCrops.map((c) => (
                  <button key={c} onClick={() => setCrop(c)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                      crop === c ? "bg-primary text-primary-foreground border-primary" : "bg-muted/50 hover:bg-muted border-transparent text-muted-foreground"
                    }`}
                  >{c}</button>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-sm text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 rounded-xl px-4 py-3">
              <AlertCircle className="h-4 w-4 shrink-0" /> {error}
            </div>
          )}

          <Button onClick={handleGenerate} disabled={!crop || !plantingDate || loading} className="w-full gap-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold shadow-xs" size="lg">
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Generating Plan…</>
            ) : (
              <><Zap className="h-4 w-4" /> Generate Plan for {settings.cityName || settings.provinceName || "My Farm"}</>
            )}
          </Button>

          {loading && (
            <div className="text-center text-xs text-muted-foreground space-y-1">
              <p>Fetching ERA5 climate history and 16-day forecast from Open-Meteo…</p>
              <p>Computing GDD accumulation for {settings.cityName || locationDisplay}…</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Plan Result */}
      {plan && (
        <div className="space-y-4">
          {/* View Mode Switcher */}
          <div className="flex items-center justify-between p-3 bg-card border rounded-2xl shadow-xs">
            <span className="text-xs font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
              <ClipboardList className="h-4 w-4 text-emerald-800 dark:text-emerald-400" />
              {t.viewMode}: <strong className="capitalize text-emerald-800 dark:text-emerald-400">{viewMode === "detailed" ? t.detailed : t.summarized}</strong>
            </span>
            <div className="flex items-center bg-muted p-1 rounded-xl border border-border/60">
              <button
                type="button"
                onClick={() => setViewMode("summarized")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === "summarized"
                    ? "bg-emerald-800 text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.summarized}
              </button>
              <button
                type="button"
                onClick={() => setViewMode("detailed")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === "detailed"
                    ? "bg-emerald-800 text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.detailed}
              </button>
            </div>
          </div>

          {/* Summarized View Mode Banner / Matrix */}
          {viewMode === "summarized" ? (
            <div className="space-y-4">
              <Card className="border-emerald-200/80 dark:border-emerald-800/80 bg-gradient-to-br from-emerald-50/90 via-emerald-100/30 to-green-100/40 dark:from-emerald-950/80 dark:via-stone-900/90 dark:to-emerald-950/60 shadow-xs">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-bold flex items-center gap-2 text-emerald-950 dark:text-emerald-100">
                      <span>{allCrops.find(c => c.cropName.toLowerCase() === plan.crop.toLowerCase())?.emoji ?? "🌱"}</span>
                      <span className="capitalize">{plan.crop} — {t.summarized} Overview</span>
                    </CardTitle>
                    <RiskBadge level={plan.weatherRiskLevel} />
                  </div>
                  <CardDescription className="text-xs text-stone-600 dark:text-stone-300 font-medium">
                    High-level executive schedule & milestone summary for quick review.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* KPI Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-white/90 dark:bg-stone-900/90 p-3 rounded-xl border border-emerald-100 dark:border-emerald-800/70 shadow-2xs">
                      <div className="text-xs text-stone-600 dark:text-stone-400 font-medium">Total Cycle</div>
                      <div className="text-xl font-extrabold text-emerald-800 dark:text-emerald-400">{plan.totalGrowingDays} Days</div>
                    </div>
                    <div className="bg-white/90 dark:bg-stone-900/90 p-3 rounded-xl border border-emerald-100 dark:border-emerald-800/70 shadow-2xs">
                      <div className="text-xs text-stone-600 dark:text-stone-400 font-medium">Phases</div>
                      <div className="text-xl font-extrabold text-emerald-800 dark:text-emerald-400">{plan.stages.length} Stages</div>
                    </div>
                    <div className="bg-white/90 dark:bg-stone-900/90 p-3 rounded-xl border border-emerald-100 dark:border-emerald-800/70 shadow-2xs">
                      <div className="text-xs text-stone-600 dark:text-stone-400 font-medium">Harvest Window</div>
                      <div className="text-sm font-bold text-amber-700 dark:text-amber-400 mt-1">Day {plan.estimatedHarvestStart}–{plan.estimatedHarvestEnd}</div>
                    </div>
                    <div className="bg-white/90 dark:bg-stone-900/90 p-3 rounded-xl border border-emerald-100 dark:border-emerald-800/70 shadow-2xs">
                      <div className="text-xs text-stone-600 dark:text-stone-400 font-medium">Expected Yield</div>
                      <div className="text-sm font-bold text-emerald-700 dark:text-emerald-300 truncate mt-1">{plan.expectedYield || "Standard"}</div>
                    </div>
                  </div>

                  <TimelineBar plan={plan} />

                  {/* High-level stage list */}
                  <div className="space-y-2 pt-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300">Stage Summary</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {plan.stages.map((stg) => {
                        const cfg = STAGE_TYPE_CONFIG[stg.type] ?? STAGE_TYPE_CONFIG.monitoring;
                        const Icon = cfg.icon;
                        return (
                          <div key={stg.id} className={`p-3 rounded-xl border ${cfg.bg} flex items-center justify-between gap-2 shadow-2xs`}>
                            <div className="flex items-center gap-2 min-w-0">
                              <div className={`p-1.5 rounded-lg bg-white/80 dark:bg-stone-900/80 ${cfg.color}`}>
                                <Icon className="h-4 w-4" />
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-xs truncate text-stone-900 dark:text-stone-100">{stg.name}</div>
                                <div className={`text-[11px] font-mono ${cfg.color}`}>Day {stg.startDay}–{stg.endDay}</div>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-[10px] shrink-0 bg-white/80 dark:bg-stone-900/90 border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 font-semibold">
                              {stg.tasks.length} tasks
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            /* Detailed View Mode (Full Tabs & Cards) */
            <>
          {/* Summary Card */}
          <Card className="border-none shadow-sm bg-gradient-to-br from-emerald-50 to-green-100/60 dark:from-emerald-950/40 dark:to-green-950/20">
            <CardContent className="pt-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">
                      {allCrops.find(c => c.cropName.toLowerCase() === plan.crop.toLowerCase())?.emoji ?? "🌱"}
                    </span>
                    <h2 className="text-xl font-bold capitalize">{plan.crop}</h2>
                    <RiskBadge level={plan.weatherRiskLevel} />
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>{result?.location?.display || locationDisplay}</span>
                  </div>
                  {plan.expectedYield && (
                    <div className="mt-1 text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                      Expected yield: {plan.expectedYield}
                    </div>
                  )}
                </div>
                <div className="flex gap-4 flex-wrap">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{plan.totalGrowingDays}</div>
                    <div className="text-[10px] text-muted-foreground">Total Days</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-600">{plan.stages.length}</div>
                    <div className="text-[10px] text-muted-foreground">Stages</div>
                  </div>
                </div>
              </div>
              <div className="mt-4"><TimelineBar plan={plan} /></div>
              {plan.weatherRiskNotes && (
                <div className="mt-3 flex items-start gap-2 text-xs text-muted-foreground bg-white/50 dark:bg-black/20 rounded-xl p-3">
                  <Info className="h-3.5 w-3.5 mt-0.5 shrink-0 text-blue-500" />
                  <span>{plan.weatherRiskNotes}</span>
                </div>
              )}
              {plan.climateAdaptedNote && (
                <div className="mt-2 flex items-start gap-2 text-xs text-muted-foreground bg-white/50 dark:bg-black/20 rounded-xl p-3">
                  <ThermometerSun className="h-3.5 w-3.5 mt-0.5 shrink-0 text-amber-500" />
                  <span>{plan.climateAdaptedNote}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Variety Recommendation */}
          {plan.varietyRecommendation && (
            <div className="flex items-start gap-3 px-4 py-3 bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-800/40 rounded-2xl text-xs">
              <Info className="h-3.5 w-3.5 mt-0.5 shrink-0 text-blue-500" />
              <span className="text-muted-foreground leading-relaxed">{plan.varietyRecommendation}</span>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-1 overflow-x-auto pb-1">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id ? "bg-primary text-primary-foreground" : "bg-muted/60 text-muted-foreground hover:bg-muted"
                }`}
              >
                <tab.icon className="h-3.5 w-3.5" />{tab.label}
              </button>
            ))}
          </div>

          {/* Timeline Tab */}
          {activeTab === "timeline" && (
            <div className="space-y-4">
              {plan.milestones.length > 0 && (
                <Card className="border-none shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2"><Activity className="h-4 w-4 text-primary" /> Key Milestones</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      <div className="absolute left-3.5 top-0 bottom-0 w-px bg-border" />
                      <div className="space-y-4">
                        {plan.milestones.map((m, i) => {
                          const Icon = MILESTONE_ICON_MAP[m.icon] ?? Activity;
                          const date = new Date(plan.plantingDate); date.setDate(date.getDate() + m.day);
                          return (
                            <div key={i} className="flex items-start gap-4 pl-10 relative">
                              <div className="absolute left-0 h-7 w-7 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center">
                                <Icon className="h-3.5 w-3.5 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0 pb-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-semibold text-sm">{m.label}</span>
                                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">Day {m.day}</Badge>
                                  <span className="text-xs text-muted-foreground">{date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{m.description}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              <div>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">All Stages ({plan.stages.length})</div>
                <div className="space-y-3">
                  {plan.stages.map(stage => <StageCard key={stage.id} stage={stage} plantingDate={plan.plantingDate} />)}
                </div>
              </div>
            </div>
          )}

          {/* Weather Tab */}
          {activeTab === "weather" && (
            <Card className="border-none shadow-sm bg-gradient-to-br from-sky-50 to-blue-100/60 dark:from-sky-950/40 dark:to-blue-950/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2"><Cloud className="h-4 w-4 text-blue-500" /> 16-Day Forecast</CardTitle>
                <CardDescription className="text-xs">Used to calibrate your plan's risk assessment · From Open-Meteo</CardDescription>
              </CardHeader>
              <CardContent>
                {result?.weatherData?.daily ? (
                  <div className="overflow-x-auto -mx-1">
                    <div className="flex gap-2 pb-1 min-w-max px-1">
                      {result.weatherData.daily.dates?.slice(0, 10).map((date, i) => {
                        const d = new Date(date);
                        const label = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
                        return (
                          <div key={date} className="bg-white/60 dark:bg-black/20 rounded-xl p-2.5 text-center min-w-[80px]">
                            <div className="text-[10px] text-muted-foreground mb-1">{label}</div>
                            <div className="text-xs font-semibold">{result.weatherData!.daily!.maxTemps?.[i]}°</div>
                            <div className="text-[10px] text-muted-foreground">{result.weatherData!.daily!.minTemps?.[i]}°</div>
                            <div className="flex items-center justify-center gap-0.5 mt-1">
                              <Droplets className="h-2.5 w-2.5 text-blue-400" />
                              <span className="text-[10px] text-blue-600 dark:text-blue-400">{result.weatherData!.daily!.precipitation?.[i]}mm</span>
                            </div>
                            <div className="text-[10px] text-muted-foreground">{result.weatherData!.daily!.precipitationProbability?.[i]}%</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-6">Weather data not available for this plan.</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Fertilizer Tab */}
          {activeTab === "fertilizer" && (
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2"><FlaskConical className="h-4 w-4 text-blue-500" /> Fertilizer Schedule</CardTitle>
                <CardDescription>Application timing based on crop growth stages</CardDescription>
              </CardHeader>
              <CardContent>
                {plan.fertilizerSchedule && plan.fertilizerSchedule.length > 0 ? (
                  <div className="space-y-3">
                    {plan.fertilizerSchedule.map((item, i) => {
                      const date = new Date(plan.plantingDate); date.setDate(date.getDate() + item.day);
                      return (
                        <div key={i} className="flex items-start gap-4 p-4 bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-800/40 rounded-2xl">
                          <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex flex-col items-center justify-center shrink-0">
                            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">D{item.day}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm">{item.product}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">{date.toLocaleDateString("en-US", { month: "short", day: "numeric" })} · {item.rate} · {item.method}</div>
                            <div className="text-xs text-blue-700 dark:text-blue-400 mt-1">{item.purpose}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : <p className="text-sm text-muted-foreground text-center py-6">No fertilizer schedule in this plan.</p>}
              </CardContent>
            </Card>
          )}

          {/* Pests Tab */}
          {activeTab === "pests" && (
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2"><Shield className="h-4 w-4 text-rose-500" /> Pest & Disease Alerts</CardTitle>
                <CardDescription>Common threats to monitor during the growing cycle</CardDescription>
              </CardHeader>
              <CardContent>
                {plan.pestAlerts && plan.pestAlerts.length > 0 ? (
                  <div className="space-y-3">
                    {plan.pestAlerts.map((pest, i) => (
                      <div key={i} className={`p-4 rounded-2xl border ${pest.riskActive ? "bg-rose-50/80 dark:bg-rose-950/30 border-rose-300/60 dark:border-rose-700/40" : "bg-muted/30 border-border"}`}>
                        <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
                          <div className="font-semibold text-sm flex items-center gap-2">
                            <Bug className={`h-4 w-4 ${pest.riskActive ? "text-rose-500" : "text-muted-foreground"}`} />
                            {pest.name}
                            {pest.riskActive && <Badge className="text-[10px] bg-rose-100 text-rose-700 border-rose-200">Active Risk</Badge>}
                          </div>
                          <Badge variant="outline" className="text-[10px] text-muted-foreground">{pest.riskPeriod}</Badge>
                        </div>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <p><span className="font-medium">Symptoms:</span> {pest.symptoms}</p>
                          <p><span className="font-medium">Treatment:</span> {pest.treatment}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-sm text-muted-foreground text-center py-6">No specific pest alerts for this plan.</p>}
              </CardContent>
            </Card>
          )}

          {/* Adjustments Tab */}
          {activeTab === "adjustments" && (
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2"><RefreshCw className="h-4 w-4 text-amber-500" /> Weather Adjustment Rules</CardTitle>
                <CardDescription>How your plan adapts to changing weather conditions</CardDescription>
              </CardHeader>
              <CardContent>
                {plan.weatherAdjustments.length > 0 ? (
                  <div className="space-y-3">
                    {plan.weatherAdjustments.map((adj, i) => (
                      <div key={i} className="p-4 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 rounded-2xl">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="text-xs font-semibold">{adj.trigger}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{adj.action}</p>
                        {adj.affectedStages?.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {adj.affectedStages.map((s, j) => <Badge key={j} variant="secondary" className="text-[10px]">{s}</Badge>)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : <p className="text-sm text-muted-foreground text-center py-6">No weather adjustment rules in this plan.</p>}
              </CardContent>
            </Card>
          )}

          <p className="text-[10px] text-muted-foreground text-center">
            Plan generated {new Date(result.generatedAt).toLocaleString()} ·
            Weather from Open-Meteo ERA5 · GDD model from FAO Paper No. 56 ·
            Always validate with a local agronomist before major farming decisions.
          </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
