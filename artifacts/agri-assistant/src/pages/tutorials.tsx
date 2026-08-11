import { useState, useEffect } from "react";
import {
  Search,
  Video,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ExternalLink,
  Play,
  Filter,
  RefreshCw,
  Info,
  Calendar,
  User,
  XCircle,
  Sprout,
  ArrowRight,
  ThumbsUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

export default function TutorialsPage() {
  const { toast } = useToast();
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
        title: "Search query required",
        description: "Please enter what farming tutorial you are looking for.",
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
        throw new Error("Failed to search YouTube videos.");
      }

      const searchData = await searchRes.json();
      const fetchedVideos: VideoResult[] = searchData.videos || [];
      setRawVideos(fetchedVideos);
      setIsSearching(false);

      if (fetchedVideos.length === 0) {
        setHasStrongMatch(false);
        setNoMatchReason("No videos found matching your search query.");
        return;
      }

      // Step 2: Background Grownox AI Relevance Analysis
      setIsAnalyzing(true);
      const evalRes = await fetch("/api/tutorials/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, videos: fetchedVideos }),
      });

      if (!evalRes.ok) {
        throw new Error("Grownox analysis encountered an issue.");
      }

      const evalData = await evalRes.json();
      setAnalyzedVideos(evalData.videos || []);
      setQuerySummary(evalData.querySummary || "");
      setHasStrongMatch(evalData.hasStrongMatch !== false);
      setNoMatchReason(evalData.noMatchReason || null);
    } catch (err: any) {
      console.error("Tutorial search error:", err);
      toast({
        title: "Search Error",
        description: err.message || "Failed to retrieve tutorial videos.",
        variant: "destructive",
      });
      setHasStrongMatch(false);
      setNoMatchReason("Could not retrieve videos due to network error. Please try again.");
    } finally {
      setIsSearching(false);
      setIsAnalyzing(false);
    }
  };

  const handlePromptClick = (promptText: string) => {
    setSearchQuery(promptText);
    handleSearch(promptText);
  };

  const displayVideos = analyzedVideos.length > 0 ? analyzedVideos : rawVideos;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white rounded-2xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-6">
          <YoutubeIcon className="w-64 h-64 text-white" />
        </div>

        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 bg-emerald-700/60 border border-emerald-500/40 text-emerald-200 text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Grownox Smart AI Video Ranking</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Agriculture Tutorial Video Search
          </h1>

          <p className="text-emerald-100 text-sm sm:text-base leading-relaxed">
            Describe your exact agricultural challenge in plain language. Grownox will search YouTube for relevant tutorial videos and rigorously evaluate their title & description for exact topic, climate, and method matches.
          </p>
        </div>
      </div>

      {/* Natural Language Search Input Form */}
      <Card className="border-border/60 shadow-sm">
        <CardContent className="p-4 sm:p-6 space-y-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g., How to grow tomatoes in hot and humid weather using organic fertilizer"
                className="pl-10 h-12 text-sm bg-muted/40 focus-visible:bg-background rounded-xl border-border/80"
              />
            </div>
            <Button
              type="submit"
              disabled={isSearching}
              className="h-12 px-6 rounded-xl font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shrink-0 gap-2 shadow-xs"
            >
              {isSearching ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  <span>Search Videos</span>
                </>
              )}
            </Button>
          </form>

          {/* Quick Sample Suggestions */}
          <div className="space-y-2 pt-1">
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-amber-500" />
              <span>Try natural language examples:</span>
            </span>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handlePromptClick(prompt)}
                  className="text-xs bg-muted/60 hover:bg-emerald-500/10 hover:text-emerald-700 dark:hover:text-emerald-300 border border-border/60 rounded-lg px-3 py-1.5 transition-colors text-left text-muted-foreground"
                >
                  "{prompt}"
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search Status & Grownox Analysis Header */}
      {activeQuery && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card border border-border/60 rounded-xl p-4 shadow-2xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-semibold text-xs border-emerald-600/30 text-emerald-700 dark:text-emerald-400">
                  Search Query
                </Badge>
                <span className="font-medium text-sm text-foreground">"{activeQuery}"</span>
              </div>

              {querySummary && (
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <strong className="text-emerald-700 dark:text-emerald-400">Grownox Overview:</strong> {querySummary}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs shrink-0">
              {isSearching ? (
                <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 flex items-center gap-1.5 py-1 px-3">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>Fetching YouTube...</span>
                </Badge>
              ) : isAnalyzing ? (
                <Badge className="bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/30 flex items-center gap-1.5 py-1 px-3">
                  <Loader2 className="h-3 w-3 animate-spin text-indigo-600" />
                  <span>Grownox AI Analyzing Relevance...</span>
                </Badge>
              ) : analyzedVideos.length > 0 ? (
                <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 flex items-center gap-1.5 py-1 px-3 font-semibold">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>AI Evaluation Complete</span>
                </Badge>
              ) : null}
            </div>
          </div>

          {/* Analysis in Progress Banner */}
          {isAnalyzing && (
            <div className="bg-indigo-500/8 border border-indigo-500/20 rounded-xl p-3.5 flex items-center gap-3 text-xs text-indigo-900 dark:text-indigo-200 animate-pulse">
              <Sparkles className="h-4 w-4 text-indigo-600 shrink-0" />
              <span>
                <strong>YouTube search results loaded below.</strong> Grownox AI is currently evaluating titles & descriptions to rank them by exact topic, climate, and method match...
              </span>
            </div>
          )}

          {/* No Strong Match Notice */}
          {!isSearching && !isAnalyzing && !hasStrongMatch && (
            <Card className="border-amber-500/40 bg-amber-500/5">
              <CardContent className="p-5 sm:p-6 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0">
                    <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="space-y-1 flex-1">
                    <h3 className="font-bold text-base text-amber-900 dark:text-amber-200">
                      No Strong Tutorial Match Found
                    </h3>
                    <p className="text-xs sm:text-sm text-amber-800/90 dark:text-amber-300 leading-relaxed">
                      {noMatchReason ||
                        `Grownox strictly verified the available YouTube video descriptions and could not find a tutorial specifically matching all your criteria for "${activeQuery}". Unrelated videos are suppressed to ensure high agricultural accuracy.`}
                    </p>
                  </div>
                </div>

                <div className="bg-background/80 rounded-lg p-3 text-xs space-y-1.5 text-muted-foreground border border-amber-500/20">
                  <strong className="text-foreground font-semibold">Recommendations:</strong>
                  <ul className="list-disc list-inside space-y-1 pl-1">
                    <li>Try broadening your keywords (e.g. search "organic tomato farming" instead of highly specific multi-condition phrases).</li>
                    <li>Or ask **Grownox AI Chat** directly in the sidebar for step-by-step advice tailored to your farm location.</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results Grid */}
          {displayVideos.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                <span>
                  Showing {displayVideos.length} video result{displayVideos.length === 1 ? "" : "s"}
                  {analyzedVideos.length > 0 ? " ranked by Grownox AI relevance" : ""}
                </span>
                {analyzedVideos.length > 0 && (
                  <span className="font-medium text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                    <Filter className="h-3 w-3" />
                    Sorted: Most Relevant First
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayVideos.map((video) => {
                  const analyzed = "score" in video ? (video as AnalyzedVideo) : null;

                  return (
                    <Card
                      key={video.id}
                      className={`flex flex-col h-full overflow-hidden transition-all duration-200 hover:shadow-md border ${
                        analyzed
                          ? analyzed.score >= 80
                            ? "border-emerald-500/40 bg-emerald-500/[0.02]"
                            : analyzed.uncertain
                            ? "border-amber-500/40 bg-amber-500/[0.02]"
                            : "border-border/60"
                          : "border-border/60"
                      }`}
                    >
                      {/* Video Thumbnail */}
                      <div className="relative aspect-video w-full bg-slate-900 group overflow-hidden">
                        <img
                          src={video.thumbnailUrl}
                          alt={video.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`;
                          }}
                        />

                        {/* Play Overlay */}
                        <a
                          href={video.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                          title="Watch on YouTube"
                        >
                          <div className="h-12 w-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                            <Play className="h-6 w-6 fill-current ml-0.5" />
                          </div>
                        </a>

                        {/* Relevance Score Badge Overlay */}
                        {analyzed && (
                          <div className="absolute top-2.5 right-2.5 z-10">
                            {analyzed.score >= 80 ? (
                              <Badge className="bg-emerald-600 text-white font-bold text-xs px-2.5 py-0.5 shadow-md flex items-center gap-1">
                                <ThumbsUp className="h-3 w-3" />
                                <span>{analyzed.score}% Match</span>
                              </Badge>
                            ) : analyzed.uncertain ? (
                              <Badge className="bg-amber-600 text-white font-bold text-xs px-2.5 py-0.5 shadow-md flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                <span>Uncertain ({analyzed.score}%)</span>
                              </Badge>
                            ) : (
                              <Badge className="bg-slate-700/90 text-slate-100 font-semibold text-xs px-2.5 py-0.5 shadow-md">
                                {analyzed.score}% Match
                              </Badge>
                            )}
                          </div>
                        )}

                        {!analyzed && isAnalyzing && (
                          <div className="absolute top-2.5 right-2.5 z-10">
                            <Badge className="bg-indigo-600/90 text-white font-medium text-[11px] px-2 py-0.5 shadow-md flex items-center gap-1 animate-pulse">
                              <Loader2 className="h-3 w-3 animate-spin" />
                              <span>Evaluating...</span>
                            </Badge>
                          </div>
                        )}
                      </div>

                      {/* Card Body */}
                      <CardContent className="p-4 flex-1 flex flex-col justify-between space-y-3">
                        <div className="space-y-2">
                          <h3 className="font-bold text-sm text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                            {video.title}
                          </h3>

                          <div className="flex items-center justify-between text-xs text-muted-foreground gap-2 pt-0.5">
                            <div className="flex items-center gap-1.5 truncate">
                              <User className="h-3 w-3 text-red-600 shrink-0" />
                              <span className="font-medium text-foreground/80 truncate">
                                {video.channelTitle}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-[11px] shrink-0">
                              <Calendar className="h-3 w-3 opacity-60" />
                              <span>{formatDate(video.publishedAt)}</span>
                            </div>
                          </div>

                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            {video.description}
                          </p>
                        </div>

                        {/* Grownox AI Evaluation Box */}
                        {analyzed && (
                          <div
                            className={`rounded-xl p-3 text-xs space-y-1.5 border transition-colors ${
                              analyzed.score >= 80
                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-200"
                                : analyzed.uncertain
                                ? "bg-amber-500/10 border-amber-500/30 text-amber-950 dark:text-amber-200"
                                : "bg-muted/60 border-border/60 text-muted-foreground"
                            }`}
                          >
                            <div className="flex items-center justify-between font-bold text-[11px]">
                              <div className="flex items-center gap-1.5">
                                <Sprout className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                <span>Grownox Evaluation</span>
                              </div>
                              <Badge
                                variant="outline"
                                className={`text-[10px] px-1.5 py-0 h-4 ${
                                  analyzed.score >= 80
                                    ? "border-emerald-600 text-emerald-700 dark:text-emerald-400"
                                    : analyzed.uncertain
                                    ? "border-amber-600 text-amber-700 dark:text-amber-400"
                                    : "border-slate-400 text-slate-600 dark:text-slate-400"
                                }`}
                              >
                                {analyzed.relevanceLabel}
                              </Badge>
                            </div>

                            <p className="text-[11px] leading-relaxed">
                              {analyzed.explanation}
                            </p>

                            {analyzed.uncertain && (
                              <div className="flex items-center gap-1 text-[10px] font-medium text-amber-700 dark:text-amber-300 pt-0.5">
                                <Info className="h-3 w-3 shrink-0" />
                                <span>Snippet lacks full verification for all prompt details.</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="pt-2 border-t border-border/40 flex items-center justify-between gap-2">
                          <a
                            href={video.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                          >
                            <YoutubeIcon className="h-4 w-4" />
                            <span>Watch on YouTube</span>
                            <ExternalLink className="h-3 w-3 opacity-70" />
                          </a>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setPlayingVideo(video)}
                            className="h-7 text-xs font-medium text-muted-foreground hover:text-foreground"
                          >
                            <Play className="h-3 w-3 mr-1" />
                            <span>Preview</span>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Video Preview Modal */}
      {playingVideo && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border/80 rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl relative space-y-0">
            <div className="flex items-center justify-between p-4 border-b border-border/60 bg-muted/40">
              <div className="flex items-center gap-2 pr-4 truncate">
                <YoutubeIcon className="h-5 w-5 text-red-600 shrink-0" />
                <h3 className="font-bold text-sm text-foreground truncate">{playingVideo.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setPlayingVideo(null)}
                className="h-8 w-8 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shrink-0"
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
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs transition-colors shrink-0 justify-center"
              >
                <span>Open in YouTube</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
