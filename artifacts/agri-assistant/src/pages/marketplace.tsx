import { useState, useEffect, useMemo, useRef, memo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/hooks/use-settings";
import {
  Store, ShoppingBag, PlusCircle, Search, Filter, MapPin, ShieldCheck,
  CheckCircle2, AlertCircle, Sparkles, Phone, ArrowUpRight, ArrowDownRight,
  Minus, Plus, RefreshCw, Heart, Truck, Calendar, Tag, UserCheck, DollarSign,
  Package, ShoppingCart, Clock, AlertTriangle, Layers, BarChart3, Check, X,
  Info, Eye, ChevronRight, Trash2, Edit, PauseCircle, PlayCircle, MessageSquare,
  ArrowRight, User, ListFilter, SlidersHorizontal, ShoppingBasket, CheckCircle, Home, Bell,
  Star, Camera, Upload, Image as ImageIcon, ArrowLeft, MoveLeft, MoveRight, ThumbsUp, TrendingUp
} from "lucide-react";

interface MarketplaceListing {
  id: string;
  listingId: string;
  sellerId: string;
  sellerName: string;
  sellerPhone: string;
  sellerFarmName?: string;
  sellerRating: number;
  sellerReviewCount?: number;
  verificationStatus: "Grownox Seller" | "Co-op Member" | "Premium Seller" | "Community Seller" | string;
  cropName: string;
  cropImageUrl?: string;
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
  streetAddress?: string;
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

interface MarketplaceReview {
  id: string;
  reviewId: string;
  orderId: string;
  listingId: string;
  sellerId: string;
  sellerName: string;
  buyerName: string;
  cropName: string;
  variety: string;
  rating: number;
  productQualityRating?: number;
  sellerExperienceRating?: number;
  comment: string;
  createdAt: string;
}

function getCropStandardImage(cropName: string): string {
  const name = (cropName || "").toLowerCase().trim();
  if (name.includes("rice") || name.includes("palay") || name.includes("dinorado") || name.includes("sinandomeng") || name.includes("jasmin")) {
    return "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80";
  }
  if (name.includes("corn") || name.includes("mais")) {
    return "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=800&q=80";
  }
  if (name.includes("tomato") || name.includes("kamatis")) {
    return "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80";
  }
  if (name.includes("cabbage") || name.includes("repolyo")) {
    return "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=800&q=80";
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
  if (name.includes("eggplant") || name.includes("talong")) {
    return "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80";
  }
  if (name.includes("potato") || name.includes("patatas")) {
    return "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=80";
  }
  if (name.includes("garlic") || name.includes("bawang")) {
    return "https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?auto=format&fit=crop&w=800&q=80";
  }
  if (name.includes("carrot") || name.includes("karot")) {
    return "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=800&q=80";
  }
  if (name.includes("pineapple") || name.includes("pinya")) {
    return "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=800&q=80";
  }
  if (name.includes("coconut") || name.includes("niyog")) {
    return "https://images.unsplash.com/photo-1543362906-acfc16c67564?auto=format&fit=crop&w=800&q=80";
  }
  if (name.includes("coffee") || name.includes("kape")) {
    return "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80";
  }
  if (name.includes("chili") || name.includes("sili")) {
    return "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=800&q=80";
  }
  if (name.includes("squash") || name.includes("kalabasa") || name.includes("pumpkin")) {
    return "https://images.unsplash.com/photo-1570586437263-ab629fccc818?auto=format&fit=crop&w=800&q=80";
  }
  if (name.includes("peanut") || name.includes("mani")) {
    return "https://images.unsplash.com/photo-1567892336306-037041793739?auto=format&fit=crop&w=800&q=80";
  }
  if (name.includes("papaya")) {
    return "https://images.unsplash.com/photo-1617112848923-cc22343f1a72?auto=format&fit=crop&w=800&q=80";
  }
  return "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80";
}

interface CartItem {
  listing: MarketplaceListing;
  quantityKg: number;
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

const CATEGORIES = [
  { id: "all", label: "All Products", labelFil: "Lahat ng Produkto", icon: "🌾" },
  { id: "Rice", label: "Rice", labelFil: "Palay / Bigas", icon: "🍚" },
  { id: "Corn", label: "Corn", labelFil: "Mais", icon: "🌽" },
  { id: "Vegetables", label: "Vegetables", labelFil: "Mga Gulay", icon: "🥬" },
  { id: "Fruits", label: "Fruits", labelFil: "Mga Prutas", icon: "🍎" },
  { id: "Root Crops", label: "Root Crops", labelFil: "Mga Lamang-lupa", icon: "🥔" },
  { id: "Seeds", label: "Seeds", labelFil: "Mga Binhi", icon: "🌰" },
  { id: "Other Crops", label: "Other Crops", labelFil: "Iba pang Pananim", icon: "📦" },
];

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

function cleanLoc(str: string): string {
  if (!str) return "";
  let s = str.toLowerCase().trim();
  if (s.includes(",")) {
    s = s.split(",")[0].trim();
  }
  s = s.replace(/\b(city of|municipality of|town of)\b/gi, "");
  s = s.replace(/\b(city|municipality|town|capital|dist|district)\b/gi, "");
  s = s.replace(/\([^)]*\)/g, "");
  s = s.replace(/[^a-z0-9]/gi, "");
  return s.trim();
}

function cleanProv(str: string): string {
  if (!str) return "";
  let s = str.toLowerCase().trim();
  if (s.includes(",")) {
    s = s.split(",")[0].trim();
  }
  s = s.replace(/\b(province of|province)\b/gi, "");
  s = s.replace(/[^a-z0-9]/gi, "");
  return s.trim();
}

function cleanReg(str: string): string {
  if (!str) return "";
  let s = str.toLowerCase().trim();
  s = s.replace(/region\s*(xiii|xii|xi|x|ix|viii|vii|vi|v|iv-b|iv-a|iii|ii|i|13|12|11|10|9|8|7|6|5|4b|4a|3|2|1)?\s*-?/gi, "");
  s = s.replace(/[^a-z0-9]/gi, "");
  return s.trim();
}

function getProximityBadge(
  listing: { region?: string; province?: string; municipality?: string },
  buyer: { region?: string; province?: string; municipality?: string },
  isFil?: boolean
) {
  const lMuni = cleanLoc(listing.municipality || "");
  const bMuni = cleanLoc(buyer.municipality || "");

  const lProv = cleanProv(listing.province || "");
  const bProv = cleanProv(buyer.province || "");

  const lReg = cleanReg(listing.region || "");
  const bReg = cleanReg(buyer.region || "");

  if (lMuni && bMuni && (lMuni === bMuni || lMuni.includes(bMuni) || bMuni.includes(lMuni))) {
    return {
      label: isFil ? "Kaparehong Lungsod" : "Same City",
      rank: 1,
      badge: (
        <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 font-bold flex items-center gap-0.5 shrink-0">
          <MapPin className="h-2.5 w-2.5 text-emerald-600" /> {isFil ? "Kaparehong Lungsod" : "Same City"}
        </Badge>
      ),
    };
  }
  if (lProv && bProv && (lProv === bProv || lProv.includes(bProv) || bProv.includes(lProv))) {
    return {
      label: isFil ? "Kaparehong Lalawigan" : "Same Province",
      rank: 2,
      badge: (
        <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-amber-500/40 text-amber-700 dark:text-amber-300 bg-amber-500/10 font-bold flex items-center gap-0.5 shrink-0">
          <MapPin className="h-2.5 w-2.5 text-amber-600" /> {isFil ? "Kaparehong Lalawigan" : "Same Province"}
        </Badge>
      ),
    };
  }
  if (lReg && bReg && (lReg === bReg || lReg.includes(bReg) || bReg.includes(lReg))) {
    return {
      label: isFil ? "Kaparehong Rehiyon" : "Same Region",
      rank: 3,
      badge: (
        <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-blue-500/40 text-blue-700 dark:text-blue-300 bg-blue-500/10 font-bold flex items-center gap-0.5 shrink-0">
          <MapPin className="h-2.5 w-2.5 text-blue-600" /> {isFil ? "Kaparehong Rehiyon" : "Same Region"}
        </Badge>
      ),
    };
  }
  return {
    label: isFil ? "Ibang Rehiyon" : "Outside Region",
    rank: 4,
    badge: (
      <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-muted-foreground/30 text-muted-foreground bg-muted/40 font-medium flex items-center gap-0.5 shrink-0">
        <MapPin className="h-2.5 w-2.5 text-muted-foreground" /> {isFil ? "Ibang Rehiyon" : "Outside Region"}
      </Badge>
    ),
  };
}

export default function MarketplacePage() {
  const { toast } = useToast();
  const { settings, updateSettings, t } = useSettings();
  const isFil = settings.language === "fil";

  // Primary Navigation / View State: 'home' | 'market' | 'sell' | 'cart_orders' | 'my_listings'
  const [navTab, setNavTab] = useState<"home" | "market" | "sell" | "cart_orders" | "my_listings">("home");

  // Sync tab with URL search parameter
  useEffect(() => {
    const syncTabFromUrl = () => {
      const searchParams = new URLSearchParams(window.location.search);
      const tabParam = searchParams.get("tab");
      if (tabParam === "orders" || tabParam === "cart") {
        setNavTab("cart_orders");
      } else if (tabParam === "sell") {
        setNavTab("sell");
      } else if (tabParam === "my-listings" || tabParam === "farmer") {
        setNavTab("my_listings");
      } else if (tabParam === "market") {
        setNavTab("market");
      } else {
        setNavTab("home");
      }
    };

    syncTabFromUrl();
    window.addEventListener("popstate", syncTabFromUrl);
    return () => window.removeEventListener("popstate", syncTabFromUrl);
  }, []);

  const changeNavTab = (tab: "home" | "market" | "sell" | "cart_orders" | "my_listings") => {
    setNavTab(tab);
    const searchParams = new URLSearchParams(window.location.search);
    if (tab === "home") searchParams.set("tab", "home");
    else if (tab === "market") searchParams.set("tab", "market");
    else if (tab === "sell") searchParams.set("tab", "sell");
    else if (tab === "cart_orders") searchParams.set("tab", "orders");
    else if (tab === "my_listings") searchParams.set("tab", "my-listings");
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
  const [buyerLocation, setBuyerLocation] = useState(() => {
    const muni = settings.cityName || settings.savedBuyerAddress?.municipality || "Mati City";
    const prov = settings.provinceName || settings.savedBuyerAddress?.province || "Davao Oriental";
    return `${muni}, ${prov}`;
  });

  // Derived Buyer Location Object from active buyerLocation state or Settings
  const buyerLocationObj = useMemo(() => {
    const parts = buyerLocation.split(",").map((s) => s.trim());
    const muni = parts[0] || settings.cityName || settings.savedBuyerAddress?.municipality || "Mati City";
    const prov = parts[1] || settings.provinceName || settings.savedBuyerAddress?.province || "Davao Oriental";
    const reg = settings.regionName || settings.savedBuyerAddress?.region || "Davao Region";
    return {
      municipality: muni,
      province: prov,
      region: reg,
    };
  }, [buyerLocation, settings.savedBuyerAddress, settings.cityName, settings.provinceName, settings.regionName]);

  // Seller Listing Location PSGC State
  const [sellPsgcRegions, setSellPsgcRegions] = useState<any[]>([]);
  const [sellPsgcProvinces, setSellPsgcProvinces] = useState<any[]>([]);
  const [sellPsgcCities, setSellPsgcCities] = useState<any[]>([]);
  const [sellRegCode, setSellRegCode] = useState("");
  const [sellProvCode, setSellProvCode] = useState("");
  const [sellCityCode, setSellCityCode] = useState("");

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [sortBy, setSortBy] = useState<"newest" | "price_asc" | "price_desc" | "distance" | "quantity">("newest");

  // Listings data
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [loadingListings, setLoadingListings] = useState(true);

  // Selected Product Detail Modal/Sheet
  const [selectedListing, setSelectedListing] = useState<MarketplaceListing | null>(null);
  const [activeDetailPhotoIndex, setActiveDetailPhotoIndex] = useState<number>(0);
  const [detailQuantity, setDetailQuantity] = useState<number>(1);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  // Chat Seller Modal
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");

  // Shopping Cart State (Persisted in localStorage)
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem("grownox_marketplace_cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("grownox_marketplace_cart", JSON.stringify(cart));
    } catch (e) {
      console.error("Cart save error", e);
    }
  }, [cart]);

  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [checkoutAddress, setCheckoutAddress] = useState("Butuan City, Agusan del Norte");
  const [checkoutBarangay, setCheckoutBarangay] = useState("Doongan");
  const [checkoutStreetAddress, setCheckoutStreetAddress] = useState("J.C. Aquino Ave, Commercial Center");
  const [checkoutPhone, setCheckoutPhone] = useState("+63 917 123 4567");
  const [checkoutBuyerName, setCheckoutBuyerName] = useState("Juan Dela Cruz");
  const [checkoutPaymentMethod, setCheckoutPaymentMethod] = useState("Cash on Delivery");
  const [placingOrder, setPlacingOrder] = useState(false);

  // Sell Crops Wizard / Modal
  const [addListingOpen, setAddListingOpen] = useState(false);
  const [sellStep, setSellStep] = useState(1);
  const [newListingForm, setNewListingForm] = useState({
    sellerName: "",
    sellerPhone: "",
    sellerFarmName: "",
    cropName: "Rice",
    variety: "",
    category: "Grains & Staples",
    quantityAvailableKg: "",
    unit: "kg",
    askingPricePhpKg: "",
    qualityGrade: "Grade A",
    region: "Region XI - Davao",
    province: "Davao Oriental",
    municipality: "Mati City",
    barangay: "",
    streetAddress: "",
    description: "",
    deliveryOptions: "Farm Gate Pickup, Local Delivery",
  });
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [daPreviewPrice, setDaPreviewPrice] = useState<number | null>(null);
  const [submittingListing, setSubmittingListing] = useState(false);

  // Reviews & Rating System State
  const [reviewModalOrder, setReviewModalOrder] = useState<any | null>(null);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewQualityRating, setReviewQualityRating] = useState<number>(5);
  const [reviewExperienceRating, setReviewExperienceRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>("");
  const [submittingReview, setSubmittingReview] = useState<boolean>(false);

  // Seller Profile & Reviews Modal
  const [sellerProfileModal, setSellerProfileModal] = useState<{ sellerId: string; sellerName: string; sellerPhone?: string; sellerFarmName?: string } | null>(null);
  const [sellerProfileReviews, setSellerProfileReviews] = useState<MarketplaceReview[]>([]);
  const [sellerProfileSummary, setSellerProfileSummary] = useState<{ averageRating: number; totalReviews: number } | null>(null);
  const [loadingSellerReviews, setLoadingSellerReviews] = useState<boolean>(false);

  // Product Details Reviews
  const [listingReviews, setListingReviews] = useState<MarketplaceReview[]>([]);

  // Photo Uploader Event Handlers
  const handlePhotosSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const files = Array.from(e.target.files);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setUploadedPhotos((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSetPrimaryPhoto = (index: number) => {
    if (index === 0) return;
    setUploadedPhotos((prev) => {
      const next = [...prev];
      const item = next.splice(index, 1)[0];
      next.unshift(item);
      return next;
    });
  };

  const handleRemovePhoto = (index: number) => {
    setUploadedPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMovePhoto = (index: number, direction: "left" | "right") => {
    setUploadedPhotos((prev) => {
      const next = [...prev];
      const targetIndex = direction === "left" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= next.length) return prev;
      const temp = next[index];
      next[index] = next[targetIndex];
      next[targetIndex] = temp;
      return next;
    });
  };

  // Review & Rating Handlers
  const handleSubmitReview = async () => {
    if (!reviewModalOrder || !reviewComment.trim()) {
      toast({ title: "Comment Required", description: "Please enter your written review comment.", variant: "destructive" });
      return;
    }
    setSubmittingReview(true);
    try {
      const res = await fetch("/api/marketplace/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: reviewModalOrder.orderId || reviewModalOrder.id,
          buyerName: reviewModalOrder.buyerName || settings.userName || (isFil ? "Mamimili" : "Buyer"),
          rating: reviewRating,
          productQualityRating: reviewQualityRating,
          sellerExperienceRating: reviewExperienceRating,
          comment: reviewComment,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit review");

      toast({
        title: "Review Published! ⭐",
        description: "Thank you for reviewing your verified marketplace order.",
      });

      setReviewModalOrder(null);
      setReviewComment("");
      fetchOrders();
      fetchListings();
    } catch (err: any) {
      toast({ title: "Review Failed", description: err.message, variant: "destructive" });
    } finally {
      setSubmittingReview(false);
    }
  };

  const openSellerProfile = (sellerId: string, sellerName: string, sellerPhone?: string, sellerFarmName?: string) => {
    setSellerProfileModal({ sellerId, sellerName, sellerPhone, sellerFarmName });
    setLoadingSellerReviews(true);
    fetch(`/api/marketplace/sellers/${encodeURIComponent(sellerId)}/reviews`)
      .then((r) => r.json())
      .then((data) => {
        if (data) {
          setSellerProfileSummary({ averageRating: data.averageRating || 0, totalReviews: data.totalReviews || 0 });
          setSellerProfileReviews(Array.isArray(data.reviews) ? data.reviews : []);
        }
      })
      .catch((e) => console.error("Failed to load seller reviews", e))
      .finally(() => setLoadingSellerReviews(false));
  };

  // My Listings State & Filters
  const [myListingsFilter, setMyListingsFilter] = useState<"active" | "paused" | "sold_out" | "completed">("active");
  const [editingListing, setEditingListing] = useState<MarketplaceListing | null>(null);
  const [editPriceInput, setEditPriceInput] = useState("");
  const [editQtyInput, setEditQtyInput] = useState("");
  const [editDescInput, setEditDescInput] = useState("");
  const [updatingListing, setUpdatingListing] = useState(false);

  // Orders Data
  const [myOrders, setMyOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

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

  // Load PSGC Regions for Seller Creation Wizard
  useEffect(() => {
    if (addListingOpen && sellPsgcRegions.length === 0) {
      fetch("/api/psgc/regions")
        .then((r) => r.json())
        .then((data) => Array.isArray(data) && setSellPsgcRegions(data))
        .catch(() => {});
    }
  }, [addListingOpen]);

  // Sync Seller Defaults from User Settings when Creation Wizard Opens
  useEffect(() => {
    if (addListingOpen) {
      const defaultName = settings.userName || "Juan Dela Cruz";
      const defaultRegion = settings.savedSellerAddress?.region || settings.regionName || "Davao Region";
      const defaultProvince = settings.savedSellerAddress?.province || settings.provinceName || "Davao Oriental";
      const defaultMuni = settings.savedSellerAddress?.municipality || settings.cityName || "Mati City";
      const defaultBrgy = settings.savedSellerAddress?.barangay || "Central";
      const defaultStreet = settings.savedSellerAddress?.streetAddress || "Example Street";

      setNewListingForm((prev) => ({
        ...prev,
        sellerName: defaultName,
        region: defaultRegion,
        province: defaultProvince,
        municipality: defaultMuni,
        barangay: defaultBrgy,
        streetAddress: defaultStreet,
      }));
    }
  }, [addListingOpen, settings]);

  // Fetch Provinces for Seller Creation Wizard
  useEffect(() => {
    if (sellRegCode) {
      fetch(`/api/psgc/provinces?region_code=${sellRegCode}`)
        .then((r) => r.json())
        .then((data) => Array.isArray(data) && setSellPsgcProvinces(data))
        .catch(() => {});
      setSellProvCode("");
      setSellCityCode("");
      setSellPsgcCities([]);
    }
  }, [sellRegCode]);

  // Fetch Cities for Seller Creation Wizard
  useEffect(() => {
    if (sellProvCode) {
      fetch(`/api/psgc/cities?province_code=${sellProvCode}`)
        .then((r) => r.json())
        .then((data) => Array.isArray(data) && setSellPsgcCities(data))
        .catch(() => {});
      setSellCityCode("");
    }
  }, [sellProvCode]);

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
      updateSettings({
        savedBuyerAddress: {
          region: regName || settings.savedBuyerAddress?.region || "Davao Region",
          province: provName || settings.savedBuyerAddress?.province || "Davao Oriental",
          municipality: cityName || locString.split(",")[0].trim(),
          barangay: brgyName || settings.savedBuyerAddress?.barangay || "Central",
          streetAddress: settings.savedBuyerAddress?.streetAddress || "",
        },
      });
      toast({
        title: "Location Updated",
        description: `Marketplace location set to ${locString}`,
      });
    }
    setLocationModalOpen(false);
  };

  // Load Marketplace Listings from Backend API
  const fetchListings = () => {
    setLoadingListings(true);
    const params = new URLSearchParams();
    if (searchQuery) params.append("search", searchQuery);
    if (selectedCategory && selectedCategory !== "all") params.append("category", selectedCategory);
    if (selectedRegion && selectedRegion !== "all") params.append("region", selectedRegion);
    if (buyerLocation) params.append("buyerLocation", buyerLocation);
    if (sortBy) params.append("sortBy", sortBy);

    fetch(`/api/marketplace/listings?${params.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setListings(data);
        }
      })
      .catch((err) => {
        console.warn("Retrying marketplace listings fetch...", err);
        fetch("/api/marketplace/listings")
          .then((r) => r.ok ? r.json() : [])
          .then((data) => {
            if (Array.isArray(data)) setListings(data);
          })
          .catch(() => {});
      })
      .finally(() => setLoadingListings(false));
  };

  useEffect(() => {
    fetchListings();
  }, [selectedCategory, selectedRegion, buyerLocation, sortBy]);

  // Load Orders from API
  const fetchOrders = () => {
    setLoadingOrders(true);
    fetch("/api/marketplace/buyer-dashboard?buyerName=all")
      .then((r) => r.json())
      .then((data) => {
        if (data && Array.isArray(data.orders)) {
          setMyOrders(data.orders);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoadingOrders(false));
  };

  useEffect(() => {
    if (navTab === "cart_orders") {
      fetchOrders();
    }
  }, [navTab]);

  // Fetch AI Analysis when product detail is selected
  useEffect(() => {
    if (selectedListing) {
      setLoadingAi(true);
      setAiAnalysis(null);
      setDetailQuantity(1);
      setActiveDetailPhotoIndex(0);
      fetch(`/api/marketplace/listings/${selectedListing.listingId}/ai-analysis?buyerLocation=${encodeURIComponent(buyerLocation)}&lang=${settings.language}`)
        .then((r) => r.json())
        .then((data) => setAiAnalysis(data))
        .catch((e) => console.error(e))
        .finally(() => setLoadingAi(false));
    }
  }, [selectedListing, buyerLocation, settings.language]);

  // Fetch DA Preview for Seller Wizard
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

  // Sync saved seller address and user name to listing form when wizard opens
  useEffect(() => {
    if (addListingOpen) {
      setNewListingForm((prev) => ({
        ...prev,
        sellerName: prev.sellerName || settings.userName || "",
        region: settings.savedSellerAddress?.region || settings.regionName || prev.region,
        province: settings.savedSellerAddress?.province || settings.provinceName || prev.province,
        municipality: settings.savedSellerAddress?.municipality || settings.cityName || prev.municipality,
        barangay: settings.savedSellerAddress?.barangay || prev.barangay,
        streetAddress: settings.savedSellerAddress?.streetAddress || prev.streetAddress,
      }));
    }
  }, [addListingOpen, settings.userName, settings.savedSellerAddress, settings.regionName, settings.provinceName, settings.cityName]);

  // Sync saved buyer address and user name to checkout form when checkout opens
  useEffect(() => {
    if (checkoutModalOpen) {
      if (settings.userName) {
        setCheckoutBuyerName(settings.userName);
      }
      if (settings.savedBuyerAddress) {
        if (settings.savedBuyerAddress.municipality) {
          setCheckoutAddress(`${settings.savedBuyerAddress.municipality}, ${settings.savedBuyerAddress.province || "Davao Oriental"}`);
        }
        if (settings.savedBuyerAddress.barangay) {
          setCheckoutBarangay(settings.savedBuyerAddress.barangay);
        }
        if (settings.savedBuyerAddress.streetAddress) {
          setCheckoutStreetAddress(settings.savedBuyerAddress.streetAddress);
        }
      }
    }
  }, [checkoutModalOpen, settings.userName, settings.savedBuyerAddress]);

  // Shopping Cart Operations
  const addToCart = (product: MarketplaceListing, qty: number) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.listing.listingId === product.listingId);
      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = updated[existingIndex].quantityKg + qty;
        if (newQty > product.quantityAvailableKg) {
          toast({
            title: "Stock Limit Reached",
            description: `Only ${product.quantityAvailableKg} kg available.`,
            variant: "destructive",
          });
          return prev;
        }
        updated[existingIndex].quantityKg = newQty;
        return updated;
      } else {
        return [...prev, { listing: product, quantityKg: qty }];
      }
    });

    toast({
      title: "Added to Cart 🛒",
      description: `${qty} kg of ${product.cropName} added to your shopping cart.`,
    });
  };

  const updateCartQty = (listingId: string, newQty: number) => {
    if (newQty <= 0) {
      setCart((prev) => prev.filter((item) => item.listing.listingId !== listingId));
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.listing.listingId === listingId) {
          const maxStock = item.listing.quantityAvailableKg;
          return { ...item, quantityKg: Math.min(newQty, maxStock) };
        }
        return item;
      })
    );
  };

  const removeFromCart = (listingId: string) => {
    setCart((prev) => prev.filter((item) => item.listing.listingId !== listingId));
    toast({ title: "Item Removed", description: "Product removed from cart." });
  };

  const cartTotalAmount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantityKg * item.listing.askingPricePhpKg, 0);
  }, [cart]);

  const totalCartItemCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantityKg, 0);
  }, [cart]);

  // Handle Checkout / Place Order from Cart
  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    setPlacingOrder(true);
    try {
      for (const item of cart) {
        await fetch("/api/marketplace/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            listingId: item.listing.listingId,
            buyerName: checkoutBuyerName,
            buyerContact: checkoutPhone,
            buyerLocation: checkoutAddress,
            buyerBarangay: checkoutBarangay,
            buyerStreetAddress: checkoutStreetAddress,
            quantityKg: item.quantityKg,
            deliveryMethod: "Local Delivery",
          }),
        });
      }

      // Save buyer address and profile name to settings for future orders
      updateSettings({
        userName: checkoutBuyerName || settings.userName,
        savedBuyerAddress: {
          region: settings.savedBuyerAddress?.region || settings.regionName || "Davao Region",
          province: settings.savedBuyerAddress?.province || settings.provinceName || "Davao Oriental",
          municipality: checkoutAddress.split(",")[0].trim(),
          barangay: checkoutBarangay,
          streetAddress: checkoutStreetAddress,
        },
      });

      toast({
        title: "Order Placed Successfully! 🎉",
        description: `Your marketplace order for ₱${cartTotalAmount.toLocaleString()} has been placed.`,
      });

      setCart([]);
      setCheckoutModalOpen(false);
      setCartOpen(false);
      changeNavTab("cart_orders");
      fetchListings();
    } catch (err: any) {
      toast({
        title: "Order Failed",
        description: err.message || "Could not complete order",
        variant: "destructive",
      });
    } finally {
      setPlacingOrder(false);
    }
  };

  // Direct Buy Now Submit
  const handleDirectBuyNow = async (listing: MarketplaceListing, qty: number) => {
    try {
      const res = await fetch("/api/marketplace/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: listing.listingId,
          buyerName: checkoutBuyerName,
          buyerContact: checkoutPhone,
          buyerLocation: checkoutAddress,
          buyerBarangay: checkoutBarangay,
          buyerStreetAddress: checkoutStreetAddress,
          quantityKg: qty,
          deliveryMethod: "Local Delivery",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to place direct buy order");

      // Save buyer address and profile name to settings
      updateSettings({
        userName: checkoutBuyerName || settings.userName,
        savedBuyerAddress: {
          region: settings.savedBuyerAddress?.region || settings.regionName || "Davao Region",
          province: settings.savedBuyerAddress?.province || settings.provinceName || "Davao Oriental",
          municipality: checkoutAddress.split(",")[0].trim(),
          barangay: checkoutBarangay,
          streetAddress: checkoutStreetAddress,
        },
      });

      toast({
        title: "Order Reserved! 🎉",
        description: `Successfully ordered ${qty} kg of ${listing.cropName} from ${listing.sellerName}.`,
      });

      setSelectedListing(null);
      changeNavTab("cart_orders");
      fetchListings();
    } catch (err: any) {
      toast({
        title: "Order Failed",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  // Create New Listing Submit
  const handleCreateListingSubmit = async () => {
    setSubmittingListing(true);
    try {
      const fallbackName = newListingForm.sellerName || settings.userName || "Authenticated Farmer";
      const fallbackPhone = newListingForm.sellerPhone || "+63 917 000 0000";
      const fallbackFarm = newListingForm.sellerFarmName || `${fallbackName}'s Farm`;
      const fallbackQty = parseFloat(newListingForm.quantityAvailableKg) || 100;
      const fallbackPrice = parseFloat(newListingForm.askingPricePhpKg) || daPreviewPrice || 50;
      const fallbackRegion = newListingForm.region || settings.savedSellerAddress?.region || settings.regionName || "Region XI - Davao Region";
      const fallbackProvince = newListingForm.province || settings.savedSellerAddress?.province || settings.provinceName || "Davao Oriental";
      const fallbackMuni = newListingForm.municipality || settings.savedSellerAddress?.municipality || settings.cityName || "Mati City";

      const res = await fetch("/api/marketplace/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sellerId: settings.userName ? `USR-${settings.userName.toLowerCase().replace(/[^a-z0-9]/g, "")}` : "USR-AUTHENTICATED-FARMER",
          sellerName: fallbackName,
          sellerPhone: fallbackPhone,
          sellerFarmName: fallbackFarm,
          cropName: newListingForm.cropName || "Rice",
          variety: newListingForm.variety || "Local Harvest",
          category: newListingForm.category || "Grains & Staples",
          quantityAvailableKg: fallbackQty,
          askingPricePhpKg: fallbackPrice,
          qualityGrade: newListingForm.qualityGrade || "Grade A",
          region: fallbackRegion,
          province: fallbackProvince,
          municipality: fallbackMuni,
          barangay: newListingForm.barangay || "Central",
          streetAddress: newListingForm.streetAddress || "",
          description: newListingForm.description || "Fresh crop harvest direct from farm.",
          deliveryOptions: newListingForm.deliveryOptions ? newListingForm.deliveryOptions.split(",").map((s) => s.trim()) : ["Farm Gate Pickup", "Local Delivery"],
          photoUrls: uploadedPhotos,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to publish listing");

      // Save farmer listing address and seller name as default for future listings
      updateSettings({
        userName: newListingForm.sellerName || settings.userName,
        savedSellerAddress: {
          region: newListingForm.region,
          province: newListingForm.province,
          municipality: newListingForm.municipality,
          barangay: newListingForm.barangay,
          streetAddress: newListingForm.streetAddress,
        },
      });

      toast({
        title: "Crop Listing Published! 🌾",
        description: `Your ${newListingForm.cropName} listing is now live in the marketplace.`,
      });

      setUploadedPhotos([]);
      setAddListingOpen(false);
      setSellStep(1);
      fetchListings();
      changeNavTab("my_listings");
    } catch (err: any) {
      toast({ title: "Publish Failed", description: err.message, variant: "destructive" });
    } finally {
      setSubmittingListing(false);
    }
  };

  // Manage Seller Listing (Edit, Pause, Delete)
  const handleToggleListingStatus = async (listingId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "active" ? "paused" : "active";
    try {
      const res = await fetch(`/api/marketplace/listings/${listingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      toast({
        title: `Listing ${nextStatus === "active" ? "Activated" : "Paused"}`,
        description: `Listing ${listingId} is now ${nextStatus}.`,
      });
      fetchListings();
    } catch (err: any) {
      toast({ title: "Update Failed", description: err.message, variant: "destructive" });
    }
  };

  const handleDeleteListing = async (listingId: string) => {
    try {
      const res = await fetch(`/api/marketplace/listings/${listingId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete listing");
      toast({
        title: "Listing Removed",
        description: "Listing successfully deleted from marketplace.",
      });
      fetchListings();
    } catch (err: any) {
      toast({ title: "Delete Failed", description: err.message, variant: "destructive" });
    }
  };

  const handleUpdateListingDetails = async () => {
    if (!editingListing) return;
    setUpdatingListing(true);
    try {
      const res = await fetch(`/api/marketplace/listings/${editingListing.listingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          askingPricePhpKg: parseFloat(editPriceInput),
          quantityAvailableKg: parseFloat(editQtyInput),
          description: editDescInput,
        }),
      });
      if (!res.ok) throw new Error("Failed to update listing");
      toast({
        title: "Listing Updated",
        description: "Your product changes have been saved.",
      });
      setEditingListing(null);
      fetchListings();
    } catch (err: any) {
      toast({ title: "Update Failed", description: err.message, variant: "destructive" });
    } finally {
      setUpdatingListing(false);
    }
  };

  // Filtered lists for Curated Sections
  const recommendedListings = useMemo(() => {
    return [...listings].sort((a, b) => a.distanceKm - b.distanceKm).slice(0, 4);
  }, [listings]);

  const recentListings = useMemo(() => {
    return [...listings].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 4);
  }, [listings]);

  const bestValueListings = useMemo(() => {
    return [...listings].sort((a, b) => a.priceDifferencePct - b.priceDifferencePct).slice(0, 4);
  }, [listings]);

  const nearbyFarmers = useMemo(() => {
    const map = new Map<string, MarketplaceListing>();
    for (const item of listings) {
      if (!map.has(item.sellerName)) {
        map.set(item.sellerName, item);
      }
    }
    return Array.from(map.values()).slice(0, 4);
  }, [listings]);

  // Filtered active listings for main grid view
  const mainGridListings = useMemo(() => {
    return listings.filter((item) => item.status === "active");
  }, [listings]);

  // My Listings
  const myFilteredListings = useMemo(() => {
    return listings.filter((item) => {
      if (myListingsFilter === "active") return item.status === "active";
      if (myListingsFilter === "paused") return item.status === "paused";
      if (myListingsFilter === "sold_out") return item.status === "sold_out" || item.quantityAvailableKg === 0;
      if (myListingsFilter === "completed") return item.status === "cancelled";
      return true;
    });
  }, [listings, myListingsFilter]);

  return (
    <div className="space-y-4 sm:space-y-6 pb-24 md:pb-12 max-w-full overflow-x-hidden text-[#26332A]">
      {/* TOP MARKETPLACE E-COMMERCE HEADER */}
      <div className="bg-white border border-[#DDE5DE] rounded-2xl p-3 sm:p-5 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Logo & Title */}
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-[#2E7D32] text-white flex items-center justify-center shadow-md shrink-0">
              <Store className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="text-lg sm:text-2xl font-black text-[#26332A] tracking-tight">Grownox Marketplace</h1>
                <Badge className="bg-[#E8F5E9] text-[#2E7D32] border border-[#66BB6A]/40 text-[10px] px-2 py-0.5 font-bold">{isFil ? "Grownox Pamilihan" : "Grownox Marketplace"}</Badge>
              </div>
              <p className="text-xs text-[#6B756D]">{isFil ? "Direktang pamilihan ng pananim mula magsasaka patungong mamimili na may live market price benchmarks" : "Direct farmer-to-buyer crop trading platform with live market price benchmarks"}</p>
            </div>
          </div>

          {/* Quick Action Controls */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            {/* Location Selector */}
            <Button
              variant="outline"
              size="sm"
              className="h-9 text-xs gap-1.5 border-[#DDE5DE] text-[#26332A] bg-white hover:bg-[#E8F5E9] shrink-0"
              onClick={() => setLocationModalOpen(true)}
            >
              <MapPin className="h-3.5 w-3.5 text-[#2E7D32] shrink-0" />
              <span className="max-w-[130px] sm:max-w-[180px] truncate">{buyerLocation || (isFil ? "Pumili ng Lokasyon" : "Select Location")}</span>
            </Button>

            {/* Cart Button */}
            <Button
              variant="outline"
              size="sm"
              className="h-9 text-xs gap-1.5 relative shrink-0 border-[#DDE5DE] text-[#26332A] bg-white hover:bg-[#E8F5E9]"
              onClick={() => setCartOpen(true)}
            >
              <ShoppingCart className="h-4 w-4 text-[#2E7D32]" />
              <span className="hidden sm:inline font-semibold">Cart</span>
              {cart.length > 0 && (
                <Badge className="bg-[#2E7D32] text-white text-[10px] h-5 px-1.5 min-w-[20px] rounded-full justify-center">
                  {cart.length}
                </Badge>
              )}
            </Button>

            {/* Orders Access Button */}
            <Button
              variant="outline"
              size="sm"
              className="h-9 text-xs gap-1.5 shrink-0 border-[#DDE5DE] text-[#26332A] bg-white hover:bg-[#E8F5E9]"
              onClick={() => changeNavTab("cart_orders")}
            >
              <ShoppingBag className="h-4 w-4 text-[#2E7D32]" />
              <span className="hidden sm:inline font-semibold">{isFil ? "Mga Order" : "Orders"}</span>
            </Button>

            {/* Sell Crops Button */}
            <Button
              className="bg-[#2E7D32] hover:bg-[#1B5E20] text-white gap-1.5 h-9 text-xs font-semibold px-3 sm:px-4 shrink-0 shadow-xs"
              onClick={() => { setAddListingOpen(true); setSellStep(1); }}
            >
              <PlusCircle className="h-4 w-4" />
              <span>{isFil ? "Ibenta ang Pananim" : "Sell Your Crops"}</span>
            </Button>
          </div>
        </div>

        {/* Global Marketplace Search Bar */}
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B756D]" />
          <Input
            placeholder={isFil ? "Maghanap ng pananim, gulay, prutas, palay, mais, binhi, magsasaka..." : "Search crops, vegetables, fruits, rice, corn, seeds, sellers..."}
            className="pl-10 pr-24 h-10 text-xs sm:text-sm bg-[#F8FAF7] border-[#DDE5DE] text-[#26332A] rounded-xl"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchListings()}
          />
          <Button
            size="sm"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 text-xs font-semibold px-3 bg-[#2E7D32] hover:bg-[#1B5E20] text-white rounded-lg"
            onClick={fetchListings}
          >
            {isFil ? "Maghanap" : "Search"}
          </Button>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isSel = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => { setSelectedCategory(cat.id); changeNavTab("market"); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                  isSel
                    ? "bg-[#2E7D32] text-white shadow-xs"
                    : "bg-white text-[#6B756D] border border-[#DDE5DE] hover:bg-[#E8F5E9] hover:text-[#26332A]"
                }`}
              >
                <span>{cat.icon}</span>
                <span>{isFil ? cat.labelFil : cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* VIEW NAVIGATION TABS (Desktop / Main view switch) */}
      <div className="flex items-center justify-between border-b border-[#DDE5DE] pb-2">
        <div className="flex items-center gap-1 overflow-x-auto">
          <Button
            variant={navTab === "home" ? "default" : "ghost"}
            size="sm"
            className={`text-xs h-8 font-bold ${navTab === "home" ? "bg-[#2E7D32] hover:bg-[#1B5E20] text-white" : "text-[#6B756D] hover:text-[#26332A] hover:bg-[#E8F5E9]"}`}
            onClick={() => changeNavTab("home")}
          >
            <Home className="h-3.5 w-3.5 mr-1" /> {isFil ? "Tahanan" : "Home"}
          </Button>
          <Button
            variant={navTab === "market" ? "default" : "ghost"}
            size="sm"
            className={`text-xs h-8 font-bold ${navTab === "market" ? "bg-[#2E7D32] hover:bg-[#1B5E20] text-white" : "text-[#6B756D] hover:text-[#26332A] hover:bg-[#E8F5E9]"}`}
            onClick={() => changeNavTab("market")}
          >
            <Store className="h-3.5 w-3.5 mr-1" /> {isFil ? "Mag-browse Lahat" : "Browse All"}
          </Button>
          <Button
            variant={navTab === "sell" ? "default" : "ghost"}
            size="sm"
            className={`text-xs h-8 font-bold ${navTab === "sell" ? "bg-[#2E7D32] hover:bg-[#1B5E20] text-white" : "text-[#6B756D] hover:text-[#26332A] hover:bg-[#E8F5E9]"}`}
            onClick={() => { setAddListingOpen(true); setSellStep(1); }}
          >
            <PlusCircle className="h-3.5 w-3.5 mr-1" /> {isFil ? "Magbenta ng Pananim" : "Sell Crops"}
          </Button>
          <Button
            variant={navTab === "cart_orders" ? "default" : "ghost"}
            size="sm"
            className={`text-xs h-8 font-bold ${navTab === "cart_orders" ? "bg-[#2E7D32] hover:bg-[#1B5E20] text-white" : "text-[#6B756D] hover:text-[#26332A] hover:bg-[#E8F5E9]"}`}
            onClick={() => changeNavTab("cart_orders")}
          >
            <ShoppingCart className="h-3.5 w-3.5 mr-1" /> {isFil ? "Cart at Mga Order" : "Cart & Orders"}
          </Button>
          <Button
            variant={navTab === "my_listings" ? "default" : "ghost"}
            size="sm"
            className={`text-xs h-8 font-bold ${navTab === "my_listings" ? "bg-[#2E7D32] hover:bg-[#1B5E20] text-white" : "text-[#6B756D] hover:text-[#26332A] hover:bg-[#E8F5E9]"}`}
            onClick={() => changeNavTab("my_listings")}
          >
            <UserCheck className="h-3.5 w-3.5 mr-1" /> {isFil ? "Aking Mga Listahan" : "My Listings"}
          </Button>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
            <SelectTrigger className="h-8 text-xs w-36 bg-white border-[#DDE5DE] text-[#26332A]">
              <SelectValue placeholder={isFil ? "Iayos Ayon Sa" : "Sort By"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">{isFil ? "Pinakabago Una" : "Newest First"}</SelectItem>
              <SelectItem value="price_asc">{isFil ? "Presyo: Mababa Pataas" : "Price: Low to High"}</SelectItem>
              <SelectItem value="price_desc">{isFil ? "Presyo: Mataas Pababa" : "Price: High to Low"}</SelectItem>
              <SelectItem value="distance">{isFil ? "Pinakamalapit Una" : "Nearest First"}</SelectItem>
              <SelectItem value="quantity">{isFil ? "Pinakamaraming Dami" : "Highest Stock"}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 1. HOME VIEW */}
      {navTab === "home" && (
        <div className="space-y-6">
          {/* Price Safeguard Information Banner */}
          <div className="rounded-2xl border border-[#DDE5DE] bg-[#E8F5E9] p-3.5 sm:p-4 text-xs flex items-start gap-3">
            <TrendingUp className="h-5 w-5 text-[#2E7D32] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-[#26332A]">{isFil ? "Aktibo ang Grownox Market Price Reference" : "Grownox Market Price Reference Active"}</h3>
              <p className="text-[#6B756D] leading-relaxed">
                {isFil ? "Lahat ng listahan ng pananim sa pamilihan ay nagpapakita ng reference market price. Ang mga lokal na magsasaka ang nagtatakda ng kanilang presyo, at nakakatanggap ang mga mamimili ng patas na paghahambing ng presyo bago mag-order." : "All marketplace crop listings display reference market prices. Local farmers set their own listing prices, and buyers receive clear price comparisons before ordering."}
              </p>
            </div>
          </div>

          {/* SECTION A: Recommended Products Near You */}
          {recommendedListings.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base sm:text-lg font-extrabold text-[#26332A] flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-[#2E7D32]" /> {isFil ? "Inirerekomendang Produkto Malapit sa Iyo" : "Recommended Products Near You"}
                  </h2>
                  <p className="text-xs text-[#6B756D]">{isFil ? `Mga listahang pinakamalapit sa ${buyerLocation}` : `Listings closest to ${buyerLocation}`}</p>
                </div>
                <Button variant="ghost" size="sm" className="text-xs font-semibold text-[#2E7D32] hover:text-[#1B5E20] hover:bg-[#E8F5E9]" onClick={() => changeNavTab("market")}>
                  {isFil ? "Tingnan Lahat" : "See All"} <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
                </Button>
              </div>

              {/* Responsive 2-col on mobile, 4-col on desktop */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
                {recommendedListings.map((item) => (
                  <ProductCard key={item.listingId} item={item} buyerLocationObj={buyerLocationObj} isFil={isFil} onSelect={setSelectedListing} onAddToCart={addToCart} onOpenSellerProfile={openSellerProfile} />
                ))}
              </div>
            </div>
          )}

          {/* SECTION B: Best-Value Listings */}
          {bestValueListings.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base sm:text-lg font-extrabold text-[#26332A] flex items-center gap-2">
                    <Tag className="h-4 w-4 text-[#2E7D32]" /> {isFil ? "Pinakasulit na Listahan ng Pananim" : "Best-Value Crop Listings"}
                  </h2>
                  <p className="text-xs text-[#6B756D]">{isFil ? "Magagandang presyo kumpara sa market reference benchmarks" : "Competitive asking prices vs market reference benchmarks"}</p>
                </div>
                <Button variant="ghost" size="sm" className="text-xs font-semibold text-[#2E7D32] hover:text-[#1B5E20] hover:bg-[#E8F5E9]" onClick={() => changeNavTab("market")}>
                  {isFil ? "Tingnan Lahat" : "See All"} <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
                </Button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
                {bestValueListings.map((item) => (
                  <ProductCard key={item.listingId} item={item} buyerLocationObj={buyerLocationObj} isFil={isFil} onSelect={setSelectedListing} onAddToCart={addToCart} onOpenSellerProfile={openSellerProfile} />
                ))}
              </div>
            </div>
          )}

          {/* SECTION C: Recently Listed Crops */}
          {recentListings.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base sm:text-lg font-extrabold text-[#26332A] flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[#2E7D32]" /> {isFil ? "Kamakailang Inilistang Pananim" : "Recently Listed Crops"}
                  </h2>
                  <p className="text-xs text-[#6B756D]">{isFil ? "Sariwang ani na inilista ng mga lokal na magsasaka ngayon" : "Fresh harvest products listed by local farmers today"}</p>
                </div>
                <Button variant="ghost" size="sm" className="text-xs font-semibold text-[#2E7D32] hover:text-[#1B5E20] hover:bg-[#E8F5E9]" onClick={() => changeNavTab("market")}>
                  {isFil ? "Tingnan Lahat" : "See All"} <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
                </Button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
                {recentListings.map((item) => (
                  <ProductCard key={item.listingId} item={item} buyerLocationObj={buyerLocationObj} isFil={isFil} onSelect={setSelectedListing} onAddToCart={addToCart} onOpenSellerProfile={openSellerProfile} />
                ))}
              </div>
            </div>
          )}

          {/* SECTION D: Nearby Farmers */}
          {nearbyFarmers.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base sm:text-lg font-extrabold text-[#26332A] flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-[#2E7D32]" /> {isFil ? "Mga Kalapit na Magsasaka" : "Nearby Farmers"}
                  </h2>
                  <p className="text-xs text-[#6B756D]">{isFil ? "Mga lokal na prodyuser sa agrikultura sa iyong lugar" : "Local agricultural producers in your area"}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {nearbyFarmers.map((f) => (
                  <Card key={f.sellerId} className="p-3.5 bg-white border border-[#DDE5DE] shadow-xs flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-[#E8F5E9] text-[#2E7D32] font-bold text-sm flex items-center justify-center shrink-0 border border-[#66BB6A]/30">
                      {f.sellerName.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-xs truncate text-[#26332A]">{f.sellerName}</div>
                      <div className="text-[10px] text-[#6B756D] truncate">{f.sellerFarmName || "Local Farm"}</div>
                      <div className="text-[10px] text-[#2E7D32] font-semibold flex items-center gap-1 mt-0.5">
                        <MapPin className="h-2.5 w-2.5" /> {f.municipality}, {f.province}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Empty State when no listings exist */}
          {!loadingListings && listings.length === 0 && (
            <div className="text-center py-12 sm:py-16 px-4 bg-white border border-[#DDE5DE] rounded-2xl shadow-xs max-w-lg mx-auto space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center mx-auto border border-[#66BB6A]/30">
                <Store className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#26332A]">
                  {isFil ? "Wala pang magagamit na pananim." : "No crops available yet."}
                </h3>
                <p className="text-xs text-[#6B756D] leading-relaxed">
                  {isFil ? "Maaaring maging una ang mga magsasaka sa pagbenta ng kanilang ani." : "Farmers can be the first to sell their crops."}
                </p>
              </div>
              <div className="pt-2">
                <Button
                  className="bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-semibold text-xs h-9 px-5 shadow-xs"
                  onClick={() => { setAddListingOpen(true); setSellStep(1); }}
                >
                  <PlusCircle className="h-4 w-4 mr-1.5" /> {isFil ? "Ibenta ang Pananim" : "Sell Your Crops"}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. MARKET VIEW (ALL PRODUCTS GRID) */}
      {navTab === "market" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-xl font-bold text-[#26332A]">
                {isFil ? `Lahat ng Listahan ng Pananim (${mainGridListings.length})` : `All Crop Listings (${mainGridListings.length})`}
              </h2>
              <p className="text-xs text-[#6B756D]">
                {isFil ? "Aktibong mga produkto sa pamilihan mula sa beripikadong magsasaka" : "Active marketplace products from authenticated farmers"}
              </p>
            </div>
          </div>

          {loadingListings ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
              {Array(8).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-64 sm:h-72 w-full rounded-2xl" />
              ))}
            </div>
          ) : mainGridListings.length === 0 ? (
            <div className="text-center py-12 px-4 bg-white border border-[#DDE5DE] rounded-2xl max-w-md mx-auto space-y-3">
              <Store className="h-8 w-8 text-[#6B756D] mx-auto" />
              <p className="text-sm font-bold text-[#26332A]">{isFil ? "Wala pang magagamit na pananim." : "No crops available yet."}</p>
              <p className="text-xs text-[#6B756D]">{isFil ? "Maaaring maging una ang mga magsasaka sa pagbenta ng kanilang ani." : "Farmers can be the first to sell their crops."}</p>
              <Button
                className="bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-xs h-8 px-4"
                onClick={() => { setAddListingOpen(true); setSellStep(1); }}
              >
                {isFil ? "Ibenta ang Pananim" : "Sell Your Crops"}
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
              {mainGridListings.map((item) => (
                <ProductCard key={item.listingId} item={item} buyerLocationObj={buyerLocationObj} onSelect={setSelectedListing} onAddToCart={addToCart} onOpenSellerProfile={openSellerProfile} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. CART & ORDERS VIEW */}
      {navTab === "cart_orders" && (
        <div className="space-y-6">
          {/* Cart Section */}
          <Card className="border border-[#DDE5DE] bg-white shadow-xs">
            <CardHeader className="p-4 border-b border-[#DDE5DE] flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-[#26332A] flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4 text-[#2E7D32]" /> Shopping Cart
                </CardTitle>
                <CardDescription className="text-xs text-[#6B756D]">
                  {isFil ? "Mga napiling produkto para sa checkout" : "Selected items ready for checkout"}
                </CardDescription>
              </div>
              <Badge className="bg-[#2E7D32] text-white font-bold">{cart.length} {isFil ? "Produkto" : "Products"}</Badge>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {cart.length === 0 ? (
                <div className="text-center py-8 text-xs text-[#6B756D] space-y-2">
                  <ShoppingBasket className="h-8 w-8 text-[#6B756D] mx-auto" />
                  <p>{isFil ? "Kasalukuyang walang laman ang iyong shopping cart." : "Your shopping cart is currently empty."}</p>
                  <Button size="sm" variant="outline" className="text-xs h-8 border-[#DDE5DE] text-[#26332A] hover:bg-[#E8F5E9]" onClick={() => changeNavTab("market")}>
                    {isFil ? "Mag-browse ng Produkto" : "Browse Products"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.listing.listingId} className="flex items-center gap-3 p-3 rounded-xl border border-[#DDE5DE] bg-white">
                      <img src={item.listing.photoUrls[0]} alt={item.listing.cropName} className="h-14 w-14 rounded-lg object-cover bg-muted shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-xs truncate text-[#26332A]">{item.listing.cropName}</div>
                        <div className="text-[10px] text-[#6B756D] truncate">{item.listing.sellerName} · ₱{item.listing.askingPricePhpKg}/kg</div>
                        <div className="text-xs font-black text-[#2E7D32] mt-0.5">
                          {isFil ? "Kabuuan" : "Total"}: ₱{(item.quantityKg * item.listing.askingPricePhpKg).toLocaleString()}
                        </div>
                      </div>

                      {/* Quantity Selector */}
                      <div className="flex items-center gap-1.5 bg-[#F8FAF7] border border-[#DDE5DE] p-1 rounded-lg">
                        <button
                          type="button"
                          className="h-6 w-6 rounded bg-white border border-[#DDE5DE] text-[#26332A] flex items-center justify-center font-bold text-xs"
                          onClick={() => updateCartQty(item.listing.listingId, item.quantityKg - 10)}
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-xs font-bold w-10 text-center text-[#26332A]">{item.quantityKg} kg</span>
                        <button
                          type="button"
                          className="h-6 w-6 rounded bg-white border border-[#DDE5DE] text-[#26332A] flex items-center justify-center font-bold text-xs"
                          onClick={() => updateCartQty(item.listing.listingId, item.quantityKg + 10)}
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-[#D32F2F] hover:bg-[#D32F2F]/10"
                        onClick={() => removeFromCart(item.listing.listingId)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}

                  <div className="pt-3 border-t border-[#DDE5DE] flex items-center justify-between">
                    <div>
                      <div className="text-xs text-[#6B756D]">{isFil ? "Kabuuang Halaga" : "Grand Total Amount"}</div>
                      <div className="text-lg font-black text-[#26332A]">₱{cartTotalAmount.toLocaleString()}</div>
                    </div>
                    <Button
                      className="bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-bold text-xs h-10 px-6 shadow-xs"
                      onClick={() => setCheckoutModalOpen(true)}
                    >
                      {isFil ? "Magpatuloy sa Pag-checkout" : "Proceed to Checkout"}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Active Orders Section */}
          <Card className="border border-[#DDE5DE] bg-white shadow-xs overflow-hidden">
            <CardHeader className="p-4 border-b border-[#DDE5DE]">
              <CardTitle className="text-base font-bold text-[#26332A] flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-[#2E7D32]" /> {isFil ? "Mga Aktibong Order" : "Active Orders"}
              </CardTitle>
              <CardDescription className="text-xs text-[#6B756D]">{isFil ? "Subaybayan ang iyong mga kumpirmadong order sa pamilihan" : "Track your confirmed marketplace orders"}</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loadingOrders ? (
                <div className="p-4 space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : myOrders.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#6B756D]">{isFil ? "Wala pang naisagawang order." : "No orders placed yet."}</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#F8FAF7] border-b border-[#DDE5DE] uppercase font-semibold text-[#6B756D]">
                      <tr>
                        <th className="p-3">Order ID</th>
                        <th className="p-3">{isFil ? "Pananim" : "Crop"}</th>
                        <th className="p-3">{isFil ? "Nagbenta" : "Seller"}</th>
                        <th className="p-3">{isFil ? "Dami" : "Quantity"}</th>
                        <th className="p-3">{isFil ? "Presyo" : "Agreed Price"}</th>
                        <th className="p-3">{isFil ? "Kabuuan" : "Total"}</th>
                        <th className="p-3">{isFil ? "Katayuan" : "Status"}</th>
                        <th className="p-3 text-right">{isFil ? "Aksyon" : "Action"}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#DDE5DE]">
                      {myOrders.map((ord) => (
                        <tr key={ord.orderId || ord.id} className="hover:bg-[#E8F5E9]/30">
                          <td className="p-3 font-mono font-bold text-[#2E7D32]">{ord.orderId || ord.id}</td>
                          <td className="p-3 font-bold text-[#26332A]">{ord.cropName}</td>
                          <td className="p-3 text-[#6B756D]">{ord.sellerName}</td>
                          <td className="p-3 text-[#26332A]">{ord.quantityKg} kg</td>
                          <td className="p-3 text-[#26332A]">₱{ord.agreedPricePhpKg}/kg</td>
                          <td className="p-3 font-bold text-[#26332A]">₱{(ord.totalAmountPhp || 0).toLocaleString()}</td>
                          <td className="p-3">
                            <Badge className="bg-[#43A047] text-white text-[10px]">{ord.status}</Badge>
                          </td>
                          <td className="p-3 text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-[10px] font-bold border-[#DDE5DE] hover:bg-[#E8F5E9] text-[#26332A]"
                              onClick={() => {
                                setReviewModalOrder(ord);
                                setReviewRating(5);
                                setReviewQualityRating(5);
                                setReviewExperienceRating(5);
                                setReviewComment("");
                              }}
                            >
                              <Star className="h-3 w-3 text-[#F9A825] fill-[#F9A825] mr-1" /> {isFil ? "Magsulat ng Review" : "Write Review"}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* 4. MY LISTINGS VIEW (FARMER MANAGEMENT) */}
      {navTab === "my_listings" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-[#DDE5DE] p-4 rounded-2xl">
            <div>
              <h2 className="text-base sm:text-xl font-bold text-[#26332A]">{isFil ? "Aking Mga Listahan ng Pananim" : "My Crop Listings"}</h2>
              <p className="text-xs text-[#6B756D]">{isFil ? "Pamahalaan, i-edit, i-pause, o alisin ang iyong mga produkto" : "Manage, edit, pause, or remove your marketplace products"}</p>
            </div>
            <Button
              className="bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-xs font-bold h-9 px-4 shrink-0 shadow-xs"
              onClick={() => { setAddListingOpen(true); setSellStep(1); }}
            >
              <PlusCircle className="h-4 w-4 mr-1.5" /> {isFil ? "Magbenta ng Bagong Pananim" : "Sell New Crop"}
            </Button>
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 border-b border-[#DDE5DE] pb-2 overflow-x-auto">
            {(["active", "paused", "sold_out", "completed"] as const).map((st) => (
              <Button
                key={st}
                variant={myListingsFilter === st ? "default" : "outline"}
                size="sm"
                className={`text-xs h-8 capitalize font-semibold ${
                  myListingsFilter === st ? "bg-[#2E7D32] text-white" : "border-[#DDE5DE] text-[#6B756D] hover:text-[#26332A] hover:bg-[#E8F5E9]"
                }`}
                onClick={() => setMyListingsFilter(st)}
              >
                {st === "active" ? (isFil ? "Aktibo" : "Active") : st === "paused" ? (isFil ? "Naka-pause" : "Paused") : st === "sold_out" ? (isFil ? "Ubos Na" : "Sold Out") : (isFil ? "Kumpleto" : "Completed")}
              </Button>
            ))}
          </div>

          {myFilteredListings.length === 0 ? (
            <div className="text-center py-12 px-4 bg-white border border-[#DDE5DE] rounded-2xl max-w-md mx-auto space-y-3">
              <Store className="h-8 w-8 text-[#6B756D] mx-auto" />
              <p className="text-sm font-bold text-[#26332A]">
                {isFil ? `Walang listahan sa katayuang "${myListingsFilter}".` : `No listings in "${myListingsFilter}" status.`}
              </p>
              <Button
                className="bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-xs h-8 px-4"
                onClick={() => { setAddListingOpen(true); setSellStep(1); }}
              >
                {isFil ? "Magdagdag ng Listahan" : "Add Marketplace Listing"}
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {myFilteredListings.map((item) => (
                <Card key={item.listingId} className="p-3.5 bg-white border border-[#DDE5DE] shadow-xs space-y-3">
                  <div className="flex gap-3">
                    <img src={item.photoUrls[0]} alt={item.cropName} className="h-16 w-16 rounded-xl object-cover bg-muted shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <Badge className={`text-[9px] ${item.status === "active" ? "bg-[#43A047]" : "bg-[#F9A825]"} text-white font-bold`}>
                          {item.status}
                        </Badge>
                        <span className="text-[10px] text-[#6B756D]">{item.listingId}</span>
                      </div>
                      <h4 className="font-bold text-sm text-[#26332A] truncate mt-1">{item.cropName}</h4>
                      <div className="text-xs font-black text-[#2E7D32]">₱{item.askingPricePhpKg}/kg</div>
                      <div className="text-[10px] text-[#6B756D]">{item.quantityAvailableKg} kg {isFil ? "magagamit" : "available"}</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 pt-2 border-t border-[#DDE5DE]">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-[11px] h-8 font-semibold border-[#DDE5DE] text-[#26332A] hover:bg-[#E8F5E9]"
                      onClick={() => {
                        setEditingListing(item);
                        setEditPriceInput(item.askingPricePhpKg.toString());
                        setEditQtyInput(item.quantityAvailableKg.toString());
                        setEditDescInput(item.description);
                      }}
                    >
                      <Edit className="h-3 w-3 mr-1" /> {isFil ? "I-edit" : "Edit"}
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      className="text-[11px] h-8 font-semibold border-[#DDE5DE] text-[#26332A] hover:bg-[#E8F5E9]"
                      onClick={() => handleToggleListingStatus(item.listingId, item.status)}
                    >
                      {item.status === "active" ? <PauseCircle className="h-3.5 w-3.5 text-[#F9A825]" /> : <PlayCircle className="h-3.5 w-3.5 text-[#43A047]" />}
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      className="text-[11px] h-8 font-semibold text-[#D32F2F] border-[#D32F2F]/30 hover:bg-[#D32F2F]/10"
                      onClick={() => handleDeleteListing(item.listingId)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* EDIT LISTING DIALOG */}
      <Dialog open={!!editingListing} onOpenChange={(open) => !open && setEditingListing(null)}>
        <DialogContent className="w-[95vw] max-w-md p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">{isFil ? "I-edit ang Listahan ng Produkto" : "Edit Product Listing"}</DialogTitle>
            <DialogDescription className="text-xs">{isFil ? "I-update ang presyo, dami, o detalye ng iyong produkto" : "Update your product price, quantity, or details"}</DialogDescription>
          </DialogHeader>

          {editingListing && (
            <div className="space-y-3 py-2 text-xs">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">{isFil ? "Hinihinging Presyo (₱/kg)" : "Asking Price (₱/kg)"}</Label>
                <Input type="number" value={editPriceInput} onChange={(e) => setEditPriceInput(e.target.value)} className="h-9 text-xs" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">{isFil ? "Magagamit na Dami (kg)" : "Available Quantity (kg)"}</Label>
                <Input type="number" value={editQtyInput} onChange={(e) => setEditQtyInput(e.target.value)} className="h-9 text-xs" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">{isFil ? "Deskripsyon" : "Description"}</Label>
                <Textarea value={editDescInput} onChange={(e) => setEditDescInput(e.target.value)} className="h-20 text-xs" />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditingListing(null)} className="text-xs">{isFil ? "Kanselahin" : "Cancel"}</Button>
            <Button className="bg-emerald-600 text-white text-xs font-bold" disabled={updatingListing} onClick={handleUpdateListingDetails}>
              {updatingListing ? (isFil ? "Ipinapasok..." : "Saving...") : (isFil ? "I-save ang Pagbabago" : "Save Changes")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PRODUCT DETAILS SHEET / DEDICATED PAGE */}
      <Sheet open={!!selectedListing} onOpenChange={(open) => !open && setSelectedListing(null)}>
        <SheetContent side="right" className="w-full sm:w-[540px] p-0 flex flex-col">
          {selectedListing && (
            <>
              <SheetHeader className="px-4 sm:px-6 pt-5 pb-3 border-b bg-muted/20">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-[10px]">
                        {selectedListing.qualityGrade}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{selectedListing.category}</span>
                    </div>
                    <SheetTitle className="text-xl font-black mt-1">
                      {selectedListing.cropName} <span className="text-sm font-normal text-muted-foreground">({selectedListing.variety})</span>
                    </SheetTitle>
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                      {selectedListing.municipality}, {selectedListing.province} ({selectedListing.distanceKm} km {isFil ? "ang layo" : "away"})
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-2xl font-black text-foreground">₱{selectedListing.askingPricePhpKg}</div>
                    <div className="text-[10px] text-muted-foreground">{isFil ? "bawat" : "per"} {selectedListing.unit}</div>
                  </div>
                </div>
              </SheetHeader>

              <ScrollArea className="flex-1">
                <div className="px-4 sm:px-6 py-4 space-y-4">
                  {/* Photo Display Header */}
                  <div className="space-y-2">
                    <div className="rounded-2xl overflow-hidden h-48 sm:h-56 w-full bg-muted border relative">
                      <img
                        src={
                          selectedListing.photoUrls && selectedListing.photoUrls.length > 0
                            ? selectedListing.photoUrls[activeDetailPhotoIndex || 0] || selectedListing.photoUrls[0]
                            : (selectedListing.cropImageUrl || getCropStandardImage(selectedListing.cropName))
                        }
                        alt={selectedListing.cropName}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute top-2 left-2 flex items-center gap-1.5">
                        {selectedListing.photoUrls && selectedListing.photoUrls.length > 0 ? (
                          <Badge className="bg-emerald-600 text-white text-[10px] font-bold shadow-xs">
                            ★ {isFil ? "Litrato ng Magsasaka" : "Farmer Photo"} ({ (activeDetailPhotoIndex || 0) + 1 } / {selectedListing.photoUrls.length})
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-600 text-white text-[10px] font-bold shadow-xs">
                            {isFil ? "Karaniwang Larawan" : "Standard Crop Image"}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Farmer Photos Thumbnails Row */}
                    {selectedListing.photoUrls && selectedListing.photoUrls.length > 0 && (
                      <div className="space-y-1">
                        <div className="text-[10px] font-semibold text-muted-foreground flex items-center justify-between">
                          <span>{isFil ? `Mga Litratong In-upload ng Magsasaka (${selectedListing.photoUrls.length}):` : `Farmer Uploaded Photos (${selectedListing.photoUrls.length}):`}</span>
                          <span className="text-emerald-600">{isFil ? "Pindutin para palakihin" : "Click photo to view enlarged"}</span>
                        </div>
                        <div className="flex items-center gap-2 overflow-x-auto pb-1">
                          {selectedListing.photoUrls.map((url, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setActiveDetailPhotoIndex(idx)}
                              className={`relative h-14 w-14 rounded-xl overflow-hidden border shrink-0 transition-transform ${
                                (activeDetailPhotoIndex || 0) === idx ? "ring-2 ring-emerald-600 scale-105" : "opacity-75 hover:opacity-100"
                              }`}
                            >
                              <img src={url} alt={`Thumbnail ${idx + 1}`} className="h-full w-full object-cover" />
                              {idx === 0 && (
                                <span className="absolute top-0.5 left-0.5 bg-emerald-600 text-white text-[8px] px-1 rounded font-bold">
                                  {isFil ? "Pangunahin" : "Primary"}
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Price Breakdown & Reference Comparison */}
                  <Card className={`border p-3.5 space-y-2 ${selectedListing.priceDifferencePct > 10 ? "border-red-300 bg-red-500/5" : "border-amber-300/80 bg-amber-500/5"}`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 ${selectedListing.priceDifferencePct > 10 ? "text-red-700 dark:text-red-300" : "text-amber-800 dark:text-amber-300"}`}>
                        {selectedListing.priceDifferencePct > 10 ? <AlertTriangle className="h-4 w-4 text-red-600" /> : <TrendingUp className="h-4 w-4 text-amber-600" />} {isFil ? "Paghahambing ng Presyo" : "Market Price Comparison"}
                      </span>
                      <Badge className={selectedListing.priceDifferencePct > 10 ? "bg-red-600 text-white font-bold text-[10px]" : "bg-emerald-600 text-white font-bold text-[10px]"}>
                        {selectedListing.priceDifferencePct > 10 ? `⚠️ +${Math.round(selectedListing.priceDifferencePct)}% ${isFil ? "Mataas sa Ref" : "Above Ref"}` : selectedListing.priceDifferencePct <= 0 ? (isFil ? "Mababa sa Ref" : "Below Ref") : `+${selectedListing.priceDifferencePct}% vs Ref`}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-center pt-1">
                      <div className="p-2 rounded-lg bg-background border">
                        <div className="text-[9px] text-muted-foreground uppercase">{isFil ? "Presyo ng Nagbenta" : "Seller Price"}</div>
                        <div className="text-base font-black">₱{selectedListing.askingPricePhpKg} / kg</div>
                      </div>
                      <div className="p-2 rounded-lg bg-background border">
                        <div className="text-[9px] text-muted-foreground uppercase">{isFil ? "Market Reference" : "Market Reference"}</div>
                        <div className="text-base font-black text-amber-700 dark:text-amber-300">₱{selectedListing.daReferencePricePhpKg} / kg</div>
                      </div>
                    </div>

                    {selectedListing.priceDifferencePct > 10 ? (
                      <div className="p-2.5 rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-200 text-xs space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-red-700 dark:text-red-300">
                          <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
                          <span>{isFil ? `Babala sa Presyo: +${Math.round(selectedListing.priceDifferencePct)}% Mataas sa Reference` : `Price Warning: +${Math.round(selectedListing.priceDifferencePct)}% Above Reference`}</span>
                        </div>
                        <p className="text-[11px] leading-tight text-red-600 dark:text-red-300">
                          {isFil
                            ? "Ang presyong ito ay lumampas sa market reference nang higit sa 10%. Ang mga magsasaka ay may ganap na kontrol sa presyo at ang listahan ay nananatiling mabibili."
                            : "This crop price exceeds the market reference by more than 10%. Farmers retain full control of their selling price and this listing remains available for purchase."}
                        </p>
                      </div>
                    ) : (
                      <div className="p-2 rounded-xl border border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-200 text-[11px] flex items-center gap-1.5 font-medium">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        <span>{isFil ? "Ang presyo ay pasok sa market reference benchmark threshold" : "Price is within the market reference benchmark threshold"} ({selectedListing.priceDifferencePct <= 0 ? (isFil ? "Mababa sa reference" : "Below reference") : `+${selectedListing.priceDifferencePct}% vs Ref`}).</span>
                      </div>
                    )}
                  </Card>

                  {/* Gemini AI Market Assessment */}
                  <Card className="border bg-card p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1.5">
                        <Sparkles className="h-4 w-4 text-primary" /> {isFil ? "Pagsusuri ng Gemini AI" : "Gemini AI Market Assessment"}
                      </span>
                      {loadingAi ? (
                        <Badge variant="outline" className="text-[10px] animate-pulse">{isFil ? "Sinusuri..." : "Analyzing..."}</Badge>
                      ) : aiAnalysis ? (
                        <Badge className="bg-emerald-600 text-white text-[10px]">{aiAnalysis.fairnessScore} {isFil ? "Puntos" : "Score"}</Badge>
                      ) : null}
                    </div>

                    {loadingAi ? (
                      <Skeleton className="h-16 w-full rounded-xl" />
                    ) : aiAnalysis ? (
                      <div className="space-y-1.5 text-xs">
                        <p className="font-semibold text-foreground">{aiAnalysis.priceAssessment}</p>
                        <p className="text-muted-foreground">{aiAnalysis.offerAdvice}</p>
                      </div>
                    ) : null}
                  </Card>

                  {/* Product Details & Description */}
                  <div className="space-y-2 text-xs">
                    <div className="font-bold text-sm text-foreground">{isFil ? "Impormasyon ng Produkto" : "Product Information"}</div>
                    <p className="text-muted-foreground leading-relaxed">{selectedListing.description}</p>
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t text-[11px]">
                      <div><span className="text-muted-foreground">{isFil ? "Magagamit na Stock:" : "Available Stock:"}</span> <strong className="text-foreground">{selectedListing.quantityAvailableKg} kg</strong></div>
                      <div><span className="text-muted-foreground">{isFil ? "Petsa ng Paglista:" : "Date Listed:"}</span> <strong className="text-foreground">{new Date(selectedListing.createdAt).toLocaleDateString()}</strong></div>
                    </div>
                  </div>

                  {/* Seller Info & Profile Link */}
                  <div className="rounded-xl border p-3.5 space-y-2.5 bg-muted/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <UserCheck className="h-4 w-4 text-emerald-600" />
                        <div>
                          <button
                            type="button"
                            className="font-bold text-xs hover:text-emerald-600 text-left underline"
                            onClick={() => openSellerProfile(selectedListing.sellerId, selectedListing.sellerName, selectedListing.sellerPhone, selectedListing.sellerFarmName)}
                          >
                            {selectedListing.sellerName}
                          </button>
                          <div className="text-[10px] text-muted-foreground">{selectedListing.sellerFarmName}</div>
                        </div>
                      </div>
                      <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[10px]">
                        {selectedListing.verificationStatus}
                      </Badge>
                    </div>

                    {/* Rating Bar */}
                    <div className="flex items-center justify-between text-xs border-t pt-2">
                      <div className="flex items-center gap-1 font-bold text-amber-600">
                        <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                        <span>
                          {selectedListing.sellerReviewCount && selectedListing.sellerReviewCount > 0
                            ? `${selectedListing.sellerRating.toFixed(1)} / 5.0 (${selectedListing.sellerReviewCount} ${isFil ? "mga review" : "reviews"})`
                            : (isFil ? "Wala pang review" : "No reviews yet")}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-[10px] text-emerald-600 hover:text-emerald-700 p-0 h-auto font-bold underline"
                        onClick={() => openSellerProfile(selectedListing.sellerId, selectedListing.sellerName, selectedListing.sellerPhone, selectedListing.sellerFarmName)}
                      >
                        {isFil ? "Tingnan ang Profile at Mga Review →" : "View Profile & Reviews →"}
                      </Button>
                    </div>

                    <div className="text-xs text-muted-foreground flex items-center gap-2 border-t pt-2">
                      <Phone className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span>{selectedListing.sellerPhone}</span>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-start gap-2 border-t pt-2">
                      <MapPin className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <span className="font-semibold text-foreground">{isFil ? "Tirahan ng Sakahan:" : "Farm Address:"} </span>
                          {getProximityBadge(selectedListing, buyerLocationObj).badge}
                        </div>
                        <span>
                          {selectedListing.streetAddress ? `${selectedListing.streetAddress}, ` : ""}
                          {selectedListing.barangay ? `${selectedListing.barangay}, ` : ""}
                          {selectedListing.municipality}, {selectedListing.province}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Reviews Section inside Sheet */}
                  <div className="space-y-2 border-t pt-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <Star className="h-4 w-4 text-amber-500 fill-amber-500" /> {isFil ? "Mga Review ng Mamimili" : "Buyer Reviews"}
                      </h4>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-[10px] text-emerald-600 p-0 h-auto font-bold"
                        onClick={() => openSellerProfile(selectedListing.sellerId, selectedListing.sellerName, selectedListing.sellerPhone, selectedListing.sellerFarmName)}
                      >
                        {isFil ? `Lahat ng Review (${selectedListing.sellerReviewCount || 0})` : `All Reviews (${selectedListing.sellerReviewCount || 0})`}
                      </Button>
                    </div>

                    {listingReviews.length === 0 ? (
                      <div className="p-3 text-center text-xs text-muted-foreground bg-muted/20 rounded-xl">
                        {isFil ? "Wala pang isinumiteng review para sa partikular na listahang ito." : "No reviews submitted for this specific listing yet."}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {listingReviews.map((rev) => (
                          <div key={rev.reviewId || rev.id} className="p-2.5 rounded-xl border bg-card text-xs space-y-1">
                            <div className="flex items-center justify-between">
                              <div className="font-bold flex items-center gap-1">
                                <span>{rev.buyerName}</span>
                                <Badge variant="outline" className="text-[8px] bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 border-emerald-300">
                                  {isFil ? "Nakumpletong Pagbili" : "Completed Order"}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-0.5 text-amber-500">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star key={s} className={`h-3 w-3 ${s <= rev.rating ? "fill-amber-500 text-amber-500" : "text-muted-foreground/30"}`} />
                                ))}
                              </div>
                            </div>
                            <p className="text-muted-foreground text-[11px] leading-snug">{rev.comment}</p>
                            <div className="text-[9px] text-muted-foreground text-right">{new Date(rev.createdAt).toLocaleDateString()}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Quantity Stepper & Total */}
                  <div className="p-3.5 rounded-2xl border bg-card space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-bold">{isFil ? "Pumili ng Dami (kg)" : "Select Quantity (kg)"}</Label>
                      <div className="flex items-center gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8"
                          onClick={() => setDetailQuantity((q) => Math.max(1, q - 10))}
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </Button>
                        <Input
                          type="number"
                          value={detailQuantity}
                          onChange={(e) => setDetailQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-16 h-8 text-xs text-center font-bold"
                        />
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8"
                          onClick={() => setDetailQuantity((q) => Math.min(selectedListing.quantityAvailableKg, q + 10))}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-xs font-bold">{isFil ? "Kabuuang Presyo:" : "Total Price:"}</span>
                      <span className="text-lg font-black text-emerald-600">
                        ₱{(detailQuantity * selectedListing.askingPricePhpKg).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-3 gap-2 pt-2">
                    <Button
                      variant="outline"
                      className="text-xs h-10 font-bold"
                      onClick={() => {
                        setChatMessage(`Hi ${selectedListing.sellerName}, I am interested in buying ${detailQuantity} kg of your ${selectedListing.cropName} (${selectedListing.variety}). Is this still available?`);
                        setChatModalOpen(true);
                      }}
                    >
                      <MessageSquare className="h-3.5 w-3.5 mr-1" /> {isFil ? "Makipag-chat" : "Chat"}
                    </Button>

                    <Button
                      variant="secondary"
                      className="text-xs h-10 font-bold bg-amber-500/10 text-amber-900 dark:text-amber-200"
                      onClick={() => addToCart(selectedListing, detailQuantity)}
                    >
                      <ShoppingCart className="h-3.5 w-3.5 mr-1" /> {isFil ? "Idagdag sa Cart" : "Add to Cart"}
                    </Button>

                    <Button
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-10 font-bold"
                      onClick={() => handleDirectBuyNow(selectedListing, detailQuantity)}
                    >
                      {isFil ? "Bumili Ngayon" : "Buy Now"}
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* SHOPPING CART SHEET / DRAWER */}
      <Sheet open={cartOpen} onOpenChange={setCartOpen}>
        <SheetContent side="right" className="w-full sm:w-[480px] p-0 flex flex-col">
          <SheetHeader className="p-4 border-b">
            <SheetTitle className="text-lg font-bold flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-emerald-600" /> {isFil ? `Iyong Shopping Cart (${cart.length})` : `Your Shopping Cart (${cart.length})`}
            </SheetTitle>
          </SheetHeader>

          <ScrollArea className="flex-1 p-4">
            {cart.length === 0 ? (
              <div className="text-center py-12 text-xs text-muted-foreground space-y-2">
                <ShoppingBasket className="h-10 w-10 text-muted-foreground mx-auto" />
                <p>{isFil ? "Kasalukuyang walang laman ang iyong shopping cart." : "Your shopping cart is currently empty."}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => (
                  <div key={item.listing.listingId} className="p-3 rounded-xl border bg-card flex gap-3">
                    <img src={item.listing.photoUrls[0]} alt={item.listing.cropName} className="h-14 w-14 rounded-lg object-cover bg-muted shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-xs truncate">{item.listing.cropName}</div>
                      <div className="text-[10px] text-muted-foreground">{item.listing.sellerName} · ₱{item.listing.askingPricePhpKg}/kg</div>
                      <div className="text-xs font-black text-emerald-600 mt-1">
                        ₱{(item.quantityKg * item.listing.askingPricePhpKg).toLocaleString()}
                      </div>
                    </div>

                    <div className="flex flex-col items-end justify-between">
                      <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={() => removeFromCart(item.listing.listingId)}>
                        <X className="h-3.5 w-3.5" />
                      </Button>

                      <div className="flex items-center gap-1 bg-muted p-0.5 rounded">
                        <button type="button" className="px-1.5 text-xs font-bold" onClick={() => updateCartQty(item.listing.listingId, item.quantityKg - 10)}>-</button>
                        <span className="text-[11px] font-bold px-1">{item.quantityKg}kg</span>
                        <button type="button" className="px-1.5 text-xs font-bold" onClick={() => updateCartQty(item.listing.listingId, item.quantityKg + 10)}>+</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {cart.length > 0 && (
            <div className="p-4 border-t bg-card space-y-3">
              <div className="flex items-center justify-between text-sm font-bold">
                <span>{isFil ? "Kabuuang Halaga:" : "Total Amount:"}</span>
                <span className="text-emerald-600 text-lg">₱{cartTotalAmount.toLocaleString()}</span>
              </div>
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-10 text-xs" onClick={() => setCheckoutModalOpen(true)}>
                {isFil ? "Magpatuloy sa Checkout" : "Proceed to Checkout"}
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* CHECKOUT MODAL */}
      <Dialog open={checkoutModalOpen} onOpenChange={setCheckoutModalOpen}>
        <DialogContent className="w-[95vw] max-w-md p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">{isFil ? "Checkout sa Pamilihan" : "Marketplace Checkout"}</DialogTitle>
            <DialogDescription className="text-xs">{isFil ? "Ilagay ang address ng paghahatid at mga detalye ng pagbabayad" : "Enter delivery address & payment details"}</DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">{isFil ? "Pangalan ng Mamimili" : "Buyer Name"}</Label>
              <Input value={checkoutBuyerName} onChange={(e) => setCheckoutBuyerName(e.target.value)} className="h-9 text-xs" />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">{isFil ? "Numero ng Telepono" : "Contact Phone Number"}</Label>
              <Input value={checkoutPhone} onChange={(e) => setCheckoutPhone(e.target.value)} className="h-9 text-xs" />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">{isFil ? "Lungsod / Munisipalidad" : "City / Municipality"}</Label>
              <Input
                value={checkoutAddress}
                onChange={(e) => setCheckoutAddress(e.target.value)}
                placeholder={isFil ? "hal. Butuan City, Agusan del Norte" : "e.g. Butuan City, Agusan del Norte"}
                className="h-9 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">{isFil ? "Barangay" : "Barangay (Manual Text)"}</Label>
                <Input
                  value={checkoutBarangay}
                  onChange={(e) => setCheckoutBarangay(e.target.value)}
                  placeholder={isFil ? "hal. Central o Doongan" : "e.g. Central or Doongan"}
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">{isFil ? "Kalye / Tiyak na Address" : "Street / Specific Address"}</Label>
                <Input
                  value={checkoutStreetAddress}
                  onChange={(e) => setCheckoutStreetAddress(e.target.value)}
                  placeholder={isFil ? "hal. Halimbawang Kalye" : "e.g. Example Street"}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">{isFil ? "Paraan ng Pagbabayad" : "Payment Method"}</Label>
              <Select value={checkoutPaymentMethod} onValueChange={setCheckoutPaymentMethod}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash on Delivery">{isFil ? "Kaliwaan sa Paghahatid (COD)" : "Cash on Delivery (COD)"}</SelectItem>
                  <SelectItem value="GCash / e-Wallet">GCash / e-Wallet</SelectItem>
                  <SelectItem value="Bank Transfer">{isFil ? "Paglipat sa Bangko" : "Bank Transfer"}</SelectItem>
                  <SelectItem value="Farm Gate Direct">{isFil ? "Direktang Bayad sa Sakahan (Cash)" : "Farm Gate Direct Cash"}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="p-3 rounded-xl bg-muted/40 border space-y-1 font-semibold">
              <div className="flex justify-between"><span>{isFil ? "Kabuuang Aytem:" : "Items Total:"}</span> <span>₱{cartTotalAmount.toLocaleString()}</span></div>
              <div className="flex justify-between text-emerald-600 font-bold border-t pt-1"><span>{isFil ? "Kabuuang Halaga:" : "Grand Total:"}</span> <span>₱{cartTotalAmount.toLocaleString()}</span></div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setCheckoutModalOpen(false)} className="text-xs">{isFil ? "Kanselahin" : "Cancel"}</Button>
            <Button className="bg-emerald-600 text-white text-xs font-bold" disabled={placingOrder} onClick={handlePlaceOrder}>
              {placingOrder ? (isFil ? "Inilalagay ang Order..." : "Placing Order...") : (isFil ? "Kumpirmahin at I-order" : "Confirm & Place Order")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CHAT SELLER MODAL */}
      <Dialog open={chatModalOpen} onOpenChange={setChatModalOpen}>
        <DialogContent className="w-[95vw] max-w-md p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-emerald-600" /> {isFil ? "Makipag-chat sa Nagbenta" : "Chat Seller"}
            </DialogTitle>
            <DialogDescription className="text-xs">{isFil ? "Magpadala ng direktang mensahe tungkol sa listahang ito" : "Send a direct message regarding this crop listing"}</DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <Textarea value={chatMessage} onChange={(e) => setChatMessage(e.target.value)} className="h-28 text-xs" />
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setChatModalOpen(false)} className="text-xs">{isFil ? "Kanselahin" : "Cancel"}</Button>
            <Button
              className="bg-emerald-600 text-white text-xs font-bold"
              onClick={() => {
                toast({
                  title: isFil ? "Naipadala ang Mensahe!" : "Message Sent!",
                  description: isFil ? "Sasagot ang nagbenta sa iyong numero ng telepono." : "The seller will respond to your contact phone number."
                });
                setChatModalOpen(false);
              }}
            >
              {isFil ? "Ipadala ang Mensahe" : "Send Message"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* SELL CROPS WIZARD / MODAL */}
      <Dialog open={addListingOpen} onOpenChange={setAddListingOpen}>
        <DialogContent className="w-[95vw] max-w-lg max-h-[88vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
              <PlusCircle className="h-5 w-5 text-amber-600" /> {isFil ? `Ibenta ang Iyong Ani (Hakbang ${sellStep} ng 3)` : `Sell Your Crops (Step ${sellStep} of 3)`}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {isFil
                ? "Ilista ang iyong ani nang direkta sa mga mamimili na may live Grownox market price references"
                : "List your crop harvest directly to buyers with live Grownox market price references"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            {sellStep === 1 && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">{isFil ? "Pangalan ng Pananim" : "Crop Name"}</Label>
                    <Select value={newListingForm.cropName} onValueChange={(v) => setNewListingForm({ ...newListingForm, cropName: v })}>
                      <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Rice">{isFil ? "Palay / Bigas" : "Rice"}</SelectItem>
                        <SelectItem value="Corn">{isFil ? "Mais" : "Corn"}</SelectItem>
                        <SelectItem value="Vegetables">{isFil ? "Gulay" : "Vegetables"}</SelectItem>
                        <SelectItem value="Fruits">{isFil ? "Prutas" : "Fruits"}</SelectItem>
                        <SelectItem value="Root Crops">{isFil ? "Lamang-ugat" : "Root Crops"}</SelectItem>
                        <SelectItem value="Seeds">{isFil ? "Mga Binhi" : "Seeds"}</SelectItem>
                        <SelectItem value="Other Crops">{isFil ? "Ibang Pananim" : "Other Crops"}</SelectItem>
                        <SelectItem value="Tomato">{isFil ? "Kamatis" : "Tomato"}</SelectItem>
                        <SelectItem value="Onion">{isFil ? "Sibuyas" : "Onion"}</SelectItem>
                        <SelectItem value="Cabbage">{isFil ? "Repolyo" : "Cabbage"}</SelectItem>
                        <SelectItem value="Mango">{isFil ? "Mangga" : "Mango"}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">{isFil ? "Uri / Barayti" : "Variety"}</Label>
                    <Input value={newListingForm.variety} onChange={(e) => setNewListingForm({ ...newListingForm, variety: e.target.value })} className="h-9 text-xs" />
                  </div>
                </div>

                {/* Farmer Custom Photo Upload Section */}
                <div className="space-y-2 border-t pt-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold flex items-center gap-1.5">
                      <Camera className="h-4 w-4 text-emerald-600" /> {isFil ? "Mag-upload ng Litrato ng Ani" : "Upload Harvest Photos"}
                    </Label>
                    <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 font-semibold">
                      {uploadedPhotos.length} {uploadedPhotos.length === 1 ? (isFil ? "Litrato" : "Photo") : (isFil ? "mga Litrato" : "Photos")}
                    </Badge>
                  </div>

                  <p className="text-[10px] text-muted-foreground">
                    {isFil
                      ? "Mag-upload ng totoong litrato mula sa iyong device. Maaari kang magdagdag ng marami, pumili ng pabalat, at muling ayusin."
                      : "Upload real photos from your device. You can add multiple photos, select the primary cover photo, and reorder them. Preset pictures are disabled."}
                  </p>

                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handlePhotosSelected}
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-4 px-3 border-2 border-dashed border-emerald-600/30 hover:border-emerald-600 hover:bg-emerald-500/5 rounded-xl transition-colors flex flex-col items-center justify-center gap-1.5 group cursor-pointer"
                  >
                    <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                      <Upload className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-bold text-foreground">{isFil ? "Magdagdag ng Litrato mula sa Device" : "Add Photos from Your Device"}</span>
                    <span className="text-[10px] text-muted-foreground">{isFil ? "Pindutin upang pumili sa gallery o camera (JPG, PNG, WEBP)" : "Click to browse gallery or device camera (JPG, PNG, WEBP)"}</span>
                  </button>

                  {uploadedPhotos.length > 0 ? (
                    <div className="space-y-2 pt-1">
                      <div className="text-[11px] font-semibold text-muted-foreground flex items-center justify-between">
                        <span>{isFil ? "Mga In-upload na Litrato (Pangunahin ang unang litrato):" : "Uploaded Photos (First image is Primary cover):"}</span>
                      </div>
                      <div className="grid grid-cols-2 xs:grid-cols-3 gap-2">
                        {uploadedPhotos.map((photo, idx) => (
                          <div key={idx} className={`relative rounded-xl overflow-hidden border bg-muted group ${idx === 0 ? "ring-2 ring-emerald-600" : ""}`}>
                            <img src={photo} alt={`Harvest photo ${idx + 1}`} className="h-24 w-full object-cover" />
                            
                            {idx === 0 ? (
                              <Badge className="absolute top-1 left-1 bg-emerald-600 text-white text-[9px] px-1.5 py-0 border-none font-bold shadow-xs">
                                ★ {isFil ? "Pangunahin" : "Primary"}
                              </Badge>
                            ) : (
                              <Button
                                size="sm"
                                variant="secondary"
                                className="absolute top-1 left-1 h-5 text-[9px] px-1.5 bg-black/70 hover:bg-emerald-600 text-white border-none font-bold"
                                onClick={() => handleSetPrimaryPhoto(idx)}
                              >
                                {isFil ? "Gawing Pangunahin" : "Make Primary"}
                              </Button>
                            )}

                            <Button
                              size="icon"
                              variant="destructive"
                              className="absolute top-1 right-1 h-5 w-5 rounded-full p-0 shadow-sm"
                              onClick={() => handleRemovePhoto(idx)}
                            >
                              <X className="h-3 w-3" />
                            </Button>

                            <div className="absolute bottom-1 right-1 flex items-center gap-1 bg-black/75 p-0.5 rounded">
                              {idx > 0 && (
                                <button
                                  type="button"
                                  className="text-white hover:text-emerald-400 p-0.5"
                                  title={isFil ? "Ilipat pakaliwa" : "Move Left"}
                                  onClick={() => handleMovePhoto(idx, "left")}
                                >
                                  <MoveLeft className="h-3 w-3" />
                                </button>
                              )}
                              {idx < uploadedPhotos.length - 1 && (
                                <button
                                  type="button"
                                  className="text-white hover:text-emerald-400 p-0.5"
                                  title={isFil ? "Ilipat pakanan" : "Move Right"}
                                  onClick={() => handleMovePhoto(idx, "right")}
                                >
                                  <MoveRight className="h-3 w-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-900 dark:text-amber-200 text-[11px] leading-tight flex items-center gap-2 font-medium">
                      <Info className="h-4 w-4 text-amber-600 shrink-0" />
                      <span>{isFil ? `Wala pang na-upload na litrato. Kung ilalathala nang walang litrato, makikita ng mamimili ang karaniwang imahe para sa ${newListingForm.cropName}.` : `No photos uploaded yet. If published without custom photos, buyers will see the standard crop image for ${newListingForm.cropName}.`}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {sellStep === 2 && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">{isFil ? "Magagamit na Dami (kg)" : "Quantity Available (kg)"}</Label>
                    <Input type="number" value={newListingForm.quantityAvailableKg} onChange={(e) => setNewListingForm({ ...newListingForm, quantityAvailableKg: e.target.value })} className="h-9 text-xs" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">{isFil ? "Hinihinging Presyo (₱/kg)" : "Asking Price (₱/kg)"}</Label>
                    <Input type="number" value={newListingForm.askingPricePhpKg} onChange={(e) => setNewListingForm({ ...newListingForm, askingPricePhpKg: e.target.value })} className="h-9 text-xs font-bold" />
                  </div>
                </div>

                {daPreviewPrice && (() => {
                  const ask = parseFloat(newListingForm.askingPricePhpKg) || 0;
                  const diff = ask > 0 ? Math.round(((ask - daPreviewPrice) / daPreviewPrice) * 100) : 0;
                  const isHigh = diff > 10;
                  return (
                    <div className="space-y-1.5">
                      <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 text-xs flex items-center justify-between font-medium">
                        <span className="flex items-center gap-1.5"><TrendingUp className="h-4 w-4 text-amber-600" /> {isFil ? "Grownox Market Reference:" : "Grownox Market Reference:"}</span>
                        <span className="font-bold">₱{daPreviewPrice}/kg</span>
                      </div>
                      {isHigh ? (
                        <div className="p-2 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-300 text-red-700 dark:text-red-300 text-[11px] leading-tight flex items-start gap-1.5 font-medium">
                          <AlertTriangle className="h-3.5 w-3.5 text-red-600 shrink-0 mt-0.5" />
                          <span>
                            {isFil
                              ? `Paunawa: Ang presyo ay +${diff}% lampas sa market reference benchmark. Isang paunawa sa presyo ang ipapakita sa mga mamimili, ngunit mananatiling aktibo ang iyong listahan.`
                              : `Notice: Asking price is +${diff}% above market reference benchmark. A price notice will be displayed to buyers for transparency, but your listing will remain active and purchasable.`}
                          </span>
                        </div>
                      ) : ask > 0 ? (
                        <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 text-emerald-800 dark:text-emerald-200 text-[11px] flex items-center gap-1.5 font-medium">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                          <span>{isFil ? "Ang presyo ay pasok sa market reference range" : "Price is within market reference range"} ({diff <= 0 ? (isFil ? "Mababa sa benchmark" : "Below benchmark") : `+${diff}% vs Ref`}).</span>
                        </div>
                      ) : null}
                    </div>
                  );
                })()}

                <div className="space-y-1">
                  <Label className="text-xs font-semibold">{isFil ? "Pangalan ng Magsasaka" : "Farmer Name"}</Label>
                  <Input value={newListingForm.sellerName} onChange={(e) => setNewListingForm({ ...newListingForm, sellerName: e.target.value })} className="h-9 text-xs" />
                </div>
              </div>
            )}

            {sellStep === 3 && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">{isFil ? "Rehiyon" : "Region"}</Label>
                  <Select
                    value={sellRegCode}
                    onValueChange={(code) => {
                      setSellRegCode(code);
                      const found = sellPsgcRegions.find((r) => r.code === code);
                      if (found) {
                        setNewListingForm((prev) => ({ ...prev, region: found.name }));
                      }
                    }}
                  >
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder={newListingForm.region || (isFil ? "Pumili ng Rehiyon" : "Select Region")} />
                    </SelectTrigger>
                    <SelectContent className="max-h-48">
                      {sellPsgcRegions.map((r) => (
                        <SelectItem key={r.code} value={r.code}>{r.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">{isFil ? "Lalawigan" : "Province"}</Label>
                    {sellPsgcProvinces.length > 0 ? (
                      <Select
                        value={sellProvCode}
                        onValueChange={(code) => {
                          setSellProvCode(code);
                          const found = sellPsgcProvinces.find((p) => p.code === code);
                          if (found) {
                            setNewListingForm((prev) => ({ ...prev, province: found.name }));
                          }
                        }}
                      >
                        <SelectTrigger className="h-9 text-xs">
                          <SelectValue placeholder={newListingForm.province || (isFil ? "Pumili ng Lalawigan" : "Select Province")} />
                        </SelectTrigger>
                        <SelectContent className="max-h-48">
                          {sellPsgcProvinces.map((p) => (
                            <SelectItem key={p.code} value={p.code}>{p.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        value={newListingForm.province}
                        onChange={(e) => setNewListingForm({ ...newListingForm, province: e.target.value })}
                        placeholder={isFil ? "hal. Davao Oriental" : "e.g. Davao Oriental"}
                        className="h-9 text-xs"
                      />
                    )}
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">{isFil ? "Lungsod / Munisipalidad" : "City / Municipality"}</Label>
                    {sellPsgcCities.length > 0 ? (
                      <Select
                        value={sellCityCode}
                        onValueChange={(code) => {
                          setSellCityCode(code);
                          const found = sellPsgcCities.find((c) => c.code === code);
                          if (found) {
                            setNewListingForm((prev) => ({ ...prev, municipality: found.name }));
                          }
                        }}
                      >
                        <SelectTrigger className="h-9 text-xs">
                          <SelectValue placeholder={newListingForm.municipality || (isFil ? "Pumili ng Lungsod / Munisipalidad" : "Select City / Municipality")} />
                        </SelectTrigger>
                        <SelectContent className="max-h-48">
                          {sellPsgcCities.map((c) => (
                            <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        value={newListingForm.municipality}
                        onChange={(e) => setNewListingForm({ ...newListingForm, municipality: e.target.value })}
                        placeholder={isFil ? "hal. Mati City" : "e.g. Mati City"}
                        className="h-9 text-xs"
                      />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">{isFil ? "Barangay" : "Barangay (Manual Text)"}</Label>
                    <Input
                      value={newListingForm.barangay}
                      onChange={(e) => setNewListingForm({ ...newListingForm, barangay: e.target.value })}
                      placeholder={isFil ? "hal. Central" : "e.g. Central"}
                      className="h-9 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">{isFil ? "Kalye / Tiyak na Address" : "Street / Specific Address (Manual Text)"}</Label>
                    <Input
                      value={newListingForm.streetAddress}
                      onChange={(e) => setNewListingForm({ ...newListingForm, streetAddress: e.target.value })}
                      placeholder={isFil ? "hal. Halimbawang Kalye" : "e.g. Example Street"}
                      className="h-9 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold">{isFil ? "Deskripsyon" : "Description"}</Label>
                  <Textarea value={newListingForm.description} onChange={(e) => setNewListingForm({ ...newListingForm, description: e.target.value })} className="h-16 text-xs" />
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            {sellStep > 1 && (
              <Button variant="outline" size="sm" onClick={() => setSellStep((s) => s - 1)} className="text-xs">{isFil ? "Bumalik" : "Back"}</Button>
            )}
            {sellStep < 3 ? (
              <Button className="bg-amber-600 text-white text-xs font-bold" onClick={() => setSellStep((s) => s + 1)}>{isFil ? "Susunod" : "Next"}</Button>
            ) : (
              <Button className="bg-emerald-600 text-white text-xs font-bold" disabled={submittingListing} onClick={handleCreateListingSubmit}>
                {submittingListing ? (isFil ? "Inilalathala..." : "Publishing...") : (isFil ? "Ilathala ang Listahan" : "Publish Listing")}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* LOCATION SELECTION DIALOG */}
      <Dialog open={locationModalOpen} onOpenChange={setLocationModalOpen}>
        <DialogContent className="w-[95vw] max-w-md max-h-[85vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" /> {isFil ? "Pumili ng Lokasyon sa Pamilihan" : "Select Marketplace Location"}
            </DialogTitle>
            <DialogDescription className="text-xs">{isFil ? "Mag-browse ng mga produktong sakahan sa iyong lugar" : "Browse farm products available in your area"}</DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">{isFil ? "Mabilisang Paghahanap" : "Quick Search"}</Label>
              <Input
                placeholder={isFil ? "hal. Mati City, Davao, Cebu, Butuan..." : "e.g. Mati City, Davao, Cebu, Butuan..."}
                value={customLocationSearch}
                onChange={(e) => setCustomLocationSearch(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">{isFil ? "Pumili ng Rehiyon" : "Select Region"}</Label>
              <Select value={selectedRegCode} onValueChange={setSelectedRegCode}>
                <SelectTrigger className="h-9 text-xs"><SelectValue placeholder={isFil ? "Pumili ng Rehiyon" : "Select Region"} /></SelectTrigger>
                <SelectContent className="max-h-48">
                  {psgcRegions.map((r) => <SelectItem key={r.code} value={r.code}>{r.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {selectedRegCode && (
              <div className="space-y-1">
                <Label className="text-xs font-semibold">{isFil ? "Pumili ng Lalawigan" : "Select Province"}</Label>
                <Select value={selectedProvCode} onValueChange={setSelectedProvCode}>
                  <SelectTrigger className="h-9 text-xs"><SelectValue placeholder={isFil ? "Pumili ng Lalawigan" : "Select Province"} /></SelectTrigger>
                  <SelectContent className="max-h-48">
                    {psgcProvinces.map((p) => <SelectItem key={p.code} value={p.code}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedProvCode && (
              <div className="space-y-1">
                <Label className="text-xs font-semibold">{isFil ? "Pumili ng Lungsod / Munisipalidad" : "Select City / Municipality"}</Label>
                <Select value={selectedCityCode} onValueChange={setSelectedCityCode}>
                  <SelectTrigger className="h-9 text-xs"><SelectValue placeholder={isFil ? "Pumili ng Lungsod / Munisipalidad" : "Select City / Municipality"} /></SelectTrigger>
                  <SelectContent className="max-h-48">
                    {psgcCities.map((c) => <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setLocationModalOpen(false)} className="text-xs">{isFil ? "Kanselahin" : "Cancel"}</Button>
            <Button onClick={handleApplyLocation} className="bg-emerald-600 text-white text-xs font-bold">{isFil ? "Gamitin ang Lokasyon" : "Apply Location"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* BOTTOM MOBILE NAVIGATION BAR */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#DDE5DE] z-40 px-2 py-1.5 flex items-center justify-around shadow-lg">
        <button
          type="button"
          onClick={() => changeNavTab("home")}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${navTab === "home" ? "text-[#2E7D32]" : "text-[#6B756D]"}`}
        >
          <Home className="h-5 w-5" />
          <span>{isFil ? "Tahanan" : "Home"}</span>
        </button>

        <button
          type="button"
          onClick={() => changeNavTab("market")}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${navTab === "market" ? "text-[#2E7D32]" : "text-[#6B756D]"}`}
        >
          <Store className="h-5 w-5" />
          <span>{isFil ? "Pamilihan" : "Market"}</span>
        </button>

        <button
          type="button"
          onClick={() => { setAddListingOpen(true); setSellStep(1); }}
          className="flex flex-col items-center gap-0.5 text-[10px] font-bold text-white bg-[#2E7D32] p-1.5 rounded-full -mt-5 shadow-md"
        >
          <PlusCircle className="h-6 w-6" />
        </button>

        <button
          type="button"
          onClick={() => changeNavTab("cart_orders")}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold relative ${navTab === "cart_orders" ? "text-[#2E7D32]" : "text-[#6B756D]"}`}
        >
          <ShoppingCart className="h-5 w-5" />
          <span>{isFil ? "Mga Order" : "Orders"}</span>
          {cart.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#2E7D32] text-white text-[9px] h-4 w-4 rounded-full flex items-center justify-center">
              {cart.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => changeNavTab("my_listings")}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${navTab === "my_listings" ? "text-[#2E7D32]" : "text-[#6B756D]"}`}
        >
          <UserCheck className="h-5 w-5" />
          <span>{isFil ? "Profile" : "Profile"}</span>
        </button>
      </div>

      {/* VERIFIED BUYER REVIEW MODAL */}
      <Dialog open={!!reviewModalOrder} onOpenChange={(open) => !open && setReviewModalOrder(null)}>
        <DialogContent className="w-[95vw] max-w-md p-4 sm:p-6 bg-white border border-[#DDE5DE]">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-[#26332A] flex items-center gap-2">
              <Star className="h-5 w-5 text-[#F9A825] fill-[#F9A825]" /> {isFil ? "Magsulat ng Review" : "Write Buyer Review"}
            </DialogTitle>
            <DialogDescription className="text-xs text-[#6B756D]">
              {isFil
                ? `Ibahagi ang iyong karanasan sa pagbili ng ${reviewModalOrder?.cropName} mula kay ${reviewModalOrder?.sellerName}`
                : `Share your experience purchasing ${reviewModalOrder?.cropName} from ${reviewModalOrder?.sellerName}`}
            </DialogDescription>
          </DialogHeader>

          {reviewModalOrder && (
            <div className="space-y-4 py-2 text-xs">
              <div className="p-3 rounded-xl bg-[#F8FAF7] border border-[#DDE5DE] space-y-1">
                <div className="font-bold text-xs text-[#26332A]">{reviewModalOrder.cropName}</div>
                <div className="text-[11px] text-[#6B756D]">{isFil ? "Nagbenta:" : "Seller:"} {reviewModalOrder.sellerName} · {isFil ? "Order #" : "Order #"}{reviewModalOrder.orderId || reviewModalOrder.id}</div>
                <div className="text-xs font-black text-[#2E7D32]">₱{(reviewModalOrder.totalAmountPhp || 0).toLocaleString()} ({reviewModalOrder.quantityKg} kg)</div>
              </div>

              {/* Overall Rating Stars */}
              <div className="space-y-1.5 text-center">
                <Label className="text-xs font-bold text-[#26332A]">{isFil ? "Pangkalahatang Rating" : "Overall Star Rating"}</Label>
                <div className="flex items-center justify-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className="p-1 transition-transform hover:scale-125 cursor-pointer"
                      onClick={() => setReviewRating(star)}
                    >
                      <Star className={`h-7 w-7 ${star <= reviewRating ? "text-[#F9A825] fill-[#F9A825]" : "text-[#DDE5DE]"}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Written Review */}
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-[#26332A]">{isFil ? "Iyong Review at Puna" : "Your Review & Feedback"}</Label>
                <Textarea
                  placeholder={isFil ? "Kumusta ang kalidad ng pananim, kasariwaan, at bilis ng tugon ng nagbenta?" : "How was the crop quality, freshness, and seller response time?"}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="h-24 text-xs bg-white border-[#DDE5DE] text-[#26332A]"
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setReviewModalOrder(null)} className="text-xs border-[#DDE5DE] text-[#26332A] hover:bg-[#E8F5E9]">{isFil ? "Kanselahin" : "Cancel"}</Button>
            <Button className="bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-xs font-bold" disabled={submittingReview} onClick={handleSubmitReview}>
              {submittingReview ? (isFil ? "Inilalathala..." : "Publishing...") : (isFil ? "Isumite ang Review" : "Submit Review")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* SELLER PROFILE & REVIEWS MODAL */}
      <Dialog open={!!sellerProfileModal} onOpenChange={(open) => !open && setSellerProfileModal(null)}>
        <DialogContent className="w-[95vw] max-w-md max-h-[85vh] overflow-y-auto p-4 sm:p-6 bg-white border border-[#DDE5DE]">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-[#26332A] flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-[#2E7D32]" /> {isFil ? "Profile at Mga Review ng Nagbenta" : "Seller Profile & Reviews"}
            </DialogTitle>
            <DialogDescription className="text-xs text-[#6B756D]">
              {isFil ? "Reputasyon ng magsasaka at feedback ng mamimili" : "Farmer reputation and buyer feedback"}
            </DialogDescription>
          </DialogHeader>

          {sellerProfileModal && (
            <div className="space-y-4 py-2 text-xs">
              {/* Seller Info Header */}
              <div className="p-3.5 rounded-2xl bg-[#F8FAF7] border border-[#DDE5DE] space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-[#26332A]">{sellerProfileModal.sellerName}</h3>
                    <p className="text-[11px] text-[#6B756D]">{sellerProfileModal.sellerFarmName || (isFil ? "Lokal na Magsasaka" : "Local Farmer")}</p>
                  </div>
                  <Badge className="bg-[#E8F5E9] text-[#2E7D32] border border-[#66BB6A]/40 font-bold text-[10px]">{isFil ? "Magsasaka sa Pamilihan" : "Marketplace Seller"}</Badge>
                </div>

                <div className="flex items-center justify-between border-t border-[#DDE5DE] pt-2 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-[#2E7D32]">
                    <Star className="h-4 w-4 fill-[#F9A825] text-[#F9A825]" />
                    <span>{sellerProfileSummary?.averageRating ? sellerProfileSummary.averageRating.toFixed(1) : "5.0"} / 5.0</span>
                  </div>
                  <span className="text-[#6B756D] font-medium">{sellerProfileSummary?.totalReviews ?? sellerProfileReviews.length} {isFil ? "Mga Review" : "Reviews"}</span>
                </div>
              </div>

              {/* Reviews List */}
              <div className="space-y-2">
                <h4 className="font-bold text-xs text-[#26332A] flex items-center gap-1">
                  <ThumbsUp className="h-3.5 w-3.5 text-[#2E7D32]" /> {isFil ? "Mga Review ng Mamimili" : "Buyer Reviews"}
                </h4>

                {loadingSellerReviews ? (
                  <div className="space-y-2">
                    <Skeleton className="h-16 w-full rounded-xl" />
                    <Skeleton className="h-16 w-full rounded-xl" />
                  </div>
                ) : sellerProfileReviews.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[#6B756D] bg-[#F8FAF7] border border-[#DDE5DE] rounded-xl space-y-1">
                    <p className="font-semibold text-[#26332A]">{isFil ? "Wala pang review." : "No reviews yet."}</p>
                    <p className="text-[10px] text-[#6B756D]">{isFil ? "Maging unang mamimili na mag-iwan ng review para sa nagbentang ito!" : "Be the first buyer to review this seller!"}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {sellerProfileReviews.map((rev) => (
                      <div key={rev.reviewId || rev.id} className="p-3 rounded-xl border border-[#DDE5DE] bg-white text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="font-bold flex items-center gap-1 text-[#26332A]">
                            <span>{rev.buyerName}</span>
                            <Badge variant="outline" className="text-[8px] bg-[#E8F5E9] text-[#2E7D32] border-[#66BB6A]/40 font-bold">
                              {isFil ? "Nakumpletong Order" : "Completed Order"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-0.5 text-[#F9A825]">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} className={`h-3 w-3 ${s <= rev.rating ? "fill-[#F9A825] text-[#F9A825]" : "text-[#DDE5DE]"}`} />
                            ))}
                          </div>
                        </div>
                        <p className="text-[#6B756D] text-[11px] leading-relaxed">{rev.comment}</p>
                        <div className="text-[9px] text-[#6B756D] text-right">{new Date(rev.createdAt).toLocaleDateString()}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setSellerProfileModal(null)} className="text-xs border-[#DDE5DE] text-[#26332A] hover:bg-[#E8F5E9]">{isFil ? "Isara ang Profile" : "Close Profile"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Reusable Product Card Component
function ProductCard({
  item,
  buyerLocationObj,
  isFil: propIsFil,
  onSelect,
  onAddToCart,
  onOpenSellerProfile,
}: {
  item: MarketplaceListing;
  buyerLocationObj: { municipality: string; province: string; region: string };
  isFil?: boolean;
  onSelect: (item: MarketplaceListing) => void;
  onAddToCart: (item: MarketplaceListing, qty: number) => void;
  onOpenSellerProfile: (sellerId: string, sellerName: string, sellerPhone?: string, sellerFarmName?: string) => void;
}) {
  const { settings } = useSettings();
  const isFil = propIsFil ?? (settings.language === "fil");
  const isRedWarning = item.priceDifferencePct > 10;
  const standardCropImage = item.cropImageUrl || getCropStandardImage(item.cropName);
  const primaryFarmerPhoto = item.photoUrls && item.photoUrls.length > 0 ? item.photoUrls[0] : null;

  return (
    <Card className={`bg-white border border-[#DDE5DE] shadow-xs hover:shadow-md transition-shadow overflow-hidden flex flex-col group rounded-2xl ${isRedWarning ? "border-[#D32F2F]/40" : ""}`}>
      {/* Crop Header Image */}
      <div className="relative h-28 xs:h-32 sm:h-40 w-full bg-muted overflow-hidden shrink-0">
        <img
          src={primaryFarmerPhoto || standardCropImage}
          alt={item.cropName}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-1.5 left-1.5 flex items-center gap-1 flex-wrap">
          <Badge className="bg-black/70 text-white text-[9px] px-1.5 py-0.2 border-none">
            {item.qualityGrade}
          </Badge>
          {item.photoUrls && item.photoUrls.length > 0 && (
            <Badge className="bg-[#2E7D32] text-white text-[9px] px-1.5 py-0.2 border-none font-bold flex items-center gap-1 shadow-xs">
              <Camera className="h-2.5 w-2.5" /> {item.photoUrls.length} {item.photoUrls.length === 1 ? (isFil ? "Litrato" : "Photo") : (isFil ? "mga Litrato" : "Photos")}
            </Badge>
          )}
          {isRedWarning && (
            <Badge className="bg-[#D32F2F] text-white text-[9px] px-1.5 py-0.2 border-none font-bold flex items-center gap-0.5 shadow-sm">
              <AlertTriangle className="h-2.5 w-2.5" /> +{Math.round(item.priceDifferencePct)}% {isFil ? "mataas sa ref" : "above ref"}
            </Badge>
          )}
        </div>

        <div className="absolute bottom-1.5 left-1.5 bg-black/75 text-white px-1.5 py-0.5 rounded text-[9px] font-semibold flex items-center gap-1">
          <Package className="h-2.5 w-2.5 text-[#66BB6A]" /> {item.quantityAvailableKg} kg
        </div>
      </div>

      {/* Content */}
      <CardContent className="p-2.5 sm:p-3 flex-1 space-y-1.5">
        <div>
          <div className="text-[9px] text-[#6B756D] font-semibold flex items-center justify-between gap-1">
            <span className="truncate">{item.category}</span>
            {getProximityBadge(item, buyerLocationObj).badge}
          </div>
          <h3 className="text-xs sm:text-sm font-bold text-[#26332A] leading-tight truncate mt-0.5">
            {item.cropName} {item.variety ? <span className="text-[10px] text-[#6B756D] font-normal">({item.variety})</span> : null}
          </h3>

          <div className="flex items-center justify-between gap-1 mt-0.5">
            <button
              type="button"
              className="text-[10px] text-[#6B756D] hover:text-[#2E7D32] flex items-center gap-1 truncate text-left font-semibold cursor-pointer"
              onClick={() => onOpenSellerProfile(item.sellerId, item.sellerName, item.sellerPhone, item.sellerFarmName)}
            >
              <UserCheck className="h-2.5 w-2.5 text-[#2E7D32] shrink-0" />
              <span className="truncate underline">{item.sellerName}</span>
            </button>

            {item.sellerReviewCount && item.sellerReviewCount > 0 ? (
              <span className="text-[10px] font-bold text-[#2E7D32] flex items-center gap-0.5 shrink-0">
                <Star className="h-2.5 w-2.5 fill-[#F9A825] text-[#F9A825]" />
                {item.sellerRating.toFixed(1)} ({item.sellerReviewCount})
              </span>
            ) : (
              <span className="text-[9px] text-[#6B756D] italic shrink-0">{isFil ? "Walang review" : "No reviews"}</span>
            )}
          </div>
        </div>

        {/* Pricing Box */}
        <div className={`rounded-xl p-1.5 sm:p-2 border space-y-1 ${isRedWarning ? "bg-[#D32F2F]/5 border-[#D32F2F]/30" : "bg-[#F8FAF7] border-[#DDE5DE]"}`}>
          <div className="flex items-baseline justify-between">
            <span className="text-[9px] text-[#6B756D] font-medium">{isFil ? "Presyo:" : "Price:"}</span>
            <div className="text-right">
              <span className={`text-sm sm:text-base font-black ${isRedWarning ? "text-[#D32F2F]" : "text-[#26332A]"}`}>₱{item.askingPricePhpKg}</span>
              <span className="text-[9px] text-[#6B756D]">/{item.unit}</span>
            </div>
          </div>

          {isRedWarning ? (
            <div className="flex items-center justify-between text-[9px] border-t border-[#D32F2F]/30 pt-1 text-[#D32F2F] font-bold">
              <span className="flex items-center gap-0.5"><AlertTriangle className="h-2.5 w-2.5 text-[#D32F2F] shrink-0" /> {isFil ? "Babala sa Presyo:" : "Price Warning:"}</span>
              <span>+{Math.round(item.priceDifferencePct)}% {isFil ? "mataas sa ref" : "above ref"}</span>
            </div>
          ) : item.priceDifferencePct <= 0 ? (
            <div className="flex items-center justify-between text-[9px] border-t border-[#DDE5DE] pt-1 text-[#2E7D32] font-semibold">
              <span className="flex items-center gap-0.5"><TrendingUp className="h-2.5 w-2.5 text-[#2E7D32] shrink-0" /> Market Ref: ₱{item.daReferencePricePhpKg}/{item.unit}</span>
              <span className="bg-[#E8F5E9] text-[#2E7D32] px-1 rounded text-[8px] font-bold">{isFil ? "Mababa sa Benchmark" : "Below Benchmark"}</span>
            </div>
          ) : (
            <div className="flex items-center justify-between text-[9px] border-t border-[#DDE5DE] pt-1 text-[#2E7D32] font-semibold">
              <span className="flex items-center gap-0.5"><TrendingUp className="h-2.5 w-2.5 text-[#2E7D32] shrink-0" /> Market Ref: ₱{item.daReferencePricePhpKg}/{item.unit}</span>
              <span className="bg-[#E8F5E9] text-[#2E7D32] px-1 rounded text-[8px] font-bold">{isFil ? "Pasok sa Range" : "Within Range"}</span>
            </div>
          )}
        </div>

        <div className="text-[10px] text-[#6B756D] truncate flex items-center gap-1 font-medium">
          <MapPin className="h-2.5 w-2.5 text-[#2E7D32] shrink-0" />
          <span className="truncate text-[#26332A] font-semibold">
            {item.municipality}, {item.province}
          </span>
        </div>
      </CardContent>

      {/* Actions */}
      <CardFooter className="p-2.5 sm:p-3 pt-0 flex flex-col gap-1.5 w-full">
        <Button
          variant="outline"
          size="sm"
          className="w-full text-xs h-8 font-bold px-2 truncate border-[#DDE5DE] text-[#26332A] hover:bg-[#E8F5E9] hover:text-[#2E7D32]"
          onClick={() => onSelect(item)}
        >
          {isFil ? "Tingnan ang Produkto" : "View Product"}
        </Button>
        <Button
          size="sm"
          className="w-full bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-xs h-8 font-bold px-2 truncate shadow-xs"
          onClick={() => onAddToCart(item, 10)}
        >
          {isFil ? "Idagdag sa Cart" : "Add to Cart"}
        </Button>
      </CardFooter>
    </Card>
  );
}
