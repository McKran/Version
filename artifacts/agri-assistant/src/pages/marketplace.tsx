import { useState, useEffect, useMemo, memo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  Store, ShoppingBag, PlusCircle, Search, Filter, MapPin, ShieldCheck,
  CheckCircle2, AlertCircle, Sparkles, Phone, ArrowUpRight, ArrowDownRight,
  Minus, RefreshCw, Heart, Truck, Calendar, Tag, UserCheck, DollarSign,
  Package, ShoppingCart, Clock, AlertTriangle, Layers, BarChart3, Check, X,
  Info, Eye, ChevronRight, HelpCircle
} from "lucide-react";

interface MarketplaceListing {
  id: string;
  listingId: string;
  sellerId: string;
  sellerName: string;
  sellerPhone: string;
  sellerFarmName?: string;
  sellerRating: number;
  verificationStatus: "Verified Farmer" | "DA Co-op Member" | "Premium Seller" | "Unverified";
  cropName: string;
  variety: string;
  category: string;
  quantityAvailableKg: number;
  originalQuantityKg: number;
  unit: string;
  askingPricePhpKg: number;
  daReferencePricePhpKg: number;
  priceDifferencePct: number;
  qualityGrade: string;
  harvestDate: string;
  availableDate: string;
  description: string;
  region: string;
  province: string;
  municipality: string;
  barangay?: string;
  latitude: number;
  longitude: number;
  deliveryOptions: string[];
  photoUrls: string[];
  status: "active" | "paused" | "sold_out" | "cancelled";
  createdAt: string;
  distanceKm: number;
  isFavorite?: boolean;
  minAllowedOfferPhpKg?: number;
}

interface AIAnalysis {
  listingId: string;
  cropName: string;
  farmerPrice: number;
  daReferencePrice: number;
  minAllowedOffer: number;
  priceAssessment: string;
  offerAdvice: string;
  farmerTip: string;
  fairnessScore: "High" | "Fair" | "Premium";
  keyHighlights: string[];
  generatedAt: string;
}

const ALL_PHILIPPINE_REGIONS = [
  "NCR - Metro Manila",
  "CAR - Cordillera Administrative Region",
  "Region I - Ilocos Region",
  "Region II - Cagayan Valley",
  "Region III - Central Luzon",
  "Region IV-A - CALABARZON",
  "Region IV-B - MIMAROPA",
  "Region V - Bicol Region",
  "Region VI - Western Visayas",
  "Region VII - Central Visayas",
  "Region VIII - Eastern Visayas",
  "Region IX - Zamboanga Peninsula",
  "Region X - Northern Mindanao",
  "Region XI - Davao Region",
  "Region XII - SOCCSKSARGEN",
  "Region XIII - CARAGA",
  "BARMM - Bangsamoro Autonomous Region",
];

const REGIONS_PROVINCES = [
  { region: "Region XIII - CARAGA", province: "Agusan del Norte", municipality: "Butuan City" },
  { region: "Region XIII - CARAGA", province: "Agusan del Sur", municipality: "Bayugan City" },
  { region: "NCR - Metro Manila", province: "Metro Manila", municipality: "Manila City" },
  { region: "CAR - Cordillera Administrative Region", province: "Benguet", municipality: "La Trinidad" },
  { region: "Region I - Ilocos Region", province: "Ilocos Norte", municipality: "Laoag City" },
  { region: "Region II - Cagayan Valley", province: "Isabela", municipality: "Cauayan City" },
  { region: "Region III - Central Luzon", province: "Nueva Ecija", municipality: "Cabanatuan City" },
  { region: "Region IV-A - CALABARZON", province: "Batangas", municipality: "Lipa City" },
  { region: "Region IV-B - MIMAROPA", province: "Oriental Mindoro", municipality: "Calapan City" },
  { region: "Region V - Bicol Region", province: "Camarines Sur", municipality: "Naga City" },
  { region: "Region VI - Western Visayas", province: "Iloilo", municipality: "Iloilo City" },
  { region: "Region VII - Central Visayas", province: "Cebu", municipality: "Cebu City" },
  { region: "Region VIII - Eastern Visayas", province: "Leyte", municipality: "Tacloban City" },
  { region: "Region IX - Zamboanga Peninsula", province: "Zamboanga del Sur", municipality: "Zamboanga City" },
  { region: "Region X - Northern Mindanao", province: "Bukidnon", municipality: "Malaybalay City" },
  { region: "Region XI - Davao Region", province: "Davao del Norte", municipality: "Tagum City" },
  { region: "Region XII - SOCCSKSARGEN", province: "South Cotabato", municipality: "General Santos City" },
  { region: "BARMM - Bangsamoro Autonomous Region", province: "Maguindanao", municipality: "Cotabato City" },
];

const CATEGORIES = [
  "all",
  "Grains & Staples",
  "Vegetables",
  "Fruits",
  "Root Crops",
  "Legumes & Others",
  "Herbs & Spices",
];

export default function MarketplacePage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"browse" | "farmer-dash" | "buyer-dash">("browse");

  // Sync tab with URL search parameter and handle browser navigation
  useEffect(() => {
    const syncTabFromUrl = () => {
      const searchParams = new URLSearchParams(window.location.search);
      const tabParam = searchParams.get("tab");
      if (tabParam === "orders" || tabParam === "buyer-dash") {
        setActiveTab("buyer-dash");
      } else if (tabParam === "farmer" || tabParam === "farmer-dash") {
        setActiveTab("farmer-dash");
      } else if (tabParam === "browse" || !tabParam) {
        setActiveTab("browse");
      }
    };

    syncTabFromUrl();
    window.addEventListener("popstate", syncTabFromUrl);
    return () => window.removeEventListener("popstate", syncTabFromUrl);
  }, []);

  const handleTabChange = (val: string) => {
    const newTab = val as "browse" | "farmer-dash" | "buyer-dash";
    setActiveTab(newTab);
    const searchParams = new URLSearchParams(window.location.search);
    if (newTab === "farmer-dash") {
      searchParams.set("tab", "farmer");
    } else if (newTab === "buyer-dash") {
      searchParams.set("tab", "orders");
    } else {
      searchParams.set("tab", "browse");
    }
    window.history.pushState(null, "", `${window.location.pathname}?${searchParams.toString()}`);
  };

  // Location selector state
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [psgcRegions, setPsgcRegions] = useState<any[]>([]);
  const [psgcProvinces, setPsgcProvinces] = useState<any[]>([]);
  const [psgcCities, setPsgcCities] = useState<any[]>([]);
  const [psgcBarangays, setPsgcBarangays] = useState<any[]>([]);

  const [selectedRegCode, setSelectedRegCode] = useState("");
  const [selectedProvCode, setSelectedProvCode] = useState("");
  const [selectedCityCode, setSelectedCityCode] = useState("");
  const [selectedBrgyCode, setSelectedBrgyCode] = useState("");
  const [customLocationSearch, setCustomLocationSearch] = useState("");

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [buyerLocation, setBuyerLocation] = useState("Butuan City, Agusan del Norte");
  const [maxPriceFilter, setMaxPriceFilter] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "price_asc" | "price_desc" | "distance" | "quantity">("newest");

  // Load PSGC Regions when location modal opens
  useEffect(() => {
    if (locationModalOpen && psgcRegions.length === 0) {
      fetch("/api/psgc/regions")
        .then((r) => r.json())
        .then((data) => Array.isArray(data) && setPsgcRegions(data))
        .catch(() => {});
    }
  }, [locationModalOpen]);

  // Load Provinces when Region selected
  useEffect(() => {
    if (selectedRegCode) {
      fetch(`/api/psgc/provinces?region_code=${selectedRegCode}`)
        .then((r) => r.json())
        .then((data) => Array.isArray(data) && setPsgcProvinces(data))
        .catch(() => {});
      setSelectedProvCode("");
      setSelectedCityCode("");
      setSelectedBrgyCode("");
      setPsgcCities([]);
      setPsgcBarangays([]);
    }
  }, [selectedRegCode]);

  // Load Cities when Province selected
  useEffect(() => {
    if (selectedProvCode) {
      fetch(`/api/psgc/cities?province_code=${selectedProvCode}`)
        .then((r) => r.json())
        .then((data) => Array.isArray(data) && setPsgcCities(data))
        .catch(() => {});
      setSelectedCityCode("");
      setSelectedBrgyCode("");
      setPsgcBarangays([]);
    }
  }, [selectedProvCode]);

  // Load Barangays when City selected
  useEffect(() => {
    if (selectedCityCode) {
      fetch(`/api/psgc/barangays?city_code=${selectedCityCode}`)
        .then((r) => r.json())
        .then((data) => Array.isArray(data) && setPsgcBarangays(data))
        .catch(() => {});
      setSelectedBrgyCode("");
    }
  }, [selectedCityCode]);

  const handleApplyLocation = () => {
    let locString = customLocationSearch.trim();
    let regName = "";
    let provName = "";
    let cityName = "";
    let brgyName = "";

    if (!locString) {
      const parts: string[] = [];
      if (selectedBrgyCode) {
        const brgy = psgcBarangays.find((b) => b.code === selectedBrgyCode);
        if (brgy) {
          brgyName = `Brgy. ${brgy.name}`;
          parts.push(brgyName);
        }
      }
      if (selectedCityCode) {
        const city = psgcCities.find((c) => c.code === selectedCityCode);
        if (city) {
          cityName = city.name;
          parts.push(cityName);
        }
      }
      if (selectedProvCode) {
        const prov = psgcProvinces.find((p) => p.code === selectedProvCode);
        if (prov) {
          provName = prov.name;
          parts.push(provName);
        }
      }
      if (selectedRegCode) {
        const reg = psgcRegions.find((r) => r.code === selectedRegCode);
        if (reg) {
          regName = reg.name;
        }
      }
      locString = parts.join(", ");
    }

    if (locString) {
      setBuyerLocation(locString);
      setNewListingForm((prev) => ({
        ...prev,
        ...(regName ? { region: regName } : {}),
        ...(provName ? { province: provName } : {}),
        ...(cityName ? { municipality: cityName } : {}),
        ...(brgyName ? { barangay: brgyName } : {}),
      }));
      toast({
        title: "Location Updated",
        description: `Marketplace location set to ${locString}`,
      });
    }
    setLocationModalOpen(false);
  };

  // Listings data
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [loadingListings, setLoadingListings] = useState(true);

  // Selected Listing Detail Modal
  const [selectedListing, setSelectedListing] = useState<MarketplaceListing | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  // Buy Now Modal
  const [buyNowOpen, setBuyNowOpen] = useState(false);
  const [buyQuantity, setBuyQuantity] = useState("50");
  const [buyerNameInput, setBuyerNameInput] = useState("Juan Dela Cruz");
  const [buyerPhoneInput, setBuyerPhoneInput] = useState("+63 917 123 4567");
  const [submittingOrder, setSubmittingOrder] = useState(false);

  // Make Offer Modal
  const [makeOfferOpen, setMakeOfferOpen] = useState(false);
  const [offerPriceInput, setOfferPriceInput] = useState("");
  const [offerQuantityInput, setOfferQuantityInput] = useState("100");
  const [offerNotesInput, setOfferNotesInput] = useState("");
  const [submittingOffer, setSubmittingOffer] = useState(false);
  const [offerError, setOfferError] = useState<string | null>(null);

  // Add Listing Modal
  const [addListingOpen, setAddListingOpen] = useState(false);
  const [newListingForm, setNewListingForm] = useState({
    sellerName: "Mang Pedro Farmer",
    sellerPhone: "+63 918 888 7766",
    sellerFarmName: "Agusan Organic Fields",
    cropName: "Rice",
    variety: "Dinorado (Well-Milled)",
    category: "Grains & Staples",
    quantityAvailableKg: "500",
    askingPricePhpKg: "48",
    qualityGrade: "Grade A" as const,
    region: "Region XIII - CARAGA",
    province: "Agusan del Norte",
    municipality: "Butuan City",
    barangay: "Brgy. Libertad",
    description: "Freshly harvested premium rice grains.",
    deliveryOptions: "Farm Gate Pickup, Local Delivery",
  });
  const [daPreviewPrice, setDaPreviewPrice] = useState<number | null>(null);
  const [submittingListing, setSubmittingListing] = useState(false);

  // Dashboard Data
  const [farmerDash, setFarmerDash] = useState<any>(null);
  const [buyerDash, setBuyerDash] = useState<any>(null);
  const [loadingDash, setLoadingDash] = useState(false);

  // Load Marketplace Listings
  const fetchListings = () => {
    setLoadingListings(true);
    const params = new URLSearchParams();
    if (searchQuery) params.append("search", searchQuery);
    if (selectedCategory && selectedCategory !== "all") params.append("category", selectedCategory);
    if (selectedRegion && selectedRegion !== "all") params.append("region", selectedRegion);
    if (maxPriceFilter) params.append("maxPrice", maxPriceFilter);
    if (buyerLocation) params.append("buyerLocation", buyerLocation);
    if (sortBy) params.append("sortBy", sortBy);

    fetch(`/api/marketplace/listings?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setListings(data);
        }
      })
      .catch((err) => console.error("Error fetching listings:", err))
      .finally(() => setLoadingListings(false));
  };

  useEffect(() => {
    fetchListings();
  }, [selectedCategory, selectedRegion, buyerLocation, sortBy]);

  // Load Dashboards when switching tabs
  const refreshDashboards = () => {
    setLoadingDash(true);
    Promise.all([
      fetch("/api/marketplace/farmer-dashboard?sellerId=all").then((r) => r.json()),
      fetch("/api/marketplace/buyer-dashboard?buyerName=all").then((r) => r.json()),
    ])
      .then(([fData, bData]) => {
        setFarmerDash(fData);
        setBuyerDash(bData);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoadingDash(false));
  };

  useEffect(() => {
    if (activeTab === "farmer-dash" || activeTab === "buyer-dash") {
      refreshDashboards();
    }
  }, [activeTab]);

  // Fetch AI Analysis when listing opened
  useEffect(() => {
    if (selectedListing) {
      setLoadingAi(true);
      setAiAnalysis(null);
      fetch(`/api/marketplace/listings/${selectedListing.listingId}/ai-analysis?buyerLocation=${encodeURIComponent(buyerLocation)}`)
        .then((r) => r.json())
        .then((data) => setAiAnalysis(data))
        .catch((e) => console.error(e))
        .finally(() => setLoadingAi(false));
    }
  }, [selectedListing, buyerLocation]);

  // Fetch DA Reference Preview for New Listing
  useEffect(() => {
    if (addListingOpen && newListingForm.cropName) {
      fetch(`/api/prices/latest?region=${encodeURIComponent(newListingForm.region)}&category=all`)
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data)) {
            const found = data.find((d: any) => d.commodity.toLowerCase().includes(newListingForm.cropName.toLowerCase()));
            if (found) {
              setDaPreviewPrice(found.pricePhpKg);
            } else {
              setDaPreviewPrice(45);
            }
          }
        })
        .catch(() => setDaPreviewPrice(45));
    }
  }, [addListingOpen, newListingForm.cropName, newListingForm.region]);

  // Handle Direct Buy Submit
  const handleDirectBuySubmit = async () => {
    if (!selectedListing) return;
    setSubmittingOrder(true);
    try {
      const res = await fetch("/api/marketplace/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: selectedListing.listingId,
          buyerName: buyerNameInput,
          buyerContact: buyerPhoneInput,
          buyerLocation,
          quantityKg: parseFloat(buyQuantity),
          deliveryMethod: "Local Delivery",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to place order");

      toast({
        title: "Order Reserved! 🎉",
        description: `Your order for ${buyQuantity} kg of ${selectedListing.cropName} from ${selectedListing.sellerName} was confirmed.`,
      });

      setBuyNowOpen(false);
      setSelectedListing(null);
      fetchListings();
    } catch (err: any) {
      toast({
        title: "Order Failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setSubmittingOrder(false);
    }
  };

  // Handle Make Offer Submit
  const handleMakeOfferSubmit = async () => {
    if (!selectedListing) return;
    setOfferError(null);
    setSubmittingOffer(true);

    const price = parseFloat(offerPriceInput);
    const qty = parseFloat(offerQuantityInput);

    try {
      const res = await fetch("/api/marketplace/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: selectedListing.listingId,
          buyerName: buyerNameInput,
          buyerContact: buyerPhoneInput,
          buyerLocation,
          quantityKg: qty,
          offeredPricePhpKg: price,
          notes: offerNotesInput,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Offer submission failed");

      toast({
        title: "Offer Submitted To Farmer! 📩",
        description: `Your offer of ₱${price}/kg for ${qty} kg of ${selectedListing.cropName} was sent to ${selectedListing.sellerName}.`,
      });

      setMakeOfferOpen(false);
      setSelectedListing(null);
    } catch (err: any) {
      setOfferError(err.message || "Offer rejected by server validation rules.");
    } finally {
      setSubmittingOffer(false);
    }
  };

  // Handle Create Listing Submit
  const handleCreateListingSubmit = async () => {
    setSubmittingListing(true);
    try {
      const res = await fetch("/api/marketplace/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sellerName: newListingForm.sellerName,
          sellerPhone: newListingForm.sellerPhone,
          sellerFarmName: newListingForm.sellerFarmName,
          cropName: newListingForm.cropName,
          variety: newListingForm.variety,
          category: newListingForm.category,
          quantityAvailableKg: parseFloat(newListingForm.quantityAvailableKg),
          askingPricePhpKg: parseFloat(newListingForm.askingPricePhpKg),
          qualityGrade: newListingForm.qualityGrade,
          region: newListingForm.region,
          province: newListingForm.province,
          municipality: newListingForm.municipality,
          description: newListingForm.description,
          deliveryOptions: newListingForm.deliveryOptions.split(",").map((s) => s.trim()),
          photoUrls: ["https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=800&auto=format&fit=crop"],
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create listing");

      toast({
        title: "Crop Listing Published! 🌾",
        description: `Your ${newListingForm.cropName} listing is now live on the marketplace.`,
      });

      setAddListingOpen(false);
      fetchListings();
    } catch (err: any) {
      toast({ title: "Publish Failed", description: err.message, variant: "destructive" });
    } finally {
      setSubmittingListing(false);
    }
  };

  // Farmer Respond to Offer
  const handleFarmerOfferRespond = async (offerId: string, action: "accept" | "reject") => {
    try {
      const res = await fetch(`/api/marketplace/offers/${offerId}/respond`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error("Action failed");

      toast({
        title: action === "accept" ? "Offer Accepted!" : "Offer Rejected",
        description: action === "accept" ? "Stock reserved for buyer." : "Buyer notified.",
      });

      refreshDashboards();
    } catch (err: any) {
      toast({ title: "Action Failed", description: err.message, variant: "destructive" });
    }
  };

  // Update Order Status
  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`/api/marketplace/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      toast({
        title: `Order Updated: ${status}`,
        description: `Order ${orderId} is now ${status}.`,
      });
      refreshDashboards();
    } catch (err: any) {
      toast({ title: "Update Failed", description: err.message, variant: "destructive" });
    }
  };

  // Toggle Favorite
  const handleToggleFavorite = async (listingId: string) => {
    try {
      const res = await fetch("/api/marketplace/favorites/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId }),
      });
      const data = await res.json();
      setListings((prev) =>
        prev.map((l) => (l.listingId === listingId ? { ...l, isFavorite: data.isFavorite } : l))
      );
      toast({
        title: data.isFavorite ? "Added to Favorites" : "Removed from Favorites",
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6 pb-12 max-w-full overflow-x-hidden">
      {/* Top Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4 border-b pb-4 sm:pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <Badge className="bg-amber-600 hover:bg-amber-700 text-white font-semibold text-[10px] sm:text-xs px-2.5 py-0.5 gap-1 shadow-xs">
              <Store className="h-3.5 w-3.5" /> Farmer Trading Platform
            </Badge>
            <Badge variant="outline" className="text-[10px] sm:text-xs bg-amber-50 text-amber-800 border-amber-200/80 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/60">
              <ShieldCheck className="h-3 w-3 mr-1 text-amber-600 dark:text-amber-400" /> DA Reference Safeguard
            </Badge>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-stone-900 dark:text-stone-100">Philippine Farmer Marketplace</h1>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 mt-1">
            Direct farmer-to-buyer crop trading with official Department of Agriculture (DA) price safeguards
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto">
          {/* Buyer Location Selector */}
          <Button
            variant="outline"
            className="bg-card text-xs h-9 justify-start gap-2 border-amber-200/70 dark:border-amber-900/50 text-foreground w-full sm:w-64 truncate shrink-0"
            onClick={() => setLocationModalOpen(true)}
          >
            <MapPin className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="truncate">{buyerLocation || "Select Location"}</span>
          </Button>

          {/* Add Listing Button */}
          <Button
            className="bg-amber-600 hover:bg-amber-700 text-white gap-1.5 h-9 text-xs font-semibold px-4 w-full sm:w-auto shrink-0 shadow-xs"
            onClick={() => setAddListingOpen(true)}
          >
            <PlusCircle className="h-4 w-4" /> Sell Crops / Add Listing
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto sm:mx-0">
          <TabsTrigger value="browse" className="gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-semibold px-1 sm:px-3">
            <ShoppingBag className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">Browse</span>
          </TabsTrigger>
          <TabsTrigger value="farmer-dash" className="gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-semibold px-1 sm:px-3">
            <BarChart3 className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">Farmer</span>
          </TabsTrigger>
          <TabsTrigger value="buyer-dash" className="gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-semibold px-1 sm:px-3">
            <ShoppingCart className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">Orders</span>
          </TabsTrigger>
        </TabsList>

        {/* 1. BROWSE MARKETPLACE TAB */}
        <TabsContent value="browse" className="space-y-4 sm:space-y-5 mt-4 sm:mt-5">
          {/* Search & Filter Bar */}
          <Card className="bg-card border shadow-xs p-3 sm:p-4 space-y-3">
            <div className="grid gap-2.5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
              {/* Search */}
              <div className="relative lg:col-span-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search crop, variety, seller, location..."
                  className="pl-9 h-9 text-xs bg-muted/40"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && fetchListings()}
                />
              </div>

              {/* Category Filter */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="h-9 text-xs bg-muted/40">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat === "all" ? "All Categories" : cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sort By */}
              <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                <SelectTrigger className="h-9 text-xs bg-muted/40">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="price_asc">Price: Low to High</SelectItem>
                  <SelectItem value="price_desc">Price: High to Low</SelectItem>
                  <SelectItem value="distance">Distance: Nearest First</SelectItem>
                  <SelectItem value="quantity">Stock: Highest Available</SelectItem>
                </SelectContent>
              </Select>

              {/* Search Action */}
              <Button onClick={fetchListings} className="h-9 text-xs font-semibold bg-primary text-primary-foreground">
                <Filter className="h-3.5 w-3.5 mr-1" /> Apply Filters
              </Button>
            </div>
          </Card>

          {/* DA Safeguard Note Banner */}
          <div className="rounded-xl border border-amber-300/60 bg-gradient-to-r from-amber-50 via-rose-50/40 to-amber-50/60 p-3 sm:p-3.5 text-xs text-amber-950 dark:from-amber-950/40 dark:to-rose-950/30 dark:text-amber-200 dark:border-amber-800/60 flex items-start gap-2.5">
            <ShieldCheck className="h-5 w-5 text-rose-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5 text-[11px] sm:text-xs">
              <div className="font-bold text-stone-900 dark:text-stone-100">DA Reference Benchmark & 10% Protection Rule</div>
              <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
                Every listing displays live Department of Agriculture (DA) Bantay Presyo prices. Offers are safeguarded up to <strong>10% below</strong> the DA benchmark.
              </p>
            </div>
          </div>

          {/* Listings Grid (Mobile-First: 1 col on <360px, 2 col on >=360px phones) */}
          {loadingListings ? (
            <div className="grid gap-3 sm:gap-4 grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3">
              {Array(6).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-72 sm:h-80 w-full rounded-2xl" />
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center py-12 sm:py-16 px-4 bg-card border rounded-2xl shadow-xs max-w-lg mx-auto space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
                <Store className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <p className="text-base font-bold text-foreground">No Crop Listings Available Yet</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Be the first farmer or agricultural cooperative to list your harvested crops and connect directly with verified buyers across the Philippines.
                </p>
              </div>
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
                <Button
                  className="bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs h-9 px-5 w-full sm:w-auto shadow-xs"
                  onClick={() => setAddListingOpen(true)}
                >
                  <PlusCircle className="h-4 w-4 mr-1.5" /> Sell Your Crops / Add Listing
                </Button>
                {(searchQuery || selectedCategory !== "all" || selectedRegion !== "all") && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-9 w-full sm:w-auto"
                    onClick={() => { setSearchQuery(""); setSelectedCategory("all"); setSelectedRegion("all"); setSortBy("newest"); fetchListings(); }}
                  >
                    Reset Filters
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid gap-2.5 sm:gap-4 grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3">
              {listings.map((item) => {
                const diff = item.priceDifferencePct;
                const isCheaper = diff < 0;

                return (
                  <Card key={item.listingId} className="bg-card border shadow-xs hover:shadow-md transition-shadow overflow-hidden flex flex-col group rounded-2xl">
                    {/* Image Box */}
                    <div className="relative h-32 xs:h-36 sm:h-44 w-full bg-muted overflow-hidden shrink-0">
                      <img
                        src={item.photoUrls[0]}
                        alt={item.cropName}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 left-2 flex flex-col gap-1">
                        <Badge className="bg-black/60 backdrop-blur-md text-white border-none text-[9px] sm:text-[10px] px-1.5 py-0.5">
                          {item.qualityGrade}
                        </Badge>
                      </div>
                      <div className="absolute top-2 right-2">
                        <Button
                          size="icon"
                          variant="secondary"
                          className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-black/40 backdrop-blur-md border-none text-white hover:bg-black/60"
                          onClick={() => handleToggleFavorite(item.listingId)}
                        >
                          <Heart className={`h-3.5 w-3.5 ${item.isFavorite ? "fill-rose-500 text-rose-500" : ""}`} />
                        </Button>
                      </div>

                      {/* Stock Badge */}
                      <div className="absolute bottom-2 left-2 bg-black/75 backdrop-blur-md text-white px-2 py-0.5 rounded-md text-[10px] font-semibold flex items-center gap-1">
                        <Package className="h-3 w-3 text-emerald-400" />
                        {item.quantityAvailableKg} kg left
                      </div>
                    </div>

                    {/* Listing Body */}
                    <CardContent className="p-3 sm:p-4 flex-1 space-y-2">
                      <div>
                        <div className="flex items-center justify-between text-[10px] sm:text-xs">
                          <span className="text-muted-foreground font-medium truncate max-w-[90px]">{item.category}</span>
                          <span className="text-primary font-bold flex items-center gap-0.5 shrink-0">
                            <MapPin className="h-3 w-3" /> {item.distanceKm} km
                          </span>
                        </div>
                        <h3 className="text-sm sm:text-base font-bold text-foreground leading-tight mt-0.5 truncate">
                          {item.cropName} <span className="text-xs font-normal text-muted-foreground">({item.variety})</span>
                        </h3>
                        <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 flex items-center gap-1 truncate">
                          <UserCheck className="h-3 w-3 text-emerald-600 shrink-0" />
                          <span className="font-semibold text-foreground truncate">{item.sellerName}</span>
                        </p>
                      </div>

                      {/* Price Section */}
                      <div className="rounded-xl bg-muted/40 p-2 sm:p-3 border space-y-1">
                        <div className="flex items-baseline justify-between">
                          <span className="text-[10px] sm:text-xs text-muted-foreground font-medium">Farmer:</span>
                          <div className="text-right">
                            <span className="text-base sm:text-lg font-black text-foreground">₱{item.askingPricePhpKg}</span>
                            <span className="text-[10px] text-muted-foreground">/{item.unit}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[10px] sm:text-xs pt-1 border-t border-border/40">
                          <span className="text-muted-foreground flex items-center gap-0.5">
                            <ShieldCheck className="h-3 w-3 text-primary shrink-0" /> DA Ref:
                          </span>
                          <span className="font-bold text-foreground">₱{item.daReferencePricePhpKg}/{item.unit}</span>
                        </div>
                      </div>

                      {/* Location & Delivery */}
                      <div className="text-[10px] sm:text-xs text-muted-foreground space-y-0.5">
                        <div className="flex items-center gap-1 truncate">
                          <MapPin className="h-3 w-3 text-primary shrink-0" />
                          <span className="truncate">{item.municipality}, {item.province}</span>
                        </div>
                      </div>
                    </CardContent>

                    {/* Actions */}
                    <CardFooter className="p-3 sm:p-4 pt-0 gap-1.5 flex-col xs:flex-row">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-[11px] h-8 sm:h-9 font-semibold"
                        onClick={() => setSelectedListing(item)}
                      >
                        <Eye className="h-3.5 w-3.5 mr-1" /> View
                      </Button>
                      <Button
                        size="sm"
                        className="w-full bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-700 hover:to-rose-700 text-white text-[11px] h-8 sm:h-9 font-semibold shadow-xs"
                        onClick={() => { setSelectedListing(item); setBuyNowOpen(true); }}
                      >
                        Buy Now
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* 2. FARMER DASHBOARD TAB */}
        <TabsContent value="farmer-dash" className="space-y-5 mt-4 sm:mt-5">
          {loadingDash ? (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full rounded-2xl" />
              <Skeleton className="h-64 w-full rounded-2xl" />
            </div>
          ) : farmerDash ? (
            <>
              {/* Stat Cards */}
              <div className="grid gap-2.5 grid-cols-2 lg:grid-cols-5">
                <Card className="bg-card border shadow-xs">
                  <CardContent className="p-3.5">
                    <div className="text-[10px] font-semibold text-muted-foreground uppercase">Active Listings</div>
                    <div className="text-xl sm:text-2xl font-black mt-1 text-foreground">{farmerDash.activeListingsCount ?? 0}</div>
                    <p className="text-[10px] text-muted-foreground">On Marketplace</p>
                  </CardContent>
                </Card>
                <Card className="bg-card border shadow-xs">
                  <CardContent className="p-3.5">
                    <div className="text-[10px] font-semibold text-muted-foreground uppercase">Available Volume</div>
                    <div className="text-xl sm:text-2xl font-black mt-1 text-foreground">{farmerDash.totalAvailableKg ?? 0} kg</div>
                    <p className="text-[10px] text-muted-foreground">In Inventory</p>
                  </CardContent>
                </Card>
                <Card className="bg-card border shadow-xs">
                  <CardContent className="p-3.5">
                    <div className="text-[10px] font-semibold text-muted-foreground uppercase">Pending Offers</div>
                    <div className="text-xl sm:text-2xl font-black mt-1 text-amber-600 dark:text-amber-400">{farmerDash.pendingOffersCount ?? 0}</div>
                    <p className="text-[10px] text-muted-foreground">Requires Action</p>
                  </CardContent>
                </Card>
                <Card className="bg-card border shadow-xs">
                  <CardContent className="p-3.5">
                    <div className="text-[10px] font-semibold text-muted-foreground uppercase">Completed Orders</div>
                    <div className="text-xl sm:text-2xl font-black mt-1 text-emerald-600 dark:text-emerald-400">{farmerDash.completedOrdersCount ?? 0}</div>
                    <p className="text-[10px] text-muted-foreground">Confirmed Sales</p>
                  </CardContent>
                </Card>
                <Card className="bg-card border shadow-xs col-span-2 lg:col-span-1">
                  <CardContent className="p-3.5">
                    <div className="text-[10px] font-semibold text-muted-foreground uppercase">Total Sales Revenue</div>
                    <div className="text-xl sm:text-2xl font-black mt-1 text-primary">₱{(farmerDash.totalRevenuePhp ?? 0).toLocaleString()}</div>
                    <p className="text-[10px] text-muted-foreground">Gross Revenue</p>
                  </CardContent>
                </Card>
              </div>

              {/* Pending Offers Table */}
              <Card className="border shadow-xs overflow-hidden">
                <CardHeader className="p-4 border-b">
                  <CardTitle className="text-sm sm:text-base font-bold flex items-center gap-2">
                    <Tag className="h-4 w-4 text-primary" /> Incoming Offers from Buyers
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {(() => {
                    const offers = farmerDash.pendingOffers || farmerDash.receivedOffers || [];
                    if (offers.length === 0) {
                      return <div className="p-6 text-center text-xs text-muted-foreground">No buyer offers received yet.</div>;
                    }
                    return (
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                          <thead className="bg-muted/50 border-b uppercase font-semibold text-muted-foreground">
                            <tr>
                              <th className="p-3">Buyer</th>
                              <th className="p-3">Crop</th>
                              <th className="p-3">Qty</th>
                              <th className="p-3">Offered Price</th>
                              <th className="p-3">DA Ref</th>
                              <th className="p-3 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {offers.map((ofr: any) => (
                              <tr key={ofr.offerId || ofr.id} className="hover:bg-muted/30">
                                <td className="p-3 font-semibold">{ofr.buyerName}</td>
                                <td className="p-3 font-bold text-foreground">{ofr.cropName}</td>
                                <td className="p-3">{ofr.quantityKg} kg</td>
                                <td className="p-3 font-bold text-emerald-600">₱{ofr.offeredPricePhpKg}/kg</td>
                                <td className="p-3 text-muted-foreground">₱{ofr.daReferencePricePhpKg}/kg</td>
                                <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                                  <Button
                                    size="sm"
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] h-7 px-2.5"
                                    onClick={() => handleFarmerOfferRespond(ofr.offerId || ofr.id, "accept")}
                                  >
                                    Accept
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-[10px] h-7 px-2.5 text-destructive border-destructive/30"
                                    onClick={() => handleFarmerOfferRespond(ofr.offerId || ofr.id, "reject")}
                                  >
                                    Reject
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="p-8 text-center text-xs text-muted-foreground bg-card border rounded-2xl">
              Unable to load farmer dashboard. Please try again.
            </div>
          )}
        </TabsContent>

        {/* 3. BUYER ORDERS TAB */}
        <TabsContent value="buyer-dash" className="space-y-5 mt-4 sm:mt-5">
          {loadingDash ? (
            <Skeleton className="h-64 w-full rounded-2xl" />
          ) : buyerDash ? (
            <Card className="border shadow-xs overflow-hidden">
              <CardHeader className="p-4 border-b">
                <CardTitle className="text-sm sm:text-base font-bold flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4 text-primary" /> Your Active Orders & Offers
                </CardTitle>
                <CardDescription className="text-xs">
                  Track direct purchases and negotiated offers submitted to farmers
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {(() => {
                  const orders = buyerDash.orders || [];
                  if (orders.length === 0) {
                    return <div className="p-8 text-center text-xs text-muted-foreground">No orders placed yet.</div>;
                  }
                  return (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-muted/50 border-b uppercase font-semibold text-muted-foreground">
                          <tr>
                            <th className="p-3">Order ID</th>
                            <th className="p-3">Crop</th>
                            <th className="p-3">Seller</th>
                            <th className="p-3">Quantity</th>
                            <th className="p-3">Agreed Price</th>
                            <th className="p-3">Total</th>
                            <th className="p-3">Status</th>
                            <th className="p-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {orders.map((ord: any) => (
                            <tr key={ord.orderId || ord.id} className="hover:bg-muted/30">
                              <td className="p-3 font-mono text-[11px] font-bold text-primary">{ord.orderId || ord.id}</td>
                              <td className="p-3 font-bold text-foreground">{ord.cropName} ({ord.variety})</td>
                              <td className="p-3">{ord.sellerName}</td>
                              <td className="p-3 font-semibold">{ord.quantityKg} kg</td>
                              <td className="p-3 font-bold">₱{ord.agreedPricePhpKg}/kg</td>
                              <td className="p-3 font-extrabold text-foreground">₱{(ord.totalAmountPhp ?? 0).toLocaleString()}</td>
                              <td className="p-3">
                                <Badge className={`text-[10px] ${
                                  ord.status === "Completed"
                                    ? "bg-emerald-600 text-white"
                                    : ord.status === "Cancelled"
                                    ? "bg-destructive/10 text-destructive border-destructive/30"
                                    : "bg-blue-600 text-white"
                                }`}>
                                  {ord.status}
                                </Badge>
                              </td>
                              <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                                {ord.status !== "Completed" && ord.status !== "Cancelled" && (
                                  <>
                                    <Button
                                      size="sm"
                                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] h-7 px-2"
                                      onClick={() => handleUpdateOrderStatus(ord.orderId || ord.id, "Completed")}
                                    >
                                      Mark Received
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-[10px] h-7 px-2 text-destructive border-destructive/30"
                                      onClick={() => handleUpdateOrderStatus(ord.orderId || ord.id, "Cancelled")}
                                    >
                                      Cancel
                                    </Button>
                                  </>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          ) : (
            <div className="p-8 text-center text-xs text-muted-foreground bg-card border rounded-2xl">
              Unable to load buyer dashboard. Please try again.
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* PRODUCT PAGE / LISTING DETAIL SHEET */}
      <Sheet open={!!selectedListing} onOpenChange={(open) => !open && setSelectedListing(null)}>
        <SheetContent side="right" className="w-full sm:w-[600px] p-0 flex flex-col">
          {selectedListing && (
            <>
              <SheetHeader className="px-4 sm:px-6 pt-5 pb-3 border-b bg-muted/20">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-[10px] sm:text-xs">
                        {selectedListing.qualityGrade}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{selectedListing.category}</span>
                    </div>
                    <SheetTitle className="text-xl sm:text-2xl font-black mt-1">
                      {selectedListing.cropName} <span className="text-sm font-normal text-muted-foreground">({selectedListing.variety})</span>
                    </SheetTitle>
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                      {selectedListing.municipality}, {selectedListing.province} ({selectedListing.distanceKm} km away)
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xl sm:text-2xl font-black text-foreground">₱{selectedListing.askingPricePhpKg}</div>
                    <div className="text-[10px] text-muted-foreground">per {selectedListing.unit}</div>
                  </div>
                </div>
              </SheetHeader>

              <ScrollArea className="flex-1">
                <div className="px-4 sm:px-6 py-4 space-y-4">
                  {/* Image */}
                  <div className="rounded-2xl overflow-hidden h-44 sm:h-52 w-full bg-muted border">
                    <img src={selectedListing.photoUrls[0]} alt={selectedListing.cropName} className="h-full w-full object-cover" />
                  </div>

                  {/* DA Reference Safeguard Box */}
                  <Card className="border border-primary/30 bg-primary/5 p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-primary flex items-center gap-1">
                        <ShieldCheck className="h-4 w-4" /> Official DA Reference Price
                      </span>
                      <Badge variant="outline" className="text-[10px] font-bold">
                        10% Safeguard Active
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center pt-1">
                      <div className="p-2 rounded-lg bg-background border">
                        <div className="text-[9px] text-muted-foreground uppercase">DA Ref</div>
                        <div className="text-sm sm:text-base font-black">₱{selectedListing.daReferencePricePhpKg}</div>
                      </div>
                      <div className="p-2 rounded-lg bg-background border">
                        <div className="text-[9px] text-muted-foreground uppercase">Seller</div>
                        <div className="text-sm sm:text-base font-black">₱{selectedListing.askingPricePhpKg}</div>
                      </div>
                      <div className="p-2 rounded-lg bg-background border">
                        <div className="text-[9px] text-muted-foreground uppercase">Min Offer</div>
                        <div className="text-sm sm:text-base font-black text-emerald-600">₱{Math.round(selectedListing.daReferencePricePhpKg * 0.90 * 100) / 100}</div>
                      </div>
                    </div>
                  </Card>

                  {/* Grownox AI Listing Market Analysis */}
                  <Card className="border bg-card p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Sparkles className="h-4 w-4 text-primary" /> Grownox AI Market Evaluation
                      </span>
                      {loadingAi ? (
                        <Badge variant="outline" className="text-[10px] animate-pulse border-emerald-400 text-emerald-700 dark:text-emerald-300 bg-emerald-500/10">
                          Grownox is working...
                        </Badge>
                      ) : aiAnalysis ? (
                        <Badge className="bg-emerald-600 text-white text-[10px]">
                          Fairness: {aiAnalysis.fairnessScore}
                        </Badge>
                      ) : null}
                    </div>

                    {loadingAi ? (
                      <Skeleton className="h-20 w-full rounded-xl" />
                    ) : aiAnalysis ? (
                      <div className="space-y-2 text-xs">
                        <p className="font-semibold text-foreground">{aiAnalysis.priceAssessment}</p>
                        <p className="text-muted-foreground">{aiAnalysis.offerAdvice}</p>
                        <div className="p-2 rounded bg-muted/40 text-[11px] font-medium text-emerald-800 dark:text-emerald-300">
                          💡 Farmer Tip: {aiAnalysis.farmerTip}
                        </div>
                      </div>
                    ) : null}
                  </Card>

                  {/* Seller Info */}
                  <div className="rounded-xl border p-3 space-y-2 bg-muted/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <UserCheck className="h-4 w-4 text-emerald-600" />
                        <div>
                          <div className="font-bold text-xs">{selectedListing.sellerName}</div>
                          <div className="text-[10px] text-muted-foreground">{selectedListing.sellerFarmName}</div>
                        </div>
                      </div>
                      <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[10px]">
                        {selectedListing.verificationStatus}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-2 border-t pt-2">
                      <Phone className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span>Contact: {selectedListing.sellerPhone}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <Button
                      variant="outline"
                      className="w-full text-xs h-10 font-bold"
                      onClick={() => setMakeOfferOpen(true)}
                    >
                      Make Offer
                    </Button>
                    <Button
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-10 font-bold"
                      onClick={() => setBuyNowOpen(true)}
                    >
                      Buy Now
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* BUY NOW DIALOG */}
      <Dialog open={buyNowOpen} onOpenChange={setBuyNowOpen}>
        <DialogContent className="w-[95vw] max-w-md max-h-[88vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg font-bold">Confirm Direct Purchase Order</DialogTitle>
            <DialogDescription className="text-xs">
              Direct farm-gate order at farmer asking price with stock reservation.
            </DialogDescription>
          </DialogHeader>

          {selectedListing && (
            <div className="space-y-3 py-2 text-xs">
              <div className="p-3 rounded-lg bg-muted/50 border space-y-1">
                <div className="flex justify-between font-semibold">
                  <span>Crop:</span>
                  <span>{selectedListing.cropName} ({selectedListing.variety})</span>
                </div>
                <div className="flex justify-between">
                  <span>Asking Price:</span>
                  <span className="font-bold text-emerald-600">₱{selectedListing.askingPricePhpKg}/kg</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Quantity Required (kg)</Label>
                <Input
                  type="number"
                  value={buyQuantity}
                  onChange={(e) => setBuyQuantity(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Buyer Name</Label>
                <Input value={buyerNameInput} onChange={(e) => setBuyerNameInput(e.target.value)} className="h-9 text-xs" />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Contact Phone</Label>
                <Input value={buyerPhoneInput} onChange={(e) => setBuyerPhoneInput(e.target.value)} className="h-9 text-xs" />
              </div>

              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-between font-bold text-sm">
                <span>Total Amount:</span>
                <span className="text-primary text-base">
                  ₱{(parseFloat(buyQuantity || "0") * selectedListing.askingPricePhpKg).toLocaleString()}
                </span>
              </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" size="sm" onClick={() => setBuyNowOpen(false)} className="w-full sm:w-auto text-xs">Cancel</Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white size-sm w-full sm:w-auto text-xs font-bold"
              disabled={submittingOrder}
              onClick={handleDirectBuySubmit}
            >
              {submittingOrder ? "Confirming..." : "Confirm & Reserve Stock"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MAKE OFFER DIALOG */}
      <Dialog open={makeOfferOpen} onOpenChange={setMakeOfferOpen}>
        <DialogContent className="w-[95vw] max-w-md max-h-[88vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg font-bold">Submit Price Offer to Farmer</DialogTitle>
            <DialogDescription className="text-xs">
              Subject to server 10% minimum offer safeguard against DA reference prices.
            </DialogDescription>
          </DialogHeader>

          {selectedListing && (
            <div className="space-y-3 py-2 text-xs">
              <div className="p-3 rounded-lg bg-muted/50 border space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">DA Ref Price:</span>
                  <span className="font-bold">₱{selectedListing.daReferencePricePhpKg}/kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Asking Price:</span>
                  <span className="font-bold">₱{selectedListing.askingPricePhpKg}/kg</span>
                </div>
                <div className="flex justify-between text-emerald-600 font-bold border-t pt-1">
                  <span>Minimum Permitted Offer (90%):</span>
                  <span>₱{Math.round(selectedListing.daReferencePricePhpKg * 0.90 * 100) / 100}/kg</span>
                </div>
              </div>

              {offerError && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-xs font-semibold flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{offerError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Your Proposed Price (₱/kg)</Label>
                <Input
                  type="number"
                  step="0.5"
                  value={offerPriceInput}
                  onChange={(e) => { setOfferPriceInput(e.target.value); setOfferError(null); }}
                  className="h-9 text-xs font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Quantity Wanted (kg)</Label>
                <Input
                  type="number"
                  value={offerQuantityInput}
                  onChange={(e) => setOfferQuantityInput(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Offer Notes (Optional)</Label>
                <Textarea
                  placeholder="e.g. Ready for farm gate pickup tomorrow morning..."
                  value={offerNotesInput}
                  onChange={(e) => setOfferNotesInput(e.target.value)}
                  className="h-16 text-xs"
                />
              </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" size="sm" onClick={() => setMakeOfferOpen(false)} className="w-full sm:w-auto text-xs">Cancel</Button>
            <Button
              className="bg-primary text-primary-foreground size-sm w-full sm:w-auto text-xs font-bold"
              disabled={submittingOffer}
              onClick={handleMakeOfferSubmit}
            >
              {submittingOffer ? "Submitting..." : "Submit Offer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ADD LISTING / SELL CROPS DIALOG */}
      <Dialog open={addListingOpen} onOpenChange={setAddListingOpen}>
        <DialogContent className="w-[95vw] max-w-lg max-h-[88vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg font-bold">Sell Crops / Add Marketplace Listing</DialogTitle>
            <DialogDescription className="text-xs">
              List your harvested crops for direct sale to buyers with DA price indexing.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Farmer Name</Label>
                <Input value={newListingForm.sellerName} onChange={(e) => setNewListingForm({ ...newListingForm, sellerName: e.target.value })} className="h-9 text-xs" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Contact Phone</Label>
                <Input value={newListingForm.sellerPhone} onChange={(e) => setNewListingForm({ ...newListingForm, sellerPhone: e.target.value })} className="h-9 text-xs" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Crop Name</Label>
                <Select value={newListingForm.cropName} onValueChange={(v) => setNewListingForm({ ...newListingForm, cropName: v })}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Rice">Rice</SelectItem>
                    <SelectItem value="Tomato">Tomato</SelectItem>
                    <SelectItem value="Onion">Onion</SelectItem>
                    <SelectItem value="Cabbage">Cabbage</SelectItem>
                    <SelectItem value="Mango">Mango</SelectItem>
                    <SelectItem value="Banana">Banana</SelectItem>
                    <SelectItem value="Eggplant">Eggplant</SelectItem>
                    <SelectItem value="Corn – Yellow">Corn – Yellow</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Crop Variety</Label>
                <Input value={newListingForm.variety} onChange={(e) => setNewListingForm({ ...newListingForm, variety: e.target.value })} className="h-9 text-xs" />
              </div>
            </div>

            {/* Live DA Reference Price Preview */}
            {daPreviewPrice && (
              <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 text-xs flex items-center justify-between font-medium">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-amber-600 dark:text-amber-400" /> DA Reference Benchmark:
                </span>
                <span className="font-bold text-sm">₱{daPreviewPrice}/kg</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Quantity Available (kg)</Label>
                <Input type="number" value={newListingForm.quantityAvailableKg} onChange={(e) => setNewListingForm({ ...newListingForm, quantityAvailableKg: e.target.value })} className="h-9 text-xs" />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Asking Price (₱/kg)</Label>
                <Input type="number" value={newListingForm.askingPricePhpKg} onChange={(e) => setNewListingForm({ ...newListingForm, askingPricePhpKg: e.target.value })} className="h-9 text-xs font-bold" />
              </div>
            </div>

            {/* Farm Location Selection (All 17 PH Regions & Custom Province/City) */}
            <div className="space-y-2 p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-amber-950 dark:text-amber-200 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-rose-600 dark:text-amber-400" /> Farm Location
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 text-[10px] font-bold text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50 px-2"
                  onClick={() => setLocationModalOpen(true)}
                >
                  📍 Use PSGC Hierarchy Picker
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <Label className="text-[11px] font-medium text-stone-700 dark:text-stone-300">Region (All 17 PH Regions)</Label>
                  <Select value={newListingForm.region} onValueChange={(v) => setNewListingForm({ ...newListingForm, region: v })}>
                    <SelectTrigger className="h-8 text-xs bg-background">
                      <SelectValue placeholder="Select Region" />
                    </SelectTrigger>
                    <SelectContent className="max-h-52">
                      {ALL_PHILIPPINE_REGIONS.map((reg) => (
                        <SelectItem key={reg} value={reg}>{reg}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] font-medium text-stone-700 dark:text-stone-300">Province</Label>
                  <Input
                    placeholder="e.g. Agusan del Norte, Isabela, Cebu..."
                    value={newListingForm.province}
                    onChange={(e) => setNewListingForm({ ...newListingForm, province: e.target.value })}
                    className="h-8 text-xs bg-background"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <div className="space-y-1">
                  <Label className="text-[11px] font-medium text-stone-700 dark:text-stone-300">Municipality / City</Label>
                  <Input
                    placeholder="e.g. Butuan City, Santiago, Cebu City..."
                    value={newListingForm.municipality}
                    onChange={(e) => setNewListingForm({ ...newListingForm, municipality: e.target.value })}
                    className="h-8 text-xs bg-background"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] font-medium text-stone-700 dark:text-stone-300">Barangay / Sitio (Optional)</Label>
                  <Input
                    placeholder="e.g. Brgy. Libertad, Poblacion..."
                    value={newListingForm.barangay || ""}
                    onChange={(e) => setNewListingForm({ ...newListingForm, barangay: e.target.value })}
                    className="h-8 text-xs bg-background"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Description</Label>
              <Textarea value={newListingForm.description} onChange={(e) => setNewListingForm({ ...newListingForm, description: e.target.value })} className="h-16 text-xs" />
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" size="sm" onClick={() => setAddListingOpen(false)} className="w-full sm:w-auto text-xs">Cancel</Button>
            <Button className="bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-700 hover:to-rose-700 text-white size-sm w-full sm:w-auto text-xs font-bold shadow-xs" disabled={submittingListing} onClick={handleCreateListingSubmit}>
              {submittingListing ? "Publishing..." : "Publish Listing"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* LOCATION SELECTION DIALOG (COMPLETE PSGC HIERARCHY + SEARCH) */}
      <Dialog open={locationModalOpen} onOpenChange={setLocationModalOpen}>
        <DialogContent className="w-[95vw] max-w-md max-h-[85vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" /> Select Marketplace Location
            </DialogTitle>
            <DialogDescription className="text-xs">
              Filter farm listings by selecting your region, province, city, or barangay across the Philippines.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            {/* Quick Location Search */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Quick Location Search</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="e.g. Tacloban City, Davao del Norte, Panabo, Baguio..."
                  value={customLocationSearch}
                  onChange={(e) => setCustomLocationSearch(e.target.value)}
                  className="pl-8 h-9 text-xs"
                />
              </div>
              <p className="text-[10px] text-muted-foreground">Type any Philippine city, town, or province directly.</p>
            </div>

            <div className="relative flex items-center gap-2 my-2">
              <div className="flex-1 border-t border-border" />
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">OR Browse Hierarchy</span>
              <div className="flex-1 border-t border-border" />
            </div>

            {/* Region Select */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">1. Region</Label>
              <Select value={selectedRegCode} onValueChange={setSelectedRegCode}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Select Region" />
                </SelectTrigger>
                <SelectContent className="max-h-48">
                  {psgcRegions.map((r) => (
                    <SelectItem key={r.code} value={r.code}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Province Select */}
            {selectedRegCode && (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">2. Province</Label>
                <Select value={selectedProvCode} onValueChange={setSelectedProvCode}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select Province" />
                  </SelectTrigger>
                  <SelectContent className="max-h-48">
                    {psgcProvinces.map((p) => (
                      <SelectItem key={p.code} value={p.code}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* City / Municipality Select */}
            {selectedProvCode && (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">3. City / Municipality</Label>
                <Select value={selectedCityCode} onValueChange={setSelectedCityCode}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select City/Municipality" />
                  </SelectTrigger>
                  <SelectContent className="max-h-48">
                    {psgcCities.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Barangay Select */}
            {selectedCityCode && (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">4. Barangay</Label>
                <Select value={selectedBrgyCode} onValueChange={setSelectedBrgyCode}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select Barangay" />
                  </SelectTrigger>
                  <SelectContent className="max-h-48">
                    {psgcBarangays.map((b) => (
                      <SelectItem key={b.code} value={b.code}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2 mt-2">
            <Button variant="outline" size="sm" onClick={() => setLocationModalOpen(false)} className="w-full sm:w-auto text-xs">
              Cancel
            </Button>
            <Button onClick={handleApplyLocation} className="bg-emerald-600 hover:bg-emerald-700 text-white size-sm w-full sm:w-auto text-xs font-bold">
              Apply Location
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
