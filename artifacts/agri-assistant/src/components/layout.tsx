import { memo, useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  CloudSun,
  Sprout,
  TrendingUp,
  Store,
  ClipboardList,
  MapPin,
  Settings,
  Menu,
  X,
  MessageSquare,
  ChevronRight,
  Video,
  Languages,
  Globe,
} from "lucide-react";
import { useLocationStore } from "@/hooks/use-location";
import { useSettings } from "@/hooks/use-settings";
import { COUNTRIES } from "@/lib/country-data";
import { Input } from "@/components/ui/input";

export function isNavItemActive(href: string, currentPath: string, searchStr: string = ""): boolean {
  const [itemPath, itemQuery] = href.split("?");
  const itemParams = new URLSearchParams(itemQuery || "");
  const itemTab = itemParams.get("tab");

  const currentParams = new URLSearchParams(searchStr || (typeof window !== "undefined" ? window.location.search : ""));
  const currentTab = currentParams.get("tab");

  if (itemPath === "/") {
    return currentPath === "/";
  }

  if (currentPath !== itemPath) {
    return false;
  }

  if (itemTab) {
    if (itemTab === "farmer") return currentTab === "farmer" || currentTab === "farmer-dash";
    if (itemTab === "orders") return currentTab === "orders" || currentTab === "buyer-dash";
    if (itemTab === "browse") return !currentTab || currentTab === "browse";
    return currentTab === itemTab;
  }

  if (itemPath === "/marketplace") {
    return !currentTab || currentTab === "browse";
  }

  return true;
}

function getActiveNavStyle(href: string): string {
  if (href === "/") return "bg-emerald-800 text-white shadow-sm";
  if (href.startsWith("/weather")) return "bg-blue-600 text-white shadow-sm";
  if (href.startsWith("/crops")) return "bg-emerald-600 text-white shadow-sm";
  if (href.startsWith("/market") && !href.startsWith("/marketplace")) return "bg-emerald-700 text-white shadow-sm";
  if (href.startsWith("/marketplace")) return "bg-gradient-to-r from-amber-600 to-rose-500 text-white shadow-sm";
  if (href.startsWith("/farming-plan")) return "bg-emerald-800 text-white shadow-sm";
  if (href.startsWith("/tutorials")) return "bg-rose-600 text-white shadow-sm";
  if (href.startsWith("/chat")) return "bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 text-white shadow-sm";
  if (href.startsWith("/settings")) return "bg-slate-700 text-white shadow-sm";
  return "bg-emerald-800 text-white shadow-sm";
}

function SidebarInner({
  location,
  setLocation,
  selectedCountry,
  locationPath,
  onNavClick,
}: {
  location: string;
  setLocation: (v: string) => void;
  selectedCountry: typeof COUNTRIES[number] | undefined;
  locationPath: string;
  onNavClick?: () => void;
}) {
  const { t, settings, setLanguage } = useSettings();

  const navItems = [
    { href: "/", icon: LayoutDashboard, label: t.dashboard },
    { href: "/weather", icon: CloudSun, label: t.weather },
    { href: "/crops", icon: Sprout, label: t.crops },
    { href: "/market", icon: TrendingUp, label: t.market },
    { href: "/marketplace", icon: Store, label: t.marketplace },
    { href: "/farming-plan", icon: ClipboardList, label: t.farmingPlan },
    { href: "/tutorials", icon: Video, label: t.tutorials },
    { href: "/chat", icon: MessageSquare, label: t.chat },
    { href: "/settings", icon: Settings, label: t.settings },
  ];

  return (
    <>
      <div className="p-6 border-b border-border/40">
        <div className="flex items-center gap-3 font-bold text-xl text-primary">
          <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <Sprout className="h-5 w-5 text-primary" />
          </div>
          <span>Grownox</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1.5">{t.smartFarmingPlatform}</p>
      </div>

      <div className="px-4 py-3 border-b border-border/40 space-y-2">
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="pl-8 bg-muted/50 border-transparent focus-visible:ring-primary focus-visible:bg-background h-9 rounded-xl text-sm"
            placeholder="Your location..."
          />
        </div>

        {/* Quick Language Toggle in Sidebar */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
            <Languages className="h-3 w-3 text-primary" /> {t.language}
          </span>
          <div className="flex items-center bg-muted p-0.5 rounded-lg border border-border/60">
            <button
              type="button"
              onClick={() => setLanguage("en")}
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${
                settings.language === "en"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              🇬🇧 EN
            </button>
            <button
              type="button"
              onClick={() => setLanguage("fil")}
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${
                settings.language === "fil"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              🇵🇭 FIL
            </button>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = isNavItemActive(item.href, locationPath);
          const activeClass = getActiveNavStyle(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavClick}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                isActive
                  ? activeClass
                  : "text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900"
              }`}
            >
              <item.icon className={`h-4 w-4 shrink-0 ${isActive ? "opacity-100" : "opacity-70"}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const [locationPath] = useLocation();
  const { location, setLocation } = useLocationStore();
  const { settings, fullLocationLabel, t } = useSettings();
  const [fabOpen, setFabOpen] = useState(false);
  const fabRef = useRef<HTMLDivElement>(null);

  const selectedCountry = COUNTRIES.find((c) => c.code === settings.countryCode);
  const displayLocation = fullLocationLabel || location || selectedCountry?.name || "Location";

  // Close FAB menu on tap outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (fabRef.current && !fabRef.current.contains(event.target as Node)) {
        setFabOpen(false);
      }
    }
    if (fabOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [fabOpen]);

  // Close menu on route change
  useEffect(() => {
    setFabOpen(false);
  }, [locationPath]);

  const marketModeLabel =
    settings.targetMarket === "international"
      ? "Int'l Market"
      : settings.targetMarket === "regional"
      ? "Regional Market"
      : "Local Market";

  return (
    <div className="flex h-[100dvh] w-full max-w-full overflow-x-hidden bg-background text-foreground">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-60 lg:w-72 flex-col border-r bg-card h-full shrink-0">
        <SidebarInner
          location={location}
          setLocation={setLocation}
          selectedCountry={selectedCountry}
          locationPath={locationPath}
        />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-full max-w-full overflow-x-hidden relative">
        {/* Mobile Header */}
        <header className="md:hidden flex-none flex items-center justify-between px-3.5 py-2.5 border-b bg-card/95 backdrop-blur z-20 shadow-xs">
          <Link href="/" className="flex items-center gap-2 font-bold text-base text-primary shrink-0">
            <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sprout className="h-4 w-4 text-primary" />
            </div>
            <span>Grownox</span>
          </Link>

          <div className="flex items-center gap-2 max-w-[170px] sm:max-w-xs">
            {selectedCountry && (
              <span className="text-base shrink-0" title={selectedCountry.name}>
                {selectedCountry.flag}
              </span>
            )}
            <div className="relative w-full">
              <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="h-8 pl-7 text-xs bg-muted/50 border-transparent rounded-lg text-ellipsis overflow-hidden"
                placeholder="Location..."
              />
            </div>
          </div>
        </header>

        {/* Desktop Top Bar */}
        <div className="hidden md:flex items-center justify-between px-5 py-2 border-b bg-card/50">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {selectedCountry && (
              <>
                <span>
                  {selectedCountry.flag} {selectedCountry.name}
                </span>
                <span>·</span>
                <span className="font-mono text-primary/80">
                  {selectedCountry.currencySymbol} {settings.currency}
                </span>
                <span>·</span>
              </>
            )}
            <span className="capitalize">{settings.weightUnit.replace("_", " ")} pricing</span>
            <span>·</span>
            <span
              className={`font-medium ${
                settings.targetMarket === "international"
                  ? "text-blue-600 dark:text-blue-400"
                  : settings.targetMarket === "regional"
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-green-600 dark:text-green-400"
              }`}
            >
              {marketModeLabel}
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-teal-50 text-teal-800 border border-teal-200/80 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800/60 rounded-full px-3 py-1 text-xs font-semibold shadow-xs">
            <MapPin className="h-3 w-3 text-teal-600 dark:text-teal-400 shrink-0" />
            <span className="max-w-[220px] truncate" title={displayLocation}>
              {displayLocation}
            </span>
          </div>
        </div>

        {/* Scrollable Page Body */}
        {locationPath === "/chat" ? (
          <div className="flex-1 overflow-hidden relative flex flex-col h-full w-full">
            {children}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto overflow-x-hidden relative pb-28 md:pb-6">
            <div className="p-3 sm:p-5 md:p-6 lg:p-8 max-w-6xl mx-auto w-full min-h-full">
              {children}
            </div>
          </div>
        )}

        {/* Mobile Floating Action Navigation Button (FAB) */}
        <div ref={fabRef} className="md:hidden fixed bottom-5 right-5 z-50 pointer-events-auto">
          {/* Backdrop for mobile menu */}
          {fabOpen && (
            <div
              className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-40 transition-opacity animate-in fade-in duration-200"
              onClick={() => setFabOpen(false)}
            />
          )}

          {/* Floating Circular Toggle Button */}
          <button
            type="button"
            onClick={() => setFabOpen((prev) => !prev)}
            aria-label="Toggle Navigation Menu"
            className={`relative z-50 h-14 w-14 rounded-full bg-emerald-600 text-white shadow-2xl flex items-center justify-center transition-all duration-200 hover:bg-emerald-700 active:scale-90 focus:outline-none focus:ring-4 focus:ring-emerald-400/40 ${
              fabOpen ? "rotate-90 bg-emerald-700 ring-4 ring-emerald-500/30" : "hover:scale-105"
            }`}
          >
            {fabOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          {/* Popover Navigation Menu */}
          {fabOpen && (
            <div className="absolute bottom-16 right-0 z-50 w-64 bg-card/95 backdrop-blur-xl border border-border/80 rounded-2xl p-2.5 shadow-2xl space-y-1 animate-in fade-in zoom-in-90 slide-in-from-bottom-4 duration-200">
              <div className="px-3 py-2 border-b border-border/50 mb-1 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-md bg-emerald-500/10 flex items-center justify-center">
                    <Sprout className="h-3.5 w-3.5 text-emerald-600" />
                  </div>
                  <span className="font-bold text-xs text-foreground tracking-wide">AgriAssist Menu</span>
                </div>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold px-2 py-0.5 rounded-full">
                  Quick Access
                </span>
              </div>

              <div className="space-y-0.5">
                {[
                  { href: "/", icon: LayoutDashboard, label: t.dashboard },
                  { href: "/weather", icon: CloudSun, label: t.weather },
                  { href: "/crops", icon: Sprout, label: t.crops },
                  { href: "/market", icon: TrendingUp, label: t.market },
                  { href: "/marketplace", icon: Store, label: t.marketplace },
                  { href: "/farming-plan", icon: ClipboardList, label: t.farmingPlan },
                  { href: "/tutorials", icon: Video, label: t.tutorials },
                  { href: "/chat", icon: MessageSquare, label: t.chat },
                  { href: "/settings", icon: Settings, label: t.settings },
                ].map((item) => {
                  const isCurrent = isNavItemActive(item.href, locationPath);

                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setFabOpen(false)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all active:scale-[0.98] ${
                        isCurrent
                          ? "bg-emerald-600 text-white shadow-md"
                          : "text-foreground hover:bg-muted/80 active:bg-muted"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <item.icon className={`h-4 w-4 ${isCurrent ? "text-white" : "text-emerald-600"}`} />
                        <span>{item.label}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ChevronRight className={`h-3.5 w-3.5 opacity-60 ${isCurrent ? "text-white" : ""}`} />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
