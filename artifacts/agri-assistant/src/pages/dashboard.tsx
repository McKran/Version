import { useState, useEffect } from "react";
import { useGetDashboardSummary, getGetDashboardSummaryQueryKey } from "@workspace/api-client-react";
import { useLocationStore } from "@/hooks/use-location";
import { useSettings } from "@/hooks/use-settings";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import {
  CloudSun,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Bot,
  Store,
  ClipboardList,
  MapPin,
  Wind,
  Droplets,
  ArrowRight,
  CheckCircle2,
  Circle,
  Sparkles,
  Search,
  Sprout,
  Video
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface MarketItem {
  commodity: string;
  pricePhpKg: number;
  unit: string;
  trend: "Increasing" | "Decreasing" | "Stable";
  changePercent24h?: number;
}

interface ListingItem {
  id: string;
  cropName: string;
  variety?: string;
  quantityKg: number;
  pricePhpKg: number;
  sellerLocation: string;
}

export default function Dashboard() {
  const { location, setLocation } = useLocationStore();
  const { settings, t } = useSettings();

  // Location Selector Modal State
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [tempLocation, setTempLocation] = useState(location);

  const lat = settings.cityLat ?? undefined;
  const lon = settings.cityLon ?? undefined;
  const queryParams = { location, ...(lat !== undefined && lon !== undefined ? { lat, lon } : {}), lang: settings.language };

  const { data: summary, isLoading } = useGetDashboardSummary(
    queryParams as any,
    { query: { queryKey: getGetDashboardSummaryQueryKey(queryParams) } }
  );

  // Live Market Prices State
  const [topPrices, setTopPrices] = useState<MarketItem[]>([
    { commodity: "Rice (Well-milled)", pricePhpKg: 52, unit: "kg", trend: "Increasing", changePercent24h: 1.5 },
    { commodity: "Yellow Corn", pricePhpKg: 31, unit: "kg", trend: "Decreasing", changePercent24h: -0.8 },
    { commodity: "Red Tomato", pricePhpKg: 80, unit: "kg", trend: "Increasing", changePercent24h: 3.2 },
  ]);

  // Live Marketplace Listings State
  const [activeListings, setActiveListings] = useState<ListingItem[]>([]);
  const [listingCount, setListingCount] = useState<number>(3);

  // Today's Tasks Interactive State
  const [tasks, setTasks] = useState([
    { id: "t1", label: "Check irrigation channels & drip lines", done: false },
    { id: "t2", label: "Fertilize tomatoes with high-potassium formula", done: false },
    { id: "t3", label: "Inspect corn field for early pest signs", done: true },
  ]);

  useEffect(() => {
    // Fetch live market prices
    fetch("/api/prices/latest?region=CARAGA&category=all")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const formatted = data.slice(0, 3).map((item: any) => ({
            commodity: item.commodity,
            pricePhpKg: item.pricePhpKg,
            unit: item.unit || "kg",
            trend: item.trend || "Stable",
            changePercent24h: item.changePercent24h || 0,
          }));
          setTopPrices(formatted);
        }
      })
      .catch(() => {});

    // Fetch live marketplace listings
    fetch("/api/marketplace/listings")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setActiveListings(data.slice(0, 3));
          setListingCount(data.length);
        }
      })
      .catch(() => {});
  }, []);

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  const handleSaveLocation = () => {
    if (tempLocation.trim()) {
      setLocation(tempLocation.trim());
    }
    setLocationModalOpen(false);
  };

  const weatherData = summary?.weather || {
    temperature: 29,
    condition: "Partly Cloudy",
    humidity: 78,
    windSpeed: 12,
    feelsLike: 31,
  };

  return (
    <div className="space-y-6 pb-12 font-sans text-stone-900 dark:text-stone-100">
      {/* QUICK CATEGORY NAVIGATION STRIP */}
      <nav className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { href: "/weather", icon: CloudSun, label: t.weather, badge: t.live, color: "bg-blue-50/80 text-blue-700 hover:bg-blue-600 hover:text-white border-blue-200/60" },
          { href: "/market", icon: TrendingUp, label: t.market, badge: "DA Data", color: "bg-emerald-50/80 text-emerald-800 hover:bg-emerald-700 hover:text-white border-emerald-200/60" },
          { href: "/marketplace", icon: Store, label: t.marketplace, badge: t.trading, color: "bg-amber-50/90 text-amber-900 hover:bg-gradient-to-r hover:from-amber-600 hover:to-rose-600 hover:text-white border-amber-200/80" },
          { href: "/farming-plan", icon: ClipboardList, label: t.farmingPlan, badge: t.tasks, color: "bg-emerald-100/70 text-emerald-900 hover:bg-emerald-800 hover:text-white border-emerald-200/80" },
          { href: "/chat", icon: Bot, label: t.aiAdvisor, badge: "Gemini", color: "bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50 text-indigo-800 hover:bg-gradient-to-r hover:from-blue-600 hover:to-cyan-600 hover:text-white border-blue-200/60" },
          { href: "/tutorials", icon: Video, label: t.tutorials, badge: t.guides, color: "bg-rose-50/80 text-rose-800 hover:bg-rose-600 hover:text-white border-rose-200/60" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2.5 p-3 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-xs hover:shadow-sm transition-all group`}
          >
            <div className={`p-2 rounded-xl ${item.color} shrink-0 transition-colors`}>
              <item.icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <span className="block text-xs font-semibold text-stone-800 dark:text-stone-200 group-hover:text-stone-900 dark:group-hover:text-white transition-colors truncate">
                {item.label}
              </span>
              <span className="block text-[10px] text-stone-500 dark:text-stone-400 truncate">
                {item.badge}
              </span>
            </div>
          </Link>
        ))}
      </nav>

      {/* DASHBOARD CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* CARD 1: WEATHER */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-sm transition-all">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300">
                  <CloudSun className="h-5 w-5" />
                </div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
                  🌤 {t.weather}
                </h2>
              </div>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200/80 text-[10px]">
                {t.liveForecast}
              </Badge>
            </div>

            {isLoading ? (
              <div className="space-y-3 py-2">
                <Skeleton className="h-10 w-24 rounded-lg" />
                <Skeleton className="h-4 w-36 rounded" />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-extrabold text-stone-900 dark:text-stone-50 tracking-tight">
                    {weatherData.temperature}°C
                  </span>
                  <span className="text-sm font-medium text-stone-600 dark:text-stone-300 capitalize">
                    {weatherData.condition}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-stone-100 dark:border-stone-800/80">
                  <div className="flex items-center gap-1.5 text-stone-600 dark:text-stone-400">
                    <Droplets className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
                    <span>{t.humidity} <strong>{weatherData.humidity}%</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-stone-600 dark:text-stone-400">
                    <Wind className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
                    <span>{t.wind} <strong>{weatherData.windSpeed} km/h</strong></span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Link
            href="/weather"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 pt-2 group"
          >
            <span>{t.viewAll}</span>
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* CARD 2: MARKET PRICES */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-sm transition-all">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
                  📊 {t.market}
                </h2>
              </div>
              <Badge variant="outline" className="bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200/80 text-[10px]">
                {t.daReference}
              </Badge>
            </div>

            <div className="space-y-2.5">
              {topPrices.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/40 dark:bg-stone-800/50 border border-emerald-100/60 dark:border-stone-800/80 text-xs"
                >
                  <span className="font-semibold text-stone-800 dark:text-stone-200 truncate max-w-[130px]">
                    {item.commodity}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-bold text-stone-900 dark:text-stone-100">
                      ₱{item.pricePhpKg}/{item.unit}
                    </span>
                    {item.trend === "Increasing" ? (
                      <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center" title="Price increasing">
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </span>
                    ) : item.trend === "Decreasing" ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center" title="Price decreasing">
                        <ArrowDownRight className="h-3.5 w-3.5" />
                      </span>
                    ) : (
                      <span className="text-stone-400 font-bold flex items-center">
                        <Minus className="h-3.5 w-3.5" />
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Link
            href="/market"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 pt-2 group"
          >
            <span>{t.viewAll}</span>
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* CARD 3: GROWNOX INSIGHT */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-sm transition-all">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/20 via-indigo-500/20 to-cyan-500/20 text-indigo-700 dark:text-cyan-400">
                  <Bot className="h-5 w-5" />
                </div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
                  🤖 {t.grownoxInsight}
                </h2>
              </div>
              <Badge className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 text-white text-[10px] shadow-xs border-0">
                {t.aiMarketBrief}
              </Badge>
            </div>

            <div className="p-3.5 rounded-xl bg-gradient-to-br from-blue-50/80 via-indigo-50/40 to-cyan-50/70 dark:from-blue-950/40 dark:to-cyan-950/40 border border-blue-200/70 dark:border-blue-800/50 text-xs space-y-2">
              <p className="text-stone-800 dark:text-stone-200 font-medium leading-relaxed">
                {summary?.marketAlert ||
                  (settings.language === "fil"
                    ? "Tumaas ang presyo ng bigas sa mga lokal na pamilihan dahil sa mataas na demand sa panahon ng anihan. Magandang pagkakataon ito upang magbenta ng ani."
                    : "Rice and grain prices are trending upwards in local regional markets due to seasonal demand shifts. Higher demand for local well-milled varieties creates a favorable selling window for growers.")}
              </p>
              <div className="text-[11px] text-indigo-700 dark:text-cyan-300 font-bold flex items-center gap-1 pt-1 border-t border-blue-200/60 dark:border-indigo-800/50">
                <Sparkles className="h-3 w-3 shrink-0 text-cyan-600 dark:text-cyan-400" />
                <span>Tip: {summary?.farmingTip || (settings.language === "fil" ? "Suriin ang presyo ng DA linggo-linggo para mas lumaki ang kita." : "Monitor local DA market prices weekly to maximize profit.")}</span>
              </div>
            </div>
          </div>

          <Link
            href="/market"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 hover:text-indigo-800 dark:text-cyan-400 dark:hover:text-cyan-300 pt-2 group"
          >
            <span>{t.viewMarketAnalysis}</span>
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* CARD 4: MARKETPLACE */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-sm transition-all">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-gradient-to-br from-amber-100 to-rose-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                  <Store className="h-5 w-5 text-amber-700 dark:text-amber-300" />
                </div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
                  🛒 {t.marketplace}
                </h2>
              </div>
              <Badge variant="outline" className="bg-amber-50/80 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200/90 text-[10px] font-semibold">
                {t.directFarmTrading}
              </Badge>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-gradient-to-br from-amber-50/70 via-rose-50/30 to-amber-50/50 dark:from-amber-950/40 dark:to-rose-950/20 border border-amber-200/80 dark:border-amber-800/50">
                <div className="text-xs font-bold text-amber-950 dark:text-amber-200 flex items-center gap-1.5 mb-1">
                  <Sprout className="h-3.5 w-3.5 text-rose-600 dark:text-amber-400" />
                  <span>{listingCount} {t.activeListingsNearYou}</span>
                </div>
                <p className="text-[11px] text-stone-600 dark:text-stone-400 leading-relaxed">
                  {activeListings.length > 0
                    ? `Latest crops: ${activeListings.map((l) => l.cropName).join(", ")}`
                    : (settings.language === "fil" ? "Makipag-ugnayan nang direkta sa mga magsasaka sa iyong lalawigan nang walang patong na tubo." : "Connect directly with local farmers in your province with zero middleman markups.")}
                </p>
              </div>
            </div>
          </div>

          <Link
            href="/marketplace"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 hover:text-rose-700 dark:text-amber-400 dark:hover:text-amber-300 pt-2 group"
          >
            <span>{t.browseMarketplace}</span>
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* CARD 5: FARM PLANNER */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-sm transition-all md:col-span-2 lg:col-span-2">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-100/90 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                  <ClipboardList className="h-5 w-5" />
                </div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
                  🌾 {t.farmingPlan}
                </h2>
              </div>
              <Badge variant="outline" className="bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200/80 text-[10px] font-semibold">
                {t.todaysTasks}
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-bold text-stone-900 dark:text-stone-100 mb-2">
                {t.scheduleActionItems}:
              </div>
              {tasks.map((tItem) => (
                <button
                  key={tItem.id}
                  onClick={() => toggleTask(tItem.id)}
                  className={`w-full text-left flex items-start gap-2.5 p-2.5 rounded-xl border transition-all text-xs ${
                    tItem.done
                      ? "bg-stone-50/60 dark:bg-stone-900/40 border-stone-200/50 text-stone-400 line-through"
                      : "bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-200/70 dark:border-emerald-800/50 text-stone-800 dark:text-stone-200 font-medium hover:border-emerald-400"
                  }`}
                >
                  {tItem.done ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="h-4 w-4 text-emerald-500 dark:text-emerald-500 shrink-0 mt-0.5" />
                  )}
                  <span className="leading-snug">{tItem.label}</span>
                </button>
              ))}
            </div>
          </div>

          <Link
            href="/farming-plan"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-900 dark:text-emerald-400 dark:hover:text-emerald-300 pt-2 group"
          >
            <span>{t.openPlanner}</span>
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      {/* LOCATION DIALOG */}
      <Dialog open={locationModalOpen} onOpenChange={setLocationModalOpen}>
        <DialogContent className="w-[90vw] max-w-sm rounded-2xl p-5">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <MapPin className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              Set Farm Location
            </DialogTitle>
            <DialogDescription className="text-xs text-stone-500">
              Enter your municipality, province, or region in the Philippines to tailor weather forecasts & DA market prices.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2 space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
              <Input
                value={tempLocation}
                onChange={(e) => setTempLocation(e.target.value)}
                placeholder="e.g. Tacloban City, Leyte"
                className="pl-9 text-xs h-9 rounded-xl"
              />
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {["Tacloban City, Leyte", "Davao City", "CARAGA Region", "Benguet", "Cebu City", "Iloilo City"].map(
                (quick) => (
                  <button
                    key={quick}
                    type="button"
                    onClick={() => setTempLocation(quick)}
                    className="text-[10px] px-2 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/60 dark:hover:bg-teal-900 text-teal-800 dark:text-teal-300 border border-teal-200/60 transition-colors"
                  >
                    {quick}
                  </button>
                )
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocationModalOpen(false)}
              className="text-xs h-8 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSaveLocation}
              className="bg-teal-600 hover:bg-teal-700 text-white text-xs h-8 rounded-xl font-bold"
            >
              Save Location
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
