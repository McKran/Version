import { useState, useEffect, useMemo, memo, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSettings } from "@/hooks/use-settings";
import {
  ArrowUpRight, ArrowDownRight, Minus, TrendingUp, AlertCircle,
  BarChart3, MapPin, Sparkles, TrendingDown, Calendar, Loader2,
  CheckCircle2, AlertTriangle, Info, ShieldCheck, RefreshCw, Store
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";

interface DAPriceRecord {
  id: string;
  commodity: string;
  localName: string;
  category: string;
  pricePhpKg: number;
  priceMinPhpKg: number;
  priceMaxPhpKg: number;
  unit: string;
  marketName: string;
  region: string;
  province: string;
  date: string;
  source: string;
  specifications?: string;
  trend: "Increasing" | "Decreasing" | "Stable";
  changePercent24h: number;
}

interface PriceHistoryPoint {
  date: string;
  pricePhpKg: number;
  priceMinPhpKg: number;
  priceMaxPhpKg: number;
}

interface DAMarketInsight {
  commodity: string;
  localName: string;
  currentPrice: number;
  unit: string;
  trend: "Increasing" | "Decreasing" | "Stable";
  historicalComparison: string;
  whyIsItHighLow: string;
  expectedTrend: string;
  confidence: "High" | "Medium" | "Low";
  factsAndDerived: string[];
  possibleFactors: string[];
  calculatedStats: {
    currentPrice: number;
    avg7Day: number;
    avg30Day: number;
    historicalMin90d: number;
    historicalMax90d: number;
    pctDiffFrom30dAvg: number;
  };
  region: string;
  province: string;
  source: string;
  lastUpdated: string;
  disclaimer: string;
}

const REGIONS = [
  { value: "CARAGA", label: "Region XIII - CARAGA (Agusan del Norte / Sur)" },
  { value: "NCR", label: "NCR - Metro Manila (Divisoria / Central)" },
  { value: "CAR", label: "CAR - Cordillera (Benguet / La Trinidad)" },
  { value: "Region I", label: "Region I - Ilocos Region" },
  { value: "Region III", label: "Region III - Central Luzon" },
  { value: "Region VII", label: "Region VII - Central Visayas (Cebu)" },
  { value: "Region XI", label: "Region XI - Davao Region" },
];

const CATEGORIES = [
  { id: "all", name: "All Commodities" },
  { id: "Grains & Staples", name: "Grains & Staples" },
  { id: "Vegetables", name: "Vegetables" },
  { id: "Fruits", name: "Fruits" },
  { id: "Root Crops", name: "Root Crops" },
  { id: "Legumes & Others", name: "Legumes" },
  { id: "Herbs & Spices", name: "Spices" },
];

function TrendBadge({ trend, percent }: { trend: string; percent: number }) {
  if (trend === "Increasing") {
    return (
      <Badge variant="outline" className="bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-400 font-semibold gap-1 text-[10px] sm:text-xs">
        <ArrowUpRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> +{Math.abs(percent).toFixed(1)}%
      </Badge>
    );
  }
  if (trend === "Decreasing") {
    return (
      <Badge variant="outline" className="bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-400 font-semibold gap-1 text-[10px] sm:text-xs">
        <ArrowDownRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> -{Math.abs(percent).toFixed(1)}%
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="bg-muted text-muted-foreground font-semibold gap-1 text-[10px] sm:text-xs">
      <Minus className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> Stable
    </Badge>
  );
}

function ConfidenceBadge({ confidence }: { confidence: string }) {
  const colors =
    confidence === "High"
      ? "bg-emerald-600 text-white"
      : confidence === "Medium"
      ? "bg-amber-600 text-white"
      : "bg-muted text-muted-foreground";

  return (
    <Badge className={`text-[10px] font-bold ${colors}`}>
      Confidence: {confidence}
    </Badge>
  );
}

function DetailDrawer({
  item,
  region,
  onClose,
}: {
  item: DAPriceRecord | null;
  region: string;
  onClose: () => void;
}) {
  const { settings } = useSettings();
  const [insight, setInsight] = useState<DAMarketInsight | null>(null);
  const [history, setHistory] = useState<PriceHistoryPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"simplified" | "detailed">("simplified");

  const cacheRef = useRef<Record<string, { insight: DAMarketInsight; history: PriceHistoryPoint[] }>>({});

  useEffect(() => {
    if (!item) {
      setInsight(null);
      setHistory([]);
      return;
    }

    const lang = settings.language || "en";
    const cacheKey = `${item.commodity}_${region}_${mode}_${lang}`;

    if (cacheRef.current[cacheKey]) {
      setInsight(cacheRef.current[cacheKey].insight);
      setHistory(cacheRef.current[cacheKey].history);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    fetch(`/api/prices/insights?commodity=${encodeURIComponent(item.commodity)}&region=${encodeURIComponent(region)}&mode=${mode}&lang=${lang}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load Grownox AI market analysis");
        return res.json();
      })
      .then((data) => {
        const ins = data.insight ?? data;
        const hist = data.history ?? [];
        cacheRef.current[cacheKey] = { insight: ins, history: hist };
        setInsight(ins);
        setHistory(hist);
      })
      .catch((err) => {
        console.error(err);
        setError("Unable to load live market insight. Please try again.");
      })
      .finally(() => setLoading(false));
  }, [item, region, mode, settings.language]);

  const isFilipino = settings.language === "fil";

  return (
    <Sheet open={!!item} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-lg md:max-w-xl p-0 flex flex-col h-full max-h-screen overflow-hidden">
        {item && (
          <>
            <SheetHeader className="px-4 sm:px-6 pt-5 pb-4 pr-12 border-b bg-muted/20 shrink-0">
              <div className="flex items-start justify-between gap-3 min-w-0">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="text-xs border-primary/30 text-primary shrink-0">
                      {item.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground truncate">{region} Market</span>
                  </div>
                  <SheetTitle className="text-lg sm:text-xl font-extrabold mt-1 break-words">
                    {item.commodity} <span className="text-xs sm:text-sm font-normal text-muted-foreground">({item.localName})</span>
                  </SheetTitle>
                  <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1 break-words">
                    <MapPin className="h-3 w-3 text-primary shrink-0" /> {item.marketName}, {item.province}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-lg sm:text-xl font-black text-foreground">₱{item.pricePhpKg}</div>
                  <div className="text-[11px] sm:text-xs text-muted-foreground">per {item.unit}</div>
                </div>
              </div>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-5 min-h-0">
              {/* 30-Day DA Retail Price Chart */}
              {history.length > 0 && (
                <Card className="border bg-card overflow-hidden min-w-0">
                  <CardHeader className="p-3 sm:p-4 pb-2">
                    <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <BarChart3 className="h-4 w-4 text-primary shrink-0" />
                      {isFilipino ? "30-Araw na Presyo ng DA" : "30-Day DA Retail Price Trend"} (₱/{item.unit})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-4 pt-0">
                    <div className="h-44 w-full pt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={history}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                          <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(d) => d.slice(5)} />
                          <YAxis domain={["auto", "auto"]} tick={{ fontSize: 10 }} tickFormatter={(v) => `₱${v}`} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              borderColor: "hsl(var(--border))",
                              borderRadius: "0.5rem",
                              color: "hsl(var(--card-foreground))",
                              fontSize: "12px",
                              padding: "8px 12px",
                              boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                            }}
                            itemStyle={{ color: "hsl(var(--primary))", fontWeight: "bold" }}
                            labelStyle={{ color: "hsl(var(--muted-foreground))", fontWeight: "bold", marginBottom: "2px" }}
                            formatter={(value: any) => [`₱${value}/${item.unit}`, "DA Retail Price"]}
                            labelFormatter={(label) => `Date: ${label}`}
                          />
                          <Line
                            type="monotone"
                            dataKey="pricePhpKg"
                            stroke="hsl(var(--primary))"
                            strokeWidth={2.5}
                            dot={false}
                            activeDot={{ r: 5 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* AI Market Analysis Card with Mode Switcher */}
              <Card className="border border-primary/30 bg-primary/5 min-w-0">
                <CardContent className="p-3.5 sm:p-4 space-y-3 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-primary/10 pb-2.5">
                    <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                      <Sparkles className="h-4 w-4 text-primary shrink-0" />
                      <span className="text-xs font-bold uppercase tracking-wider text-primary break-words">
                        {isFilipino ? "Pagsusuri sa Presyo ng AI" : "AI Market Analysis"}
                      </span>
                      <Badge variant="outline" className="text-[10px] text-muted-foreground border-primary/20 shrink-0">
                        Grownox AI
                      </Badge>
                    </div>

                    {/* Mode Switcher */}
                    <div className="inline-flex items-center p-0.5 rounded-lg bg-background border text-xs shrink-0 self-start sm:self-auto">
                      <button
                        type="button"
                        onClick={() => setMode("simplified")}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                          mode === "simplified"
                            ? "bg-primary text-primary-foreground shadow-2xs"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {isFilipino ? "Pinaikli" : "Simplified"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setMode("detailed")}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                          mode === "detailed"
                            ? "bg-primary text-primary-foreground shadow-2xs"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {isFilipino ? "Detalyado" : "Detailed"}
                      </button>
                    </div>
                  </div>

                  {loading ? (
                    <div className="space-y-2 py-2">
                      <Skeleton className="h-4 w-3/4 rounded" />
                      <Skeleton className="h-12 w-full rounded" />
                    </div>
                  ) : insight ? (
                    <div className="space-y-3 min-w-0 break-words">
                      {/* Summary / Comparison */}
                      <div className="space-y-1 min-w-0">
                        <div className="flex flex-wrap items-center justify-between gap-1">
                          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                            {isFilipino ? "Kalagayan sa Pamilihan" : "Market Situation"}
                          </span>
                          <ConfidenceBadge confidence={insight.confidence} />
                        </div>
                        <p className="text-xs sm:text-sm font-bold text-foreground leading-relaxed break-words">
                          {insight.historicalComparison}
                        </p>
                      </div>

                      {/* Reasoning according to mode */}
                      <div className="text-xs text-foreground/90 leading-relaxed bg-background/60 p-3 rounded-lg border border-primary/10 space-y-1 min-w-0 break-words">
                        <span className="font-semibold text-muted-foreground block text-[11px] uppercase tracking-wider">
                          {mode === "simplified"
                            ? (isFilipino ? "Pangunahing Dahilan / Salik:" : "Key Cause & Factors:")
                            : (isFilipino ? "Malalim na Pagsusuri sa Ekonomiya at Panahon:" : "Economic & Agricultural Reasoning:")}
                        </span>
                        <p className="break-words leading-relaxed">{insight.whyIsItHighLow}</p>
                      </div>

                      {/* Short-Term Outlook */}
                      <div className="text-xs text-foreground/90 leading-relaxed bg-primary/10 p-3 rounded-lg border border-primary/20 space-y-1 min-w-0 break-words">
                        <span className="font-bold text-primary block text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                          <TrendingUp className="h-3.5 w-3.5 shrink-0" />
                          {isFilipino ? "Inaasahang Pananaw sa Presyo:" : "Short-Term Market Outlook:"}
                        </span>
                        <p className="leading-relaxed break-words">{insight.expectedTrend}</p>
                      </div>

                      {/* SIMPLIFIED MODE: Pill Tags for Quick Scanning */}
                      {mode === "simplified" && insight.possibleFactors && insight.possibleFactors.length > 0 && (
                        <div className="pt-1 min-w-0 w-full">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                            {isFilipino ? "Mga Pangunahing Salik:" : "Key Factors:"}
                          </span>
                          <div className="flex flex-col gap-1.5 w-full">
                            {insight.possibleFactors.map((f, idx) => (
                              <div
                                key={idx}
                                className="text-xs font-medium py-1.5 px-2.5 rounded-md bg-secondary/80 text-secondary-foreground border border-secondary/50 break-words whitespace-normal w-full leading-snug flex items-start gap-1.5"
                              >
                                <span className="text-primary font-bold shrink-0">•</span>
                                <span className="break-words whitespace-normal flex-1">{f}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : error ? (
                    <p className="text-xs text-destructive break-words">{error}</p>
                  ) : null}
                </CardContent>
              </Card>

              {/* DETAILED MODE ONLY: Full Stats, Separated Confirmed Facts, and Factor Lists */}
              {insight && mode === "detailed" && (
                <>
                  {/* DA Statistical Summary Grid */}
                  <div className="space-y-1.5 min-w-0">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <BarChart3 className="h-4 w-4 text-emerald-600 shrink-0" />
                      {isFilipino ? "Opisyal na Estadistika ng DA" : "DA Statistical Benchmark Data"}
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div className="rounded-xl bg-muted/50 p-2.5 sm:p-3 text-center border">
                        <div className="text-[10px] sm:text-[11px] text-muted-foreground uppercase font-medium">
                          {isFilipino ? "Kasalukuyan" : "Current"}
                        </div>
                        <div className="text-base font-bold">₱{insight.calculatedStats.currentPrice}</div>
                        <div className="text-[10px] text-muted-foreground">per {item.unit}</div>
                      </div>
                      <div className="rounded-xl bg-muted/50 p-2.5 sm:p-3 text-center border">
                        <div className="text-[10px] sm:text-[11px] text-muted-foreground uppercase font-medium">
                          {isFilipino ? "7-Araw na Katamtaman" : "7-Day Avg"}
                        </div>
                        <div className="text-base font-bold">₱{insight.calculatedStats.avg7Day}</div>
                        <div className="text-[10px] text-muted-foreground">per {item.unit}</div>
                      </div>
                      <div className="rounded-xl bg-muted/50 p-2.5 sm:p-3 text-center border">
                        <div className="text-[10px] sm:text-[11px] text-muted-foreground uppercase font-medium">
                          {isFilipino ? "30-Araw na Katamtaman" : "30-Day Avg"}
                        </div>
                        <div className="text-base font-bold">₱{insight.calculatedStats.avg30Day}</div>
                        <div className="text-[10px] text-muted-foreground">per {item.unit}</div>
                      </div>
                      <div className="rounded-xl bg-muted/50 p-2.5 sm:p-3 text-center border">
                        <div className="text-[10px] sm:text-[11px] text-muted-foreground uppercase font-medium">
                          {isFilipino ? "90-Araw na Saklaw" : "90-Day Range"}
                        </div>
                        <div className="text-xs font-bold mt-1">
                          ₱{insight.calculatedStats.historicalMin90d} - ₱{insight.calculatedStats.historicalMax90d}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Supported Facts & Derived Calculations */}
                  <div className="space-y-2 min-w-0">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      {isFilipino ? "Kumpirmadong Datos mula sa DA Bantay Presyo" : "Confirmed Facts Supported by DA Data"}
                    </span>
                    <ul className="space-y-1.5">
                      {insight.factsAndDerived.map((fact, idx) => (
                        <li key={idx} className="text-xs text-foreground bg-muted/40 p-2.5 rounded-lg border flex items-start gap-2 break-words">
                          <span className="text-emerald-600 font-bold shrink-0">•</span>
                          <span className="break-words leading-relaxed">{fact}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Possible Contributing Factors */}
                  {insight.possibleFactors && insight.possibleFactors.length > 0 && (
                    <div className="space-y-2 min-w-0">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                        {isFilipino ? "Mga Posibleng Salik sa Pamilihan" : "Possible Contributing Factors & Explanations"}
                      </span>
                      <ul className="space-y-1.5">
                        {insight.possibleFactors.map((factor, idx) => (
                          <li key={idx} className="text-xs text-foreground bg-amber-500/5 p-2.5 rounded-lg border border-amber-500/20 flex items-start gap-2 break-words">
                            <span className="text-amber-600 font-bold shrink-0">•</span>
                            <span className="break-words leading-relaxed">{factor}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}

              {insight && (
                /* Source & Disclaimer */
                <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 text-[11px] text-amber-900 dark:text-amber-200 space-y-1 min-w-0 break-words">
                  <div className="font-semibold flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5 shrink-0" /> Source: {insight.source}
                  </div>
                  <p className="leading-relaxed break-words">{insight.disclaimer}</p>
                </div>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

export default function Market() {
  const { settings } = useSettings();
  const [selectedRegion, setSelectedRegion] = useState("CARAGA");
  const [category, setCategory] = useState("all");
  const [prices, setPrices] = useState<DAPriceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<DAPriceRecord | null>(null);

  const [bgInsight, setBgInsight] = useState<DAMarketInsight | null>(null);
  const [loadingBgInsight, setLoadingBgInsight] = useState(false);
  const [bgMode, setBgMode] = useState<"simplified" | "detailed">("simplified");
  const bgCacheRef = useRef<Record<string, DAMarketInsight>>({});

  const fetchPrices = () => {
    setLoading(true);
    fetch(`/api/prices/latest?region=${encodeURIComponent(selectedRegion)}&category=${encodeURIComponent(category)}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setPrices(data);
        }
      })
      .catch((err) => console.error("Error fetching DA prices:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPrices();
  }, [selectedRegion, category]);

  // Background Gemini Market Insight Generation when market data loads
  useEffect(() => {
    if (prices.length > 0) {
      const topCommodity = prices[0].commodity;
      const lang = settings.language || "en";
      const cacheKey = `${topCommodity}_${selectedRegion}_${bgMode}_${lang}`;

      if (bgCacheRef.current[cacheKey]) {
        setBgInsight(bgCacheRef.current[cacheKey]);
        setLoadingBgInsight(false);
        return;
      }

      setLoadingBgInsight(true);
      fetch(`/api/prices/insights?commodity=${encodeURIComponent(topCommodity)}&region=${encodeURIComponent(selectedRegion)}&mode=${bgMode}&lang=${lang}`)
        .then((res) => res.json())
        .then((data) => {
          const ins = data.insight ?? data;
          bgCacheRef.current[cacheKey] = ins;
          setBgInsight(ins);
        })
        .catch((err) => console.error("Background insight fetch error:", err))
        .finally(() => setLoadingBgInsight(false));
    }
  }, [prices, selectedRegion, bgMode, settings.language]);

  const trends = useMemo(() => {
    if (!prices.length) return null;
    const rising = prices.filter((p) => p.trend === "Increasing").sort((a, b) => b.changePercent24h - a.changePercent24h);
    const falling = prices.filter((p) => p.trend === "Decreasing").sort((a, b) => a.changePercent24h - b.changePercent24h);
    const stable = prices.filter((p) => p.trend === "Stable");

    return {
      topGainer: rising[0]?.commodity ?? "Red Onion",
      topLoser: falling[0]?.commodity ?? "Tomato",
      mostStable: stable[0]?.commodity ?? "Rice",
      marketSentiment: rising.length > falling.length ? "Increasing" : falling.length > rising.length ? "Decreasing" : "Stable",
    };
  }, [prices]);

  return (
    <div className="space-y-5 sm:space-y-6 pb-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 border-b pb-4 sm:pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-emerald-700 hover:bg-emerald-800 text-white font-medium gap-1 text-[11px] sm:text-xs px-2.5 py-0.5">
              <ShieldCheck className="h-3.5 w-3.5" /> Authoritative Source
            </Badge>
            <span className="text-xs text-muted-foreground font-medium">Bantay Presyo Index</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">Philippine DA Market Prices</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Official Philippine Department of Agriculture (DA) retail commodity monitoring with Grownox AI Market Insights
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <a href="/marketplace" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 px-3.5 gap-1.5">
              <Store className="h-3.5 w-3.5" /> Farmer Marketplace →
            </Button>
          </a>
          {/* Region Selector */}
          <Select value={selectedRegion} onValueChange={setSelectedRegion}>
            <SelectTrigger className="w-full sm:w-64 bg-card text-xs h-9">
              <MapPin className="h-3.5 w-3.5 mr-1 text-primary shrink-0" />
              <SelectValue placeholder="Select Region" />
            </SelectTrigger>
            <SelectContent>
              {REGIONS.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon" className="h-9 w-9 shrink-0" onClick={fetchPrices} title="Refresh DA Prices">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {trends && (
        <div className="grid gap-2.5 grid-cols-2 md:grid-cols-4">
          <Card className="bg-card border shadow-xs">
            <CardContent className="p-3">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-rose-600 dark:text-rose-400 mb-0.5">
                <TrendingUp className="h-3.5 w-3.5" /> Top Rising
              </div>
              <div className="text-xs sm:text-sm font-bold text-foreground truncate">{trends.topGainer}</div>
            </CardContent>
          </Card>
          <Card className="bg-card border shadow-xs">
            <CardContent className="p-3">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mb-0.5">
                <TrendingDown className="h-3.5 w-3.5" /> Top Lowering
              </div>
              <div className="text-xs sm:text-sm font-bold text-foreground truncate">{trends.topLoser}</div>
            </CardContent>
          </Card>
          <Card className="bg-card border shadow-xs">
            <CardContent className="p-3">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-blue-600 dark:text-blue-400 mb-0.5">
                <BarChart3 className="h-3.5 w-3.5" /> Most Stable
              </div>
              <div className="text-xs sm:text-sm font-bold text-foreground truncate">{trends.mostStable}</div>
            </CardContent>
          </Card>
          <Card className="bg-card border shadow-xs">
            <CardContent className="p-3">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground mb-0.5">
                <AlertCircle className="h-3.5 w-3.5 text-primary" /> Market Sentiment
              </div>
              <div className="text-xs sm:text-sm font-bold text-foreground capitalize truncate">{trends.marketSentiment}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Automated Background Grownox Market Insight Card */}
      <Card className="border border-emerald-500/30 bg-emerald-500/5 shadow-xs overflow-hidden">
        <CardContent className="p-3.5 sm:p-4 space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-500/20 pb-2.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Sparkles className="h-4 w-4 text-emerald-600 shrink-0" />
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-900 dark:text-emerald-200">
                {settings.language === "fil" ? "Awtomatikong Pagsusuri ng Grownox" : "Automated Grownox Market Insight"} ({selectedRegion})
              </span>
              <Badge variant="outline" className="text-[10px] text-emerald-800 dark:text-emerald-300 border-emerald-500/30 shrink-0">
                Grownox AI
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {loadingBgInsight ? (
                <Badge variant="outline" className="text-[10px] animate-pulse border-emerald-400 text-emerald-700 dark:text-emerald-300 bg-emerald-500/10">
                  {settings.language === "fil" ? "Nagsusuri..." : "Grownox is analyzing..."}
                </Badge>
              ) : bgInsight ? (
                <Badge className="bg-emerald-600 text-white text-[10px]">
                  {bgInsight.commodity} · {bgInsight.confidence} Confidence
                </Badge>
              ) : null}

              {/* Mode Switcher */}
              <div className="inline-flex items-center p-0.5 rounded-lg bg-background/80 border border-emerald-500/20 text-xs shrink-0">
                <button
                  type="button"
                  onClick={() => setBgMode("simplified")}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition-all ${
                    bgMode === "simplified"
                      ? "bg-emerald-600 text-white shadow-2xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {settings.language === "fil" ? "Pinaikli" : "Simplified"}
                </button>
                <button
                  type="button"
                  onClick={() => setBgMode("detailed")}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition-all ${
                    bgMode === "detailed"
                      ? "bg-emerald-600 text-white shadow-2xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {settings.language === "fil" ? "Detalyado" : "Detailed"}
                </button>
              </div>
            </div>
          </div>

          {loadingBgInsight ? (
            <div className="space-y-1.5 py-1">
              <Skeleton className="h-4 w-2/3 rounded bg-emerald-500/10" />
              <Skeleton className="h-8 w-full rounded bg-emerald-500/10" />
            </div>
          ) : bgInsight ? (
            <div className="space-y-2 text-xs min-w-0 break-words">
              <p className="font-bold text-foreground leading-snug break-words whitespace-normal">{bgInsight.historicalComparison}</p>
              <p className="text-muted-foreground leading-relaxed bg-background/50 p-2.5 rounded-md border border-emerald-500/10 break-words whitespace-normal">{bgInsight.whyIsItHighLow}</p>
              <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 space-y-1 min-w-0 break-words whitespace-normal">
                <span className="font-bold text-emerald-900 dark:text-emerald-200 text-[11px] flex items-center gap-1.5 uppercase tracking-wider">
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  {settings.language === "fil" ? "Inaasahang Pananaw:" : "Expected Outlook:"}
                </span>
                <p className="text-xs text-foreground leading-snug break-words whitespace-normal">{bgInsight.expectedTrend}</p>
              </div>
              {bgMode === "detailed" && bgInsight.possibleFactors && bgInsight.possibleFactors.length > 0 && (
                <div className="pt-1.5 space-y-1.5 min-w-0 w-full">
                  <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block">
                    {settings.language === "fil" ? "Mga Salik sa Pamilihan:" : "Market Factors:"}
                  </span>
                  <div className="flex flex-col gap-1.5 w-full">
                    {bgInsight.possibleFactors.map((f, i) => (
                      <div key={i} className="text-xs text-foreground bg-background/60 p-2.5 rounded-md border border-emerald-500/10 break-words whitespace-normal leading-relaxed flex items-start gap-1.5">
                        <span className="text-emerald-600 font-bold shrink-0">•</span>
                        <span className="break-words whitespace-normal flex-1">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Market prices loaded. Grownox AI analysis initializing...</p>
          )}
        </CardContent>
      </Card>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none max-w-full">
        {CATEGORIES.map((cat) => (
          <Button
            key={cat.id}
            variant={category === cat.id ? "default" : "outline"}
            size="sm"
            className="rounded-full text-xs h-8 whitespace-nowrap px-3.5 shrink-0"
            onClick={() => setCategory(cat.id)}
          >
            {cat.name}
          </Button>
        ))}
      </div>

      {/* Main Table / Grid */}
      <Card className="border shadow-xs overflow-hidden">
        <CardHeader className="p-4 pb-3 flex flex-row items-center justify-between space-y-0 border-b">
          <div>
            <CardTitle className="text-sm sm:text-base font-bold flex items-center gap-2">
              Retail Price Index (₱/kg)
              <Badge variant="outline" className="text-[10px] font-normal">
                {prices.length} Items
              </Badge>
            </CardTitle>
            <CardDescription className="text-xs">
              Primary Source: Philippine Department of Agriculture (DA) - Bantay Presyo
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-3">
              {Array(6).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          ) : prices.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-xs">
              No commodity prices found for this category.
            </div>
          ) : (
            <>
              {/* Mobile View Card List (< sm screens) */}
              <div className="block sm:hidden divide-y">
                {prices.map((item) => (
                  <div key={item.id} className="p-3.5 space-y-2.5 hover:bg-muted/30">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-sm text-foreground">{item.commodity}</div>
                        <div className="text-xs text-muted-foreground">{item.localName} · {item.category}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-black text-base text-foreground">₱{item.pricePhpKg}</div>
                        <div className="text-[10px] text-muted-foreground">per {item.unit}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-border/40">
                      <div className="flex items-center gap-1.5">
                        <TrendBadge trend={item.trend} percent={item.changePercent24h} />
                        <span className="text-[10px] text-muted-foreground">Range: ₱{item.priceMinPhpKg} - ₱{item.priceMaxPhpKg}</span>
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-[11px] gap-1 px-2.5 border-primary/30 text-primary hover:bg-primary/10"
                        onClick={() => setSelectedItem(item)}
                      >
                        <Sparkles className="h-3 w-3" />
                        AI Insights
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop/Tablet Table (>= sm screens) */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/50 text-muted-foreground border-b text-xs uppercase font-semibold">
                    <tr>
                      <th className="px-4 py-3">Commodity</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">DA Retail Price</th>
                      <th className="px-4 py-3">DA Range (₱/kg)</th>
                      <th className="px-4 py-3">24h Trend</th>
                      <th className="px-4 py-3 text-right">AI Insights</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {prices.map((item) => (
                      <tr key={item.id} className="hover:bg-muted/30 transition-colors group">
                        <td className="px-4 py-3.5">
                          <div className="font-bold text-sm text-foreground">{item.commodity}</div>
                          <div className="text-xs text-muted-foreground font-medium">{item.localName}</div>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-muted-foreground">{item.category}</td>
                        <td className="px-4 py-3.5">
                          <div className="font-extrabold text-base text-foreground">₱{item.pricePhpKg}</div>
                          <div className="text-[11px] text-muted-foreground">per {item.unit}</div>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-muted-foreground">
                          ₱{item.priceMinPhpKg} – ₱{item.priceMaxPhpKg}
                        </td>
                        <td className="px-4 py-3.5">
                          <TrendBadge trend={item.trend} percent={item.changePercent24h} />
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs gap-1.5 border-primary/30 text-primary hover:bg-primary/10"
                            onClick={() => setSelectedItem(item)}
                          >
                            <Sparkles className="h-3.5 w-3.5" />
                            View Insights
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Detail Drawer */}
      <DetailDrawer item={selectedItem} region={selectedRegion} onClose={() => setSelectedItem(null)} />
    </div>
  );
}
