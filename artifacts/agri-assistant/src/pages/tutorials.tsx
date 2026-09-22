import { useState } from "react";
import { Link } from "wouter";
import {
  Search,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Play,
  Filter,
  Info,
  Calendar,
  User,
  XCircle,
  Sprout,
  ThumbsUp,
  Video,
  Layers,
  Languages,
  MessageSquare,
  Phone,
  WifiOff,
  RotateCcw,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useSettings } from "@/hooks/use-settings";
import { useToast } from "@/hooks/use-toast";

function YoutubeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

export interface VideoResult {
  id: string;
  title: string;
  channelTitle: string;
  description: string;
  publishedAt: string;
  thumbnailUrl: string;
  videoUrl: string;
}

export interface AnalyzedVideo extends VideoResult {
  score: number;
  relevanceLabel: "High Match" | "Moderate Match" | "Uncertain Match" | "Low Match";
  uncertain: boolean;
  isRelevant: boolean;
  explanation: string;
}

const SAMPLE_PROMPTS = [
  "How to grow tomatoes in hot and humid weather using organic fertilizer",
  "Drip irrigation setup for small scale organic vegetable farming",
  "Natural neem oil organic pest control for tropical fruit trees",
  "Hydroponic lettuce farming system in tropical climate",
  "Compost soil preparation for lowland rice farming",
];

const SAMPLE_PROMPTS_FIL = [
  "Paano magpalaki ng kamatis sa mainit at maulang panahon gamit ang organikong abono",
  "Paggawa ng drip irrigation para sa maliit na gulayan sa bukid",
  "Paggamit ng langis ng neem bilang puksain sa peste sa mga punong prutas",
  "Sistemang hydroponics sa pagpapatubo ng letsugas sa tropikong klima",
  "Paghahanda ng compost na lupa para sa pagtatanim ng palay sa mababang lupa",
];

export default function TutorialsPage() {
  const { toast } = useToast();
  const { settings } = useSettings();
  const isFil = settings.language === "fil";
  const activeSamplePrompts = isFil ? SAMPLE_PROMPTS_FIL : SAMPLE_PROMPTS;
  const [searchQuery, setSearchQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");

  // Search states
  const [isSearching, setIsSearching] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [rawVideos, setRawVideos] = useState<VideoResult[]>([]);
  const [analyzedVideos, setAnalyzedVideos] = useState<AnalyzedVideo[]>([]);
  const [querySummary, setQuerySummary] = useState<string>("");
  const [hasStrongMatch, setHasStrongMatch] = useState<boolean>(true);
  const [noMatchReason, setNoMatchReason] = useState<string | null>(null);

  // Selected video modal/embed state
  const [playingVideo, setPlayingVideo] = useState<VideoResult | null>(null);

  const handleSearch = async (queryToSearch?: string) => {
    const query = (queryToSearch || searchQuery).trim();
    if (!query) {
      toast({
        title: isFil ? "Kailangan ng babasahin" : "Search query required",
        description: isFil ? "Mangyaring ilagay kung anong tutorial sa pagsasaka ang iyong hinahanap." : "Please enter what farming tutorial you are looking for.",
        variant: "destructive",
      });
      return;
    }

    setSearchQuery(query);
    setActiveQuery(query);
    setIsSearching(true);
    setIsAnalyzing(false);
    setRawVideos([]);
    setAnalyzedVideos([]);
    setQuerySummary("");
    setHasStrongMatch(true);
    setNoMatchReason(null);

    try {
      // Step 1: Fast raw YouTube video search
      const searchRes = await fetch("/api/tutorials/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      if (!searchRes.ok) {
        throw new Error(isFil ? "Bigo sa paghahanap ng mga video sa YouTube." : "Failed to search YouTube videos.");
      }

      const searchData = await searchRes.json();
      const fetchedVideos: VideoResult[] = searchData.videos || [];
      setRawVideos(fetchedVideos);
      setIsSearching(false);

      if (fetchedVideos.length === 0) {
        setHasStrongMatch(false);
        setNoMatchReason(isFil ? "Walang nahanap na video na tumutugma sa iyong paghahanap." : "No videos found matching your search query.");
        return;
      }

      // Step 2: Background Grownox AI Relevance Analysis
      setIsAnalyzing(true);
      const evalRes = await fetch("/api/tutorials/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, videos: fetchedVideos, lang: settings.language }),
      });

      if (!evalRes.ok) {
        throw new Error(isFil ? "Nagkaroon ng problema sa pagsusuri ng Grownox AI." : "Grownox analysis encountered an issue.");
      }

      const evalData = await evalRes.json();
      setAnalyzedVideos(evalData.videos || []);
      setQuerySummary(evalData.querySummary || "");
      setHasStrongMatch(evalData.hasStrongMatch !== false);
      setNoMatchReason(evalData.noMatchReason || null);
    } catch (err: any) {
      console.error("Tutorial search error:", err);
      toast({
        title: isFil ? "Maling Paghahanap" : "Search Error",
        description: err.message || (isFil ? "Bigo sa pagkuha ng mga tutorial video." : "Failed to retrieve tutorial videos."),
        variant: "destructive",
      });
      setHasStrongMatch(false);
      setNoMatchReason(isFil ? "Hindi makuha ang mga video dahil sa problema sa koneksyon. Subukan ulit." : "Could not retrieve videos due to network error. Please try again.");
    } finally {
      setIsSearching(false);
      setIsAnalyzing(false);
    }
  };

  const handlePromptClick = (promptText: string) => {
    setSearchQuery(promptText);
    handleSearch(promptText);
  };

  const handleResetSearch = () => {
    setSearchQuery("");
    setActiveQuery("");
    setRawVideos([]);
    setAnalyzedVideos([]);
    setQuerySummary("");
    setHasStrongMatch(true);
    setNoMatchReason(null);
  };

  const displayVideos = analyzedVideos.length > 0 ? analyzedVideos : rawVideos;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString(isFil ? "fil-PH" : "en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div id="tutorials-page-container" className="space-y-6 max-w-6xl mx-auto pb-12 font-sans">
      {/* 1. HERO & SEARCH SECTION (Adapted from Reference Design) */}
      <section
        id="tutorials-hero-section"
        className="bg-card rounded-2xl border border-border/80 p-5 sm:p-7 md:p-8 shadow-xs relative overflow-hidden"
      >
        {/* Decorative soft glow background */}
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-emerald-500/10 dark:bg-emerald-500/5 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-4">
          {/* Extension Service Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 text-[#004c22] dark:text-emerald-300 font-bold text-[11px] tracking-wider border border-emerald-500/30">
              {isFil ? "BASEHAN NG KAALAMAN SA PAGSASAKA" : "AGRICULTURAL KNOWLEDGE BASE"}
            </span>
            <span className="text-muted-foreground text-xs">•</span>
            <span className="text-muted-foreground text-xs font-semibold flex items-center gap-1">
              <Sprout className="w-3.5 h-3.5 text-[#006d30] dark:text-emerald-400" />
              {isFil ? "Mga Gabay ng Grownox" : "Grownox Field Guides"}
            </span>
          </div>

          {/* Title & Subtitle */}
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#004c22] dark:text-emerald-400 tracking-tight">
              {isFil ? "Mga Tutorial sa Agrikultura" : "Agri Tutorials"}{" "}
              <span className="text-muted-foreground text-lg sm:text-xl md:text-2xl font-normal block sm:inline">
                {isFil ? "(Agri Tutorials)" : "(Mga Tutorial sa Agrikultura)"}
              </span>
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mt-1.5 max-w-3xl">
              {isFil
                ? "Praktikal, nakabatay sa agham na mga pamamaraan sa pagsasaka, mga subok sa bukid na gabay, at video tutorial para sa mga lokal na magsasaka."
                : "Practical, science-backed farming techniques, field-tested guides, and video tutorials for local farmers."}
            </p>
          </div>

          {/* Integrated Search Bar (No Overlapping Elements, Fully Responsive) */}
          <div className="pt-1">
            <form
              id="tutorial-search-form"
              onSubmit={(e) => {
                e.preventDefault();
                handleSearch();
              }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 max-w-3xl"
            >
              <div className="relative flex-1 flex items-center bg-background rounded-xl border border-border shadow-xs focus-within:border-[#004c22] dark:focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all min-w-0">
                <Search className="absolute left-3.5 h-4.5 w-4.5 text-muted-foreground pointer-events-none shrink-0" />
                <Input
                  id="tutorial-search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    isFil
                      ? 'Maghanap ng tutorial (hal. "pagtatanim ng palay", "peste sa kamatis")...'
                      : 'Search tutorials (e.g. "rice planting", "tomato pests")...'
                  }
                  className="w-full h-11 sm:h-12 bg-transparent border-0 pl-10 sm:pl-11 pr-9 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 p-1 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors cursor-pointer"
                    title="Clear search"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                )}
              </div>

              <Button
                id="tutorial-search-btn"
                type="submit"
                disabled={isSearching}
                className="h-11 sm:h-12 px-5 sm:px-6 rounded-xl bg-[#004c22] hover:bg-[#006d30] dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shrink-0 flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer w-full sm:w-auto"
              >
                {isSearching ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{isFil ? "Naghahanap..." : "Searching..."}</span>
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    <span className="whitespace-nowrap">{isFil ? "Maghanap ng Gabay" : "Search Guides"}</span>
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* 3 Simple Informational Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-4 border-t border-border/70 mt-3">
            <div className="flex items-start sm:items-center gap-3 p-3 sm:p-3.5 rounded-xl bg-muted/30 border border-border/40">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/15 flex items-center justify-center text-[#004c22] dark:text-emerald-400 shrink-0 text-base">
                🌱
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-foreground leading-tight">
                  {isFil ? "Mga Gabay sa Pagsasaka" : "Farming Guides"}
                </p>
                <p className="text-xs text-muted-foreground font-normal mt-0.5 leading-snug">
                  {isFil ? "Praktikal na kaalaman para sa mga magsasaka" : "Practical knowledge for farmers"}
                </p>
              </div>
            </div>

            <div className="flex items-start sm:items-center gap-3 p-3 sm:p-3.5 rounded-xl bg-muted/30 border border-border/40">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/15 flex items-center justify-center text-[#004c22] dark:text-emerald-400 shrink-0 text-base">
                ▶️
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-foreground leading-tight">
                  {isFil ? "Pag-aaral sa Video" : "Video Learning"}
                </p>
                <p className="text-xs text-muted-foreground font-normal mt-0.5 leading-snug">
                  {isFil ? "Matuto sa pamamagitan ng mga video sa agrikultura" : "Learn through agricultural videos"}
                </p>
              </div>
            </div>

            <div className="flex items-start sm:items-center gap-3 p-3 sm:p-3.5 rounded-xl bg-muted/30 border border-border/40">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/15 flex items-center justify-center text-[#004c22] dark:text-emerald-400 shrink-0 text-base">
                🇵🇭
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-foreground leading-tight">
                  {isFil ? "Lokal na Agrikultura" : "Local Agriculture"}
                </p>
                <p className="text-xs text-muted-foreground font-normal mt-0.5 leading-snug">
                  {isFil ? "Impormasyong angkop sa pagsasaka sa Pilipinas" : "Information relevant to Filipino farming"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. QUICK SAMPLE SUGGESTIONS / HORIZONTAL TOPIC CHIPS (From Reference) */}
      <section id="tutorials-prompts-section" aria-label="Suggested tutorials" className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{isFil ? "Subukan ang mga halimbawang paksa:" : "Try suggested agricultural topics:"}</span>
          </span>
          {activeQuery && (
            <button
              onClick={handleResetSearch}
              className="text-xs text-muted-foreground hover:text-foreground font-semibold flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
              <span>{isFil ? "I-reset" : "Reset"}</span>
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {activeSamplePrompts.map((prompt, idx) => (
            <button
              key={idx}
              id={`sample-prompt-${idx}`}
              type="button"
              onClick={() => handlePromptClick(prompt)}
              className="text-xs bg-card hover:bg-emerald-500/10 hover:text-[#004c22] dark:hover:text-emerald-300 hover:border-emerald-600/40 border border-border/80 rounded-xl px-3 py-2 transition-all text-left text-muted-foreground cursor-pointer font-medium shadow-2xs"
            >
              "{prompt}"
            </button>
          ))}
        </div>
      </section>

      {/* 3. ACTIVE SEARCH STATUS & GROWNOX AI ANALYSIS OVERVIEW */}
      {activeQuery && (
        <section id="tutorials-results-section" className="space-y-4">
          {/* Query & Status Overview Bar */}
          <div
            id="tutorial-query-status"
            className="bg-card border border-border/80 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 text-[#004c22] dark:text-emerald-300 text-[11px] font-bold tracking-wider border border-emerald-500/30">
                  {isFil ? "PAGHAHANAP" : "ACTIVE SEARCH"}
                </span>
                <span className="font-bold text-sm text-foreground break-words">"{activeQuery}"</span>
              </div>

              <div className="flex items-center gap-2 text-xs shrink-0">
                {isSearching ? (
                  <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1.5 py-1 px-3 rounded-lg font-semibold">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>{isFil ? "Kinukuha sa YouTube..." : "Fetching YouTube..."}</span>
                  </Badge>
                ) : isAnalyzing ? (
                  <Badge className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/30 flex items-center gap-1.5 py-1 px-3 rounded-lg font-semibold">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600 dark:text-blue-400" />
                    <span>{isFil ? "Sinusuri ng Grownox AI ang Kaugnayan..." : "Grownox AI Evaluating Relevance..."}</span>
                  </Badge>
                ) : analyzedVideos.length > 0 ? (
                  <Badge className="bg-emerald-500/10 text-[#004c22] dark:text-emerald-300 border border-emerald-600/30 flex items-center gap-1.5 py-1 px-3 rounded-lg font-bold">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>{isFil ? "Tapos na ang Pagsusuri ng AI" : "AI Evaluation Complete"}</span>
                  </Badge>
                ) : null}
              </div>
            </div>

            {querySummary && (
              <div className="pt-2.5 border-t border-border/60 text-xs text-muted-foreground leading-relaxed">
                <strong className="text-[#004c22] dark:text-emerald-400 font-bold">
                  {isFil ? "Pangkalahatang-ideya ng Grownox:" : "Grownox Overview:"}
                </strong>{" "}
                {querySummary}
              </div>
            )}
          </div>

          {/* Analysis in Progress Banner */}
          {isAnalyzing && (
            <div
              id="evaluating-progress-banner"
              className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 flex items-center gap-3 text-xs text-blue-950 dark:text-blue-200"
            >
              <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 animate-spin" />
              <span className="leading-relaxed">
                <strong>{isFil ? "Nailipat ang resulta mula sa YouTube sa ibaba." : "YouTube search results loaded below."}</strong>{" "}
                {isFil
                  ? "Kasalukuyang sinusuri ng Grownox AI ang mga pamagat at paglalarawan upang maihanay ayon sa eksaktong paksa, klima, at pamamaraan..."
                  : "Grownox AI is currently evaluating titles & descriptions to rank them by exact topic, climate, and method match..."}
              </span>
            </div>
          )}

          {/* No Strong Match Notice */}
          {!isSearching && !isAnalyzing && !hasStrongMatch && (
            <div
              id="no-match-alert"
              className="bg-card border border-dashed border-border/90 rounded-2xl p-6 text-center space-y-3 shadow-xs"
            >
              <div className="w-12 h-12 rounded-full bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 mx-auto">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h4 className="font-bold text-base text-foreground">
                {isFil ? "Walang Natagpuang Mahusay na Pagtugma sa Tutorial" : "No Strong Tutorial Match Found"}{" "}
                <span className="text-muted-foreground font-normal text-xs sm:text-sm block sm:inline">
                  (Walang nahanap na tutorial)
                </span>
              </h4>
              <p className="text-xs text-muted-foreground max-w-lg mx-auto leading-relaxed">
                {noMatchReason ||
                  (isFil
                    ? `Maingat na sinuri ng Grownox ang mga paglalarawan ng video sa YouTube at walang natagpuang tutorial na eksaktong tumutugma sa lahat ng iyong pamantayan para sa "${activeQuery}".`
                    : `We couldn't find any guides specifically matching all your criteria for "${activeQuery}". Try broadening your search terms or ask Grownox AI.`)}
              </p>
              <Button
                onClick={handleResetSearch}
                variant="outline"
                className="px-4 py-2 rounded-xl text-xs font-bold border-border inline-flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>{isFil ? "Linisin ang Paghahanap" : "Clear Search & Filters"}</span>
              </Button>
            </div>
          )}

          {/* Results Header and Video Grid */}
          {displayVideos.length > 0 && (
            <div id="tutorial-results-grid-container" className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-muted-foreground px-1">
                <span className="font-semibold">
                  {isFil
                    ? `Ipinapakita ang ${displayVideos.length} resulta ng video${analyzedVideos.length > 0 ? " na inihanay ng Grownox AI" : ""}`
                    : `Showing ${displayVideos.length} video result${displayVideos.length === 1 ? "" : "s"}${analyzedVideos.length > 0 ? " ranked by Grownox AI relevance" : ""}`}
                </span>
                {analyzedVideos.length > 0 && (
                  <span className="font-bold text-[#004c22] dark:text-emerald-400 flex items-center gap-1.5 self-start sm:self-auto">
                    <Filter className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    {isFil ? "Nakaayos: Pinakanauugnay Una" : "Sorted: Most Relevant First"}
                  </span>
                )}
              </div>

              {/* VIDEO CARDS GRID (Adapted from Reference Video Cards) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {displayVideos.map((video, idx) => {
                  const analyzed = "score" in video ? (video as AnalyzedVideo) : null;

                  return (
                    <div
                      key={video.id || idx}
                      id={`tutorial-card-${video.id || idx}`}
                      className="bg-card border border-border/80 rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between hover:shadow-md hover:border-emerald-600/50 transition-all group"
                    >
                      {/* Video Thumbnail (Matching Reference Structure) */}
                      <div className="relative aspect-video bg-slate-900 overflow-hidden shrink-0">
                          <img
                            src={video.thumbnailUrl}
                            alt={video.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`;
                            }}
                          />

                          {/* Hover Play Button Overlay (Matching Reference) */}
                          <div
                            onClick={() => setPlayingVideo(video)}
                            className="absolute inset-0 bg-black/25 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          >
                            <div className="w-12 h-12 rounded-full bg-white/90 text-[#004c22] dark:text-emerald-700 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                              <Play className="h-6 w-6 fill-current ml-0.5" />
                            </div>
                          </div>

                          {/* Top-Left Method / Verification Badge */}
                          <div className="absolute top-2.5 left-2.5 z-10 flex gap-1.5 flex-wrap">
                            <span className="px-2 py-0.5 rounded-md bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs text-[#004c22] dark:text-emerald-300 font-bold text-[10px] border border-border shadow-xs">
                              {isFil ? "Tutorial sa Pagsasaka" : "Field Tutorial"}
                            </span>
                          </div>

                          {/* Top-Right AI Match Score Badge */}
                          {analyzed && (
                            <div className="absolute top-2.5 right-2.5 z-10">
                              {analyzed.score >= 80 ? (
                                <Badge className="bg-[#004c22] dark:bg-emerald-600 text-white font-bold text-[11px] px-2.5 py-0.5 shadow-md flex items-center gap-1 rounded-md">
                                  <ThumbsUp className="h-3 w-3" />
                                  <span>{analyzed.score}% {isFil ? "Tugma" : "Match"}</span>
                                </Badge>
                              ) : analyzed.uncertain ? (
                                <Badge className="bg-amber-600 text-white font-bold text-[11px] px-2.5 py-0.5 shadow-md flex items-center gap-1 rounded-md">
                                  <AlertTriangle className="h-3 w-3" />
                                  <span>{isFil ? "Hindi Tiyak" : "Uncertain"} ({analyzed.score}%)</span>
                                </Badge>
                              ) : (
                                <Badge className="bg-slate-800/90 text-slate-100 font-semibold text-[11px] px-2.5 py-0.5 shadow-md rounded-md">
                                  {analyzed.score}% {isFil ? "Tugma" : "Match"}
                                </Badge>
                              )}
                            </div>
                          )}

                          {!analyzed && isAnalyzing && (
                            <div className="absolute top-2.5 right-2.5 z-10">
                              <Badge className="bg-blue-600/90 text-white font-semibold text-[11px] px-2.5 py-0.5 shadow-md flex items-center gap-1 rounded-md animate-pulse">
                                <Loader2 className="h-3 w-3 animate-spin" />
                                <span>{isFil ? "Sinusuri..." : "Evaluating..."}</span>
                              </Badge>
                            </div>
                          )}
                        </div>

                        {/* Card Body Content */}
                        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-3">
                          <div className="space-y-2.5">
                            {/* Channel Info & Date Row */}
                            <div className="flex items-center justify-between text-xs text-muted-foreground gap-2">
                              <div className="flex items-center gap-1.5 truncate max-w-[65%]">
                                <User className="h-3.5 w-3.5 text-[#006d30] dark:text-emerald-400 shrink-0" />
                                <span className="font-bold text-[#006d30] dark:text-emerald-400 truncate">
                                  {video.channelTitle}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-[11px] shrink-0">
                                <Calendar className="h-3 w-3 opacity-60" />
                                <span>{formatDate(video.publishedAt)}</span>
                              </div>
                            </div>

                            {/* Video Title */}
                            <h3
                              onClick={() => setPlayingVideo(video)}
                              className="font-bold text-sm text-foreground group-hover:text-[#004c22] dark:group-hover:text-emerald-400 transition-colors line-clamp-2 leading-snug cursor-pointer"
                            >
                              {video.title}
                            </h3>

                            {/* Video Description */}
                            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                              {video.description}
                            </p>

                            {/* Grownox AI Evaluation Callout Box */}
                            {analyzed && (
                              <div
                                className={`rounded-xl p-3 text-xs space-y-1.5 border transition-colors ${
                                  analyzed.score >= 80
                                    ? "bg-emerald-500/10 dark:bg-emerald-950/30 border-emerald-500/30 text-foreground"
                                    : analyzed.uncertain
                                    ? "bg-amber-500/10 dark:bg-amber-950/30 border-amber-500/30 text-foreground"
                                    : "bg-muted/60 border-border/60 text-muted-foreground"
                                }`}
                              >
                                <div className="flex items-center justify-between font-bold text-[11px] gap-2">
                                  <div className="flex items-center gap-1.5 truncate">
                                    <Sprout className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                    <span className="truncate">{isFil ? "Pagsusuri ng Grownox" : "Grownox Evaluation"}</span>
                                  </div>
                                  <Badge
                                    variant="outline"
                                    className={`text-[10px] px-1.5 py-0 h-4 font-bold shrink-0 ${
                                      analyzed.score >= 80
                                        ? "border-emerald-600 text-[#004c22] dark:text-emerald-300"
                                        : analyzed.uncertain
                                        ? "border-amber-600 text-amber-800 dark:text-amber-300"
                                        : "border-border text-muted-foreground"
                                    }`}
                                  >
                                    {isFil
                                      ? analyzed.relevanceLabel === "High Match"
                                        ? "Mataas na Tugma"
                                        : analyzed.relevanceLabel === "Moderate Match"
                                        ? "Katamtamang Tugma"
                                        : analyzed.relevanceLabel === "Uncertain Match"
                                        ? "Hindi Tiyak na Tugma"
                                        : "Mababang Tugma"
                                      : analyzed.relevanceLabel}
                                  </Badge>
                                </div>

                                <p className="text-[11px] leading-relaxed opacity-90">
                                  {analyzed.explanation}
                                </p>

                                {analyzed.uncertain && (
                                  <div className="flex items-center gap-1 text-[10px] font-medium text-amber-800 dark:text-amber-300 pt-0.5">
                                    <Info className="h-3 w-3 shrink-0 text-amber-600 dark:text-amber-400" />
                                    <span>{isFil ? "Kulang sa buong beripikasyon ang impormasyon sa snippet para sa lahat ng detalye." : "Snippet lacks full verification for all prompt details."}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Card Footer Actions */}
                          <div className="flex items-center gap-2 pt-1">
                            <Button
                              onClick={() => setPlayingVideo(video)}
                              className="flex-1 h-9 rounded-lg bg-[#004c22] hover:bg-[#006d30] dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                            >
                              <Play className="h-3.5 w-3.5 fill-current" />
                              <span>{isFil ? "Panoorin ang Tutorial" : "Watch Tutorial"}</span>
                            </Button>

                            <a
                              href={video.videoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="h-9 px-3 rounded-lg border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors flex items-center justify-center gap-1 text-xs font-semibold shrink-0 cursor-pointer"
                              title="Open on YouTube"
                            >
                              <YoutubeIcon className="h-4 w-4 text-red-600" />
                            </a>
                          </div>
                        </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      )}

      {/* 4. LEARN WITH GROWNOX & TUTORIAL ASSISTANCE */}
      <section
        id="tutorials-support-section"
        className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2"
      >
        {/* Learn With Grownox Card (2 Columns) */}
        <div className="md:col-span-2 bg-gradient-to-r from-[#004c22] via-[#006d30] to-[#166534] text-white rounded-2xl p-5 sm:p-7 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden">
          <div className="space-y-2.5 relative z-10 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-white/20 text-white text-[10px] font-bold tracking-wider">
                {isFil ? "MATUTO KASAMA ANG GROWNOX" : "LEARN WITH GROWNOX"}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
              {isFil ? "Kailangan ng tulong sa paksa sa pagsasaka?" : "Need help understanding a farming topic?"}
            </h3>
            <p className="text-emerald-100 text-xs sm:text-sm leading-relaxed">
              {isFil
                ? "Tuklasin ang mga praktikal na tutorial sa agrikultura at gamitin ang Grownox AI para magtanong tungkol sa mga pananim, pamamaraan sa pagsasaka, at mga kasanayan."
                : "Explore practical agricultural tutorials and use Grownox AI to ask questions about crops, farming techniques, and agricultural practices."}
            </p>
            <div className="pt-2 flex flex-wrap gap-2">
              <Button
                asChild
                className="h-9 px-4 rounded-lg bg-white text-[#004c22] hover:bg-emerald-50 font-bold text-xs shadow-xs"
              >
                <Link href="/chat" className="inline-flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>{isFil ? "Magtanong sa Grownox AI" : "Ask Grownox AI"}</span>
                </Link>
              </Button>
              <Button
                type="button"
                onClick={() => {
                  const el = document.getElementById("tutorial-videos-section") || document.getElementById("tutorials-search-form");
                  if (el) {
                    el.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                variant="outline"
                className="h-9 px-4 rounded-lg border-white/40 text-white bg-white/10 hover:bg-white/20 font-bold text-xs cursor-pointer inline-flex items-center gap-1.5"
              >
                <Video className="h-3.5 w-3.5" />
                <span>{isFil ? "Mag-browse ng mga Tutorial" : "Browse Tutorials"}</span>
              </Button>
            </div>
          </div>

          <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/20 flex flex-col items-center justify-center text-center p-3 shrink-0">
            <Sprout className="h-8 w-8 text-emerald-300" />
            <p className="text-[10px] font-bold text-white mt-1 uppercase tracking-wider">
              {isFil ? "Grownox AI Gabay" : "GROWNOX AI GUIDANCE"}
            </p>
            <p className="text-xs text-emerald-200 font-semibold mt-0.5">
              {isFil ? "Praktikal na Suporta sa Pagsasaka" : "Practical Agriculture Support"}
            </p>
          </div>
        </div>

        {/* Offline Reference & Guidebooks Card (1 Column) */}
        <div className="bg-card border border-border/80 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/15 flex items-center justify-center text-[#004c22] dark:text-emerald-400 mb-3">
              <WifiOff className="h-5 w-5" />
            </div>
            <h4 className="font-bold text-sm sm:text-base text-foreground">
              {isFil ? "Cache ng Gabay sa Bukid" : "Field Reference Cache"}
            </h4>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              {isFil
                ? "Pumupunta sa mga liblib na bukid na mahina ang signal? Lahat ng video search at pagsusuri ng AI ay naka-cache sa browser."
                : "Visiting remote fields with weak cellular connectivity? Video search queries and evaluations are saved locally."}
            </p>
          </div>

          <div className="space-y-2 pt-2 border-t border-border/60">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground font-semibold">
              <span>{isFil ? "Katayuan ng Network" : "Network Status"}</span>
              <span className="text-[#006d30] dark:text-emerald-400 font-bold flex items-center gap-1">
                <Check className="h-3 w-3" /> {isFil ? "Handa Online" : "Online Ready"}
              </span>
            </div>
            <Button
              asChild
              variant="outline"
              className="w-full h-9 rounded-lg border-border text-xs font-semibold hover:bg-muted"
            >
              <Link href="/crops">{isFil ? "Tingnan ang Direktoryo ng Pananim" : "View Crop Directory"}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 5. VIDEO PREVIEW MODAL (Adapted with Refined Controls) */}
      {playingVideo && (
        <div
          id="video-preview-modal-backdrop"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div
            id="video-preview-modal"
            className="bg-card border border-border/80 rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl relative space-y-0"
          >
            <div className="flex items-center justify-between p-4 border-b border-border/60 bg-muted/40">
              <div className="flex items-center gap-2 pr-4 truncate">
                <YoutubeIcon className="h-5 w-5 text-red-600 shrink-0" />
                <h3 className="font-bold text-sm text-foreground truncate">{playingVideo.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setPlayingVideo(null)}
                aria-label="Close preview"
                className="h-8 w-8 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shrink-0 cursor-pointer"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <div className="relative aspect-video w-full bg-black">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${playingVideo.id}?autoplay=1`}
                title={playingVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>

            <div className="p-4 bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs border-t border-border/60">
              <div className="space-y-0.5">
                <span className="font-bold text-foreground">{playingVideo.channelTitle}</span>
                <p className="text-muted-foreground line-clamp-1">{playingVideo.description}</p>
              </div>
              <a
                href={playingVideo.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#004c22] hover:bg-[#006d30] text-white font-bold text-xs transition-colors shrink-0 justify-center cursor-pointer shadow-xs"
              >
                <span>{isFil ? "Buksan sa YouTube" : "Open in YouTube"}</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


