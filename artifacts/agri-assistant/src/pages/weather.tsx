import { useLocationStore } from "@/hooks/use-location";
import { useSettings } from "@/hooks/use-settings";
import { 
  useGetWeather, getGetWeatherQueryKey, 
  useGetWeatherForecast, getGetWeatherForecastQueryKey,
  useGetFarmingAdvice, getGetFarmingAdviceQueryKey
} from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { 
  Cloud, Droplets, Wind, Sun, MapPin, AlertCircle, Info, Umbrella, Sunrise, Sunset,
  Compass, Clock, ShieldCheck, AlertTriangle, RefreshCw, Sprout
} from "lucide-react";
import { DisasterAlertsSection } from "@/components/disaster-alerts-section";

export default function Weather() {
  const { location } = useLocationStore();
  const { settings } = useSettings();

  const lat = settings.cityLat ?? undefined;
  const lon = settings.cityLon ?? undefined;
  const weatherParams = { location, ...(lat !== undefined && lon !== undefined ? { lat, lon } : {}) };

  const { data: current, isLoading: isCurrentLoading, refetch: refetchCurrent } = useGetWeather(
    weatherParams, 
    { query: { queryKey: getGetWeatherQueryKey(weatherParams) } }
  );

  const { data: forecast, isLoading: isForecastLoading } = useGetWeatherForecast(
    weatherParams, 
    { query: { queryKey: getGetWeatherForecastQueryKey(weatherParams) } }
  );

  const { data: advice, isLoading: isAdviceLoading } = useGetFarmingAdvice(
    { location }, 
    { query: { queryKey: getGetFarmingAdviceQueryKey({ location }) } }
  );

  if (isCurrentLoading || isForecastLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-[200px] w-full rounded-3xl" />
        <Skeleton className="h-[340px] w-full rounded-[2.5rem]" />
        <Skeleton className="h-[200px] w-full rounded-3xl" />
      </div>
    );
  }

  if (!current || !forecast) return null;

  const currentData = current as any;
  const isFil = settings.language === "fil";
  const updatedTime = currentData.updatedAt 
    ? new Date(currentData.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "";

  const hourlyList = currentData.hourly || [];
  const dailyList = (currentData.daily && currentData.daily.length > 0) ? currentData.daily : forecast;

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12 font-sans">
      
      {/* Grownox Weather Status Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-muted-foreground">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 gap-1 text-[11px] font-bold">
            <ShieldCheck className="h-3.5 w-3.5 text-sky-600" />
            {isFil ? "Grownox Weather System" : "Grownox Weather Experience"}
          </Badge>
          {currentData.isLive ? (
            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              {isFil ? "Live na Panahon" : "Live Weather"}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold text-[11px]">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              {isFil ? "Naka-cache (Offline)" : "Cached Weather"}
            </span>
          )}
        </div>

        {updatedTime && (
          <div className="flex items-center gap-1.5 text-[11px]">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span>{isFil ? "Huling na-update:" : "Updated at:"} {updatedTime}</span>
            <button 
              onClick={() => refetchCurrent()}
              className="ml-1 p-1 hover:bg-muted rounded-md transition-colors"
              title="Refresh weather"
            >
              <RefreshCw className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>

      {/* DISASTER & SEVERE WEATHER ALERTS SECTION */}
      <DisasterAlertsSection location={location} />

      {/* Model Uncertainty Warning if Disagreement present */}
      {currentData.uncertaintyNote && (
        <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 flex items-start gap-3 text-xs text-amber-800 dark:text-amber-300">
          <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">{isFil ? "Model Forecast Variance:" : "Forecast Model Variance:"} </span>
            <span>{currentData.uncertaintyNote}</span>
          </div>
        </div>
      )}

      {/* Main Weather Hero Card */}
      <div className="relative rounded-[2.5rem] bg-gradient-to-b from-sky-500 via-sky-600 to-indigo-900 text-white overflow-hidden shadow-xl border border-white/10">
        <div className="absolute top-10 right-10 w-64 h-64 bg-white/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-48 h-48 bg-white/10 rounded-full blur-2xl" />

        <div className="relative z-10 flex flex-col items-center justify-center p-8 sm:p-10 text-center min-h-[320px]">
          <div className="text-2xl font-bold tracking-wide drop-shadow-sm flex items-center gap-2">
            <MapPin className="h-5 w-5 text-sky-200" />
            <span>{location}</span>
          </div>
          
          <div className="text-8xl font-light tracking-tighter my-2 drop-shadow-md">
            {currentData.temperature}°
          </div>
          
          <div className="text-xl font-semibold capitalize drop-shadow-sm text-sky-100 mb-1">
            {currentData.condition}
          </div>

          <div className="flex items-center gap-3 text-xs text-sky-100 font-medium bg-black/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/15 mt-2 flex-wrap justify-center">
            <span>{isFil ? "Parang" : "Feels like"} {currentData.feelsLike}°</span>
            <span>·</span>
            <span>{isFil ? "Tsansa ng ulan" : "Rain prob"} {currentData.rainProbability}%</span>
            <span>·</span>
            <span>{isFil ? "Hangin" : "Wind"} {currentData.windSpeed} km/h</span>
          </div>
        </div>

        {/* Detailed weather stats strip */}
        <div className="relative z-10 border-t border-white/20 bg-black/20 backdrop-blur-xl">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 p-4 sm:p-6 gap-4 text-center">
            <div className="flex flex-col items-center p-2 rounded-xl bg-white/5">
              <span className="text-xs text-sky-200 mb-1">{isFil ? "Halumigmig" : "Humidity"}</span>
              <Droplets className="h-5 w-5 text-sky-300 mb-1" />
              <span className="font-bold text-base">{currentData.humidity}%</span>
            </div>

            <div className="flex flex-col items-center p-2 rounded-xl bg-white/5">
              <span className="text-xs text-sky-200 mb-1">{isFil ? "Hangin & Direksyon" : "Wind & Dir"}</span>
              <Compass className="h-5 w-5 text-sky-300 mb-1" />
              <span className="font-bold text-sm">{currentData.windDirection || `${currentData.windSpeed} km/h`}</span>
            </div>

            <div className="flex flex-col items-center p-2 rounded-xl bg-white/5">
              <span className="text-xs text-sky-200 mb-1">{isFil ? "Bugso ng Hangin" : "Wind Gusts"}</span>
              <Wind className="h-5 w-5 text-sky-300 mb-1" />
              <span className="font-bold text-base">{currentData.windGusts ?? currentData.windSpeed} <span className="text-xs font-normal">km/h</span></span>
            </div>

            <div className="flex flex-col items-center p-2 rounded-xl bg-white/5">
              <span className="text-xs text-sky-200 mb-1">{isFil ? "Dami ng Ulan" : "Precipitation"}</span>
              <Umbrella className="h-5 w-5 text-sky-300 mb-1" />
              <span className="font-bold text-base">{currentData.rainfall} <span className="text-xs font-normal">mm</span></span>
            </div>

            <div className="flex flex-col items-center p-2 rounded-xl bg-white/5">
              <span className="text-xs text-sky-200 mb-1">{isFil ? "Takip ng Ulap" : "Cloud Cover"}</span>
              <Cloud className="h-5 w-5 text-sky-300 mb-1" />
              <span className="font-bold text-base">{currentData.cloudCover}%</span>
            </div>

            <div className="flex flex-col items-center p-2 rounded-xl bg-white/5">
              <span className="text-xs text-sky-200 mb-1">UV Index</span>
              <Sun className="h-5 w-5 text-amber-300 mb-1" />
              <span className="font-bold text-base">{currentData.uvIndex}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hourly 24-Hour Forecast Strip */}
      {hourlyList.length > 0 && (
        <div className="bg-card rounded-3xl p-5 shadow-sm border border-border/80">
          <div className="flex items-center gap-2 text-sky-700 dark:text-sky-300 font-bold text-xs uppercase tracking-wider mb-4">
            <Clock className="h-4 w-4 text-sky-600" />
            <h3>{isFil ? "24-Oras na Taya ng Panahon" : "24-Hour Hourly Forecast"}</h3>
          </div>

          <div className="flex overflow-x-auto gap-3 pb-2 hide-scrollbar">
            {hourlyList.map((item: any, idx: number) => (
              <div 
                key={idx} 
                className="flex flex-col items-center justify-between min-w-[76px] p-3 rounded-2xl bg-muted/40 border border-border/50 text-center shrink-0 space-y-1.5"
              >
                <span className="text-xs text-muted-foreground font-medium">{item.time}</span>
                <span className="text-lg font-bold">{item.temp}°</span>
                <span className="text-[10px] text-sky-600 dark:text-sky-400 font-semibold">{item.precipProb}% rain</span>
                <span className="text-[10px] text-muted-foreground truncate max-w-[70px]">{item.condition}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Agronomist Advisory */}
      <div className="bg-card rounded-3xl p-6 sm:p-8 shadow-sm border border-blue-200/60 dark:border-blue-900/50 flex flex-col sm:flex-row gap-6">
        <div className="shrink-0 h-14 w-14 bg-blue-100 dark:bg-blue-950/60 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-300">
          <AlertCircle className="h-7 w-7" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold mb-2 text-stone-900 dark:text-stone-100">
            {isFil ? "Payo ng Agronomo" : "Agronomist Insights & Guidelines"}
          </h3>
          {isAdviceLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-full rounded-lg" />
              <Skeleton className="h-4 w-5/6 rounded-lg" />
            </div>
          ) : advice ? (
            <>
              <p className="text-stone-600 dark:text-stone-300 leading-relaxed text-sm">{advice.advice}</p>
              {((advice.urgentAlerts?.length ?? 0) > 0 || (advice.recommendations?.length ?? 0) > 0) && (
                <div className="mt-5 grid sm:grid-cols-2 gap-4">
                  {(advice.urgentAlerts?.length ?? 0) > 0 && (
                    <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-900/40">
                      <h4 className="text-xs font-bold text-rose-700 dark:text-rose-300 uppercase tracking-wider mb-2">
                        {isFil ? "Mga Kritikal na Aksyon" : "Critical Actions"}
                      </h4>
                      <ul className="space-y-1.5">
                        {(advice.urgentAlerts ?? []).map((alert, i) => (
                          <li key={i} className="text-xs text-rose-800 dark:text-rose-200 flex items-start gap-2">
                            <span className="shrink-0 h-2 w-2 rounded-full bg-rose-500 mt-1" />
                            <span>{alert}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {(advice.recommendations?.length ?? 0) > 0 && (
                    <div className="p-3.5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/40">
                      <h4 className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider mb-2">
                        {isFil ? "Mga Rekomendasyon" : "Recommendations"}
                      </h4>
                      <ul className="space-y-1.5">
                        {(advice.recommendations ?? []).map((rec, i) => (
                          <li key={i} className="text-xs text-blue-900 dark:text-blue-200 flex items-start gap-2">
                            <span className="shrink-0 h-2 w-2 rounded-full bg-blue-500 mt-1" />
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <p className="text-stone-500 text-sm">{isFil ? "Kasalukuyang hindi magagamit ang payo." : "Advice unavailable at the moment."}</p>
          )}
        </div>
      </div>

      {/* 7-Day Detailed Forecast */}
      <div className="bg-card rounded-3xl p-6 sm:p-8 shadow-sm border border-blue-200/60 dark:border-blue-900/50">
        <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-bold text-xs uppercase tracking-wider mb-6">
          <Cloud className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h2>{isFil ? "7-ARAW NA TAYA NG PANAHON" : "7-DAY DETAILED FORECAST"}</h2>
        </div>
        
        <div className="flex flex-col divide-y divide-border/60">
          {dailyList.map((day: any, i: number) => {
            const isToday = i === 0;
            return (
              <div key={i} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:bg-muted/30 -mx-4 px-4 rounded-2xl transition-colors">
                <div className="w-28 shrink-0">
                  <div className="font-bold text-base text-stone-800 dark:text-stone-200">
                    {isToday ? (isFil ? "Ngayon" : "Today") : day.dayName}
                  </div>
                  <div className="text-[11px] text-muted-foreground">{day.date}</div>
                </div>
                
                <div className="flex items-center gap-3 shrink-0">
                  <Cloud className="h-6 w-6 text-sky-500" />
                  <div>
                    <div className="text-xs font-semibold">{day.condition}</div>
                    <div className="text-[11px] text-sky-600 dark:text-sky-400 font-medium">
                      {day.rainProbability ? `${day.rainProbability}% ${isFil ? "tsansa" : "chance"}` : ''} {day.rainfall > 0 ? `(${day.rainfall}mm)` : ''}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-medium text-muted-foreground w-7 text-right">{day.low}°</span>
                  <div className="w-20 sm:w-28 h-2 bg-blue-100 dark:bg-stone-800 rounded-full overflow-hidden flex">
                    <div className="h-full bg-gradient-to-r from-sky-400 to-blue-600 w-full opacity-80" />
                  </div>
                  <span className="font-bold text-sm text-stone-900 dark:text-stone-100 w-7">{day.high}°</span>
                </div>

                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {day.sunrise && (
                    <span className="inline-flex items-center gap-1">
                      <Sunrise className="h-3.5 w-3.5 text-amber-500" />
                      {day.sunrise}
                    </span>
                  )}
                  {day.sunset && (
                    <span className="inline-flex items-center gap-1">
                      <Sunset className="h-3.5 w-3.5 text-indigo-400" />
                      {day.sunset}
                    </span>
                  )}
                </div>

                <div className="sm:text-right max-w-xs">
                  <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
                    <Info className="h-3 w-3 shrink-0 text-blue-500" />
                    {day.farmingNote}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Attribution Notice */}
      <div className="text-[11px] text-muted-foreground/60 text-center pt-4 leading-relaxed">
        {isFil 
          ? "Grownox Weather Experience · Datos ng panahon mula sa Open-Meteo API (CC-BY 4.0) · Mga babala sa matinding panahon mula sa DOST-PAGASA"
          : "Grownox Weather Experience · Meteorological forecast data provided by Open-Meteo API (CC-BY 4.0) · Severe weather disaster alerts sourced directly from DOST-PAGASA"}
      </div>

    </div>
  );
}

