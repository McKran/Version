import { useLocationStore } from "@/hooks/use-location";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSettings } from "@/hooks/use-settings";
import {
  useGetCropRecommendations, getGetCropRecommendationsQueryKey,
  useGetCropCalendar, getGetCropCalendarQueryKey
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Info, Sprout, TrendingUp, AlertTriangle, ChevronDown } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const CROP_NAME_FIL_MAP: Record<string, string> = {
  Wheat: "Trigo",
  Maize: "Mais",
  Rice: "Palay",
  Sorghum: "Batad / Sorghum",
  Millet: "Mijo / Millet",
  Barley: "Barli",
  Teff: "Teff",
  Cassava: "Kamoteng Kahoy",
  Yam: "Ubi / Yam",
  "Sweet Potato": "Kamote",
  Potatoes: "Patatas",
  Beans: "Sitaw / Mungo",
  Soybeans: "Soya / Soybeans",
  Groundnuts: "Mani",
  Cowpeas: "Paayap",
  Chickpeas: "Garbanzos",
  Tomatoes: "Kamatis",
  Onions: "Sibuyas",
  Garlic: "Bawang",
  Cabbage: "Repolyo",
  Carrots: "Karot",
  Avocado: "Abokado",
  Bananas: "Saging",
  Mangoes: "Mangga",
  Coffee: "Kape",
  Tea: "Tsaa",
  Cotton: "Bulak",
  Sugarcane: "Tubo",
  Sunflower: "Mirasol",
  Cocoa: "Kakaw",
  Rubber: "Goma",
  Sesame: "Lenga",
  Cashew: "Kasuy",
  Ginger: "Luya",
  "All crops": "Lahat ng pananim",
};

const CROP_NOTES_FIL_MAP: Record<string, string> = {
  Wheat: "Pangunahing siryal para sa pandaigdigang merkado. Nangangailangan ng malamig na temperatura at maayos na basang lupa. Magandang potensyal sa pagluwas.",
  Maize: "Pangunahing pananim na pagkain sa buong mundo. Mahusay sa lupang loam na may sapat na ulan. Isabay ang sitaw o mungo para sa mas magandang nitraheno sa lupa.",
  Rice: "Pangunahing pagkain sa Asya at Africa. Ang mga uri sa padak ay nangangailangan ng tubig; ang palay sa mataas na lupa ay kailangan ng sapat na halumigmig.",
  Sorghum: "Matatag sa tagtuyot. Tamang-tama para sa mga tuyong rehiyon. Ginagamit bilang pagkain at pakain sa hayop.",
  Millet: "Napakatatag sa tagtuyot. Napakahusay para sa seguridad sa pagkain sa tuyong klima. Maikling panahon ng paglaki.",
  Barley: "Malamig na klima siryal para sa mataas na lugar. Mataas ang demand para sa malt at pakain sa hayop.",
  Teff: "Grap ng Ethiopia na walang gluten, mayaman sa bakal. Lumalaking demand sa merkado ng kalusugan.",
  Cassava: "Pangunahing pananim sa seguridad sa pagkain. Matatag sa tagtuyot pagkaraang maitanim. Mataas ang nilalamang carbohydrates.",
  Yam: "Mataas ang halagang pananim. Nangangailangan ng suporta at matabang lupa na may maayos na patubig.",
  "Sweet Potato": "Mataas ang sustansya at mabilis lumaki. Ang mga kulay kahel na uri ay mayaman sa Bitamina A.",
  Potatoes: "Lumalago sa malamig na kabundukan. Nangangailangan ng maayos na lupang pataba. Mataas ang demand sa merkado buong taon.",
  Beans: "Nagpapataas ng nitraheno sa lupa. Napakahusay para sa kalusugan ng lupa. Malawak ang demand sa merkado.",
  Soybeans: "Pangunahing pandaigdigang kalakal. Malakas na merkado sa pagluwas. Ginagamit para sa langis at pakain sa hayop.",
  Groundnuts: "Mataas ang protina at langis. Magandang katatagan sa tagtuyot kapag nakatanim na.",
  Cowpeas: "Matatag sa tagtuyot na halaman para sa tuyong lugar. Ang mga dahon ay ginagawang gulay. Nagpapaganda ng lupa.",
  Chickpeas: "Mataas ang halaga na legumbre para sa pagluwas. Pananim para sa malamig na panahon.",
  Tomatoes: "Mataas ang halaga na gulay. Nangangailangan ng patubig at maingat na pamamahala. Magandang presyo sa merkado.",
  Onions: "Magandang pananim sa tag-araw. Mataas at pare-parehong demand sa merkado.",
  Garlic: "Mataas ang halaga na pananim na may malakas na demand sa lokal at labas ng bansa.",
  Cabbage: "Gulay sa malamig na panahon na may pare-parehong merkado. Maikling siklo ng pagtatanim.",
  Carrots: "Mataas ang halagang pampalusog. Nangangailangan ng malalim at malambot na lupa.",
  Avocado: "Perennial na may mataas na halaga sa pagluwas. Lumalaking demand sa buong mundo. 3-5 taon bago ang unang ani.",
  Bananas: "Nagbibigay ng ani buong taon. Pangunahing pagkain at produktong iniluluwas. Nangangailangan ng sapat na tubig at pataba.",
  Mangoes: "Puno ng prutas na matatag sa tagtuyot kapag nakatanim na. Magandang merkado sa lokal at ibang bansa.",
  Coffee: "Premyong pananim sa pagluwas. Ang arabica sa lilim ang may pinakamataas na presyo.",
  Tea: "Perennial na may pare-parehong demand sa buong mundo. Pinakamainam sa mataas na lugar.",
  Cotton: "Pangunahing cash crop para sa industriya ng tela. Nangangailangan ng 180-200 araw na walang yelo.",
  Sugarcane: "Mahabang siklo ng pananim (12-18 buwan). Mataas na biomasa para sa asukal at etanol.",
  Sunflower: "Matatag sa tagtuyot na pananim para sa langis. Tiyak ang presyo. Maganda para sa kalusugan ng lupa.",
  Cocoa: "Premyong kalakal na may tumataas na presyo sa mundo. Nangangailangan ng basang klimang tropikal.",
  Rubber: "Perennial na puno para sa industriyal na goma. Magandang kita pagkalipas ng 6-7 taon.",
  Sesame: "Mataas ang halaga na pananim para sa langis. Matatag sa tagtuyot. Lumalaking demand sa pagluwas.",
  Cashew: "Puno ng prutas na angkop sa tropikal na baybayin. Mataas ang halaga sa pagluwas.",
  Ginger: "Mataas ang halaga na pampalasa na may malakas na demand. Nangangailangan ng lilim at basang lupa.",
};

const CROP_WINDOW_FIL_MAP: Record<string, string> = {
  "Mar–May": "Mar–Mayo",
  "Oct–Dec": "Okt–Dis",
  "Apr–Jun": "Abr–Hun",
  "May–Jul": "Mayo–Hul",
  "Sep–Nov": "Set–Nob",
  "Feb–Apr": "Peb–Abr",
  "Jun–Aug": "Hun–Ago",
  "Jun–Jul": "Hun–Hul",
  "Mar–Abr": "Mar–Abr",
  "Year-round": "Buong taon",
};

const CALENDAR_ACTIVITIES_FIL_MAP: Record<string, string> = {
  "Land preparation and plowing": "Paghahanda ng lupa at pag-aararo",
  "Seed procurement and treatment": "Pagbili ng binhi at paggamot",
  "Nursery bed preparation": "Paghahanda ng kama ng punlaan",
  "Planting — optimal window opens": "Pagtatanim — bukas ang pinakamainam na panahon",
  "Seed potato preparation": "Paghahanda ng binhing patatas",
  "Planting alongside maize": "Pagtatanim kasabay ng mais",
  "Transplanting to main field": "Pagtatipat sa pangunahing bukid",
  "First fertilizer top-dressing": "Unang pag-aabono (top-dressing)",
  "Pest scouting — stem borer check": "Pagsusuri sa peste — pag-inspeksyon sa stem borer",
  "Inoculation and planting": "Inokulasyon at pagtatanim",
  "Variety selection and seed prep": "Pagpili ng uri at paghahanda ng binhi",
  "Pruning and canopy management": "Pagpuksa/pagtatabas ng sanga at pamamahala ng puno",
  "Irrigation schedule assessment": "Pagtataya ng iskedyul ng pagpapatubig",
  "Stem cutting selection": "Pagpili ng mga putol ng stem",
  "Soil pH testing and lime application": "Pagsusuri ng pH ng lupa at paglalagay ng apog",
};

function getCropName(name: string, isFil: boolean) {
  if (!isFil) return name;
  return CROP_NAME_FIL_MAP[name] || name;
}

function getCropNotes(notes: string, cropName: string, isFil: boolean) {
  if (!isFil) return notes;
  if (CROP_NOTES_FIL_MAP[cropName]) return CROP_NOTES_FIL_MAP[cropName];
  return notes;
}

function getPlantingWindow(window: string, isFil: boolean) {
  if (!isFil) return window;
  return CROP_WINDOW_FIL_MAP[window] || window.replace("Year-round", "Buong taon");
}

function getEstimatedYield(yieldStr: string, isFil: boolean) {
  if (!isFil) return yieldStr;
  return yieldStr.replace("tons/ha", "tonelada/ha");
}

function getCalendarCrop(crop: string, isFil: boolean) {
  if (!isFil) return crop;
  return CROP_NAME_FIL_MAP[crop] || crop;
}

function getCalendarActivity(activity: string, isFil: boolean) {
  if (!isFil) return activity;
  return CALENDAR_ACTIVITIES_FIL_MAP[activity] || activity;
}

export default function Crops() {
  const { location } = useLocationStore();
  const { settings, t } = useSettings();
  const isMobile = useIsMobile();
  const isFil = settings.language === "fil";
  const currentMonth = new Date().getMonth() + 1;
  const currentSeason = currentMonth > 2 && currentMonth < 6 ? "Long Rains" : "Short Rains";
  const currentSeasonLabel = isFil
    ? (currentSeason === "Long Rains" ? "Panahon ng Mahabang Ulan" : "Panahon ng Maikling Ulan")
    : `${currentSeason} Season`;

  const queryParams = { location, season: currentSeason, lang: settings.language };

  const { data: recommendations, isLoading: isRecsLoading } = useGetCropRecommendations(
    queryParams as any,
    { query: { queryKey: getGetCropRecommendationsQueryKey(queryParams as any) } }
  );

  const { data: calendar, isLoading: isCalendarLoading } = useGetCropCalendar(
    { month: currentMonth, lang: settings.language } as any,
    { query: { queryKey: getGetCropCalendarQueryKey({ month: currentMonth, lang: settings.language } as any) } }
  );

  if (isRecsLoading || isCalendarLoading) {
    return (
      <div className="space-y-4">
        <div>
          <Skeleton className="h-8 w-48 rounded-xl" />
          <Skeleton className="h-4 w-64 rounded-xl mt-2" />
        </div>
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)}
      </div>
    );
  }

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case "low": return "bg-primary/20 text-primary";
      case "medium": return "bg-amber-500/20 text-amber-700 dark:text-amber-400";
      case "high": return "bg-destructive/20 text-destructive";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const formatRiskText = (riskLevel: string) => {
    if (!isFil) return `${riskLevel} Risk`;
    switch (riskLevel.toLowerCase()) {
      case "low": return "Mababang Panganib";
      case "medium": return "Katamtamang Panganib";
      case "high": return "Mataas na Panganib";
      default: return riskLevel;
    }
  };

  const formatSuitability = (suitability: string) => {
    if (!isFil) return suitability;
    if (suitability === "Excellent") return "Napakahusay";
    if (suitability === "Good") return "Mahusay";
    return suitability;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high": return "text-destructive";
      case "medium": return "text-amber-500";
      case "low": return "text-primary";
      default: return "text-muted-foreground";
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {isFil ? "Plano sa Pagtatanim" : "Crop Planning"}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {isFil ? `Mga rekomendasyon para sa ${location} · ${currentSeasonLabel}` : `Recommendations for ${location} · ${currentSeasonLabel}`}
        </p>
      </div>

      {isMobile ? (
        /* ── Mobile: single column, calendar at bottom ── */
        <div className="space-y-5">
          <h2 className="text-base font-semibold flex items-center gap-2">
            <Sprout className="h-4 w-4" /> {isFil ? "Mga Inirerekomendang Pananim" : "Recommended Crops"}
          </h2>

          <Accordion type="single" collapsible className="space-y-3" defaultValue="rec-0">
            {recommendations?.map((crop, i) => (
              <AccordionItem key={i} value={`rec-${i}`} className="border rounded-2xl bg-card overflow-hidden shadow-sm">
                <AccordionTrigger className="px-4 py-4 hover:no-underline hover:bg-muted/40 data-[state=open]:bg-muted/40 transition-colors [&>svg]:hidden">
                  <div className="flex items-center gap-3 w-full">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-xl shrink-0">
                      {crop.icon}
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <div className="font-semibold">{getCropName(crop.cropName, isFil)}</div>
                      <div className="text-xs text-muted-foreground">
                        {isFil ? "Kakaangkop: " : "Suitability: "}{formatSuitability(crop.suitability)}
                      </div>
                    </div>
                    <Badge variant="secondary" className={`${getRiskColor(crop.riskLevel)} text-xs shrink-0`}>
                      {formatRiskText(crop.riskLevel)}
                    </Badge>
                    <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180 shrink-0 ml-1" />
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 pt-0">
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <div className="p-3 bg-background rounded-xl border">
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                        <TrendingUp className="h-3 w-3" /> {t.expectedYield}
                      </div>
                      <div className="text-sm font-semibold">{getEstimatedYield(crop.estimatedYield, isFil)}</div>
                    </div>
                    <div className="p-3 bg-background rounded-xl border">
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                        <CalendarIcon className="h-3 w-3" /> {isFil ? "Panahon ng Pagtatanim" : "Plant window"}
                      </div>
                      <div className="text-sm font-semibold">{getPlantingWindow(crop.plantingWindow, isFil)}</div>
                    </div>
                    <div className="col-span-2 p-3 bg-background rounded-xl border">
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                        <Info className="h-3 w-3" /> {isFil ? "Mga Tala sa Pagsasaka" : "Agronomist Notes"}
                      </div>
                      <p className="text-sm leading-relaxed">{getCropNotes(crop.notes, crop.cropName, isFil)}</p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {/* Calendar below on mobile */}
          <div className="space-y-3">
            <h2 className="text-base font-semibold flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" /> {isFil ? "Mga Mendating Gawain" : "Upcoming Activities"}
            </h2>
            <Card className="rounded-2xl">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm">{isFil ? "Susunod na 30 Araw" : "Next 30 Days"}</CardTitle>
                <CardDescription className="text-xs">{isFil ? "Nakatakdang mga gawain sa bukid" : "Scheduled farming tasks"}</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <CalendarList calendar={calendar} getPriorityColor={getPriorityColor} isFil={isFil} />
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        /* ── Desktop: two-column layout ── */
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Sprout className="h-5 w-5" /> {isFil ? "Mga Inirerekomendang Pananim" : "Recommended Crops"}
            </h2>
            <Accordion type="single" collapsible className="space-y-4" defaultValue="rec-0">
              {recommendations?.map((crop, i) => (
                <AccordionItem key={i} value={`rec-${i}`} className="border rounded-xl bg-card overflow-hidden">
                  <AccordionTrigger className="px-6 hover:no-underline hover:bg-muted/50 data-[state=open]:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-xl">
                          {crop.icon}
                        </div>
                        <div className="text-left">
                          <div className="font-semibold text-lg">{getCropName(crop.cropName, isFil)}</div>
                          <div className="text-sm text-muted-foreground">
                            {isFil ? "Kakaangkop: " : "Suitability: "}{formatSuitability(crop.suitability)}
                          </div>
                        </div>
                      </div>
                      <Badge variant="secondary" className={getRiskColor(crop.riskLevel)}>
                        {formatRiskText(crop.riskLevel)}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6 pt-2">
                    <div className="grid sm:grid-cols-2 gap-4 mt-4">
                      <div className="space-y-1 p-3 bg-background rounded-lg border">
                        <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <TrendingUp className="h-3.5 w-3.5" /> {t.expectedYield}
                        </div>
                        <div className="font-medium">{getEstimatedYield(crop.estimatedYield, isFil)}</div>
                      </div>
                      <div className="space-y-1 p-3 bg-background rounded-lg border">
                        <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <CalendarIcon className="h-3.5 w-3.5" /> {isFil ? "Panahon ng Pagtatanim" : "Planting Window"}
                        </div>
                        <div className="font-medium">{getPlantingWindow(crop.plantingWindow, isFil)}</div>
                      </div>
                      <div className="sm:col-span-2 space-y-2 p-3 bg-background rounded-lg border">
                        <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <Info className="h-3.5 w-3.5" /> {isFil ? "Mga Tala sa Pagsasaka" : "Agronomist Notes"}
                        </div>
                        <p className="text-sm leading-relaxed">{getCropNotes(crop.notes, crop.cropName, isFil)}</p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" /> {isFil ? "Mga Mendating Gawain" : "Upcoming Activities"}
            </h2>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{isFil ? "Susunod na 30 Araw" : "Next 30 Days"}</CardTitle>
                <CardDescription>{isFil ? "Nakatakdang mga gawain sa bukid" : "Scheduled farming tasks"}</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <CalendarList calendar={calendar} getPriorityColor={getPriorityColor} isFil={isFil} />
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

function CalendarList({
  calendar,
  getPriorityColor,
  isFil,
}: {
  calendar: any[] | undefined;
  getPriorityColor: (p: string) => string;
  isFil: boolean;
}) {
  if (!calendar || calendar.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground text-sm">
        {isFil ? "Walang nakatakdang gawain." : "No upcoming activities scheduled."}
      </div>
    );
  }
  return (
    <div className="divide-y">
      {calendar.map((event, i) => (
        <div key={i} className="p-4 flex gap-4 hover:bg-muted/40 transition-colors">
          <div className="w-12 text-center shrink-0">
            <div className="text-2xl font-bold text-primary">{event.daysFromNow}</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{isFil ? "Araw" : "Days"}</div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm truncate">{getCalendarCrop(event.crop, isFil)}</span>
              <AlertTriangle className={`h-3.5 w-3.5 shrink-0 ${getPriorityColor(event.priority)}`} />
            </div>
            <div className="text-xs text-muted-foreground mt-0.5 leading-snug">{getCalendarActivity(event.activity, isFil)}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
