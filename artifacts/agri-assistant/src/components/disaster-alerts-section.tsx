import React, { useState, useEffect } from "react";
import { useSettings } from "@/hooks/use-settings";
import { 
  ShieldCheck, AlertTriangle, AlertCircle, Info, ChevronDown, ChevronUp,
  Wind, CloudRain, Waves, Radio, MapPin, Clock, ExternalLink, RefreshCw
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface DisasterAlert {
  id: string;
  title: string;
  eventType:
    | "Typhoon"
    | "Tropical Cyclone"
    | "Heavy Rain"
    | "Torrential Rainfall"
    | "Flooding Risk"
    | "Strong Winds"
    | "Storm Surge"
    | "Thunderstorm"
    | "Severe Weather";
  severity: "Severe Warning" | "Warning" | "Watch" | "Information";
  affectedAreas: string[];
  issuedAt: string;
  validPeriod?: string;
  warningLevel?: string;
  expectedRainfall?: string;
  expectedWinds?: string;
  stormLocation?: string;
  stormMovement?: string;
  officialInstructions?: string;
  source: string;
  updatedAt: string;
  active: boolean;
}

export interface DisasterAlertsData {
  location: string;
  hasActiveAlert: boolean;
  alerts: DisasterAlert[];
  message: string;
  updatedAt: string;
  source: string;
}

interface DisasterAlertsSectionProps {
  location: string;
  compact?: boolean;
}

export function DisasterAlertsSection({ location, compact = false }: DisasterAlertsSectionProps) {
  const { settings } = useSettings();
  const isFil = settings.language === "fil";

  const [data, setData] = useState<DisasterAlertsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [expandedAlerts, setExpandedAlerts] = useState<Record<string, boolean>>({});

  const fetchAlerts = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(
        `/api/weather/disaster-alerts?location=${encodeURIComponent(location)}&lang=${settings.language}`
      );
      if (!res.ok) throw new Error("Failed to fetch alerts");
      const json: DisasterAlertsData = await res.json();
      setData(json);
    } catch (e) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [location, settings.language]);

  const toggleExpand = (id: string) => {
    setExpandedAlerts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getSeverityStyle = (severity: DisasterAlert["severity"]) => {
    switch (severity) {
      case "Severe Warning":
        return {
          container: "bg-rose-500/10 dark:bg-rose-950/40 border-rose-500 text-rose-950 dark:text-rose-100",
          badge: "bg-rose-600 text-white font-bold",
          icon: <AlertTriangle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0" />,
          accent: "text-rose-700 dark:text-rose-300",
        };
      case "Warning":
        return {
          container: "bg-amber-500/10 dark:bg-amber-950/40 border-amber-500 text-amber-950 dark:text-amber-100",
          badge: "bg-amber-600 text-white font-bold",
          icon: <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />,
          accent: "text-amber-700 dark:text-amber-300",
        };
      case "Watch":
        return {
          container: "bg-yellow-500/10 dark:bg-yellow-950/40 border-yellow-400 text-yellow-950 dark:text-yellow-100",
          badge: "bg-yellow-500 text-stone-900 font-bold",
          icon: <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 shrink-0" />,
          accent: "text-yellow-800 dark:text-yellow-300",
        };
      case "Information":
      default:
        return {
          container: "bg-sky-500/10 dark:bg-sky-950/40 border-sky-400 text-sky-950 dark:text-sky-100",
          badge: "bg-sky-600 text-white font-bold",
          icon: <Info className="h-5 w-5 text-sky-600 dark:text-sky-400 shrink-0" />,
          accent: "text-sky-700 dark:text-sky-300",
        };
    }
  };

  const getEventIcon = (eventType: DisasterAlert["eventType"]) => {
    switch (eventType) {
      case "Typhoon":
      case "Tropical Cyclone":
        return <Wind className="h-4 w-4 shrink-0" />;
      case "Heavy Rain":
      case "Torrential Rainfall":
        return <CloudRain className="h-4 w-4 shrink-0" />;
      case "Flooding Risk":
      case "Storm Surge":
        return <Waves className="h-4 w-4 shrink-0" />;
      default:
        return <Radio className="h-4 w-4 shrink-0" />;
    }
  };

  if (compact) {
    if (loading) return null;
    if (!data?.hasActiveAlert || data.alerts.length === 0) return null;

    const topAlert = data.alerts[0];
    const style = getSeverityStyle(topAlert.severity);

    return (
      <div className={`p-3.5 rounded-2xl border ${style.container} flex items-start justify-between gap-3 shadow-xs`}>
        <div className="flex items-start gap-2.5 min-w-0">
          {style.icon}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <Badge className={`text-[10px] px-2 py-0.5 rounded-md ${style.badge}`}>
                {topAlert.severity.toUpperCase()}
              </Badge>
              <span className="text-xs font-bold truncate">{topAlert.title}</span>
            </div>
            <p className="text-[11px] opacity-90 truncate">
              {topAlert.affectedAreas.join(", ")}
            </p>
          </div>
        </div>
        <a
          href="/weather#disaster-alerts"
          className="shrink-0 text-xs font-bold underline hover:opacity-80 transition-opacity"
        >
          {isFil ? "Tingnan" : "View"}
        </a>
      </div>
    );
  }

  return (
    <div id="disaster-alerts" className="space-y-4 font-sans">
      {/* SECTION HEADER */}
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
            <Radio className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
              {isFil ? "Mga Babala sa Masamang Panahon (PAGASA)" : "Disaster & Severe Weather Alerts"}
            </h2>
            <p className="text-xs text-muted-foreground">
              {isFil
                ? "Opisyal na babala mula sa DOST-PAGASA para sa iyong rehiyon"
                : "Official warnings from DOST-PAGASA tailored to your location"}
            </p>
          </div>
        </div>

        <button
          onClick={fetchAlerts}
          disabled={loading}
          className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors text-xs flex items-center gap-1 shrink-0"
          title="Refresh PAGASA alerts"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline text-[11px]">{isFil ? "I-refresh" : "Refresh"}</span>
        </button>
      </div>

      {/* NO ACTIVE ALERTS STATE */}
      {!loading && (!data?.hasActiveAlert || data.alerts.length === 0) && (
        <div className="p-5 rounded-3xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/40 flex items-start sm:items-center gap-4 text-emerald-900 dark:text-emerald-200">
          <div className="p-2.5 rounded-2xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 shrink-0">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-sm sm:text-base text-emerald-950 dark:text-emerald-100">
              {isFil ? "Walang aktibong babala sa masamang panahon." : "No active severe weather alerts."}
            </div>
            <p className="text-xs text-emerald-800 dark:text-emerald-300 mt-0.5">
              {isFil
                ? `Ligtas ang lagay ng panahon sa ${location}. Patuloy na binabantayan ng DOST-PAGASA ang anumang sama ng panahon.`
                : `Normal weather conditions monitored in ${location}. DOST-PAGASA actively tracks regional atmospheric hazards.`}
            </p>
          </div>
          <Badge variant="outline" className="hidden sm:inline-flex bg-emerald-100/60 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 border-emerald-300/60 text-[10px] shrink-0">
            {isFil ? "Ulat Panahon ng PAGASA" : "PAGASA Weather Feed"}
          </Badge>
        </div>
      )}

      {/* ACTIVE ALERTS CARDS LIST */}
      {!loading && data?.hasActiveAlert && data.alerts.length > 0 && (
        <div className="space-y-3.5">
          {data.alerts.map((alert) => {
            const style = getSeverityStyle(alert.severity);
            const isExpanded = !!expandedAlerts[alert.id];

            return (
              <div
                key={alert.id}
                className={`p-5 rounded-3xl border-2 ${style.container} shadow-md transition-all space-y-4`}
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    {style.icon}
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <Badge className={`text-xs px-2.5 py-0.5 rounded-lg ${style.badge}`}>
                          {alert.severity}
                        </Badge>
                        {alert.warningLevel && (
                          <Badge variant="outline" className="text-xs font-semibold bg-white/50 dark:bg-black/30">
                            {alert.warningLevel}
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-base font-extrabold tracking-tight leading-snug">
                        {alert.title}
                      </h3>
                    </div>
                  </div>

                  <div className="text-xs opacity-80 flex items-center gap-1.5 shrink-0 bg-white/40 dark:bg-black/20 px-3 py-1.5 rounded-xl border border-white/20">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{alert.issuedAt}</span>
                  </div>
                </div>

                {/* Quick Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs pt-1">
                  <div className="p-2.5 rounded-xl bg-white/40 dark:bg-black/20 flex items-center gap-2">
                    <MapPin className="h-4 w-4 shrink-0 text-stone-600 dark:text-stone-400" />
                    <span className="truncate">
                      <strong>{isFil ? "Apektadong Lugar:" : "Affected Areas:"}</strong>{" "}
                      {alert.affectedAreas.join(", ")}
                    </span>
                  </div>

                  {alert.expectedRainfall && (
                    <div className="p-2.5 rounded-xl bg-white/40 dark:bg-black/20 flex items-center gap-2">
                      <CloudRain className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
                      <span className="truncate">
                        <strong>{isFil ? "Ulan:" : "Rainfall:"}</strong> {alert.expectedRainfall}
                      </span>
                    </div>
                  )}

                  {alert.expectedWinds && (
                    <div className="p-2.5 rounded-xl bg-white/40 dark:bg-black/20 flex items-center gap-2">
                      <Wind className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                      <span className="truncate">
                        <strong>{isFil ? "Hangin:" : "Winds:"}</strong> {alert.expectedWinds}
                      </span>
                    </div>
                  )}
                </div>

                {/* Toggle expandable full details */}
                <div className="pt-2 border-t border-black/10 dark:border-white/10 flex items-center justify-between">
                  <button
                    onClick={() => toggleExpand(alert.id)}
                    className="text-xs font-bold underline flex items-center gap-1 hover:opacity-80 transition-opacity"
                  >
                    <span>
                      {isExpanded
                        ? isFil ? "Ipagkait ang Detalye" : "Hide Full Details"
                        : isFil ? "Tingnan ang Buong Detalye & Tagubilin" : "View Full Details & Official Instructions"}
                    </span>
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>

                  <span className="text-[11px] opacity-75 italic">
                    Source: {alert.source}
                  </span>
                </div>

                {/* Expanded Details Section */}
                {isExpanded && (
                  <div className="p-4 rounded-2xl bg-white/60 dark:bg-black/40 border border-black/10 dark:border-white/10 text-xs space-y-3 animate-in fade-in duration-200">
                    {alert.validPeriod && (
                      <div>
                        <strong className="block text-stone-700 dark:text-stone-300">
                          {isFil ? "Bisa ng Babala:" : "Valid Period:"}
                        </strong>
                        <span className="opacity-90">{alert.validPeriod}</span>
                      </div>
                    )}

                    {alert.stormLocation && (
                      <div>
                        <strong className="block text-stone-700 dark:text-stone-300">
                          {isFil ? "Lokasyon ng Bagyo:" : "Storm Position:"}
                        </strong>
                        <span className="opacity-90">{alert.stormLocation}</span>
                      </div>
                    )}

                    {alert.stormMovement && (
                      <div>
                        <strong className="block text-stone-700 dark:text-stone-300">
                          {isFil ? "Kilos at Bilis:" : "Movement Speed:"}
                        </strong>
                        <span className="opacity-90">{alert.stormMovement}</span>
                      </div>
                    )}

                    {alert.officialInstructions && (
                      <div className="p-3 rounded-xl bg-amber-100/80 dark:bg-amber-950/60 border border-amber-300/80 text-amber-950 dark:text-amber-100">
                        <strong className="block font-bold text-xs uppercase tracking-wider mb-1">
                          📢 {isFil ? "Opisyal na Tagubilin ng PAGASA:" : "Official PAGASA Safety Instructions:"}
                        </strong>
                        <p className="leading-relaxed">{alert.officialInstructions}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
