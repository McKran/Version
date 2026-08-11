import { useLocationStore } from "@/hooks/use-location";
import { useSettings } from "@/hooks/use-settings";
import { 
  useGetWeather, getGetWeatherQueryKey, 
  useGetWeatherForecast, getGetWeatherForecastQueryKey,
  useGetFarmingAdvice, getGetFarmingAdviceQueryKey
} from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Cloud, Droplets, Wind, Sun, MapPin, AlertCircle, Info, Umbrella, Sunrise } from "lucide-react";

export default function Weather() {
  const { location } = useLocationStore();
  const { settings } = useSettings();

  const lat = settings.cityLat ?? undefined;
  const lon = settings.cityLon ?? undefined;
  const weatherParams = { location, ...(lat !== undefined && lon !== undefined ? { lat, lon } : {}) };

  const { data: current, isLoading: isCurrentLoading } = useGetWeather(
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
        <Skeleton className="h-[400px] w-full rounded-[2.5rem]" />
        <Skeleton className="h-[200px] w-full rounded-3xl" />
        <Skeleton className="h-[400px] w-full rounded-3xl" />
      </div>
    );
  }

  if (!current || !forecast) return null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      
      {/* Apple Weather Style Hero */}
      <div className="relative rounded-[2.5rem] bg-gradient-to-b from-sky-400 to-sky-600 dark:from-sky-800 dark:to-indigo-950 text-white overflow-hidden shadow-xl border border-white/10">
        {/* Abstract clouds/sun overlay */}
        <div className="absolute top-10 right-10 w-64 h-64 bg-white/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>

        <div className="relative z-10 flex flex-col items-center justify-center p-12 text-center min-h-[360px]">
          <div className="text-2xl font-medium tracking-wide drop-shadow-sm">{location}</div>
          <div className="text-8xl font-light tracking-tighter my-2 drop-shadow-md">{current.temperature}°</div>
          <div className="text-xl font-medium capitalize drop-shadow-sm text-sky-100">{current.condition}</div>
          <div className="flex gap-4 mt-2 text-sky-100 font-medium">
            <span>H:{Math.max(...forecast.map(f => f.high))}°</span>
            <span>L:{Math.min(...forecast.map(f => f.low))}°</span>
          </div>
        </div>

        {/* Scrollable stats strip */}
        <div className="relative z-10 border-t border-white/20 bg-black/10 backdrop-blur-xl">
          <div className="flex overflow-x-auto p-6 gap-8 hide-scrollbar snap-x px-8">
            <div className="flex flex-col items-center gap-3 shrink-0 snap-center">
              <span className="text-sm text-sky-100">Humidity</span>
              <Droplets className="h-6 w-6 text-white" />
              <span className="font-semibold text-lg">{current.humidity}%</span>
            </div>
            <div className="flex flex-col items-center gap-3 shrink-0 snap-center">
              <span className="text-sm text-sky-100">Wind</span>
              <Wind className="h-6 w-6 text-white" />
              <span className="font-semibold text-lg">{current.windSpeed} <span className="text-sm font-normal">km/h</span></span>
            </div>
            <div className="flex flex-col items-center gap-3 shrink-0 snap-center">
              <span className="text-sm text-sky-100">Rainfall</span>
              <Umbrella className="h-6 w-6 text-white" />
              <span className="font-semibold text-lg">{current.rainfall} <span className="text-sm font-normal">mm</span></span>
            </div>
            <div className="flex flex-col items-center gap-3 shrink-0 snap-center">
              <span className="text-sm text-sky-100">UV Index</span>
              <Sun className="h-6 w-6 text-white" />
              <span className="font-semibold text-lg">{current.uvIndex}</span>
            </div>
            <div className="flex flex-col items-center gap-3 shrink-0 snap-center">
              <span className="text-sm text-sky-100">Feels Like</span>
              <Sunrise className="h-6 w-6 text-white" />
              <span className="font-semibold text-lg">{current.feelsLike}°</span>
            </div>
          </div>
        </div>
      </div>

      {/* Farming Impact/Advice */}
      <div className="bg-card rounded-3xl p-6 sm:p-8 shadow-sm border border-blue-200/60 dark:border-blue-900/50 flex flex-col sm:flex-row gap-6">
        <div className="shrink-0 h-16 w-16 bg-blue-100 dark:bg-blue-950/60 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-300">
          <AlertCircle className="h-8 w-8" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold mb-2 text-stone-900 dark:text-stone-100">Agronomist Insights</h3>
          {isAdviceLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-full rounded-lg" />
              <Skeleton className="h-4 w-5/6 rounded-lg" />
              <Skeleton className="h-4 w-4/6 rounded-lg" />
            </div>
          ) : advice ? (
            <>
              <p className="text-stone-600 dark:text-stone-300 leading-relaxed text-sm">{advice.advice}</p>
              {((advice.urgentAlerts?.length ?? 0) > 0 || (advice.recommendations?.length ?? 0) > 0) && (
                <div className="mt-6 grid sm:grid-cols-2 gap-6">
                  {(advice.urgentAlerts?.length ?? 0) > 0 && (
                    <div>
                      <h4 className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider mb-3">Critical Actions</h4>
                      <ul className="space-y-2">
                        {(advice.urgentAlerts ?? []).map((alert, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-rose-800 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-900/40 p-3 rounded-xl">
                            <span className="shrink-0 h-2 w-2 rounded-full bg-rose-500 mt-1" />
                            <span>{alert}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {(advice.recommendations?.length ?? 0) > 0 && (
                    <div>
                      <h4 className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider mb-3">Recommendations</h4>
                      <ul className="space-y-2">
                        {(advice.recommendations ?? []).map((rec, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-blue-900 dark:text-blue-200 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/40 p-3 rounded-xl">
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
            <p className="text-stone-500 text-sm">AI insights unavailable right now.</p>
          )}
        </div>
      </div>

      {/* 7-Day Forecast */}
      <div className="bg-card rounded-3xl p-6 sm:p-8 shadow-sm border border-blue-200/60 dark:border-blue-900/50">
        <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-bold text-xs uppercase tracking-wider mb-6">
          <Cloud className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h2>7-DAY FORECAST</h2>
        </div>
        
        <div className="flex flex-col divide-y divide-blue-100/80 dark:divide-blue-950/60">
          {forecast.map((day, i) => {
            const isToday = i === 0;
            return (
              <div key={i} className="py-4 flex flex-col sm:flex-row sm:items-center gap-4 group hover:bg-blue-50/50 dark:hover:bg-blue-950/30 -mx-4 px-4 rounded-xl transition-colors">
                <div className="w-24 shrink-0 font-medium text-base text-stone-800 dark:text-stone-200">
                  {isToday ? "Today" : day.dayName}
                </div>
                
                <div className="flex items-center gap-4 shrink-0 w-32">
                  <Cloud className="h-7 w-7 text-sky-500 drop-shadow-xs" />
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">{day.rainfall > 0 ? `${day.rainfall}mm` : ''}</span>
                </div>
                
                <div className="flex items-center gap-3 shrink-0 flex-1 sm:max-w-[200px]">
                  <span className="text-stone-500 dark:text-stone-400 text-xs font-medium w-6 text-right">{day.low}°</span>
                  {/* Visual Range Bar */}
                  <div className="flex-1 h-1.5 bg-blue-100 dark:bg-stone-800 rounded-full overflow-hidden flex">
                    <div className="h-full bg-gradient-to-r from-sky-400 to-blue-600 w-full opacity-80"></div>
                  </div>
                  <span className="font-bold text-xs text-stone-900 dark:text-stone-100 w-6">{day.high}°</span>
                </div>

                <div className="flex-1 sm:text-right">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
                    <Info className="h-3.5 w-3.5 shrink-0 text-blue-500" />
                    {day.farmingNote}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
