import { memo, useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { GrownoxIcon } from "@/components/grownox-icon";
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
  Compass,
  LayoutGrid,
  Zap,
} from "lucide-react";
import { useLocationStore } from "@/hooks/use-location";
import { useSettings } from "@/hooks/use-settings";
import { COUNTRIES } from "@/lib/country-data";
import { Input } from "@/components/ui/input";

export function isNavItemActive(href: string, currentPath: string, activeSection: "market" | "farmer" = "farmer", searchStr: string = ""): boolean {
  if (href === "/market-dashboard") {
    return currentPath === "/market-dashboard" || (currentPath === "/" && activeSection === "market");
  }
  if (href === "/farmer-dashboard") {
    return currentPath === "/farmer-dashboard" || (currentPath === "/" && activeSection === "farmer");
  }

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
  if (href === "/" || href === "/farmer-dashboard") return "bg-emerald-800 text-white shadow-sm";
  if (href === "/market-dashboard") return "bg-amber-600 text-white shadow-sm";
  if (href.startsWith("/weather")) return "bg-blue-600 text-white shadow-sm";
  if (href.startsWith("/crops")) return "bg-emerald-600 text-white shadow-sm";
  if (href.startsWith("/market") && !href.startsWith("/marketplace")) return "bg-blue-600 text-white shadow-sm";
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
  const { t, settings, setLanguage, activeSection, setActiveSection } = useSettings();
  const [, setLocationPath] = useLocation();

  const handleSectionSwitch = (sec: "market" | "farmer") => {
    setActiveSection(sec);
    if (sec === "market") {
      if (["/chat", "/farming-plan", "/tutorials", "/crops", "/weather", "/farmer-dashboard"].includes(locationPath)) {
        setLocationPath("/market-dashboard");
      }
    } else {
      if (["/marketplace", "/market", "/market-dashboard"].includes(locationPath)) {
        setLocationPath("/farmer-dashboard");
      }
    }
  };

  const navItems = activeSection === "market"
    ? [
        { href: "/market-dashboard", icon: LayoutDashboard, label: t.dashboard },
        { href: "/marketplace", icon: Store, label: t.marketplace },
        { href: "/market", icon: TrendingUp, label: t.market },
        { href: "/settings", icon: Settings, label: t.settings },
      ]
    : [
        { href: "/farmer-dashboard", icon: LayoutDashboard, label: t.dashboard },
        { href: "/chat", icon: GrownoxIcon, label: t.chat },
        { href: "/farming-plan", icon: ClipboardList, label: t.farmingPlan },
        { href: "/tutorials", icon: Video, label: t.tutorials },
        { href: "/crops", icon: Sprout, label: t.crops },
        { href: "/weather", icon: CloudSun, label: t.weather },
        { href: "/settings", icon: Settings, label: t.settings },
      ];

  return (
    <>
      <div className="p-5 border-b border-border/40 space-y-3">
        <div className="flex items-center gap-3 font-bold text-xl text-primary">
          <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <Sprout className="h-5 w-5 text-primary" />
          </div>
          <span>Grownox</span>
        </div>
        <p className="text-xs text-muted-foreground">{t.smartFarmingPlatform}</p>

        {/* SECTION SWITCHER CONTROL */}
        <div className="pt-1">
          <div className="flex items-center bg-muted p-1 rounded-2xl border border-border/70 w-full text-xs font-extrabold">
            <button
              type="button"
              onClick={() => handleSectionSwitch("market")}
              className={`flex-1 py-1.5 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeSection === "market"
                  ? "bg-[#2E7D32] text-white shadow-xs font-black"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Store className="h-3.5 w-3.5 shrink-0" />
              <span>{t.marketNav}</span>
            </button>
            <button
              type="button"
              onClick={() => handleSectionSwitch("farmer")}
              className={`flex-1 py-1.5 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeSection === "farmer"
                  ? "bg-emerald-600 text-white shadow-xs font-black"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Sprout className="h-3.5 w-3.5 shrink-0" />
              <span>{t.farmerNav}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 py-3 border-b border-border/40 space-y-2">
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="pl-8 bg-muted/50 border-transparent focus-visible:ring-primary focus-visible:bg-background h-9 rounded-xl text-sm"
            placeholder={t.locationPlaceholder}
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
        <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          {activeSection === "market" ? "Marketplace Navigation" : "Farmer Tools & Advisory"}
        </div>
        {navItems.map((item) => {
          const isActive = isNavItemActive(item.href, locationPath, activeSection);
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
  const { settings, fullLocationLabel, t, activeSection, setActiveSection } = useSettings();
  const [, setLocationPath] = useLocation();
  const [fabOpen, setFabOpen] = useState(false);
  const fabRef = useRef<HTMLDivElement>(null);

  const selectedCountry = COUNTRIES.find((c) => c.code === settings.countryCode);
  const displayLocation = fullLocationLabel || location || selectedCountry?.name || "Location";

  const handleMobileSectionSwitch = (sec: "market" | "farmer") => {
    setActiveSection(sec);
    if (sec === "market") {
      if (["/chat", "/farming-plan", "/tutorials", "/crops", "/weather", "/farmer-dashboard"].includes(locationPath)) {
        setLocationPath("/market-dashboard");
      }
    } else {
      if (["/marketplace", "/market", "/market-dashboard"].includes(locationPath)) {
        setLocationPath("/farmer-dashboard");
      }
    }
  };

  const mobileNavItems = activeSection === "market"
    ? [
        { href: "/market-dashboard", icon: LayoutDashboard, label: t.dashboard },
        { href: "/marketplace", icon: Store, label: t.marketplace },
        { href: "/market", icon: TrendingUp, label: t.market },
        { href: "/settings", icon: Settings, label: t.settings },
      ]
    : [
        { href: "/farmer-dashboard", icon: LayoutDashboard, label: t.dashboard },
        { href: "/chat", icon: GrownoxIcon, label: t.chat },
        { href: "/farming-plan", icon: ClipboardList, label: t.farmingPlan },
        { href: "/tutorials", icon: Video, label: t.tutorials },
        { href: "/crops", icon: Sprout, label: t.crops },
        { href: "/weather", icon: CloudSun, label: t.weather },
        { href: "/settings", icon: Settings, label: t.settings },
      ];

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
      ? t.intMarket
      : settings.targetMarket === "regional"
      ? t.regionalMarket
      : t.localMarket;

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
        <header className="md:hidden flex-none flex flex-col gap-2 px-3.5 py-2.5 border-b bg-card/95 backdrop-blur z-20 shadow-xs">
          <div className="flex items-center justify-between">
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
                  placeholder={t.locationPlaceholder}
                />
              </div>
            </div>
          </div>

          {/* Mobile Section Switcher */}
          <div className="flex items-center bg-muted p-0.5 rounded-xl border border-border/70 text-xs font-bold">
            <button
              type="button"
              onClick={() => handleMobileSectionSwitch("market")}
              className={`flex-1 py-1 px-2 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
                activeSection === "market"
                  ? "bg-[#2E7D32] text-white shadow-xs font-black"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Store className="h-3.5 w-3.5 shrink-0" />
              <span>{t.marketPage}</span>
            </button>
            <button
              type="button"
              onClick={() => handleMobileSectionSwitch("farmer")}
              className={`flex-1 py-1 px-2 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
                activeSection === "farmer"
                  ? "bg-emerald-600 text-white shadow-xs font-black"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Sprout className="h-3.5 w-3.5 shrink-0" />
              <span>{t.farmerPage}</span>
            </button>
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
            <span className="capitalize">{settings.weightUnit.replace("_", " ")} {t.pricing}</span>
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

        {/* Mobile Floating Quick Access Navigation Button (FAB) */}
        <div ref={fabRef} className="md:hidden fixed bottom-28 right-3.5 sm:bottom-32 sm:right-4 z-50 pointer-events-auto">
          {/* Backdrop for mobile menu */}
          {fabOpen && (
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40 transition-opacity animate-in fade-in duration-200"
              onClick={() => setFabOpen(false)}
            />
          )}

          {/* Floating Toggle Button with Quick Access Icon */}
          <button
            type="button"
            onClick={() => setFabOpen((prev) => !prev)}
            aria-label={t.quickAccess}
            title={t.quickAccess}
            className={`relative z-50 h-13 w-13 sm:h-14 sm:w-14 rounded-full bg-emerald-600 text-white shadow-2xl flex items-center justify-center border-2 border-emerald-400/40 transition-all duration-200 hover:bg-emerald-700 active:scale-95 focus:outline-none focus:ring-4 focus:ring-emerald-400/40 ${
              fabOpen ? "rotate-90 bg-emerald-700 ring-4 ring-emerald-500/30" : "hover:scale-105 shadow-emerald-900/30"
            }`}
          >
            {fabOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <div className="relative flex items-center justify-center">
                <Compass className="h-6 w-6 text-white" />
                <span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-amber-400 rounded-full border-2 border-emerald-700 animate-pulse" />
              </div>
            )}
          </button>

          {/* Popover Navigation Menu */}
          {fabOpen && (
            <div className="absolute bottom-16 right-0 z-50 w-72 max-w-[calc(100vw-2rem)] bg-white dark:bg-stone-900 border border-border rounded-2xl p-2.5 shadow-2xl space-y-1 animate-in fade-in zoom-in-95 slide-in-from-bottom-3 duration-200">
              <div className="px-3 py-2 border-b border-border/50 mb-1 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="h-6 w-6 rounded-md bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <Compass className="h-3.5 w-3.5 text-emerald-600" />
                  </div>
                  <span className="font-bold text-xs text-foreground tracking-wide whitespace-nowrap truncate">{t.quickAccess}</span>
                </div>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0 whitespace-nowrap">
                  <Zap className="h-2.5 w-2.5" /> {t.navigation}
                </span>
              </div>

              <div className="space-y-0.5">
                {mobileNavItems.map((item) => {
                  const isCurrent = isNavItemActive(item.href, locationPath, activeSection);

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
