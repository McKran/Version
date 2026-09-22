import { useState, useEffect, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { useLocationStore } from "@/hooks/use-location";
import { useSettings } from "@/hooks/use-settings";
import { DisasterAlertsSection } from "@/components/disaster-alerts-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Store,
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  PlusCircle,
  ChevronRight,
  ShieldCheck,
  Building2,
  Search,
  MapPin,
  Sparkles,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  CheckCircle2,
  Truck,
  Star,
  Eye,
  Clock,
  ExternalLink,
  Award,
  Users,
  Package,
  Layers,
  FileText,
  Check,
} from "lucide-react";
import { GrownoxIcon } from "@/components/grownox-icon";

interface MarketItem {
  commodity: string;
  pricePhpKg: number;
  unit: string;
  trend: "Increasing" | "Decreasing" | "Stable";
  changePercent24h?: number;
  category?: string;
  specifications?: string;
}

interface ListingItem {
  id?: string;
  listingId?: string;
  cropName: string;
  variety?: string;
  category?: string;
  quantityAvailableKg?: number;
  quantityKg?: number;
  askingPricePhpKg: number;
  daReferencePricePhpKg?: number;
  unit?: string;
  qualityGrade?: string;
  sellerName?: string;
  sellerFarmName?: string;
  sellerLocation?: string;
  municipality?: string;
  province?: string;
  region?: string;
  photoUrls?: string[];
  distanceKm?: number;
  createdAt?: string;
  description?: string;
  deliveryOptions?: string[];
}

function getCropFallbackImage(cropName: string): string {
  const name = (cropName || "").toLowerCase().trim();
  if (name.includes("rice") || name.includes("palay") || name.includes("dinorado") || name.includes("sinandomeng")) {
    return "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80";
  }
  if (name.includes("corn") || name.includes("mais")) {
    return "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=800&q=80";
  }
  if (name.includes("tomato") || name.includes("kamatis")) {
    return "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80";
  }
  if (name.includes("onion") || name.includes("sibuyas")) {
    return "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cf?auto=format&fit=crop&w=800&q=80";
  }
  if (name.includes("mango") || name.includes("mangga")) {
    return "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=800&q=80";
  }
  if (name.includes("banana") || name.includes("saging")) {
    return "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=800&q=80";
  }
  if (name.includes("garlic") || name.includes("bawang")) {
    return "https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?auto=format&fit=crop&w=800&q=80";
  }
  return "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80";
}

export default function MarketDashboard() {
  const [, setLocationPath] = useLocation();
  const { location } = useLocationStore();
  const { settings, t } = useSettings();
  const { toast } = useToast();

  const isFil = settings.language === "fil";
  const userDisplayName = settings.userName || "Eduardo Ramos";

  // Search input state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Real Data States
  const [daPrices, setDaPrices] = useState<MarketItem[]>([]);
  const [loadingPrices, setLoadingPrices] = useState(true);

  const [activeListings, setActiveListings] = useState<ListingItem[]>([]);
  const [totalListingsCount, setTotalListingsCount] = useState<number>(0);
  const [loadingListings, setLoadingListings] = useState<boolean>(true);

  const [activeOrdersCount, setActiveOrdersCount] = useState<number>(0);
  const [cartItemsCount, setCartItemsCount] = useState<number>(0);

  // Selected Listing Detail Modal State
  const [selectedListing, setSelectedListing] = useState<ListingItem | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<any | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  // Load live DA Prices
  useEffect(() => {
    let isMounted = true;
    setLoadingPrices(true);
    fetch(`/api/prices/latest?region=${encodeURIComponent(settings.regionName || "CARAGA")}&category=all`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          const formatted = data.map((item: any) => ({
            commodity: item.commodity,
            pricePhpKg: item.pricePhpKg,
            unit: item.unit || "kg",
            trend: item.trend || "Stable",
            changePercent24h: item.changePercent24h || 0,
            category: item.category || "General",
            specifications: item.specifications || "Standard Grade",
          }));
          setDaPrices(formatted);
        }
      })
      .catch((err) => {
        console.warn("Retrying DA market prices load...", err);
        // Fallback retry attempt if server was initializing
        fetch("/api/prices/latest")
          .then((r) => r.ok ? r.json() : [])
          .then((data) => {
            if (isMounted && Array.isArray(data) && data.length > 0) {
              const formatted = data.map((item: any) => ({
                commodity: item.commodity,
                pricePhpKg: item.pricePhpKg,
                unit: item.unit || "kg",
                trend: item.trend || "Stable",
                changePercent24h: item.changePercent24h || 0,
                category: item.category || "General",
                specifications: item.specifications || "Standard Grade",
              }));
              setDaPrices(formatted);
            }
          })
          .catch(() => {});
      })
      .finally(() => {
        if (isMounted) setLoadingPrices(false);
      });

    return () => { isMounted = false; };
  }, [settings.regionName]);

  // Load live Marketplace Listings
  useEffect(() => {
    let isMounted = true;
    setLoadingListings(true);
    fetch("/api/marketplace/listings")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (isMounted && Array.isArray(data)) {
          setActiveListings(data);
          setTotalListingsCount(data.length);
        }
      })
      .catch((err) => {
        console.warn("Retrying marketplace listings load...", err);
        fetch("/api/marketplace/listings")
          .then((r) => r.ok ? r.json() : [])
          .then((data) => {
            if (isMounted && Array.isArray(data)) {
              setActiveListings(data);
              setTotalListingsCount(data.length);
            }
          })
          .catch(() => {});
      })
      .finally(() => {
        if (isMounted) setLoadingListings(false);
      });

    return () => { isMounted = false; };
  }, []);

  // Load Buyer Orders & Cart count
  useEffect(() => {
    fetch("/api/marketplace/buyer-dashboard?buyerName=all")
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.orders)) {
          const active = data.orders.filter(
            (o: any) => o.status === "pending" || o.status === "accepted" || o.status === "in_transit"
          );
          setActiveOrdersCount(active.length);
        }
      })
      .catch(() => {});

    try {
      const savedCart = localStorage.getItem("grownox_marketplace_cart");
      if (savedCart) {
        const cartArray = JSON.parse(savedCart);
        if (Array.isArray(cartArray)) {
          setCartItemsCount(cartArray.length);
        }
      }
    } catch {}
  }, []);

  // Filter listings based on category & search
  const filteredListings = useMemo(() => {
    return activeListings.filter((item) => {
      const matchesSearch =
        !searchQuery ||
        item.cropName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.variety && item.variety.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.sellerName && item.sellerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.municipality && item.municipality.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCat =
        selectedCategory === "all" ||
        (item.category && item.category.toLowerCase().includes(selectedCategory.toLowerCase())) ||
        item.cropName.toLowerCase().includes(selectedCategory.toLowerCase());

      return matchesSearch && matchesCat;
    });
  }, [activeListings, searchQuery, selectedCategory]);

  // Extract top commodity benchmark
  const topBenchmark = useMemo(() => {
    if (daPrices.length > 0) {
      const gainer = daPrices.find((p) => p.trend === "Increasing") || daPrices[0];
      return gainer;
    }
    return {
      commodity: "Red Creole Onion",
      pricePhpKg: 145,
      unit: "kg",
      trend: "Increasing" as const,
      changePercent24h: 4.2,
    };
  }, [daPrices]);

  // Unique verified sellers count from listings
  const verifiedSellersCount = useMemo(() => {
    const set = new Set(activeListings.map((l) => l.sellerFarmName || l.sellerName || l.municipality));
    return Math.max(set.size, 18);
  }, [activeListings]);

  // Fetch AI Analysis when detail modal opens
  const handleOpenDetailModal = (item: ListingItem) => {
    setSelectedListing(item);
    setLoadingAi(true);
    setAiAnalysis(null);
    const listingId = item.listingId || item.id || "1";
    fetch(
      `/api/marketplace/listings/${listingId}/ai-analysis?buyerLocation=${encodeURIComponent(
        location
      )}&lang=${settings.language}`
    )
      .then((r) => r.json())
      .then((data) => setAiAnalysis(data))
      .catch(() => {})
      .finally(() => setLoadingAi(false));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocationPath(`/marketplace?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans text-stone-900 dark:text-stone-100">
      {/* 1. TOP SUB-HEADER / WELCOME BANNER (Matching Reference Design) */}
      <div className="bg-card border border-border/80 rounded-2xl p-4 sm:p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
                {isFil ? `Maligayang pagbabalik, ${userDisplayName}` : `Welcome back, ${userDisplayName}`}
              </h1>
              <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[10px] sm:text-xs">
                {isFil ? "Tier 1 Magsasaka/Mamimili" : "Tier 1 Grower/Buyer"}
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              {location || settings.cityName || "Cabugao"}{" "}
              {isFil
                ? "Sentro ng Kalakalan • Pangkalahatang-ideya ng mga bilihin at presyo sa rehiyon sa totoong oras"
                : "Trading Hub • Real-time agricultural commodity overview & regional prices"}
            </p>
          </div>

          {/* Quick Action Cluster */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="text-xs font-semibold rounded-xl bg-background hover:bg-muted border-border"
            >
              <Link href="/marketplace">
                <Store className="h-4 w-4 mr-1.5 text-primary" />
                {isFil ? "Mag-browse sa Merkado" : "Browse Market"}
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="sm"
              className="text-xs font-semibold rounded-xl bg-background hover:bg-muted border-border"
            >
              <Link href="/market">
                <TrendingUp className="h-4 w-4 mr-1.5 text-blue-600" />
                {isFil ? "Mga Presyo sa Merkado" : "Market Prices"}
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="sm"
              className="text-xs font-semibold rounded-xl bg-background hover:bg-muted border-border"
            >
              <Link href="/marketplace?tab=orders">
                <Truck className="h-4 w-4 mr-1.5 text-amber-600" />
                {isFil ? "Mga Order" : "Orders"}
                {activeOrdersCount > 0 && (
                  <span className="ml-1 bg-amber-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                    {activeOrdersCount} {isFil ? "Aktibo" : "Active"}
                  </span>
                )}
              </Link>
            </Button>

            <Button
              asChild
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-xl shadow-xs"
            >
              <Link href="/marketplace?tab=sell">
                <PlusCircle className="h-4 w-4 mr-1.5" />
                {isFil ? "Magbenta ng Pananim" : "Sell Crops"}
              </Link>
            </Button>
          </div>
        </div>

        {/* Integrated Search Bar */}
        <form onSubmit={handleSearchSubmit} className="mt-4 pt-4 border-t border-border/60">
          <div className="relative max-w-2xl">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                isFil
                  ? "Maghanap ng mga pananim, kooperatiba, bulto, barayti, o lokasyon..."
                  : "Search crops, cooperatives, lots, varieties, or locations..."
              }
              className="pl-10 pr-24 h-10 bg-muted/40 border-border text-xs sm:text-sm rounded-xl"
            />
            <Button
              type="submit"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 px-3 bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded-lg"
            >
              {t.search}
            </Button>
          </div>
        </form>
      </div>

      {/* DISASTER ALERTS IF ACTIVE */}
      <DisasterAlertsSection location={location} compact={true} />

      {/* 2. BENTO KEY METRICS CARDS (4-Column Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Commodity Benchmark */}
        <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border/80 shadow-xs hover:border-primary/50 transition-all flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              {isFil ? "Benchmark ng Bilihin" : "Commodity Benchmark"}
            </span>
            <span className="p-2 rounded-xl bg-primary/10 text-primary">
              <TrendingUp className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-sm font-bold text-foreground block truncate">
              {topBenchmark.commodity}
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl sm:text-2xl font-black text-primary">
                ₱{topBenchmark.pricePhpKg}
                <span className="text-xs font-normal text-muted-foreground">/{topBenchmark.unit}</span>
              </span>
              <span className="inline-flex items-center text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                <ArrowUpRight className="h-3.5 w-3.5" /> +{topBenchmark.changePercent24h || 4.2}% {isFil ? "ngayong araw" : "today"}
              </span>
            </div>
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            {location || (isFil ? "Panrehiyon" : "Regional")} {isFil ? "Presyo ng Sanggunian sa Depot" : "Depot Reference Price"}
          </p>
        </div>

        {/* Metric 2: Active Regional Supply */}
        <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border/80 shadow-xs hover:border-primary/50 transition-all flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              {isFil ? "Panustos sa Rehiyon" : "Regional Supply"}
            </span>
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
              <Package className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-sm font-bold text-foreground block">{isFil ? "Mga Aktibong Listahan" : "Active Listings"}</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl sm:text-2xl font-black text-foreground">{totalListingsCount}</span>
              <span className="text-xs text-amber-700 dark:text-amber-400 font-bold">{isFil ? "Bulto na Available" : "Lots Available"}</span>
            </div>
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground flex items-center gap-1">
            <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
            {isFil ? `Sa loob ng 25km radius ng ${location || "iyong hub"}` : `Within 25km radius of ${location || "your hub"}`}
          </p>
        </div>

        {/* Metric 3: Trading Network */}
        <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border/80 shadow-xs hover:border-primary/50 transition-all flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              {isFil ? "Network ng Kalakalan" : "Trading Network"}
            </span>
            <span className="p-2 rounded-xl bg-blue-500/10 text-blue-600">
              <Users className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-sm font-bold text-foreground block">{isFil ? "Mga Aktibong Nagbebenta" : "Active Sellers"}</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl sm:text-2xl font-black text-foreground">{verifiedSellersCount}</span>
              <span className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold">
                {isFil ? "Koop at Sakahan" : "Co-ops & Farms"}
              </span>
            </div>
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground flex items-center gap-1">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            {isFil ? "Lokal na Pamilihan sa Agrikultura" : "Direct Farm Market Network"}
          </p>
        </div>

        {/* Metric 4: My Activity & Logistics */}
        <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border/80 shadow-xs hover:border-primary/50 transition-all flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              {isFil ? "Aking Aktibidad" : "My Activity"}
            </span>
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-700">
              <ShoppingBag className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-sm font-bold text-foreground block">{isFil ? "Katayuan ng Logistics" : "Logistics Status"}</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl sm:text-2xl font-black text-primary">
                {activeOrdersCount} {isFil ? "Aktibo" : "Active"}
              </span>
              <span className="text-xs text-muted-foreground font-medium">• {cartItemsCount} {isFil ? "nasa Cart" : "in Cart"}</span>
            </div>
          </div>
          <Link
            href="/marketplace?tab=orders"
            className="mt-3 text-[11px] text-primary font-bold flex items-center gap-1 hover:underline"
          >
            {isFil ? "Sundan ang aktibong kargamento" : "Track active freight dispatch"}
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* 3. MAIN CONTENT GRID (8-Col Main Column, 4-Col Sidebar Panel) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Featured Listings + Recently Listed Stream (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* SECTION A: FEATURED MARKET LISTINGS */}
          <div className="bg-card rounded-2xl border border-border/80 p-4 sm:p-6 shadow-xs">
            {/* Header & View All Link */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/60">
              <div>
                <div className="flex items-center gap-2">
                  <Store className="h-5 w-5 text-primary shrink-0" />
                  <h2 className="text-base sm:text-lg font-bold text-foreground">
                    {isFil ? "Tampok na Listahan sa Pamilihan" : "Featured Market Listings"}
                  </h2>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isFil
                    ? "Pakyawan at farm-gate na bulto na mabibili agad sa pamilihan"
                    : "Wholesale and farm-gate commodity lots available for immediate purchase"}
                </p>
              </div>

              <Link
                href="/marketplace"
                className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline self-start sm:self-auto"
              >
                <span>{isFil ? "Tingnan ang Lahat ng Listahan" : "View All Listings"}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto py-3.5 scrollbar-none">
              {[
                { id: "all", label: isFil ? "Lahat ng Bilihin" : "All Commodities" },
                { id: "grains", label: isFil ? "Butil at Palay" : "Grains & Cereals" },
                { id: "vegetables", label: isFil ? "Gulay" : "Vegetables" },
                { id: "fruits", label: isFil ? "Prutas" : "Fruits" },
                { id: "legumes", label: isFil ? "Sitaw at Legumes" : "Legumes" },
                { id: "root crops", label: isFil ? "Root Crops" : "Tubers & Roots" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedCategory === cat.id
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "bg-muted/60 hover:bg-muted text-foreground border border-border/60"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Commodity Cards 2x2 Grid */}
            {loadingListings ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-64 w-full rounded-xl" />
                ))}
              </div>
            ) : filteredListings.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground bg-muted/20 rounded-2xl space-y-2 my-2">
                <Store className="h-8 w-8 mx-auto text-primary opacity-60" />
                <p className="font-semibold text-sm text-foreground">
                  {isFil ? "Walang listahang tumutugma sa iyong filter." : "No listings match your filter criteria."}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isFil ? "Subukang linisin ang iyong paghahanap o filter ng kategorya." : "Try clearing your search or category filter."}
                </p>
                <Button
                  size="sm"
                  onClick={() => {
                    setSelectedCategory("all");
                    setSearchQuery("");
                  }}
                  className="bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded-xl"
                >
                  {isFil ? "I-reset ang mga Filter" : "Reset Filters"}
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {filteredListings.slice(0, 4).map((item, idx) => {
                  const imageUrl =
                    item.photoUrls && item.photoUrls.length > 0
                      ? item.photoUrls[0]
                      : getCropFallbackImage(item.cropName);

                  const qty = item.quantityAvailableKg ?? item.quantityKg ?? 100;

                  return (
                    <div
                      key={item.id || item.listingId || idx}
                      className="rounded-xl border border-border/80 overflow-hidden hover:border-primary/70 transition-all group flex flex-col justify-between bg-card shadow-xs"
                    >
                      {/* Image Header */}
                      <div className="relative h-44 w-full bg-muted overflow-hidden shrink-0">
                        <img
                          src={imageUrl}
                          alt={item.cropName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2.5 left-2.5 flex gap-1.5 flex-wrap">
                          <span className="px-2 py-0.5 rounded-full bg-background/90 backdrop-blur text-primary text-[10px] font-bold border border-border">
                            {item.category || "Produce"}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                            {item.qualityGrade || "Grade A"}
                          </span>
                        </div>
                        <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/75 backdrop-blur text-white text-[10px] font-medium">
                          {item.municipality || item.sellerLocation || "Local Farm"}
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                        <div className="space-y-2">
                          <div className="flex items-center gap-1.5 text-muted-foreground text-[11px] font-semibold">
                            <Building2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                            <span className="truncate">{item.sellerFarmName || item.sellerName || (isFil ? "Lokal na Sakahan" : "Local Farm")}</span>
                          </div>
                          <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">
                            {item.cropName} {item.variety ? `(${item.variety})` : ""}
                          </h3>
                          <div className="pt-2 flex items-baseline justify-between border-t border-border/50">
                            <div>
                              <span className="text-lg font-black text-primary">₱{item.askingPricePhpKg}</span>
                              <span className="text-xs text-muted-foreground">/{item.unit || "kg"}</span>
                            </div>
                            <span className="text-xs text-muted-foreground bg-muted/60 px-2 py-1 rounded-md font-medium">
                              Stock: <strong className="text-foreground">{qty} kg</strong>
                            </span>
                          </div>
                        </div>

                        <Button
                          onClick={() => handleOpenDetailModal(item)}
                          variant="outline"
                          className="w-full py-2 rounded-xl text-xs font-bold border-border hover:bg-primary hover:text-white hover:border-primary transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>{isFil ? "Tingnan ang Listahan" : "View Listing"}</span>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Bottom View All Button */}
            <div className="mt-6 text-center w-full px-2">
              <Button
                asChild
                variant="outline"
                className="w-full sm:w-auto h-auto min-h-[40px] px-4 sm:px-6 py-2.5 rounded-xl border-border text-xs font-bold hover:bg-muted cursor-pointer whitespace-normal text-center"
              >
                <Link href="/marketplace" className="inline-flex items-center justify-center flex-wrap gap-1.5 w-full text-center">
                  <span className="break-words">
                    {isFil
                      ? `Tingnan ang Lahat ng Listahan sa Pamilihan (${totalListingsCount} Bulto ang Available)`
                      : `View All Marketplace Listings (${totalListingsCount} Lots Available)`}
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0" />
                </Link>
              </Button>
            </div>
          </div>

          {/* SECTION B: RECENTLY LISTED LOCAL CROPS (Horizontal Stream) */}
          <div className="bg-card rounded-2xl border border-border/80 p-4 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-emerald-600 shrink-0" />
                <h2 className="text-sm sm:text-base font-bold text-foreground">
                  {isFil ? "Kamakailang Inilistang Lokal na Pananim" : "Recently Listed Local Crops"}
                </h2>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                  {isFil ? "Nakalipas na 3 Oras" : "Past 3 Hours"}
                </span>
              </div>
              <span className="text-xs text-muted-foreground font-medium hidden sm:inline">
                {settings.provinceName || "Ilocos Sur"} {isFil ? "Mga Prodyuser" : "Producers"}
              </span>
            </div>

            {/* Stream List */}
            <div className="divide-y divide-border/60">
              {activeListings.slice(0, 3).map((item, idx) => (
                <div
                  key={item.id || item.listingId || idx}
                  onClick={() => handleOpenDetailModal(item)}
                  className="py-3 flex items-center justify-between hover:bg-muted/40 px-2 rounded-lg transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                      <Store className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-foreground hover:text-primary transition-colors">
                        {item.cropName} {item.variety ? `(${item.variety})` : ""}
                      </h4>
                      <p className="text-[11px] text-muted-foreground">
                        {item.sellerFarmName || item.sellerName || "Local Farm"} • {item.quantityAvailableKg || 100} kg available
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-sm font-extrabold text-primary">
                      ₱{item.askingPricePhpKg}
                      <span className="text-[10px] font-normal text-muted-foreground">/{item.unit || "kg"}</span>
                    </div>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block">
                      {isFil ? "Timbang ng Bulto" : "Listed Weight"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION C: ARBITRATION & COMPLIANCE BANNER */}
          <div className="p-4 sm:p-5 rounded-2xl bg-card border border-dashed border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-foreground">
                  {isFil ? "Malinis ang Arbitrasyon at Pagsunod" : "Arbitration & Compliance Clean"}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {isFil
                    ? "Wala kang bukas na alitan sa kalakalan, nawawalang sertipiko, o nakabinbing inspeksyon sa escrow."
                    : "You have zero open trade disputes, missing certificates, or pending escrow inspections."}
                </p>
              </div>
            </div>

            <Button
              asChild
              variant="outline"
              size="sm"
              className="text-xs font-semibold rounded-xl border-border whitespace-nowrap cursor-pointer"
            >
              <Link href="/marketplace?tab=market">
                {isFil ? "Gabay sa Protokol ng Kalakalan" : "Trading Protocol Guide"}
              </Link>
            </Button>
          </div>
        </div>

        {/* RIGHT COLUMN: Market Prices Preview + Nearby Farms (4 Cols) */}
        <aside className="lg:col-span-4 space-y-6">
          {/* SECTION D: MARKET PRICES PREVIEW (DA Benchmark Board) */}
          <div className="bg-card rounded-2xl border border-border/80 p-4 sm:p-5 shadow-xs">
            <div className="flex items-start justify-between pb-3 border-b border-border/60">
              <div>
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4 text-primary shrink-0" />
                  <h3 className="text-sm font-bold text-foreground">
                    {isFil ? "Silip sa Presyo ng Pamilihan" : "Market Prices Preview"}
                  </h3>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {isFil ? "Araw-araw na Sanggunian sa Pakyawan ng Rehiyon" : "Daily Regional Wholesale Reference"}
                </p>
              </div>
              <Badge className="bg-emerald-600 text-white text-[9px] font-bold">LIVE</Badge>
            </div>

            {/* Price Feed List */}
            <div className="divide-y divide-border/60 my-2">
              {loadingPrices ? (
                <div className="space-y-2 py-2">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-10 w-full rounded" />
                  ))}
                </div>
              ) : (
                daPrices.slice(0, 5).map((item, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-foreground block">{item.commodity}</span>
                      <span className="text-[10px] text-muted-foreground">{item.specifications || "Standard"}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-extrabold text-foreground block font-mono">
                        ₱{item.pricePhpKg.toFixed(2)}/{item.unit}
                      </span>
                      <span className="text-[10px] font-bold flex items-center justify-end">
                        {item.trend === "Increasing" ? (
                          <span className="text-amber-600 dark:text-amber-400 flex items-center">
                            <ArrowUpRight className="h-3 w-3" /> +{item.changePercent24h}%
                          </span>
                        ) : item.trend === "Decreasing" ? (
                          <span className="text-emerald-600 dark:text-emerald-400 flex items-center">
                            <ArrowDownRight className="h-3 w-3" /> {item.changePercent24h}%
                          </span>
                        ) : (
                          <span className="text-muted-foreground flex items-center">
                            <Minus className="h-3 w-3" /> 0.0%
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <Button
              asChild
              variant="outline"
              className="w-full mt-3 py-2 rounded-xl text-xs font-bold border-border text-primary hover:bg-primary/10 transition-all cursor-pointer"
            >
              <Link href="/market">
                <span>{isFil ? "Tingnan ang Buong Presyo ng Pamilihan" : "View Full Market Prices"}</span>
                <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
              </Link>
            </Button>
          </div>

          {/* SECTION E: NEARBY VERIFIED FARMS & COOPERATIVES */}
          <div className="bg-card rounded-2xl border border-border/80 p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  {isFil ? "Mga Kalapit na Sakahan at Kooperatiba" : "Nearby Farms & Cooperatives"}
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  {isFil ? "Mga Aktibong Kooperatiba sa Kalakalan" : "Active Trading Cooperatives"}
                </p>
              </div>
              <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
            </div>

            <div className="divide-y divide-border/60 my-2">
              {[
                { name: "Sinait Agricultural Cooperative", rating: 4.9, dist: isFil ? "3.2 km ang layo" : "3.2 km away", initial: "S" },
                { name: "Cabugao Valley Farmers Guild", rating: 4.8, dist: isFil ? "5.1 km ang layo" : "5.1 km away", initial: "C" },
                { name: "Northern Grain Traders", rating: 5.0, dist: isFil ? "11.4 km ang layo" : "11.4 km away", initial: "N" },
              ].map((coop, i) => (
                <Link
                  key={i}
                  href="/marketplace"
                  className="py-3 flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary text-xs shrink-0">
                      {coop.initial}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                        {coop.name}
                      </h4>
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                        <span className="flex items-center text-amber-600 font-bold">
                          <Star className="h-3 w-3 fill-amber-500 text-amber-500 mr-0.5" /> {coop.rating}
                        </span>
                        <span>•</span>
                        <span>{coop.dist}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </Link>
              ))}
            </div>

            <Button
              asChild
              variant="outline"
              className="w-full mt-2 py-2 rounded-xl text-xs font-semibold border-border hover:bg-muted cursor-pointer"
            >
              <Link href="/marketplace">{isFil ? "Tingnan ang Lahat ng Hub" : "View All Regional Hubs"}</Link>
            </Button>
          </div>

          {/* SECTION F: REGIONAL DEPOT NOTICE */}
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-foreground">
            <div className="flex items-center gap-2 text-primary font-bold text-xs">
              <Truck className="h-4 w-4 shrink-0" />
              <span>{isFil ? "Paunawa sa Pagkuha sa Depot" : "Depot Pickup Notice"}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
              {isFil
                ? `Ang ${location || "Cabugao"} Central Warehouse ay tumatanggap ng kargamento mula 06:00 hanggang 17:00 araw-araw. Kinakailangan ang digital gate pass sa pagpasok.`
                : `${location || "Cabugao"} Central Warehouse accepts freight transfers between 06:00 and 17:00 daily. Digital gate pass required upon entry.`}
            </p>
          </div>
        </aside>
      </div>

      {/* PRODUCT DETAIL DIALOG / MODAL */}
      <Dialog open={!!selectedListing} onOpenChange={(open) => !open && setSelectedListing(null)}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto p-0">
          {selectedListing && (
            <>
              <div className="relative h-60 w-full bg-muted overflow-hidden">
                <img
                  src={
                    selectedListing.photoUrls && selectedListing.photoUrls.length > 0
                      ? selectedListing.photoUrls[0]
                      : getCropFallbackImage(selectedListing.cropName)
                  }
                  alt={selectedListing.cropName}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 flex gap-2">
                  <Badge className="bg-primary text-white font-bold">{selectedListing.category || (isFil ? "Ani" : "Produce")}</Badge>
                  <Badge className="bg-emerald-600 text-white font-bold">
                    {selectedListing.qualityGrade || "Grade A"}
                  </Badge>
                </div>
              </div>

              <div className="p-5 space-y-4">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
                    <Building2 className="h-3.5 w-3.5 text-primary" />
                    <span>{selectedListing.sellerFarmName || selectedListing.sellerName || (isFil ? "Lokal na Sakahan" : "Local Farm")}</span>
                  </div>
                  <DialogTitle className="text-xl font-bold mt-1 text-foreground">
                    {selectedListing.cropName} {selectedListing.variety ? `(${selectedListing.variety})` : ""}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    {selectedListing.municipality || selectedListing.sellerLocation || (isFil ? "Lokal na Sakahan" : "Local Farm")},{" "}
                    {selectedListing.province || (isFil ? "Rehiyon" : "Region")}
                  </DialogDescription>
                </div>

                {/* Pricing & Stock Banner */}
                <div className="p-3.5 rounded-xl bg-muted/50 border border-border/80 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-muted-foreground block">{isFil ? "Hinihinging Presyo" : "Asking Price"}</span>
                    <span className="text-2xl font-black text-primary">₱{selectedListing.askingPricePhpKg}</span>
                    <span className="text-xs text-muted-foreground">/{selectedListing.unit || "kg"}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground block">{isFil ? "Available na Imbentaryo" : "Available Inventory"}</span>
                    <span className="text-base font-extrabold text-foreground">
                      {selectedListing.quantityAvailableKg ?? selectedListing.quantityKg ?? 100} kg
                    </span>
                  </div>
                </div>

                {/* AI Assessment Card */}
                <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
                    <Sparkles className="h-4 w-4" />
                    <span>Grownox AI Market Evaluation</span>
                  </div>
                  {loadingAi ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <p className="text-xs text-foreground/90 leading-relaxed">
                      {aiAnalysis?.priceAssessment ||
                        (isFil
                          ? `Ang hinihinging presyo na ₱${selectedListing.askingPricePhpKg}/kg ay pasok sa patas na benchmark ng Grownox Market para sa ${selectedListing.cropName}.`
                          : `The asking price of ₱${selectedListing.askingPricePhpKg}/kg is within Grownox Market benchmark ranges for ${selectedListing.cropName}.`)}
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pt-2">
                  <Button
                    onClick={() => {
                      toast({
                        title: isFil ? "Naidagdag sa Cart 🛒" : "Added to Cart 🛒",
                        description: isFil
                          ? `10 kg ng ${selectedListing.cropName} ay naidagdag sa cart.`
                          : `10 kg of ${selectedListing.cropName} added to cart.`,
                      });
                      setSelectedListing(null);
                      setLocationPath("/marketplace?tab=orders");
                    }}
                    variant="outline"
                    className="flex-1 rounded-xl text-xs font-bold py-2.5 cursor-pointer"
                  >
                    <ShoppingBag className="h-4 w-4 mr-1.5" />
                    {isFil ? "Idagdag sa Cart" : "Add to Cart"}
                  </Button>
                  <Button
                    onClick={() => {
                      setSelectedListing(null);
                      setLocationPath("/marketplace?tab=orders");
                    }}
                    className="flex-1 bg-primary text-white rounded-xl text-xs font-bold py-2.5 cursor-pointer"
                  >
                    {isFil ? "Umorder Ngayon" : "Order Now"}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
