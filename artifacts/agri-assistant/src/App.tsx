import { lazy, Suspense } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LocationProvider } from "@/hooks/use-location";
import { SettingsProvider, useSettings } from "@/hooks/use-settings";
import { Layout } from "@/components/layout";
import { Loader2 } from "lucide-react";

function lazyWithRetry<T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>
) {
  return lazy(async () => {
    try {
      return await factory();
    } catch (error: any) {
      const isChunkError =
        error?.message?.includes("Failed to fetch dynamically imported module") ||
        error?.message?.includes("Loading chunk") ||
        error?.message?.includes("error loading dynamically imported module");

      if (isChunkError) {
        const storageKey = "last_chunk_reload";
        const lastReload = sessionStorage.getItem(storageKey);
        const now = Date.now();
        if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
          sessionStorage.setItem(storageKey, String(now));
          window.location.reload();
          return new Promise<{ default: T }>(() => {});
        }
      }
      throw error;
    }
  });
}

const Dashboard = lazyWithRetry(() => import("@/pages/dashboard"));
const MarketDashboard = lazyWithRetry(() => import("@/pages/market-dashboard"));
const FarmerDashboard = lazyWithRetry(() => import("@/pages/farmer-dashboard"));
const Weather = lazyWithRetry(() => import("@/pages/weather"));
const Crops = lazyWithRetry(() => import("@/pages/crops"));
const Market = lazyWithRetry(() => import("@/pages/market"));
const Marketplace = lazyWithRetry(() => import("@/pages/marketplace"));
const FarmingPlan = lazyWithRetry(() => import("@/pages/farming-plan"));
const Tutorials = lazyWithRetry(() => import("@/pages/tutorials"));
const Chat = lazyWithRetry(() => import("@/pages/chat"));
const Settings = lazyWithRetry(() => import("@/pages/settings"));
const Onboarding = lazyWithRetry(() => import("@/pages/onboarding"));
const NotFound = lazyWithRetry(() => import("@/pages/not-found"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-full min-h-[200px]">
      <Loader2 className="h-6 w-6 animate-spin text-primary/60" />
    </div>
  );
}

function Home() {
  const { activeSection } = useSettings();
  if (activeSection === "market") {
    return <MarketDashboard />;
  }
  return <FarmerDashboard />;
}

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/market-dashboard" component={MarketDashboard} />
        <Route path="/farmer-dashboard" component={FarmerDashboard} />
        <Route path="/weather" component={Weather} />
        <Route path="/crops" component={Crops} />
        <Route path="/market" component={Market} />
        <Route path="/marketplace" component={Marketplace} />
        <Route path="/farming-plan" component={FarmingPlan} />
        <Route path="/tutorials" component={Tutorials} />
        <Route path="/chat" component={Chat} />
        <Route path="/settings" component={Settings} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function AppInner() {
  const { settings } = useSettings();

  if (!settings.onboardingCompleted) {
    return (
      <Suspense fallback={<PageLoader />}>
        <Onboarding />
      </Suspense>
    );
  }

  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <Layout>
        <Router />
      </Layout>
    </WouterRouter>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SettingsProvider>
          <LocationProvider>
            <AppInner />
          </LocationProvider>
        </SettingsProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
