import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Link, useLocation } from "wouter";
import { useGetDashboardSummary, getGetDashboardSummaryQueryKey } from "@workspace/api-client-react";
import { useLocationStore } from "@/hooks/use-location";
import { useSettings, getUserKey } from "@/hooks/use-settings";
import { DisasterAlertsSection } from "@/components/disaster-alerts-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { GrownoxIcon } from "@/components/grownox-icon";
import { GrownoxAiAvatar } from "@/components/grownox-ai-avatar";
import {
  Sprout,
  CloudSun,
  ClipboardList,
  Video,
  Droplets,
  Wind,
  CheckCircle2,
  Circle,
  ArrowRight,
  Sparkles,
  ChevronRight,
  MapPin,
  Wheat,
  Calendar,
  Search,
  Plus,
  Filter,
  Clock,
  PlayCircle,
  FileText,
  Send,
  Image as ImageIcon,
  TrendingUp,
  Minus,
  ArrowUpRight,
  ArrowDownRight,
  Store,
  Truck,
  Check,
  FlaskConical,
  RefreshCw,
  Loader2,
  AlertCircle,
  X,
  Play,
} from "lucide-react";

function getCropImage(cropName: string): string {
  const name = (cropName || "").toLowerCase();
  if (name.includes("rice") || name.includes("dinorado") || name.includes("palay") || name.includes("paddy")) {
    return "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80";
  }
  if (name.includes("onion") || name.includes("creole") || name.includes("sibuyas")) {
    return "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cf?auto=format&fit=crop&w=800&q=80";
  }
  if (name.includes("garlic") || name.includes("bawang") || name.includes("bungon")) {
    return "https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?auto=format&fit=crop&w=800&q=80";
  }
  if (name.includes("corn") || name.includes("mais") || name.includes("maize")) {
    return "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=800&q=80";
  }
  if (name.includes("tomato") || name.includes("kamatis")) {
    return "https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=800&q=80";
  }
  if (name.includes("eggplant") || name.includes("talong")) {
    return "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80";
  }
  if (name.includes("cabbage") || name.includes("repolyo")) {
    return "https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?auto=format&fit=crop&w=800&q=80";
  }
  if (name.includes("banana") || name.includes("saging")) {
    return "https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=800&q=80";
  }
  if (name.includes("mango") || name.includes("mangga")) {
    return "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=800&q=80";
  }
  if (name.includes("cassava") || name.includes("kamoteng kahoy")) {
    return "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=800&q=80";
  }
  return "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80";
}

function getCropEmoji(cropName: string): string {
  const name = (cropName || "").toLowerCase();
  if (name.includes("rice") || name.includes("palay") || name.includes("paddy")) return "🌾";
  if (name.includes("corn") || name.includes("mais") || name.includes("maize")) return "🌽";
  if (name.includes("tomato") || name.includes("kamatis")) return "🍅";
  if (name.includes("eggplant") || name.includes("talong")) return "🍆";
  if (name.includes("onion") || name.includes("sibuyas")) return "🧅";
  if (name.includes("garlic") || name.includes("bawang")) return "🧄";
  if (name.includes("cassava")) return "🥔";
  if (name.includes("cabbage")) return "🥬";
  if (name.includes("mango")) return "🥭";
  if (name.includes("banana")) return "🍌";
  return "🌱";
}

function formatPlantingDate(dateStr: string): string {
  if (!dateStr) return "";
  const parts = dateStr.split("-").map(Number);
  if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }
  const fallback = new Date(dateStr);
  return isNaN(fallback.getTime()) ? dateStr : fallback.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

interface ActivePlanTask {
  id: string;
  label: string;
  detail: string;
  due: string;
  priority: "high" | "medium" | "normal";
  done: boolean;
}

interface ActivePlanData {
  id: string | number;
  name: string;
  crop: string;
  plantingDate: string;
  plan: {
    totalGrowingDays?: number;
    stages: Array<{
      stageName: string;
      startDay: number;
      endDay: number;
      tasks: string[];
    }>;
  };
  completedTasks: Record<string, boolean>;
  updatedAt?: string;
}

interface TutorialVideo {
  id: string;
  title: string;
  channelTitle: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
}

interface DashboardChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default function FarmerDashboard() {
  const [, setLocationPath] = useLocation();
  const { location } = useLocationStore();
  const { settings, t } = useSettings();
  const isFil = settings.language === "fil";

  const lat = settings.cityLat ?? undefined;
  const lon = settings.cityLon ?? undefined;
  const queryParams = {
    location,
    ...(lat !== undefined && lon !== undefined ? { lat, lon } : {}),
    lang: settings.language,
  };

  const { data: summary, isLoading } = useGetDashboardSummary(
    queryParams as any,
    { query: { queryKey: getGetDashboardSummaryQueryKey(queryParams) } }
  );

  // User Preferred Crops
  const preferredCropsList = settings.preferredCrops || [];

  // PH Crop Database Metadata for selected crops
  const [phCropsMap, setPhCropsMap] = useState<Record<string, any>>({});
  useEffect(() => {
    fetch("/api/ph-crops")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const map: Record<string, any> = {};
          data.forEach((item: any) => {
            if (item.cropName) map[item.cropName.toLowerCase()] = item;
            if (item.localName) map[item.localName.toLowerCase()] = item;
          });
          setPhCropsMap(map);
        }
      })
      .catch(() => {});
  }, []);

  // ── REAL FARM PLANNER INTEGRATION ──────────────────────────────────────────
  const userKey = getUserKey(settings.userName);
  const [activePlan, setActivePlan] = useState<ActivePlanData | null>(null);
  const [planLoading, setPlanLoading] = useState(true);

  // Exact Cycle Day Calculation (Day 1 = Planting Date)
  const cycleDay = useMemo(() => {
    if (!activePlan?.plantingDate) {
      return { label: "Day 1", dayNumber: 1, isUpcoming: false, daysUntil: 0 };
    }
    const parts = activePlan.plantingDate.split("-").map(Number);
    const pDate = (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2]))
      ? new Date(parts[0], parts[1] - 1, parts[2], 0, 0, 0)
      : new Date(activePlan.plantingDate);
    pDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffMs = today.getTime() - pDate.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      const daysUntil = Math.abs(diffDays);
      return {
        label: `Starts in ${daysUntil} day${daysUntil > 1 ? "s" : ""}`,
        dayNumber: 0,
        isUpcoming: true,
        daysUntil,
      };
    }

    // Selected planting date is Day 1
    const dayNumber = diffDays + 1;
    return {
      label: `Day ${dayNumber}`,
      dayNumber,
      isUpcoming: false,
      daysUntil: 0,
    };
  }, [activePlan?.plantingDate]);

  // Exact Task Progress Calculation (Completed Tasks / Total Tasks)
  const taskStats = useMemo(() => {
    if (!activePlan?.plan || !Array.isArray(activePlan.plan.stages)) {
      return { totalTasks: 0, completedTasks: 0, progressPercent: 0 };
    }

    let totalTasks = 0;
    let completedCount = 0;
    const completedMap = activePlan.completedTasks || {};
    const cropLower = (activePlan.crop || "").toLowerCase();

    activePlan.plan.stages.forEach((stage: any, sIdx: number) => {
      const stageTasks = stage.tasks || [];
      const stageDuration = Math.max(1, (stage.endDay ?? 0) - (stage.startDay ?? 0));
      stageTasks.forEach((_taskStr: string, tIdx: number) => {
        totalTasks++;
        const dayOffset = (stage.startDay ?? 0) + Math.floor((tIdx / Math.max(1, stageTasks.length)) * stageDuration);
        const taskId = `task_${cropLower}_${sIdx}_${tIdx}_${dayOffset}`;
        const legacyId = `s${sIdx}_t${tIdx}`;
        if (completedMap[taskId] || completedMap[legacyId]) {
          completedCount++;
        }
      });
    });

    const progressPercent = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;
    return { totalTasks, completedTasks: completedCount, progressPercent };
  }, [activePlan]);

  const overallPlanProgress = taskStats.progressPercent;

  const currentStageName = useMemo(() => {
    if (!activePlan?.plan || !Array.isArray(activePlan.plan.stages)) return "Active Growth";
    const daysElapsed = Math.max(0, cycleDay.dayNumber - 1);
    for (const stage of activePlan.plan.stages) {
      if (daysElapsed >= stage.startDay && daysElapsed <= stage.endDay) {
        return stage.stageName;
      }
    }
    return activePlan.plan.stages[0]?.stageName || "Active Growth";
  }, [activePlan, cycleDay.dayNumber]);

  const tasks = useMemo(() => {
    if (!activePlan?.plan || !Array.isArray(activePlan.plan.stages)) return [];
    const completedMap = activePlan.completedTasks || {};
    const cropLower = (activePlan.crop || "").toLowerCase();
    const result: Array<{ id: string; label: string; done: boolean }> = [];

    activePlan.plan.stages.forEach((stage: any, sIdx: number) => {
      const stageTasks = stage.tasks || [];
      const stageDuration = Math.max(1, (stage.endDay ?? 0) - (stage.startDay ?? 0));
      stageTasks.forEach((taskStr: string, tIdx: number) => {
        const dayOffset = (stage.startDay ?? 0) + Math.floor((tIdx / Math.max(1, stageTasks.length)) * stageDuration);
        const taskId = `task_${cropLower}_${sIdx}_${tIdx}_${dayOffset}`;
        const legacyId = `s${sIdx}_t${tIdx}`;
        const done = !!(completedMap[taskId] || completedMap[legacyId]);
        result.push({ id: taskId, label: taskStr, done });
      });
    });

    return result;
  }, [activePlan]);

  const fetchActivePlan = useCallback(async () => {
    try {
      const res = await fetch(`/api/farming-plan/get-active?userKey=${encodeURIComponent(userKey)}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.plan) {
          setActivePlan(data);
          setPlanLoading(false);
          return;
        }
      }
      // Local storage fallback if API returned null or during offline/transition
      const local = localStorage.getItem(`agri_saved_plans_${userKey}`);
      if (local) {
        try {
          const parsed = JSON.parse(local);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const activeOne = parsed.find((p: any) => p.status === "active") || parsed[0];
            if (activeOne && activeOne.plan) {
              setActivePlan(activeOne);
              setPlanLoading(false);
              return;
            }
          }
        } catch {}
      }
      setActivePlan(null);
    } catch {
      setActivePlan(null);
    } finally {
      setPlanLoading(false);
    }
  }, [userKey]);

  useEffect(() => {
    fetchActivePlan();

    const handlePlanSync = () => {
      fetchActivePlan();
    };

    if (typeof window !== "undefined") {
      window.addEventListener("farming-plan-updated", handlePlanSync);
      window.addEventListener("focus", handlePlanSync);
      window.addEventListener("storage", handlePlanSync);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("farming-plan-updated", handlePlanSync);
        window.removeEventListener("focus", handlePlanSync);
        window.removeEventListener("storage", handlePlanSync);
      }
    };
  }, [fetchActivePlan]);

  // ── REAL AGRI TUTORIALS INTEGRATION ─────────────────────────────────────────
  const [tutorials, setTutorials] = useState<TutorialVideo[]>([]);
  const [tutorialsLoading, setTutorialsLoading] = useState(true);
  const [activeVideoModal, setActiveVideoModal] = useState<TutorialVideo | null>(null);

  useEffect(() => {
    const fetchTutorials = async () => {
      setTutorialsLoading(true);
      const query = preferredCropsList[0]
        ? `${preferredCropsList[0]} farming tutorial philippines`
        : "philippine agriculture farming tutorial guide";

      try {
        const res = await fetch("/api/tutorials/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query }),
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.videos) && data.videos.length > 0) {
            setTutorials(data.videos.slice(0, 3));
          }
        }
      } catch {} finally {
        setTutorialsLoading(false);
      }
    };
    fetchTutorials();
  }, [preferredCropsList[0]]);

  // ── REAL GROWNOX AI ASSISTANT STREAMING ──────────────────────────────────────
  const [aiQuestion, setAiQuestion] = useState("");
  const [chatMessages, setChatMessages] = useState<DashboardChatMessage[]>([]);
  const [aiConversationId, setAiConversationId] = useState<number | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages, isAiLoading]);

  const sendAiMessage = async (queryText: string) => {
    if (!queryText.trim() || isAiLoading) return;

    const userMessage: DashboardChatMessage = { role: "user", content: queryText.trim() };
    setChatMessages((prev) => [...prev, userMessage]);
    setAiQuestion("");
    setIsAiLoading(true);
    setAiError(null);

    try {
      let convId = aiConversationId;
      if (!convId) {
        const createRes = await fetch("/api/chat/conversations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: queryText.slice(0, 30) }),
        });
        if (!createRes.ok) throw new Error("Failed to initialize conversation");
        const convData = await createRes.json();
        convId = convData.id;
        setAiConversationId(convId);
      }

      // Add empty assistant placeholder
      setChatMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      const response = await fetch(`/api/chat/conversations/${convId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: queryText.trim(),
          context: {
            cityName: settings.cityName,
            provinceName: settings.provinceName,
            regionName: settings.regionName,
            preferredCrops: settings.preferredCrops,
            language: settings.language,
          },
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || "Failed to fetch response");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder("utf-8");

      if (!reader) throw new Error("Response body is not readable");

      let accumulated = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const rawData = line.slice(6).trim();
            if (!rawData) continue;
            try {
              const parsed = JSON.parse(rawData);
              if (parsed.error) {
                throw new Error(parsed.error);
              }
              if (parsed.content) {
                accumulated += parsed.content;
                setChatMessages((prev) => {
                  const updated = [...prev];
                  const lastIdx = updated.length - 1;
                  if (lastIdx >= 0 && updated[lastIdx].role === "assistant") {
                    updated[lastIdx] = { ...updated[lastIdx], content: accumulated };
                  }
                  return updated;
                });
              }
            } catch (e: any) {
              if (e.message && !e.message.includes("JSON")) {
                throw e;
              }
            }
          }
        }
      }
    } catch (err: any) {
      setAiError(err.message || "Failed to send message");
      // Remove empty assistant placeholder if failed
      setChatMessages((prev) => prev.filter((m) => m.content !== ""));
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAskAi = (e: React.FormEvent) => {
    e.preventDefault();
    if (aiQuestion.trim()) {
      sendAiMessage(aiQuestion.trim());
    }
  };

  const handleChipClick = (question: string) => {
    sendAiMessage(question);
  };

  // ── REAL DA MARKET PRICES INTEGRATION ────────────────────────────────────────
  const [prices, setPrices] = useState<any[]>([]);
  const [pricesLoading, setPricesLoading] = useState(true);

  useEffect(() => {
    setPricesLoading(true);
    fetch(`/api/prices/latest?region=${encodeURIComponent(settings.regionName || "CARAGA")}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setPrices(data.slice(0, 4));
        } else {
          setPrices([]);
        }
      })
      .catch(() => {
        setPrices([]);
      })
      .finally(() => setPricesLoading(false));
  }, [settings.regionName]);

  // Weather fallback
  const weatherData = summary?.weather || {
    temperature: 29,
    condition: "Partly Cloudy",
    humidity: 68,
    windSpeed: 12,
    feelsLike: 32,
  };

  const userDisplayName = settings.userName || "Eduardo Ramos";
  const userLocation = location || settings.cityName || "Cabugao, Ilocos Sur";

  return (
    <div className="space-y-6 pb-12 font-sans text-stone-900 dark:text-stone-100">
      {/* 1. WELCOME HERO BANNER */}
      <section className="bg-card rounded-2xl border border-border/80 p-5 sm:p-6 shadow-xs flex flex-col lg:flex-row justify-between lg:items-center gap-6 relative overflow-hidden">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold text-[10px] sm:text-xs border border-primary/20 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              {isFil ? "AKTIBONG PANAHON NG PAG-AANI 2026" : "ACTIVE HARVEST SEASON 2026"}
            </span>
            <span className="text-muted-foreground text-xs">• {isFil ? `Istasyon ng ${userLocation}` : `${userLocation} Station`}</span>
          </div>

          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-foreground tracking-tight">
            {isFil ? `Maligayang pagbabalik, ${userDisplayName}` : `Welcome back, ${userDisplayName}`}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {isFil
              ? `Istasyon sa Sakahan ng ${userLocation} • Real-time na operasyon sa bukid, iskedyul ng pananim at kalagayan ng panahon`
              : `${userLocation} Farm Station • Real-time farm operations, crop schedule & local field conditions`}
          </p>
        </div>

        {/* Quick Action Cluster */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            asChild
            size="sm"
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-xl shadow-xs"
          >
            <Link href="/chat">
              <GrownoxIcon className="h-4 w-4 mr-1.5" />
              {isFil ? "Buksan ang AI Assistant" : "Open AI Assistant"}
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="sm"
            className="text-xs font-semibold rounded-xl bg-background hover:bg-muted border-border"
          >
            <Link href="/farming-plan">
              <Plus className="h-4 w-4 mr-1.5 text-primary" />
              {t.newFarmPlan}
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="sm"
            className="text-xs font-semibold rounded-xl bg-background hover:bg-muted border-border"
          >
            <Link href="/farming-plan">
              <Calendar className="h-4 w-4 mr-1.5 text-amber-600" />
              {t.logTask}
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="sm"
            className="text-xs font-semibold rounded-xl bg-muted/60 text-primary hover:bg-muted border-border"
          >
            <Link href="/market">
              <TrendingUp className="h-4 w-4 mr-1.5" />
              {t.viewMarket}
            </Link>
          </Button>
        </div>
      </section>

      {/* DISASTER ALERTS IF ACTIVE */}
      <DisasterAlertsSection location={location} compact={true} />

      {/* 2. FARM OVERVIEW KPI CARDS (4-Column Grid) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Registered Crops */}
        <div className="bg-card rounded-2xl border border-border/80 p-4 sm:p-5 shadow-xs flex flex-col justify-between hover:border-primary/50 transition-all">
          <div className="flex items-start justify-between">
            <span className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Sprout className="h-5 w-5" />
            </span>
            <Badge className="bg-emerald-600 text-white text-[10px] font-bold">
              {preferredCropsList.length > 0 ? t.optimalHealth : t.noCropsBadge}
            </Badge>
          </div>
          <div className="mt-4">
            <p className="text-xl sm:text-2xl font-black text-foreground">
              {preferredCropsList.length} {t.activeCrops}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              {preferredCropsList.length > 0
                ? preferredCropsList.join(", ")
                : t.noCropsSelected}
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-border/60 flex items-center justify-between text-xs font-semibold">
            <span className="text-muted-foreground">{t.myCropsList}</span>
            <Link href="/crops" className="text-primary hover:underline flex items-center gap-1">
              <span>{t.view}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* KPI 2: Farm Plans */}
        <div className="bg-card rounded-2xl border border-border/80 p-4 sm:p-5 shadow-xs flex flex-col justify-between hover:border-primary/50 transition-all">
          <div className="flex items-start justify-between">
            <span className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
              <ClipboardList className="h-5 w-5" />
            </span>
            <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[10px] font-bold">
              {activePlan ? t.activePlanCount : t.noActivePlanCount}
            </Badge>
          </div>
          <div className="mt-4">
            <p className="text-xl sm:text-2xl font-black text-foreground">
              {activePlan ? activePlan.name : t.farmPlans}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              {activePlan ? `Crop: ${activePlan.crop} • Stage: ${currentStageName}` : t.createCustomPlan}
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-border/60 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{t.progress}: {overallPlanProgress}%</span>
            <span className="text-emerald-600 font-bold">{activePlan ? t.active : t.ready}</span>
          </div>
        </div>

        {/* KPI 3: Upcoming Tasks */}
        <div className="bg-card rounded-2xl border border-border/80 p-4 sm:p-5 shadow-xs flex flex-col justify-between hover:border-primary/50 transition-all">
          <div className="flex items-start justify-between">
            <span className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-600">
              <Clock className="h-5 w-5" />
            </span>
            <Badge className="bg-rose-500/10 text-rose-700 dark:text-rose-400 text-[10px] font-bold">
              {tasks.filter((tItem) => !tItem.done).length} {t.pendingTasksCount}
            </Badge>
          </div>
          <div className="mt-4">
            <p className="text-xl sm:text-2xl font-black text-foreground">{t.upcomingTasks}</p>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              {tasks.length > 0
                ? tasks.filter((tItem) => !tItem.done).map((tItem) => tItem.label).join(", ") || t.allTasksCompleted
                : t.noActiveTasksQueued}
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-border/60 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {tasks.filter((tItem) => !tItem.done).length > 0 ? t.pendingSchedule : t.upToDate}
            </span>
            <span className="text-rose-600 font-bold">{t.priority}</span>
          </div>
        </div>

        {/* KPI 4: Field Weather Weather Station */}
        <div className="bg-card rounded-2xl border border-border/80 p-4 sm:p-5 shadow-xs flex flex-col justify-between hover:border-primary/50 transition-all">
          <div className="flex items-start justify-between">
            <span className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-600">
              <CloudSun className="h-5 w-5" />
            </span>
            <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">
              {isFil ? "MAGANDANG INDEKS NG PAG-SPRAY" : "GOOD SPRAY INDEX"}
            </Badge>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <p className="text-xl sm:text-2xl font-black text-foreground">{weatherData.temperature}°C</p>
              <span className="text-xs text-muted-foreground font-medium capitalize">{weatherData.condition}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {weatherData.humidity}% {isFil ? "Halumigmig" : "Humidity"} • {weatherData.windSpeed} km/h NE
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-border/60 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{userLocation}</span>
            <Link href="/weather" className="text-primary font-bold hover:underline">
              {isFil ? "Buong Panahon" : "Full Weather"}
            </Link>
          </div>
        </div>
      </section>

      {/* 3. MAIN TWO-COLUMN DASHBOARD GRID (8 Col Main + 4 Col Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT MAIN CONTENT COLUMN (8 of 12) */}
        <div className="lg:col-span-8 space-y-6">
          {/* SECTION A: MY REGISTERED CROPS */}
          <section className="bg-card rounded-2xl border border-border/80 p-4 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-foreground">
                  {isFil ? "Aking Nakarehistrong Pananim" : "My Registered Crops"}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {isFil
                    ? "Mga pananim na pinili sa onboarding/settings at naka-save sa iyong account"
                    : "Crops selected during onboarding/settings and saved to your account"}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs font-semibold rounded-xl border-border flex-1 sm:flex-none justify-center px-3"
                >
                  <Link href="/crops" className="inline-flex items-center">
                    <Filter className="h-3.5 w-3.5 mr-1 shrink-0" />
                    <span className="whitespace-nowrap">{isFil ? "Lahat ng Pananim" : "All Crops"}</span>
                  </Link>
                </Button>
                <Button
                  asChild
                  size="sm"
                  className="h-8 bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded-xl flex-1 sm:flex-none justify-center px-3"
                >
                  <Link href="/crops" className="inline-flex items-center">
                    <Plus className="h-3.5 w-3.5 mr-1 shrink-0" />
                    <span className="whitespace-nowrap">{isFil ? "Magdagdag / Baguhin" : "Add / Edit Crops"}</span>
                  </Link>
                </Button>
              </div>
            </div>

            {/* Crops Cards Bento Grid */}
            {preferredCropsList.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {preferredCropsList.map((cropName, idx) => {
                  const meta = phCropsMap[cropName.toLowerCase()] || {};
                  const localLabel = meta.localName ? ` (${meta.localName})` : "";
                  const category = meta.category || (isFil ? "Itinanim na Pananim" : "Cultivated Crop");

                  return (
                    <div
                      key={idx}
                      className="rounded-xl border border-border/80 bg-card p-3 flex flex-col justify-between hover:border-primary/70 transition-all shadow-xs"
                    >
                      <div>
                        <div className="relative w-full h-32 rounded-lg overflow-hidden mb-3 bg-muted">
                          <img
                            src={getCropImage(cropName)}
                            alt={cropName}
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-600 text-white">
                            {isFil ? "NAPAKAGANDANG KALUSUGAN" : "OPTIMAL HEALTH"}
                          </span>
                          <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/75 backdrop-blur text-white text-[10px] font-semibold">
                            {isFil ? "Napili" : "Selected"}
                          </span>
                        </div>

                        <h3 className="font-bold text-sm text-foreground">
                          {cropName}
                          <span className="text-xs font-normal text-muted-foreground">{localLabel}</span>
                        </h3>
                        <p className="text-[11px] text-muted-foreground">{category}</p>

                        <div className="mt-2 text-[11px] font-semibold text-muted-foreground flex justify-between">
                          <span>{isFil ? "Tagal ng Paglaki:" : "Growth Duration:"}</span>
                          <span className="font-bold text-primary">{meta.growthDurationDays || "90-120"} {isFil ? "Araw" : "Days"}</span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-muted rounded-full h-2 mt-1.5 overflow-hidden">
                          <div
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(100, 30 + idx * 20)}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-border/50 text-[11px]">
                        <p className="text-muted-foreground font-bold uppercase text-[9px] tracking-wider">
                          {isFil ? "Pangunahing Tala sa Agronomiya" : "Key Agronomic Note"}
                        </p>
                        <p className="font-medium text-foreground mt-0.5 line-clamp-2">
                          {meta.notes || (isFil ? "Tiyaking maayos ang patubig at daloy ng tubig sa bukid para sa mataas na ani." : "Ensure proper irrigation and field drainage for optimal yield.")}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center bg-muted/30 rounded-xl border border-dashed border-border space-y-3">
                <Sprout className="h-10 w-10 text-muted-foreground mx-auto" />
                <h3 className="text-sm font-bold text-foreground">
                  {isFil ? "Wala Pang Napiling Pananim" : "No Crops Selected Yet"}
                </h3>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  {isFil
                    ? "Wala ka pang napiling pananim sa onboarding. Piliin ang iyong mga pananim upang makita ang gabay, presyo, at iskedyul."
                    : "You haven't selected any crops during onboarding. Select your cultivated crops to see personalized guides, market prices, and schedules."}
                </p>
                <Button asChild size="sm" className="bg-primary text-white font-bold text-xs rounded-xl">
                  <Link href="/crops">
                    <Plus className="h-4 w-4 mr-1.5" />
                    {isFil ? "Piliin ang Iyong Pananim" : "Select Your Crops"}
                  </Link>
                </Button>
              </div>
            )}

            {/* Section Footer */}
            <div className="pt-3 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
              <span>{isFil ? `Ipinapakita ang mga pananim na pinili ni ${userDisplayName}.` : `Displaying crops selected by ${userDisplayName}.`}</span>
              <Link href="/crops" className="font-bold text-primary hover:underline flex items-center gap-1">
                <span>{isFil ? "Tingnan ang Buong Katalogo ng Pananim" : "View Full Philippine Crop Catalog"}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </section>

          {/* SECTION B: FARM PLANNER OVERVIEW CARD (REDESIGNED SIMPLE PROGRESS OVERVIEW) */}
          <section className="bg-card rounded-2xl border border-border p-4 sm:p-6 shadow-xs space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base sm:text-lg font-bold text-foreground">
                      {isFil ? "Tagaplano ng Sakahan" : "Farm Planner"}
                    </h2>
                    {activePlan && (
                      <Badge className="bg-primary/15 text-primary border border-primary/20 text-xs font-bold">
                        {getCropEmoji(activePlan.crop)} {activePlan.crop}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {activePlan
                      ? `${activePlan.name || `${activePlan.crop} Plan`} • ${isFil ? "Aktibong pangkalahatang progreso" : "Active progress overview"}`
                      : (isFil ? "Pangkalahatang-ideya sa iskedyul ng pananim at pagsubaybay sa gawain." : "Crop schedule and task tracking overview.")}
                  </p>
                </div>
              </div>

              {activePlan && (
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="text-xs font-bold border-primary text-primary hover:bg-primary/10 cursor-pointer h-8 px-3 rounded-xl self-start sm:self-auto"
                >
                  <Link href={`/farming-plan?planId=${encodeURIComponent(String(activePlan.id))}`}>
                    <Calendar className="h-3.5 w-3.5 mr-1.5" />
                    <span>{isFil ? "Buksan ang Tagaplano" : "Open Farm Planner"}</span>
                  </Link>
                </Button>
              )}
            </div>

            {planLoading ? (
              <div className="p-6 space-y-3">
                <Skeleton className="h-16 w-full rounded-xl" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            ) : activePlan ? (
              <Link
                href={`/farming-plan?planId=${encodeURIComponent(String(activePlan.id))}`}
                className="block group rounded-xl border border-border/80 bg-background hover:border-primary/60 hover:shadow-xs transition-all p-4 sm:p-5 space-y-4 cursor-pointer"
                title="Click to open this plan in Farm Planner"
              >
                {/* Metrics Overview Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* 1. Current Crop */}
                  <div className="p-3 rounded-xl bg-muted/40 border border-border/60 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-background border border-border flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition-transform">
                      {getCropEmoji(activePlan.crop)}
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                        {isFil ? "Kasalukuyang Pananim" : "Current Crop"}
                      </span>
                      <span className="text-sm sm:text-base font-extrabold text-foreground truncate block group-hover:text-primary transition-colors">
                        {activePlan.crop}
                      </span>
                    </div>
                  </div>

                  {/* 2. Planting Date */}
                  <div className="p-3 rounded-xl bg-muted/40 border border-border/60 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-background border border-border flex items-center justify-center text-primary shrink-0">
                      <Calendar className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                        {isFil ? "Petsa ng Pagtatanim" : "Planting Date"}
                      </span>
                      <span className="text-sm sm:text-base font-extrabold text-foreground truncate block">
                        {formatPlantingDate(activePlan.plantingDate)}
                      </span>
                    </div>
                  </div>

                  {/* 3. Tasks Completed */}
                  <div className="p-3 rounded-xl bg-muted/40 border border-border/60 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-background border border-border flex items-center justify-center text-emerald-600 shrink-0">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                        {isFil ? "Natapos na Gawain" : "Tasks Completed"}
                      </span>
                      <span className="text-sm sm:text-base font-extrabold text-foreground truncate block">
                        {taskStats.completedTasks}/{taskStats.totalTasks}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 5. Overall Progress (Percentage + Progress Bar) */}
                <div className="p-3.5 rounded-xl bg-card border border-border/70 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-foreground flex items-center gap-1.5">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      {isFil ? "Pangkalahatang Progreso" : "Overall Progress"}
                    </span>
                    <span className="font-extrabold text-primary text-sm">
                      {taskStats.progressPercent}%
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden p-0.5 border border-border/40">
                    <div
                      className="bg-primary h-1.5 rounded-full transition-all duration-500 shadow-xs"
                      style={{ width: `${Math.max(taskStats.progressPercent > 0 ? 3 : 0, taskStats.progressPercent)}%` }}
                    />
                  </div>
                </div>

                {/* Card Click Footnote */}
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                  <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-medium text-[11px]">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    {t.synchronizedPlanner}
                  </span>
                  <span className="font-semibold text-primary group-hover:underline flex items-center gap-1 text-[11px]">
                    {t.openInFarmPlanner}
                    <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </Link>
            ) : (
              /* CLEAN EMPTY STATE: "No active farm plan" */
              <div className="p-8 sm:p-10 text-center bg-muted/20 rounded-xl border border-dashed border-border/80 space-y-3.5">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                  <Sprout className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-1 max-w-md mx-auto">
                  <h3 className="text-base font-bold text-foreground">{t.noActiveFarmPlanTitle}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {t.noActiveFarmPlanDesc}
                  </p>
                </div>
                <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-xl shadow-xs px-5">
                  <Link href="/farming-plan">
                    <Plus className="h-4 w-4 mr-1.5" />
                    {t.openFarmPlanner}
                  </Link>
                </Button>
              </div>
            )}
          </section>

          {/* SECTION C: AGRI TUTORIALS SECTION */}
          <section className="bg-card rounded-2xl border border-border/80 p-4 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-foreground">{t.recommendedTutorials}</h2>
                <p className="text-xs text-muted-foreground">
                  {t.recommendedTutorialsSub}
                </p>
              </div>
              <Link href="/tutorials" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                <span>{t.viewAllTutorials}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {tutorialsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-48 w-full rounded-xl" />
                ))}
              </div>
            ) : tutorials.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {tutorials.map((video) => (
                  <div
                    key={video.id}
                    onClick={() => setActiveVideoModal(video)}
                    className="rounded-xl border border-border/80 bg-card overflow-hidden flex flex-col justify-between hover:border-primary/70 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="relative h-28 bg-zinc-900 overflow-hidden shrink-0">
                      <img
                        src={video.thumbnailUrl}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
                        <Play className="h-8 w-8 text-white fill-white drop-shadow-md" />
                      </div>
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 backdrop-blur text-emerald-400 text-[9px] font-bold border border-emerald-500/30">
                        {video.channelTitle || "Agri Video"}
                      </span>
                    </div>
                    <div className="p-3 flex-1 flex flex-col justify-between gap-2.5">
                      <div>
                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">
                          TUTORIAL
                        </span>
                        <h4 className="font-bold text-xs text-foreground mt-1 line-clamp-2 group-hover:text-primary transition-colors">
                          {video.title}
                        </h4>
                        <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">
                          {video.description || "Learn best agricultural management practices."}
                        </p>
                      </div>

                      <div className="pt-1 flex items-center justify-between text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1 text-primary font-bold">
                          <PlayCircle className="h-3.5 w-3.5" /> {t.watchTutorial}
                        </span>
                        <span className="text-xs text-muted-foreground">Video</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-4">
                {isFil ? "Walang nahanap na tutorial video para sa paghahanap na ito. Tingnan ang aming buong library sa pahina ng Mga Tutorial." : "No tutorial videos found for this search. Explore our full library on the Tutorials page."}
              </p>
            )}
          </section>
        </div>

        {/* RIGHT SIDEBAR COLUMN (4 of 12) */}
        <aside className="lg:col-span-4 space-y-6">
          {/* CARD 1: GROWNOX AI ASSISTANT WIDGET */}
          <section className="bg-card rounded-2xl border border-border/80 p-4 sm:p-5 shadow-xs relative overflow-hidden space-y-4">
            <div className="flex items-center gap-3">
              <GrownoxAiAvatar size="md" showOnlineStatus={true} statusOnline={true} />
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm text-[#26332A] dark:text-foreground">Grownox</h3>
                  <span className="px-1.5 py-0.5 rounded-full bg-[#DCFCE7] text-[#15803D] text-[10px] font-bold uppercase tracking-wider">
                    {t.daEngine}
                  </span>
                </div>
                <p className="text-xs text-[#2E7D32] font-semibold flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#43A047] inline-block animate-pulse"></span>
                  {t.aiAssistantOnline}
                </p>
              </div>
            </div>

            {/* Conversation Thread / Messages */}
            {chatMessages.length > 0 ? (
              <div
                ref={chatScrollRef}
                className="max-h-60 overflow-y-auto space-y-2.5 p-2 rounded-xl bg-[#F8FAF7] dark:bg-muted/30 border border-[#DDE5DE] dark:border-border text-xs"
              >
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-1.5 ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {msg.role === "assistant" && (
                      <GrownoxAiAvatar size="xs" className="mt-0.5 shrink-0" />
                    )}
                    <div
                      className={`p-2.5 rounded-2xl max-w-[88%] leading-relaxed text-xs break-words shadow-2xs ${
                        msg.role === "user"
                          ? "bg-[#2E7D32] text-white rounded-tr-xs font-normal"
                          : "bg-white dark:bg-card border border-[#DDE5DE] dark:border-border text-[#26332A] dark:text-foreground rounded-tl-xs"
                      }`}
                    >
                      {msg.content || (
                        <span className="inline-flex items-center gap-1.5 text-[#6B756D]">
                          <Loader2 className="h-3 w-3 animate-spin text-[#2E7D32]" />
                          {t.aiAnalyzingFields}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#6B756D] leading-relaxed">
                {t.aiCardDefaultPrompt}
              </p>
            )}

            {aiError && (
              <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 text-[11px] flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{aiError}</span>
              </div>
            )}

            {/* Quick Suggestion Chips */}
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold text-[#6B756D] uppercase tracking-wider">{t.quickInquiries}</p>
              <div className="flex flex-wrap gap-1.5">
                {[
                  t.identifyRiceBlast,
                  t.onionFertilizerRate,
                  t.nextSprayWindow,
                ].map((chip, i) => (
                  <button
                    key={i}
                    type="button"
                    disabled={isAiLoading}
                    onClick={() => handleChipClick(chip)}
                    className="text-left px-2.5 py-1.5 rounded-lg bg-[#F0F4F1] dark:bg-muted/60 text-[#26332A] dark:text-foreground border border-[#DDE5DE] dark:border-border text-xs font-medium hover:bg-[#E8F5E9] hover:text-[#166534] transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    <Search className="h-3 w-3 text-[#2E7D32] shrink-0" />
                    <span>{chip}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Message Form */}
            <form onSubmit={handleAskAi} className="rounded-xl border border-[#DDE5DE] dark:border-border bg-white dark:bg-card p-2 space-y-2 shadow-2xs">
              <Input
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                disabled={isAiLoading}
                placeholder={isFil ? "Magtanong tungkol sa iyong sakahan..." : "Ask agricultural question..."}
                className="bg-transparent border-0 text-xs text-[#26332A] dark:text-foreground placeholder:text-[#6B756D] focus-visible:ring-0 px-2 h-8"
              />
              <div className="flex items-center justify-between pt-1 border-t border-[#DDE5DE] dark:border-border/60">
                <span className="text-[#6B756D] p-1">
                  <ImageIcon className="h-4 w-4" />
                </span>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isAiLoading || !aiQuestion.trim()}
                  className="h-7 px-3 bg-[#2E7D32] hover:bg-[#1b5e20] text-white text-xs font-bold rounded-lg inline-flex items-center gap-1 shadow-2xs cursor-pointer"
                >
                  {isAiLoading ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <>
                      <span>{t.ask}</span>
                      <Send className="h-3 w-3" />
                    </>
                  )}
                </Button>
              </div>
            </form>

            <Button
              asChild
              variant="outline"
              className="w-full py-2 rounded-xl text-xs font-bold border-[#DDE5DE] dark:border-border text-[#166534] dark:text-emerald-400 hover:bg-[#E8F5E9] dark:hover:bg-muted cursor-pointer"
            >
              <Link href="/chat">{t.openFullAiChat}</Link>
            </Button>
          </section>

          {/* CARD 2: FIELD WEATHER STATION */}
          <section className="bg-card rounded-2xl border border-border/80 p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <div>
                <h3 className="font-bold text-sm text-foreground">{t.fieldWeatherStation}</h3>
                <p className="text-[11px] text-muted-foreground">{userLocation}</p>
              </div>
              <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <CloudSun className="h-4 w-4" />
              </span>
            </div>

            {/* Current Snapshot */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/80">
              <div className="flex items-center gap-3">
                <CloudSun className="h-9 w-9 text-primary shrink-0" />
                <div>
                  <p className="text-2xl font-black text-foreground leading-none">{weatherData.temperature}°C</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Feels like {weatherData.feelsLike || 32}°C • {weatherData.condition}
                  </p>
                </div>
              </div>
              <div className="text-right text-[11px] text-muted-foreground">
                <p>{t.humidity}: {weatherData.humidity}%</p>
                <p>{t.wind}: {weatherData.windSpeed} km/h</p>
              </div>
            </div>

            {/* Spraying Suitability Banner */}
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-foreground space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>{isFil ? "Indeks ng Pag-spray: NAPAKAGANDA" : "Spraying Suitability Index: EXCELLENT"}</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {isFil
                  ? "Mainam para sa pag-spray ng foliar/pataba ngayong 6:00 AM - 10:00 AM. Mahinang hangin at angkop na halumigmig."
                  : "Good for spraying foliar/fertilizer today between 6:00 AM - 10:00 AM. Gentle wind and optimal humidity."}
              </p>
            </div>

            {/* 3-Day Forecast Strip */}
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                {isFil ? "3-Araw na Pagtataya sa Agrikultura" : "3-Day Agricultural Outlook"}
              </p>

              {[
                { day: isFil ? "Bukas" : "Tomorrow", temp: "31°C / 24°C", rain: "10%", wind: "10 km/h" },
                { day: isFil ? "Sabado" : "Saturday", temp: "28°C / 23°C", rain: "65%", wind: "22 km/h" },
                { day: isFil ? "Linggo" : "Sunday", temp: "29°C / 23°C", rain: "25%", wind: "14 km/h" },
              ].map((fc, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-lg text-xs hover:bg-muted/50 border border-transparent transition-colors"
                >
                  <span className="font-semibold text-foreground w-16">{fc.day}</span>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <CloudSun className="h-3.5 w-3.5 text-amber-500" />
                    <span>{fc.temp}</span>
                  </div>
                  <span className={`font-semibold ${fc.rain.includes("65") ? "text-rose-600" : "text-emerald-600"}`}>
                    {isFil ? "Ulan: " : "Rain: "}{fc.rain}
                  </span>
                  <span className="text-muted-foreground">{fc.wind}</span>
                </div>
              ))}
            </div>

            <Button
              asChild
              variant="outline"
              className="w-full py-2 rounded-xl text-xs font-semibold border-border hover:bg-muted cursor-pointer"
            >
              <Link href="/weather">{isFil ? "Buksan ang Detalyadong Radar ng Panahon" : "Open Detailed Weather Radar"}</Link>
            </Button>
          </section>

          {/* CARD 3: LOCAL MARKET COMMODITY FEED */}
          <section className="bg-card rounded-2xl border border-border/80 p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <div>
                <h3 className="font-bold text-sm text-foreground">{t.commodityMarketplace}</h3>
                <p className="text-[11px] text-muted-foreground">DA Bantay Presyo Benchmark ({settings.regionName || "CARAGA"})</p>
              </div>
              <Badge className="bg-emerald-600 text-white text-[9px] font-bold">LIVE</Badge>
            </div>

            <div className="divide-y divide-border/60">
              {pricesLoading ? (
                <div className="py-4 space-y-2">
                  <Skeleton className="h-8 w-full rounded" />
                  <Skeleton className="h-8 w-full rounded" />
                </div>
              ) : prices.length > 0 ? (
                prices.map((p: any, idx: number) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-foreground">{p.commodity}</p>
                      <p className="text-[10px] text-muted-foreground">Market: {p.marketName || p.region}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-extrabold text-primary">
                        ₱{p.pricePhpKg}
                        <span className="text-[10px] text-muted-foreground">/kg</span>
                      </p>
                      <span
                        className={`text-[10px] font-bold ${
                          p.trend === "Increasing"
                            ? "text-rose-600"
                            : p.trend === "Decreasing"
                            ? "text-emerald-600"
                            : "text-muted-foreground"
                        }`}
                      >
                        {p.trend === "Increasing" ? t.increasing : p.trend === "Decreasing" ? t.decreasing : t.stable}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground text-center py-4">
                  {isFil ? `Walang available na presyo sa merkado para sa rehiyon ${settings.regionName || "napili"}.` : `No market prices available for region ${settings.regionName || "selected"}.`}
                </p>
              )}
            </div>

            <div className="p-3.5 rounded-xl bg-muted/50 border border-border/80 text-center space-y-2">
              <p className="text-xs text-muted-foreground">{isFil ? "May tuyong ani ka ba na handa na sa merkado?" : "Have dry harvest ready for market?"}</p>
              <Button
                asChild
                className="w-full py-2 rounded-xl bg-primary text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                <Link href="/market">
                  <Store className="h-4 w-4 mr-1.5" />
                  {isFil ? "Tingnan ang Merkado at Mag-post" : "View Market & Post Lot"}
                </Link>
              </Button>
            </div>
          </section>
        </aside>
      </div>

      {/* TUTORIAL VIDEO MODAL */}
      {activeVideoModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl space-y-3">
            <div className="flex items-center justify-between p-4 border-b border-border bg-muted/40">
              <div>
                <h3 className="font-bold text-sm sm:text-base text-foreground line-clamp-1">
                  {activeVideoModal.title}
                </h3>
                <p className="text-xs text-muted-foreground">{activeVideoModal.channelTitle}</p>
              </div>
              <button
                onClick={() => setActiveVideoModal(null)}
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="relative aspect-video w-full bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${activeVideoModal.id}?autoplay=1`}
                title={activeVideoModal.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              ></iframe>
            </div>

            <div className="p-4 pt-1 flex items-center justify-between">
              <p className="text-xs text-muted-foreground line-clamp-2 max-w-lg">
                {activeVideoModal.description}
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(activeVideoModal.videoUrl, "_blank")}
                className="text-xs font-bold rounded-xl"
              >
                {isFil ? "Buksan sa YouTube" : "Open in YouTube"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

