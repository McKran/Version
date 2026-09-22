import { useState, useEffect, useCallback, useMemo } from "react";
import { useSettings, getUserKey } from "@/hooks/use-settings";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import {
  Sprout, Calendar as CalendarIcon, MapPin, Loader2, AlertCircle, ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  Droplets, Bug, Wheat, Cloud, FlaskConical, Shield, Activity,
  TriangleAlert, Info, RefreshCw, ClipboardList, CheckCircle2,
  Clock, Zap, Leaf, ThermometerSun, CheckSquare, Square, Trash2, Plus,
  FolderKanban, AlertTriangle, ArrowRight, Sparkles
} from "lucide-react";

const BASE_URL = (import.meta.env.BASE_URL ?? "").replace(/\/+$/, "");

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

const CROP_EMOJIS: Record<string, string> = {
  rice: "🌾",
  maize: "🌽",
  corn: "🌽",
  tomato: "🍅",
  eggplant: "🍆",
  onion: "🧅",
  garlic: "🧄",
  cassava: "🥔",
  sweetpotato: "🍠",
  cabbage: "🥬",
  mango: "🥭",
  banana: "🍌",
  coconut: "🥥",
  sugarcane: "🎋",
  coffee: "☕",
  cacao: "🍫",
  peanut: "🥜",
  watermelon: "🍉",
};

function getCropEmoji(cropName: string): string {
  const lower = cropName.toLowerCase();
  for (const [key, emoji] of Object.entries(CROP_EMOJIS)) {
    if (lower.includes(key)) return emoji;
  }
  return "🌱";
}

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

export interface SavedPlanRecord {
  id: string;
  userKey: string;
  name: string;
  crop: string;
  plantingDate: string;
  status: "active" | "completed" | "archived";
  plan: FarmingPlan;
  completedTasks: Record<string, boolean>;
  createdAt: string;
  updatedAt: string;
}

interface CalendarScheduledTask {
  id: string;
  taskText: string;
  stageName: string;
  stageType: string;
  dayNumber: number;
  dateStr: string;
  priority: string;
  inputsNeeded?: string[];
  weatherNote?: string;
}

/* ─────────────────────────────────────────────────────────────────────────────
   DATE UTILITIES
   ───────────────────────────────────────────────────────────────────────────── */
function parseDateStr(dateStr: string): Date {
  if (!dateStr) return new Date();
  const parts = dateStr.split("-").map(Number);
  if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
    return new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0);
  }
  const fallback = new Date(dateStr);
  return isNaN(fallback.getTime()) ? new Date() : fallback;
}

function formatDateStr(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function addDaysToStr(dateStr: string, days: number): string {
  const d = parseDateStr(dateStr);
  d.setDate(d.getDate() + days);
  return formatDateStr(d);
}

function daysDiff(dateStrA: string, dateStrB: string): number {
  const a = parseDateStr(dateStrA);
  const b = parseDateStr(dateStrB);
  const diffMs = b.getTime() - a.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

function RiskBadge({ level, isFil }: { level: string; isFil?: boolean }) {
  if (level === "high") return <Badge className="bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 gap-1"><TriangleAlert className="h-3 w-3" /> {isFil ? "Mataas na Panganib" : "High Risk"}</Badge>;
  if (level === "medium") return <Badge className="bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 gap-1"><TriangleAlert className="h-3 w-3" /> {isFil ? "Katamtamang Panganib" : "Medium Risk"}</Badge>;
  return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 gap-1"><CheckCircle2 className="h-3 w-3" /> {isFil ? "Mababang Panganib" : "Low Risk"}</Badge>;
}

function PriorityDot({ priority }: { priority: string }) {
  if (priority === "critical") return <span className="h-2.5 w-2.5 rounded-full bg-rose-500 inline-block shrink-0" />;
  if (priority === "high") return <span className="h-2.5 w-2.5 rounded-full bg-amber-500 inline-block shrink-0" />;
  return <span className="h-2.5 w-2.5 rounded-full bg-blue-400 inline-block shrink-0" />;
}

function normalizePlanStages(stages: FarmingStage[]): FarmingStage[] {
  if (!stages || stages.length === 0) return [];
  const minStart = Math.min(...stages.map((s) => s.startDay));
  if (minStart < 0) {
    const shift = Math.abs(minStart);
    return stages.map((s) => ({
      ...s,
      startDay: s.startDay + shift,
      endDay: s.endDay + shift,
    }));
  }
  return stages;
}

function getPlanCurrentStage(plan: FarmingPlan, plantingDateStr: string, isFil?: boolean) {
  const pDateStr = plantingDateStr || formatDateStr(new Date());
  const todayStr = formatDateStr(new Date());
  const diffVal = daysDiff(pDateStr, todayStr);

  if (diffVal < 0) {
    const daysUntil = Math.abs(diffVal);
    return { name: isFil ? "Paparating" : "Upcoming", daysText: isFil ? `Magsisimula sa ${daysUntil} araw (${pDateStr})` : `Starts in ${daysUntil} day(s) (${pDateStr})` };
  }

  const currentDayNum = diffVal + 1; // Day 1 = planting start date
  if (diffVal > (plan.totalGrowingDays || 120)) {
    return { name: isFil ? "Tapos na ang Pag-ani" : "Harvest Completed", daysText: isFil ? `Araw ${currentDayNum} ng ${plan.totalGrowingDays}` : `Day ${currentDayNum} of ${plan.totalGrowingDays}` };
  }

  const stages = normalizePlanStages(plan.stages || []);
  const currentStage = stages.find((s) => diffVal >= s.startDay && diffVal <= s.endDay);

  if (currentStage) {
    const startDayNum = currentStage.startDay + 1;
    const endDayNum = currentStage.endDay + 1;
    return {
      name: currentStage.name,
      daysText: isFil ? `Araw ${currentDayNum} (Yugto Araw ${startDayNum}–${endDayNum})` : `Day ${currentDayNum} (Stage Days ${startDayNum}–${endDayNum})`,
    };
  }

  return { name: isFil ? "Ikot ng Pagtatanim" : "Growing Cycle", daysText: isFil ? `Araw ${currentDayNum}` : `Day ${currentDayNum}` };
}

function getPlanNextTask(plan: FarmingPlan, plantingDateStr: string, completedTasks: Record<string, boolean>, isFil?: boolean) {
  const pDateStr = plantingDateStr || formatDateStr(new Date());
  const todayStr = formatDateStr(new Date());
  const diffVal = Math.max(0, daysDiff(pDateStr, todayStr));

  let upcomingTask: { taskText: string; stageName: string; day: number } | null = null;
  const stages = normalizePlanStages(plan.stages || []);

  if (stages) {
    for (let sIdx = 0; sIdx < stages.length; sIdx++) {
      const stage = stages[sIdx];
      const stageDuration = Math.max(1, stage.endDay - stage.startDay);
      for (let tIdx = 0; tIdx < stage.tasks.length; tIdx++) {
        const taskText = stage.tasks[tIdx];
        const dayOffset = stage.startDay + Math.floor((tIdx / Math.max(1, stage.tasks.length)) * stageDuration);
        const taskId = `task_${plan.crop.toLowerCase()}_${sIdx}_${tIdx}_${dayOffset}`;
        if (!completedTasks[taskId] && !upcomingTask && dayOffset >= diffVal) {
          upcomingTask = { taskText, stageName: stage.name, day: dayOffset + 1 };
        }
      }
    }
  }

  if (!upcomingTask && stages.length) {
    for (let sIdx = 0; sIdx < stages.length; sIdx++) {
      const stage = stages[sIdx];
      for (let tIdx = 0; tIdx < stage.tasks.length; tIdx++) {
        const taskId = `task_${plan.crop.toLowerCase()}_${sIdx}_${tIdx}_${stage.startDay}`;
        if (!completedTasks[taskId]) {
          return { taskText: stage.tasks[tIdx], stageName: stage.name, day: stage.startDay + 1 };
        }
      }
    }
  }

  return upcomingTask || { taskText: isFil ? "Lahat ng nakatakdang gawain ay tapos na!" : "All scheduled activities completed!", stageName: isFil ? "Tapos Na" : "Complete", day: diffVal + 1 };
}

function StageCard({ stage, plantingDate, isFil }: { stage: FarmingStage; plantingDate: string; isFil?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const config = STAGE_TYPE_CONFIG[stage.type] ?? STAGE_TYPE_CONFIG.monitoring;
  const Icon = config.icon;
  const startDayNum = Math.max(0, stage.startDay) + 1;
  const endDayNum = Math.max(0, stage.endDay) + 1;
  const startDateStr = addDaysToStr(plantingDate, Math.max(0, stage.startDay));
  const endDateStr = addDaysToStr(plantingDate, Math.max(0, stage.endDay));
  const startDate = parseDateStr(startDateStr);
  const endDate = parseDateStr(endDateStr);
  const fmt = (d: Date) => d.toLocaleDateString(isFil ? "fil-PH" : "en-US", { month: "short", day: "numeric" });
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
            <span className={`text-xs font-medium ${config.color}`}>{isFil ? "Araw" : "Day"} {startDayNum}–{endDayNum}</span>
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
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{isFil ? "Mga Gawain" : "Tasks"}</div>
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
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{isFil ? "Mga Kailangang Gamit" : "Inputs Needed"}</div>
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

/* ─────────────────────────────────────────────────────────────────────────────
   CALENDAR COMPONENT
   ───────────────────────────────────────────────────────────────────────────── */
function CalendarInterface({
  plan,
  completedTasks,
  onToggleTask,
  onCompleteDay,
  isFil,
}: {
  plan: FarmingPlan;
  completedTasks: Record<string, boolean>;
  onToggleTask: (taskId: string) => void;
  onCompleteDay: (dateStr: string, taskIds: string[]) => void;
  isFil: boolean;
}) {
  const pDateStr = plan.plantingDate || formatDateStr(new Date());

  const normalizedStages = useMemo(() => normalizePlanStages(plan.stages || []), [plan.stages]);

  // Index all tasks by date string (YYYY-MM-DD)
  const taskCalendar = useMemo(() => {
    const calendar: Record<string, CalendarScheduledTask[]> = {};

    normalizedStages.forEach((stage, sIdx) => {
      const stageDuration = Math.max(1, stage.endDay - stage.startDay);
      stage.tasks.forEach((taskText, tIdx) => {
        const dayOffset = stage.startDay + Math.floor((tIdx / Math.max(1, stage.tasks.length)) * stageDuration);
        const dateStr = addDaysToStr(pDateStr, dayOffset);
        const taskId = `task_${plan.crop.toLowerCase()}_${sIdx}_${tIdx}_${dayOffset}`;

        if (!calendar[dateStr]) calendar[dateStr] = [];
        calendar[dateStr].push({
          id: taskId,
          taskText,
          stageName: stage.name,
          stageType: stage.type,
          dayNumber: dayOffset + 1, // Day 1 on planting start date
          dateStr,
          priority: stage.priority,
          inputsNeeded: stage.inputsNeeded,
          weatherNote: stage.weatherConsiderations,
        });
      });
    });

    return calendar;
  }, [plan, pDateStr, normalizedStages]);

  // Today string
  const todayStr = useMemo(() => formatDateStr(new Date()), []);

  // Selected date state defaulting to plan planting date
  const [selectedDateStr, setSelectedDateStr] = useState<string>(() => pDateStr);

  // Current view month (Date set to 1st of month)
  const [viewMonth, setViewMonth] = useState<Date>(() => {
    const selDate = parseDateStr(pDateStr);
    return new Date(selDate.getFullYear(), selDate.getMonth(), 1, 12, 0, 0);
  });

  // Sync selected date and view month whenever plan or planting date changes
  useEffect(() => {
    if (pDateStr) {
      setSelectedDateStr(pDateStr);
      const selDate = parseDateStr(pDateStr);
      setViewMonth(new Date(selDate.getFullYear(), selDate.getMonth(), 1, 12, 0, 0));
    }
  }, [plan.crop, pDateStr]);

  // When selected date changes, ensure month view aligns if user selects a day in another month
  const handleSelectDate = (dateStr: string) => {
    setSelectedDateStr(dateStr);
    const sel = parseDateStr(dateStr);
    if (sel.getFullYear() !== viewMonth.getFullYear() || sel.getMonth() !== viewMonth.getMonth()) {
      setViewMonth(new Date(sel.getFullYear(), sel.getMonth(), 1, 12, 0, 0));
    }
  };

  // Month navigation handlers
  const handlePrevMonth = () => {
    setViewMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1, 12, 0, 0));
  };

  const handleNextMonth = () => {
    setViewMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1, 12, 0, 0));
  };

  const handleTodayClick = () => {
    handleSelectDate(todayStr);
  };

  // Month Grid Calculation
  const calendarCells = useMemo(() => {
    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();

    const firstDayIndex = new Date(year, month, 1, 12, 0, 0).getDay(); // 0 (Sun) - 6 (Sat)
    const daysInMonth = new Date(year, month + 1, 0, 12, 0, 0).getDate();
    const prevMonthLastDay = new Date(year, month, 0, 12, 0, 0).getDate();

    const cells: Array<{
      dateStr: string;
      dayNumber: number;
      isCurrentMonth: boolean;
    }> = [];

    // Prev month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = prevMonthLastDay - i;
      const d = new Date(year, month - 1, dayNum, 12, 0, 0);
      cells.push({
        dateStr: formatDateStr(d),
        dayNumber: dayNum,
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(year, month, d, 12, 0, 0);
      cells.push({
        dateStr: formatDateStr(dateObj),
        dayNumber: d,
        isCurrentMonth: true,
      });
    }

    // Next month padding to fill row
    const remainder = 7 - (cells.length % 7);
    if (remainder < 7) {
      for (let d = 1; d <= remainder; d++) {
        const dateObj = new Date(year, month + 1, d, 12, 0, 0);
        cells.push({
          dateStr: formatDateStr(dateObj),
          dayNumber: d,
          isCurrentMonth: false,
        });
      }
    }

    return cells;
  }, [viewMonth]);

  // Selected date's tasks
  const selectedTasks = taskCalendar[selectedDateStr] || [];
  const selectedDateObj = parseDateStr(selectedDateStr);
  const selectedDateDiff = daysDiff(pDateStr, selectedDateStr);
  const isSelectedBeforePlanting = selectedDateDiff < 0;
  const selectedDayNumber = selectedDateDiff + 1;
  const formattedSelectedDate = selectedDateObj.toLocaleDateString(isFil ? "fil-PH" : "en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }) + (isSelectedBeforePlanting ? "" : ` (${isFil ? "Araw" : "Day"} ${selectedDayNumber})`);

  // Is selected date completed?
  const isSelectedDateCompleted = useMemo(() => {
    if (completedTasks[`day_${selectedDateStr}`]) return true;
    if (selectedTasks.length > 0) {
      return selectedTasks.every(t => !!completedTasks[t.id]);
    }
    return false;
  }, [completedTasks, selectedDateStr, selectedTasks]);

  // Find next scheduled day with tasks or next date
  const handleCompleteAndAdvance = () => {
    // 1. Mark tasks on current selected date completed
    const taskIds = selectedTasks.map(t => t.id);
    onCompleteDay(selectedDateStr, taskIds);

    // 2. Find next date with tasks or next consecutive day
    const allTaskDates = Object.keys(taskCalendar).sort();
    const futureTaskDates = allTaskDates.filter(d => d > selectedDateStr);

    let nextDateStr = "";
    if (futureTaskDates.length > 0) {
      nextDateStr = futureTaskDates[0];
    } else {
      nextDateStr = addDaysToStr(selectedDateStr, 1);
    }

    // 3. Move user to next day
    handleSelectDate(nextDateStr);
  };

  const handleJustAdvanceNext = () => {
    const allTaskDates = Object.keys(taskCalendar).sort();
    const futureTaskDates = allTaskDates.filter(d => d > selectedDateStr);

    let nextDateStr = "";
    if (futureTaskDates.length > 0) {
      nextDateStr = futureTaskDates[0];
    } else {
      nextDateStr = addDaysToStr(selectedDateStr, 1);
    }

    handleSelectDate(nextDateStr);
  };

  const handleGoPrevDay = () => {
    const prevDateStr = addDaysToStr(selectedDateStr, -1);
    handleSelectDate(prevDateStr);
  };

  // Overall Task Completion Stats
  const totalTasksCount = Object.values(taskCalendar).reduce((acc, list) => acc + list.length, 0);
  const completedTasksCount = Object.values(taskCalendar)
    .flat()
    .filter(t => !!completedTasks[t.id]).length;
  const progressPercent = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  // Day names for grid headers
  const dayHeaders = isFil
    ? ["Ling", "Lun", "Mar", "Mye", "Hwe", "Biy", "Sab"]
    : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="space-y-6">
      {/* Calendar Header Stats */}
      <div className="bg-card border rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-800 dark:text-emerald-400 shrink-0">
            <CalendarIcon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-bold text-base text-foreground">
              {isFil ? "Iskedyul sa Kalendaryo ng Pagsasaka" : "Planting Calendar & Daily Schedule"}
            </h2>
            <p className="text-xs text-muted-foreground">
              {isFil
                ? "Bawat araw ay may nakatakdang gawain batay sa petsa ng pagtatanim. Tapusin ang mga gawain para umusad sa susunod na araw."
                : "Real date-based calendar with daily farming tasks. Complete each day's tasks to advance your progress."}
            </p>
          </div>
        </div>

        {/* Task Completion Progress */}
        <div className="w-full sm:w-auto min-w-[220px] bg-muted/40 p-3 rounded-xl border flex flex-col justify-center">
          <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
            <span className="text-muted-foreground">{isFil ? "Natapos na Gawain" : "Total Task Progress"}</span>
            <span className="text-emerald-800 dark:text-emerald-400 font-bold">{completedTasksCount} / {totalTasksCount} ({progressPercent}%)</span>
          </div>
          <div className="h-2 w-full bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-600 transition-all duration-500" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      </div>

      {/* Real Month Calendar Container */}
      <div className="bg-card border rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        {/* Month Navigation Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-lg font-black text-foreground min-w-[140px]">
              {viewMonth.toLocaleDateString(isFil ? "fil-PH" : "en-US", { month: "long", year: "numeric" })}
            </h3>
            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleSelectDate(pDateStr)}
                className="text-xs font-bold gap-1 bg-amber-50 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800 hover:bg-amber-100"
                title={isFil ? "Pumunta sa Petsa ng Pagtatanim" : "Jump to Planting Date"}
              >
                <Sprout className="h-3.5 w-3.5 text-emerald-600" />
                <span>{isFil ? "Pagtatanim" : "Planting Date"}</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleTodayClick}
                className="text-xs font-bold gap-1 bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800 hover:bg-emerald-100"
              >
                <CalendarIcon className="h-3.5 w-3.5" />
                <span>{isFil ? "Ngayon" : "Today"}</span>
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handlePrevMonth}
              title={isFil ? "Nakaraang Buwan" : "Previous Month"}
              className="h-8 w-8 rounded-lg"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleNextMonth}
              title={isFil ? "Susunod na Buwan" : "Next Month"}
              className="h-8 w-8 rounded-lg"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center flex-wrap gap-3 text-[11px] text-muted-foreground pt-1">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-md bg-stone-200 dark:bg-stone-700 border border-stone-400 flex items-center justify-center text-[9px] text-stone-700 dark:text-stone-300">✓</span>
            <span>{isFil ? "Tapos Na (Gray)" : "Completed Day (Gray)"}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-md border-2 border-amber-500 bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-[9px]">🌱</span>
            <span>{isFil ? "Pagtatanim (Start)" : "Planting Start Date"}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-md border-2 border-emerald-600 bg-emerald-600 text-white flex items-center justify-center text-[8px] font-bold">●</span>
            <span>{isFil ? "Piniling Petsa" : "Selected Date"}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <span>{isFil ? "May Gawain" : "Scheduled Task"}</span>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="w-full">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-muted-foreground mb-1">
            {dayHeaders.map((dh, i) => (
              <div key={i} className="py-1">
                {dh}
              </div>
            ))}
          </div>

          {/* Day Cells */}
          <div className="grid grid-cols-7 gap-1">
            {calendarCells.map((cell) => {
              const tasksOnCell = taskCalendar[cell.dateStr] || [];
              const hasTasks = tasksOnCell.length > 0;
              const isSelected = cell.dateStr === selectedDateStr;
              const isToday = cell.dateStr === todayStr;
              const isPlantingDate = cell.dateStr === pDateStr;
              const cellDateDiff = daysDiff(pDateStr, cell.dateStr);
              const isCellBeforeStart = cellDateDiff < 0;
              const isDayDone = !isCellBeforeStart && (!!completedTasks[`day_${cell.dateStr}`] || (hasTasks && tasksOnCell.every(t => !!completedTasks[t.id])));

              return (
                <button
                  key={cell.dateStr}
                  type="button"
                  onClick={() => handleSelectDate(cell.dateStr)}
                  className={`relative flex flex-col items-center justify-between min-h-[52px] sm:min-h-[60px] p-1.5 rounded-xl border transition-all text-center select-none ${
                    isSelected
                      ? "bg-emerald-800 text-white border-emerald-800 font-bold shadow-md ring-2 ring-emerald-500/40 z-10"
                      : isDayDone
                      ? "bg-stone-200/80 dark:bg-stone-800/80 text-stone-500 dark:text-stone-400 border-stone-300/80 dark:border-stone-700/80"
                      : isPlantingDate
                      ? "bg-amber-50/90 dark:bg-amber-950/40 border-2 border-amber-500 text-amber-950 dark:text-amber-100 font-bold"
                      : isToday
                      ? "bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-500 text-emerald-950 dark:text-emerald-100 font-extrabold"
                      : cell.isCurrentMonth
                      ? "bg-card hover:bg-muted/40 border-border/60 text-foreground"
                      : "bg-muted/10 border-border/30 text-muted-foreground/40"
                  }`}
                >
                  {/* Top Bar: Date number + Day badge */}
                  <div className="flex items-center justify-between w-full px-0.5">
                    <span className={`text-xs sm:text-sm ${isSelected ? "font-black" : isToday || isPlantingDate ? "font-bold text-emerald-700 dark:text-emerald-400" : "font-semibold"}`}>
                      {cell.dayNumber}
                    </span>
                    {isPlantingDate && !isSelected ? (
                      <span className="text-[9px] bg-amber-500 text-white font-bold px-1 rounded flex items-center gap-0.5">
                        🌱 <span className="hidden sm:inline">{isFil ? "Tanim" : "Start"}</span>
                      </span>
                    ) : isToday && !isSelected ? (
                      <span className="hidden sm:inline-block text-[9px] bg-emerald-600 text-white font-bold px-1 rounded">
                        {isFil ? "Ngayon" : "Today"}
                      </span>
                    ) : null}
                  </div>

                  {/* Middle / Bottom State Indicators */}
                  <div className="mt-1 flex items-center justify-center gap-1 flex-wrap">
                    {isDayDone ? (
                      <div
                        title="Completed day"
                        className={`flex items-center gap-0.5 px-1 rounded text-[10px] font-bold ${
                          isSelected ? "bg-emerald-900 text-white" : "bg-stone-300 dark:bg-stone-700 text-stone-700 dark:text-stone-300"
                        }`}
                      >
                        <CheckCircle2 className="h-3 w-3 shrink-0" />
                        <span className="hidden sm:inline">{isFil ? "Tapos" : "Done"}</span>
                      </div>
                    ) : hasTasks ? (
                      <div className="flex items-center gap-1">
                        <span
                          className={`h-2 w-2 rounded-full ${isSelected ? "bg-amber-300" : "bg-emerald-600 dark:bg-emerald-400 animate-pulse"}`}
                          title={`${tasksOnCell.length} task(s)`}
                        />
                        <span className={`text-[10px] font-bold ${isSelected ? "text-emerald-100" : "text-emerald-700 dark:text-emerald-400"}`}>
                          {tasksOnCell.length}
                        </span>
                      </div>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Daily Scheduled Activities Panel */}
      <div
        className={`border rounded-2xl p-5 shadow-xs space-y-4 transition-all ${
          isSelectedDateCompleted
            ? "bg-stone-100/90 dark:bg-stone-900/60 border-stone-300 dark:border-stone-800"
            : "bg-card border-border"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                {selectedDateStr === todayStr ? (isFil ? "Mga Gawain Ngayong Araw" : "Today's Tasks") : (isFil ? "Mga Gawain sa Petsang Ito" : "Scheduled Date Tasks")}
              </span>
              {isSelectedDateCompleted && (
                <Badge className="bg-stone-500 text-white font-bold text-[10px] gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  {isFil ? "Araw na Naitala Bilang Tapos Na" : "Day Marked Completed"}
                </Badge>
              )}
            </div>

            <h3 className={`text-lg sm:text-xl font-bold mt-0.5 ${isSelectedDateCompleted ? "text-stone-600 dark:text-stone-400" : "text-foreground"}`}>
              {formattedSelectedDate}
            </h3>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {selectedTasks.length > 0 && (
              <Badge variant="outline" className={`font-semibold ${isSelectedDateCompleted ? "bg-stone-200 text-stone-700 border-stone-400" : "bg-emerald-50 text-emerald-800 border-emerald-200"}`}>
                {selectedTasks.filter(t => !!completedTasks[t.id]).length} / {selectedTasks.length} {isFil ? "Tapos Na" : "Tasks Completed"}
              </Badge>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleGoPrevDay}
              className="text-xs font-semibold gap-1"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>{isFil ? "Nakaraang Araw" : "Prev Day"}</span>
            </Button>
          </div>
        </div>

        {/* Tasks List */}
        {selectedTasks.length === 0 ? (
          isSelectedBeforePlanting ? (
            <div className="text-center py-8 px-4 bg-amber-50/60 dark:bg-amber-950/20 rounded-2xl border border-amber-200 dark:border-amber-900/40">
              <Sprout className="h-8 w-8 text-amber-600 dark:text-amber-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-amber-900 dark:text-amber-200">
                {isFil ? `Bago ang Petsa ng Pagtatanim (${pDateStr})` : `Before Selected Planting Date (${pDateStr})`}
              </p>
              <p className="text-xs text-amber-700/80 dark:text-amber-300/80 mt-1">
                {isFil
                  ? `Magsisimula ang mga nakatakdang gawain sa Araw 1 (${pDateStr}). Walang nakatalang gawain bago ang petsang ito.`
                  : `Planting plan activities start on Day 1 (${pDateStr}). No activities scheduled prior to this date.`}
              </p>
            </div>
          ) : (
            <div className="text-center py-10 px-4 bg-muted/20 rounded-2xl border border-dashed">
              <CheckCircle2 className="h-8 w-8 text-muted-foreground/60 mx-auto mb-2" />
              <p className="text-sm font-semibold text-muted-foreground">
                {isFil ? "Walang mga kritikal na gawain na nakatakda sa petsang ito." : "No major scheduled farming activities for this specific date."}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {isFil ? "Ipagpatuloy ang regular na pagsubaybay sa moisture ng lupa at kalusugan ng pananim." : "Continue standard routine monitoring of soil moisture and crop health."}
              </p>
            </div>
          )
        ) : (
          <div className="space-y-3">
            {selectedTasks.map(task => {
              const isTaskCompleted = !!completedTasks[task.id] || isSelectedDateCompleted;

              return (
                <div
                  key={task.id}
                  className={`flex items-start gap-3 p-4 rounded-xl border transition-all ${
                    isTaskCompleted
                      ? "bg-stone-200/50 dark:bg-stone-800/40 border-stone-300 dark:border-stone-700 opacity-80"
                      : "bg-card hover:bg-muted/20 border-border/80 shadow-xs"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onToggleTask(task.id)}
                    className="mt-0.5 shrink-0 focus:outline-none"
                    title={isTaskCompleted ? "Mark as incomplete" : "Mark as completed"}
                  >
                    {isTaskCompleted ? (
                      <CheckSquare className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Square className="h-5 w-5 text-muted-foreground hover:text-emerald-600" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-sm font-bold ${isTaskCompleted ? "line-through text-stone-500 dark:text-stone-400" : "text-foreground"}`}>
                        {task.taskText}
                      </span>
                      <PriorityDot priority={task.priority} />
                    </div>

                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground flex-wrap">
                      <Badge variant="secondary" className="text-[10px] font-medium">
                        {task.stageName}
                      </Badge>
                      <span>·</span>
                      <span>{isFil ? "Araw" : "Day"} {task.dayNumber}</span>
                    </div>

                    {task.inputsNeeded && task.inputsNeeded.length > 0 && (
                      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                        <span className="text-[11px] font-semibold text-muted-foreground">{isFil ? "Mga gagamitin:" : "Inputs needed:"}</span>
                        {task.inputsNeeded.map((input, i) => (
                          <Badge key={i} variant="outline" className="text-[10px] bg-muted/50">
                            {input}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {task.weatherNote && (
                      <div className="mt-2 text-[11px] text-blue-700 dark:text-blue-300 bg-blue-50/60 dark:bg-blue-950/30 p-2 rounded-lg border border-blue-100 flex items-center gap-1.5">
                        <Cloud className="h-3.5 w-3.5 shrink-0" />
                        <span>{task.weatherNote}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Complete Day & Advance Action Button Bar */}
        <div className="pt-3 border-t flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-muted-foreground font-medium">
            {isSelectedDateCompleted ? (
              <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                {isFil ? "Tapos na ang mga gawain sa araw na ito" : "All activities for this day are done"}
              </span>
            ) : (
              <span>{isFil ? "Tapusin ang mga gawain upang umusad sa susunod na araw" : "Finish activities to advance to the next day"}</span>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {!isSelectedDateCompleted ? (
              <Button
                type="button"
                size="sm"
                onClick={handleCompleteAndAdvance}
                className="bg-emerald-800 hover:bg-emerald-900 text-white font-semibold h-9 px-3.5 text-xs rounded-lg shadow-xs gap-1.5 cursor-pointer transition-all shrink-0"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>{isFil ? "Tapusin ang Araw" : "Complete Day"}</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleJustAdvanceNext}
                className="font-semibold h-9 px-3.5 text-xs rounded-lg gap-1.5 cursor-pointer transition-all shrink-0"
              >
                <span>{isFil ? "Susunod na Araw" : "Next Day"}</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN PAGE COMPONENT
   ───────────────────────────────────────────────────────────────────────────── */
export default function FarmingPlanPage() {
  const { settings, t } = useSettings();
  const isFil = settings.language === "fil";

  // Derive stable userKey for persistent records
  const userKey = getUserKey(settings.userName);

  // Location details
  const lat = settings.cityLat ?? 14.5995;
  const lon = settings.cityLon ?? 120.9842;
  const locationDisplay = [settings.cityName, settings.provinceName, settings.regionName, "Philippines"]
    .filter(Boolean).join(", ") || "Philippines";

  // Crops list
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

  const categoriesInDb = useMemo(() => [...new Set(allCrops.map(c => c.category))], [allCrops]);
  const filteredCrops = activeCatFilter === "all"
    ? allCrops
    : allCrops.filter(c => c.category === activeCatFilter);
  const GRID_LIMIT = 24;
  const visibleCrops = showAllCrops ? filteredCrops : filteredCrops.slice(0, GRID_LIMIT);

  // Form Inputs State
  const initialCrop = settings.preferredCrops[0] && settings.preferredCrops[0] !== "None" ? settings.preferredCrops[0] : "Rice";
  const [crop, setCrop] = useState(initialCrop);
  const [plantingDate, setPlantingDate] = useState(() => {
    const d = new Date();
    return formatDateStr(d);
  });
  const [planName, setPlanName] = useState("");

  // Saved Plans & Active Plan State
  const [savedPlans, setSavedPlans] = useState<SavedPlanRecord[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("planId");
    }
    return null;
  });

  // Deleting Dialog State
  const [planToDelete, setPlanToDelete] = useState<SavedPlanRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Creation & View Mode State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"detailed" | "summarized">("summarized");

  // Auto-generate default plan name when crop or date changes if user hasn't typed a custom name
  useEffect(() => {
    if (!planName || planName.includes(" Plan")) {
      const formatted = new Date(plantingDate).toLocaleDateString("en-US", { month: "short", year: "numeric" });
      setPlanName(`${crop} Plan (${formatted})`);
    }
  }, [crop, plantingDate]);

  // Load saved plans list from API
  const fetchUserPlans = useCallback(async () => {
    setPlansLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/farming-plan/list?userKey=${encodeURIComponent(userKey)}`);
      if (res.ok) {
        const data: SavedPlanRecord[] = await res.json();
        setSavedPlans(data);
        if (data.length > 0) {
          const urlParamId = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("planId") : null;
          if (urlParamId && data.some(p => p.id === urlParamId)) {
            setSelectedPlanId(urlParamId);
          } else if (!selectedPlanId) {
            const activeOne = data.find(p => p.status === "active") || data[0];
            setSelectedPlanId(activeOne.id);
          }
        }
      }
    } catch {
      // Local fallback if API unavailable
      const local = localStorage.getItem(`agri_saved_plans_${userKey}`);
      if (local) {
        try {
          const parsed = JSON.parse(local);
          setSavedPlans(parsed);
          if (parsed.length > 0 && !selectedPlanId) setSelectedPlanId(parsed[0].id);
        } catch {}
      }
    } finally {
      setPlansLoading(false);
    }
  }, [userKey, selectedPlanId]);

  useEffect(() => {
    fetchUserPlans();
  }, [fetchUserPlans]);

  // Active Plan Object
  const activePlanRecord = useMemo(() => {
    return savedPlans.find(p => p.id === selectedPlanId) || savedPlans[0] || null;
  }, [savedPlans, selectedPlanId]);

  const handleSelectPlan = (planRecord: SavedPlanRecord) => {
    setSelectedPlanId(planRecord.id);
    setCrop(planRecord.crop);
    setPlantingDate(planRecord.plantingDate);
    setPlanName(planRecord.name);

    // Persist as main active plan on server
    fetch(`${BASE_URL}/api/farming-plan/set-active`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: planRecord.id, userKey }),
    }).catch(() => {});

    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("farming-plan-updated"));
    }

    setTimeout(() => {
      const el = document.getElementById("active-plan-section");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  // Toggle Task Handler
  const handleToggleTask = (taskId: string) => {
    if (!activePlanRecord) return;
    const planId = activePlanRecord.id;

    setSavedPlans(prev => {
      const next = prev.map(item => {
        if (item.id === planId) {
          const updatedTasks = { ...item.completedTasks, [taskId]: !item.completedTasks[taskId] };
          return { ...item, completedTasks: updatedTasks, updatedAt: new Date().toISOString() };
        }
        return item;
      });
      if (typeof window !== "undefined") {
        localStorage.setItem(`agri_saved_plans_${userKey}`, JSON.stringify(next));
        window.dispatchEvent(new Event("farming-plan-updated"));
      }
      return next;
    });

    fetch(`${BASE_URL}/api/farming-plan/toggle-task`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: planId,
        userKey,
        taskId,
        completed: !activePlanRecord.completedTasks[taskId],
      }),
    }).catch(() => {});
  };

  // Complete Day Handler
  const handleCompleteDay = (dateStr: string, taskIds: string[]) => {
    if (!activePlanRecord) return;
    const planId = activePlanRecord.id;

    setSavedPlans(prev => {
      const next = prev.map(item => {
        if (item.id === planId) {
          const updatedTasks = { ...item.completedTasks };
          updatedTasks[`day_${dateStr}`] = true;
          taskIds.forEach(tId => {
            updatedTasks[tId] = true;
          });
          return { ...item, completedTasks: updatedTasks, updatedAt: new Date().toISOString() };
        }
        return item;
      });
      if (typeof window !== "undefined") {
        localStorage.setItem(`agri_saved_plans_${userKey}`, JSON.stringify(next));
        window.dispatchEvent(new Event("farming-plan-updated"));
      }
      return next;
    });

    fetch(`${BASE_URL}/api/farming-plan/complete-day`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: planId,
        userKey,
        dateStr,
        taskIds,
        completed: true,
      }),
    }).catch(() => {});
  };

  // Generate & Save New Plan
  const handleGenerate = useCallback(async () => {
    if (!crop || !plantingDate) return;
    setLoading(true);
    setError(null);

    try {
      // 1. Generate plan via GDD engine & open weather API
      const res = await fetch(`${BASE_URL}/api/farming-plan/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          crop,
          plantingDate,
          lat,
          lon,
          locationName: locationDisplay,
          lang: settings.language,
          cityName: settings.cityName || undefined,
          provinceName: settings.provinceName || undefined,
          regionName: settings.regionName || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to generate planting plan. Please try again.");
        return;
      }

      // 2. Save new plan to backend with unique ID
      const saveRes = await fetch(`${BASE_URL}/api/farming-plan/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userKey,
          name: planName || `${crop} Plan`,
          crop,
          plantingDate,
          status: "active",
          plan: data.plan,
          completedTasks: {},
        }),
      });

      const saveData = await saveRes.json();
      if (!saveRes.ok) {
        setError(saveData.error ?? "Failed to save planting plan.");
        return;
      }

      const newRecord: SavedPlanRecord = saveData.plan;

      // 3. Update saved plans state & select the new plan
      setSavedPlans(prev => [newRecord, ...prev]);
      setSelectedPlanId(newRecord.id);

      // Save locally & notify dashboard
      localStorage.setItem(`agri_saved_plans_${userKey}`, JSON.stringify([newRecord, ...savedPlans]));
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("farming-plan-updated"));
      }

      // Scroll to active plan section
      setTimeout(() => {
        const el = document.getElementById("active-plan-section");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 100);

    } catch (err: any) {
      setError("Network error generating plan. Please check connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [crop, plantingDate, planName, userKey, lat, lon, locationDisplay, settings.language, settings.cityName, settings.provinceName, settings.regionName, savedPlans]);

  // Delete Plan Confirmation Handler
  const handleConfirmDelete = async () => {
    if (!planToDelete) return;
    setIsDeleting(true);
    const idToDelete = planToDelete.id;

    try {
      await fetch(`${BASE_URL}/api/farming-plan/delete/${idToDelete}?userKey=${encodeURIComponent(userKey)}`, {
        method: "DELETE",
      });

      const updated = savedPlans.filter(p => p.id !== idToDelete);
      setSavedPlans(updated);
      localStorage.setItem(`agri_saved_plans_${userKey}`, JSON.stringify(updated));
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("farming-plan-updated"));
      }

      if (selectedPlanId === idToDelete) {
        setSelectedPlanId(updated.length > 0 ? updated[0].id : null);
      }
    } catch {
      // Local removal
      const updated = savedPlans.filter(p => p.id !== idToDelete);
      setSavedPlans(updated);
    } finally {
      setIsDeleting(false);
      setPlanToDelete(null);
    }
  };

  const isCropValid = Boolean(crop && crop.trim().length > 0 && crop.trim().toLowerCase() !== "none");

  return (
    <div className="space-y-8 pb-16 font-sans max-w-6xl mx-auto">
      {/* HEADER TITLE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold flex items-center gap-2.5 text-stone-900 dark:text-stone-100 tracking-tight">
            <ClipboardList className="h-7 w-7 text-emerald-800 dark:text-emerald-400" />
            {isFil ? "Plano sa Pagtatanim" : "Planting Planner"}
          </h1>
          <p className="text-stone-600 dark:text-stone-400 text-sm mt-1">
            {isFil ? "Gumawa at pamahalaan ang maramihang plano ng pananim batay sa tunay na datos ng klima at GDD algorithms." : "Create and manage multiple crop schedules with scientifically tailored GDD timelines & open climate data."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 gap-1.5 px-3 py-1.5 text-xs font-semibold">
            <FolderKanban className="h-4 w-4 text-emerald-700" />
            {savedPlans.length} {isFil ? "Nakatagong Plano" : "Saved Plan(s)"}
          </Badge>
          <a
            href="#create-plan-form"
            className="inline-flex items-center gap-1.5 text-xs font-bold bg-emerald-800 hover:bg-emerald-900 text-white px-3.5 py-2 rounded-xl shadow-xs transition-all shrink-0 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            {isFil ? "Gumawa ng Plano" : "Create Plan"}
          </a>
        </div>
      </div>

      {/* LOCATION BAR */}
      <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 rounded-2xl shadow-xs">
        <MapPin className="h-4 w-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold truncate text-emerald-950 dark:text-emerald-200">{locationDisplay}</div>
          <div className="text-xs text-emerald-800/80 dark:text-emerald-300 flex items-center gap-1.5 flex-wrap mt-0.5">
            <ThermometerSun className="h-3 w-3 text-emerald-700 dark:text-emerald-400" />
            <span>{isFil ? `Open-Meteo climate data para sa ${lat.toFixed(3)}°N, ${lon.toFixed(3)}°E` : `Open-Meteo climate data for ${lat.toFixed(3)}°N, ${lon.toFixed(3)}°E`}</span>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────
         SAVED PLANS MANAGEMENT LIST
         ───────────────────────────────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold flex items-center gap-2 text-stone-900 dark:text-stone-100">
            <FolderKanban className="h-5 w-5 text-emerald-800 dark:text-emerald-400" />
            {isFil ? "Mga Nakatagong Plano sa Pagtatanim" : "My Saved Planting Plans"}
          </h2>
          {savedPlans.length > 0 && (
            <span className="text-xs text-muted-foreground font-medium">
              {isFil ? "Pumili ng plano upang buksan ang kalendaryo" : "Click any plan card to open its active calendar"}
            </span>
          )}
        </div>

        {plansLoading ? (
          <div className="p-8 text-center bg-card border rounded-2xl flex items-center justify-center gap-2 text-muted-foreground text-sm">
            <Loader2 className="h-5 w-5 animate-spin text-emerald-700" />
            {isFil ? "Iniloload ang mga plano..." : "Loading saved planting plans..."}
          </div>
        ) : savedPlans.length === 0 ? (
          <Card className="border border-dashed border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/30 dark:bg-emerald-950/20">
            <CardContent className="p-8 text-center space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 flex items-center justify-center mx-auto text-xl">
                🌱
              </div>
              <h3 className="font-bold text-base text-foreground">
                {isFil ? "Wala Pang Nakatagong Plano" : "No Planting Plans Yet"}
              </h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                {isFil
                  ? "Gumawa ng iyong unang plano gamit ang form sa ibaba. Maaari kang gumawa ng maramihang plano para sa Palay, Kamatis, Mais, o iba pang pananim."
                  : "Create your first planting plan using the form below. You can save multiple distinct plans (e.g. Rice Plan - Field A, Tomato Plan, Corn Plot B)."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedPlans.map(planRecord => {
              const isSelected = selectedPlanId === planRecord.id;
              const emoji = getCropEmoji(planRecord.crop);
              const currentStage = getPlanCurrentStage(planRecord.plan, planRecord.plantingDate, isFil);
              const nextTask = getPlanNextTask(planRecord.plan, planRecord.plantingDate, planRecord.completedTasks || {}, isFil);

              // Calculate tasks progress
              const totalTasks = planRecord.plan?.stages?.reduce((acc, s) => acc + s.tasks.length, 0) || 0;
              const doneTasks = Object.values(planRecord.completedTasks || {}).filter(Boolean).length;
              const percent = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

              return (
                <div
                  key={planRecord.id}
                  className={`rounded-2xl border p-4 transition-all flex flex-col justify-between ${
                    isSelected
                      ? "bg-card border-emerald-600 dark:border-emerald-500 shadow-md ring-2 ring-emerald-500/20"
                      : "bg-card hover:bg-muted/30 border-border/80 shadow-xs"
                  }`}
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 flex items-center justify-center text-xl shrink-0">
                          {emoji}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-sm text-foreground truncate">{planRecord.name}</h3>
                          <div className="text-xs text-emerald-800 dark:text-emerald-400 font-semibold">{planRecord.crop}</div>
                        </div>
                      </div>

                      <Badge
                        variant="outline"
                        className={`text-[10px] uppercase font-bold shrink-0 ${
                          planRecord.status === "active"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300"
                            : "bg-stone-100 text-stone-700 border-stone-300"
                        }`}
                      >
                        {planRecord.status}
                      </Badge>
                    </div>

                    {/* Details */}
                    <div className="space-y-1.5 text-xs text-stone-600 dark:text-stone-300 bg-muted/30 p-2.5 rounded-xl border border-border/50">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">{isFil ? "Petsa ng Pagtatanim:" : "Planting Date:"}</span>
                        <span className="font-semibold text-foreground">
                          {new Date(planRecord.plantingDate).toLocaleDateString(isFil ? "fil-PH" : "en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">{isFil ? "Kasalukuyang Yugto:" : "Current Stage:"}</span>
                        <span className="font-bold text-emerald-800 dark:text-emerald-400 truncate max-w-[140px]" title={currentStage.name}>
                          {currentStage.name}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-border/40">
                        <span className="text-muted-foreground">{isFil ? "Susunod na Gawain:" : "Next Task:"}</span>
                        <span className="font-medium text-foreground truncate max-w-[150px]" title={nextTask.taskText}>
                          {nextTask.taskText}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground mb-1">
                        <span>{isFil ? "Progreso ng Gawain" : "Task Progress"}</span>
                        <span>{doneTasks} / {totalTasks} ({percent}%)</span>
                      </div>
                      <div className="h-1.5 w-full bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-600 transition-all duration-300" style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-4 border-t mt-4">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleSelectPlan(planRecord)}
                      className={`flex-1 text-xs font-bold gap-1.5 ${
                        isSelected
                          ? "bg-emerald-800 hover:bg-emerald-900 text-white"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      }`}
                    >
                      {isSelected ? (isFil ? "Kasalukuyang Naka-open" : "Currently Opened") : (isFil ? "Buksan ang Plano" : "Open Calendar")}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setPlanToDelete(planRecord)}
                      className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 border-rose-200 shrink-0"
                      title={isFil ? "Burahin ang plano" : "Delete plan"}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────
         PLAN GENERATOR FORM CARD
         ───────────────────────────────────────────────────────────────────────────── */}
      <div id="create-plan-form">
        <Card className="border border-emerald-100 dark:border-emerald-900/40 shadow-xs">
          <CardHeader className="pb-4">
            <CardTitle className="text-base sm:text-lg flex items-center justify-between text-stone-900 dark:text-stone-100">
              <span className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-emerald-800 dark:text-emerald-400" />
                {isFil ? "Gumawa ng Bagong Plano sa Pagtatanim" : "Create New Planting Plan"}
              </span>
              <Badge variant="secondary" className="text-xs font-normal">
                {isFil ? "Awtomatikong GDD Schedule" : "Automated GDD Schedule"}
              </Badge>
            </CardTitle>
            <CardDescription className="text-xs">
              {isFil
                ? "Pumili ng pananim, ilagay ang pangalan ng plano at petsa upang makagawa ng bagong iskedyul na mai-save sa iyong account."
                : "Select a crop, give your plan a unique name, and choose the planting date to generate a new distinct schedule."}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Plan Name Input */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 block mb-1.5">
                {isFil ? "PANGALAN NG PLANO" : "Plan Name / Label"}
              </label>
              <input
                type="text"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                placeholder={isFil ? "Halimbawa: Palay - Hilagang Bukid, Kamatis - Backyard" : "e.g., Rice - North Field, Tomato - Plot B, Corn - Rainy Season"}
                className="w-full px-3.5 py-2.5 rounded-xl border bg-muted/40 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:bg-background font-medium"
              />
              <span className="text-[11px] text-muted-foreground mt-1 block">
                {isFil ? "Tinutulungan kang ihiwalay ang magkakaibang taniman o ikot ng pagtatanim." : "Helps distinguish different plots, fields, or planting cycles."}
              </span>
            </div>

            {/* Crop Selection */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 block mb-2">
                {isFil ? "PUMILI NG PANANIM" : "Select Crop"}
              </label>

              {!cropsLoading && categoriesInDb.length > 0 && (
                <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3 hide-scrollbar">
                  <button
                    type="button"
                    onClick={() => { setActiveCatFilter("all"); setShowAllCrops(false); }}
                    className={`shrink-0 text-xs px-3 py-1.5 rounded-full border transition-all ${
                      activeCatFilter === "all"
                        ? "bg-emerald-800 text-white border-emerald-800 shadow-xs font-bold"
                        : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-200 dark:hover:bg-stone-700"
                    }`}
                  >
                    {isFil ? "Lahat" : "All"}
                  </button>
                  {categoriesInDb.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => { setActiveCatFilter(cat); setShowAllCrops(false); }}
                      className={`shrink-0 text-xs px-3 py-1.5 rounded-full border transition-all whitespace-nowrap ${
                        activeCatFilter === cat
                          ? "bg-emerald-800 text-white border-emerald-800 shadow-xs font-bold"
                          : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-200 dark:hover:bg-stone-700"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 mb-2">
                {visibleCrops.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCrop(c.cropName)}
                    className={`flex flex-col items-center gap-1 p-2.5 rounded-xl text-xs border transition-all ${
                      crop === c.cropName
                        ? "bg-emerald-100 dark:bg-emerald-950/80 border-emerald-500 dark:border-emerald-600 text-emerald-950 dark:text-emerald-100 font-bold shadow-xs ring-2 ring-emerald-500/20"
                        : "bg-stone-50 dark:bg-stone-800/50 border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300"
                    }`}
                  >
                    <span className="text-xl">{c.emoji}</span>
                    <span className="text-center leading-tight">{c.cropName.split(" (")[0]}</span>
                  </button>
                ))}
              </div>

              <input
                type="text"
                value={crop}
                onChange={(e) => setCrop(e.target.value)}
                placeholder={isFil ? "O mag-type ng pangalan ng pananim..." : "Or type custom crop name..."}
                className="w-full mt-3 px-3.5 py-2 rounded-xl border bg-muted/40 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:bg-background"
              />
            </div>

            {/* Planting Date */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 block mb-2">
                {isFil ? "PETSA NG PAGTATANIM" : "Planting Date"}
              </label>
              <div className="relative max-w-xs">
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                  type="date"
                  value={plantingDate}
                  onChange={(e) => setPlantingDate(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border bg-muted/40 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:bg-background font-semibold"
                />
              </div>
            </div>

            {/* Error banner */}
            {error && (
              <div className="flex items-center gap-2 text-sm text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 rounded-xl px-4 py-3">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit button */}
            <Button
              type="button"
              onClick={handleGenerate}
              disabled={!isCropValid || !plantingDate || loading}
              className="w-full gap-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold shadow-md h-12 text-sm sm:text-base rounded-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin shrink-0" />
                  <span>{isFil ? "Gumagawa ng Plano..." : "Creating Plan..."}</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 shrink-0" />
                  <span className="truncate">
                    {isFil ? "Gumawa ng Plano" : "Create Plan"}
                    {crop && crop.toLowerCase() !== "none" ? ` (${crop.split(" (")[0]})` : ""}
                  </span>
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────
         ACTIVE OPEN PLAN VIEW
         ───────────────────────────────────────────────────────────────────────────── */}
      {activePlanRecord && (
        <div id="active-plan-section" className="space-y-6 pt-4 border-t-2 border-dashed animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-emerald-800 text-white rounded-2xl p-5 sm:p-6 shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-700/80 pb-4">
              <div>
                <div className="flex items-center gap-2 text-emerald-200 text-xs font-bold uppercase tracking-wider">
                  <span>{getCropEmoji(activePlanRecord.crop)}</span>
                  <span>{isFil ? "Aktibong Binuksang Plano" : "Currently Opened Plan"}</span>
                  <span>·</span>
                  <span>{activePlanRecord.crop}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                  {activePlanRecord.name}
                </h2>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Badge className="bg-emerald-900/80 text-emerald-100 border-emerald-600 text-xs px-3 py-1">
                  {isFil ? "Itinanim:" : "Planted:"} {new Date(activePlanRecord.plantingDate).toLocaleDateString(isFil ? "fil-PH" : "en-US", { month: "short", day: "numeric", year: "numeric" })}
                </Badge>
                <RiskBadge level={activePlanRecord.plan.weatherRiskLevel} isFil={isFil} />
              </div>
            </div>

            {/* Quick stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-emerald-900/50 border border-emerald-700/60 p-3 rounded-xl">
                <div className="text-[11px] text-emerald-200 font-medium">{isFil ? "Kabuuang Araw" : "Total Growing Days"}</div>
                <div className="text-lg font-extrabold text-white mt-0.5">{activePlanRecord.plan.totalGrowingDays} <span className="text-xs font-normal">{isFil ? "araw" : "days"}</span></div>
              </div>

              <div className="bg-emerald-900/50 border border-emerald-700/60 p-3 rounded-xl">
                <div className="text-[11px] text-emerald-200 font-medium">{isFil ? "Tantiya ng Ani" : "Estimated Harvest"}</div>
                <div className="text-sm font-extrabold text-white mt-0.5">{isFil ? "Araw" : "Day"} {activePlanRecord.plan.estimatedHarvestStart}–{activePlanRecord.plan.estimatedHarvestEnd}</div>
              </div>

              <div className="bg-emerald-900/50 border border-emerald-700/60 p-3 rounded-xl">
                <div className="text-[11px] text-emerald-200 font-medium">{isFil ? "Inaasahang Ani" : "Expected Yield"}</div>
                <div className="text-sm font-extrabold text-white mt-0.5">{activePlanRecord.plan.expectedYield || (isFil ? "Karaniwan" : "Standard")}</div>
              </div>

              <div className="bg-emerald-900/50 border border-emerald-700/60 p-3 rounded-xl">
                <div className="text-[11px] text-emerald-200 font-medium">{isFil ? "Panganib sa Panahon" : "Weather Risk"}</div>
                <div className="text-xs font-bold text-amber-200 truncate mt-0.5" title={activePlanRecord.plan.weatherRiskNotes}>
                  {activePlanRecord.plan.weatherRiskNotes || "Normal"}
                </div>
              </div>
            </div>
          </div>

          {/* Mode Switcher Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-card border rounded-2xl shadow-xs">
            <span className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5 flex-wrap">
              <ClipboardList className="h-4 w-4 text-emerald-800 dark:text-emerald-400 shrink-0" />
              <span>{isFil ? "Mode:" : "Mode:"}</span>
              <strong className="capitalize text-emerald-800 dark:text-emerald-400">{viewMode === "detailed" ? (isFil ? "Detalyadong Plano" : "Detailed Mode") : (isFil ? "Buod sa Kalendaryo" : "Summarized Calendar")}</strong>
            </span>

            <div className="flex items-center gap-1.5 bg-muted p-1 rounded-xl w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setViewMode("summarized")}
                className={`text-xs flex-1 sm:flex-none px-3 py-1.5 rounded-lg font-bold transition-all text-center whitespace-nowrap ${
                  viewMode === "summarized" ? "bg-emerald-800 text-white shadow-xs" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {isFil ? "Buod (Kalendaryo)" : "Summarized Calendar"}
              </button>

              <button
                type="button"
                onClick={() => setViewMode("detailed")}
                className={`text-xs flex-1 sm:flex-none px-3 py-1.5 rounded-lg font-bold transition-all text-center whitespace-nowrap ${
                  viewMode === "detailed" ? "bg-emerald-800 text-white shadow-xs" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {isFil ? "Detalyado" : "Detailed Full Plan"}
              </button>
            </div>
          </div>

          {/* CALENDAR VIEW INTERFACE */}
          <CalendarInterface
            plan={activePlanRecord.plan}
            completedTasks={activePlanRecord.completedTasks || {}}
            onToggleTask={handleToggleTask}
            onCompleteDay={handleCompleteDay}
            isFil={isFil}
          />

          {/* DETAILED MODE CONTENT */}
          {viewMode === "detailed" && (
            <div className="space-y-6 border-t pt-6">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Leaf className="h-5 w-5 text-emerald-700" />
                {isFil ? "Komprehensibong Yugto ng Paglaki at Recomendasyon" : "Comprehensive Growth Stages & Agronomic Recommendations"}
              </h2>

              {/* Stages List */}
              <div className="space-y-4">
                {activePlanRecord.plan.stages?.map(stage => (
                  <StageCard key={stage.id} stage={stage} plantingDate={activePlanRecord.plantingDate} isFil={isFil} />
                ))}
              </div>

              {/* Fertilizer Schedule */}
              {activePlanRecord.plan.fertilizerSchedule && activePlanRecord.plan.fertilizerSchedule.length > 0 && (
                <div className="bg-card border rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-2 font-bold text-sm text-foreground">
                    <FlaskConical className="h-4 w-4 text-teal-600" />
                    <span>{isFil ? "Iskedyul ng Paggamit ng Abono" : "Fertilizer Schedule Matrix"}</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="border-b bg-muted/40">
                          <th className="p-2 font-bold">{isFil ? "Araw" : "Day"}</th>
                          <th className="p-2 font-bold">{isFil ? "Produkto / Abono" : "Fertilizer Product"}</th>
                          <th className="p-2 font-bold">{isFil ? "Dami" : "Rate"}</th>
                          <th className="p-2 font-bold">{isFil ? "Paraan" : "Method"}</th>
                          <th className="p-2 font-bold">{isFil ? "Layunin" : "Purpose"}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {activePlanRecord.plan.fertilizerSchedule.map((f, i) => (
                          <tr key={i} className="hover:bg-muted/20">
                            <td className="p-2 font-bold">{isFil ? "Araw" : "Day"} {f.day}</td>
                            <td className="p-2 font-semibold text-emerald-800 dark:text-emerald-400">{f.product}</td>
                            <td className="p-2">{f.rate}</td>
                            <td className="p-2">{f.method}</td>
                            <td className="p-2 text-muted-foreground">{f.purpose}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Pest Alerts */}
              {activePlanRecord.plan.pestAlerts && activePlanRecord.plan.pestAlerts.length > 0 && (
                <div className="bg-card border rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-2 font-bold text-sm text-foreground">
                    <Bug className="h-4 w-4 text-rose-600" />
                    <span>{isFil ? "Babala sa Peste at Sakit" : "Pest & Disease Advisory Matrix"}</span>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {activePlanRecord.plan.pestAlerts.map((pest, i) => (
                      <div key={i} className="p-3.5 rounded-xl border bg-rose-50/50 dark:bg-rose-950/20 border-rose-200/60 text-xs space-y-1">
                        <div className="font-bold text-rose-900 dark:text-rose-200 flex items-center justify-between">
                          <span>{pest.name}</span>
                          <Badge variant="outline" className="text-[10px] bg-rose-100 text-rose-800 border-rose-300">{pest.riskPeriod}</Badge>
                        </div>
                        <p className="text-muted-foreground"><strong>{isFil ? "Mga Sintomas:" : "Symptoms:"}</strong> {pest.symptoms}</p>
                        <p className="text-emerald-800 dark:text-emerald-300"><strong>{isFil ? "Paggamot:" : "Treatment:"}</strong> {pest.treatment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
         DELETE CONFIRMATION DIALOG
         ───────────────────────────────────────────────────────────────────────────── */}
      <Dialog open={!!planToDelete} onOpenChange={(open) => { if (!open) setPlanToDelete(null); }}>
        <DialogContent className="w-[90vw] max-w-md rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="h-5 w-5" />
              {isFil ? "I-delete ang Plano sa Pagtatanim?" : "Delete Planting Plan?"}
            </DialogTitle>
            <DialogDescription className="text-sm text-stone-600 dark:text-stone-300 mt-2 leading-relaxed">
              {isFil
                ? `Sigurado ka bang nais mong burahin ang planong "${planToDelete?.name}"? Mabubura nito ang iskedyul at kasaysayan ng mga gawain. Hindi ito maaapektuhan ang iba mong mga plano.`
                : `Are you sure you want to delete "${planToDelete?.name}"? This action will permanently remove its scheduled tasks and calendar history. Deleting this plan will NOT affect any of your other plans.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 flex flex-row items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setPlanToDelete(null)}
              disabled={isDeleting}
              className="rounded-xl"
            >
              {isFil ? "Kanselahin" : "Cancel"}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="rounded-xl gap-2 bg-rose-600 hover:bg-rose-700 text-white font-bold"
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              {isFil ? "I-delete ang Plano" : "Delete Plan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
