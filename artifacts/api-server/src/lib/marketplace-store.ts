/**
 * Farmer Marketplace Engine & Server-Side Rules Store
 * Enforces DA reference price calculations, 10% minimum offer rules,
 * inventory reservations, order workflows, and distance approximations.
 */

import { getLatestDAPrices, calculatePriceStatistics } from "./da-price-engine";

export interface MarketplaceListingData {
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
  unit: string; // kg, sack, ton
  askingPricePhpKg: number;
  daReferencePricePhpKg: number;
  priceDifferencePct: number; // e.g. -4.0 (cheaper than DA) or +5.0 (premium)
  qualityGrade: "Grade A" | "Grade B" | "Organic" | "Export Quality" | "Standard";
  harvestDate: string;
  availableDate: string;
  description: string;
  region: string;
  province: string;
  municipality: string;
  barangay?: string;
  latitude: number;
  longitude: number;
  deliveryOptions: string[]; // ["Farm Gate Pickup", "Local Delivery", "Regional Trucking"]
  photoUrls: string[];
  status: "active" | "paused" | "sold_out" | "cancelled";
  createdAt: string;
  updatedAt: string;
}

export interface MarketplaceOrderData {
  id: string;
  orderId: string;
  listingId: string;
  sellerId: string;
  sellerName: string;
  buyerName: string;
  buyerContact: string;
  buyerLocation: string;
  cropName: string;
  variety: string;
  quantityKg: number;
  agreedPricePhpKg: number;
  totalAmountPhp: number;
  deliveryMethod: string;
  status:
    | "Pending"
    | "Offer Submitted"
    | "Accepted"
    | "Rejected"
    | "Confirmed"
    | "Preparing"
    | "Ready for pickup"
    | "In delivery"
    | "Completed"
    | "Cancelled";
  orderType: "direct_buy" | "offer_accepted";
  createdAt: string;
  updatedAt: string;
}

export interface MarketplaceOfferData {
  id: string;
  offerId: string;
  listingId: string;
  sellerId: string;
  buyerName: string;
  buyerContact: string;
  buyerLocation: string;
  cropName: string;
  quantityKg: number;
  offeredPricePhpKg: number;
  daReferencePricePhpKg: number;
  minAllowedOfferPhpKg: number; // DA * 0.90
  totalAmountPhp: number;
  notes?: string;
  status: "Pending" | "Accepted" | "Rejected" | "Expired";
  createdAt: string;
  updatedAt: string;
}

// Coordinate mapping for Philippine Municipalities/Provinces for Distance Approximation
const PH_COORDINATES: Record<string, { lat: number; lng: number }> = {
  "Panabo City, Davao del Norte": { lat: 7.3081, lng: 125.6841 },
  "Tagum City, Davao del Norte": { lat: 7.4478, lng: 125.8078 },
  "Davao City, Davao del Sur": { lat: 7.1907, lng: 125.4553 },
  "La Trinidad, Benguet": { lat: 16.4550, lng: 120.5875 },
  "Baguio City, Benguet": { lat: 16.4023, lng: 120.5960 },
  "Cabanatuan City, Nueva Ecija": { lat: 15.4865, lng: 120.9734 },
  "Santiago City, Isabela": { lat: 16.6925, lng: 121.5478 },
  "Lipa City, Batangas": { lat: 13.9419, lng: 121.1644 },
  "Iloilo City, Iloilo": { lat: 10.7202, lng: 122.5621 },
  "Cebu City, Cebu": { lat: 10.3157, lng: 123.8854 },
  "Malaybalay City, Bukidnon": { lat: 8.1575, lng: 125.1278 },
  "General Santos City, South Cotabato": { lat: 6.1164, lng: 125.1716 },
  "Butuan City, Agusan del Norte": { lat: 8.9475, lng: 125.5406 },
  "Cabadbaran City, Agusan del Norte": { lat: 9.1233, lng: 125.5342 },
  "Divisoria, Metro Manila": { lat: 14.6010, lng: 120.9715 },
};

/**
 * Calculates distance in kilometers between two lat/lng points using Haversine formula
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export function getApproxDistanceToBuyer(
  listing: MarketplaceListingData,
  buyerLocationStr: string = "Butuan City, Agusan del Norte"
): number {
  let buyerCoords = PH_COORDINATES[buyerLocationStr];
  if (!buyerCoords) {
    // Fallback to Agusan del Norte
    buyerCoords = PH_COORDINATES["Butuan City, Agusan del Norte"];
  }
  return calculateDistanceKm(listing.latitude, listing.longitude, buyerCoords.lat, buyerCoords.lng);
}

// In-memory data store with realistic initial Philippine farmer listings
const listingsStore: Map<string, MarketplaceListingData> = new Map();
const ordersStore: Map<string, MarketplaceOrderData> = new Map();
const offersStore: Map<string, MarketplaceOfferData> = new Map();
const favoritesStore: Set<string> = new Set(); // store favorite listingIds

/**
 * Seed initial marketplace listings tied to authoritative DA reference prices
 */
function seedMarketplaceListings() {
  // Production Marketplace: No fake or synthetic sellers/listings.
  // Only real user-created active listings will be displayed.
  return;
  if (listingsStore.size > 0) return;

  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  const seeds = [
    {
      id: "mkt_1",
      listingId: "LST-1001",
      sellerId: "SLR-101",
      sellerName: "Mang Danilo Agripino",
      sellerPhone: "+63 917 555 3821",
      sellerFarmName: "Panabo Green Fields Farm",
      sellerRating: 4.9,
      verificationStatus: "Verified Farmer" as const,
      cropName: "Rice",
      variety: "Dinorado (Well-Milled)",
      category: "Grains & Staples",
      quantityAvailableKg: 850,
      originalQuantityKg: 1000,
      unit: "kg",
      askingPricePhpKg: 48,
      qualityGrade: "Grade A" as const,
      harvestDate: today,
      availableDate: today,
      description: "Freshly harvested premium Dinorado well-milled rice. Aromatic, white grains with high head-rice yield. Direct from Panabo rice fields.",
      region: "Region XI - Davao",
      province: "Davao del Norte",
      municipality: "Panabo City",
      barangay: "Barangay New Visayas",
      latitude: 7.3081,
      longitude: 125.6841,
      deliveryOptions: ["Farm Gate Pickup", "Local Delivery", "Regional Trucking"],
      photoUrls: [
        "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?auto=format&fit=crop&w=800&q=80",
      ],
      status: "active" as const,
    },
    {
      id: "mkt_2",
      listingId: "LST-1002",
      sellerId: "SLR-102",
      sellerName: "Benguet Highland Organic Co-op",
      sellerPhone: "+63 920 888 1920",
      sellerFarmName: "La Trinidad Valley Organics",
      sellerRating: 4.95,
      verificationStatus: "DA Co-op Member" as const,
      cropName: "Cabbage",
      variety: "Kyoto Highland Cabbage",
      category: "Vegetables",
      quantityAvailableKg: 1200,
      originalQuantityKg: 1200,
      unit: "kg",
      askingPricePhpKg: 70,
      qualityGrade: "Export Quality" as const,
      harvestDate: today,
      availableDate: today,
      description: "Crisp and heavy highland Kyoto heads grown organically in La Trinidad Valley. Ideal for trading posts and institutional buyers.",
      region: "CAR",
      province: "Benguet",
      municipality: "La Trinidad",
      barangay: "Barangay Puguis",
      latitude: 16.4550,
      longitude: 120.5875,
      deliveryOptions: ["Farm Gate Pickup", "Regional Trucking"],
      photoUrls: [
        "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=800&q=80",
      ],
      status: "active" as const,
    },
    {
      id: "mkt_3",
      listingId: "LST-1003",
      sellerId: "SLR-103",
      sellerName: "Aling Teresa Ramos",
      sellerPhone: "+63 908 123 4567",
      sellerFarmName: "Central Luzon Bulb Growers",
      sellerRating: 4.7,
      verificationStatus: "Verified Farmer" as const,
      cropName: "Onion",
      variety: "Red Pinoy (Red Bulb)",
      category: "Vegetables",
      quantityAvailableKg: 500,
      originalQuantityKg: 600,
      unit: "kg",
      askingPricePhpKg: 115,
      qualityGrade: "Grade A" as const,
      harvestDate: today,
      availableDate: today,
      description: "Dry, sun-cured Red Pinoy onions. Pungent aroma, firm skin, long shelf life.",
      region: "Region III - Central Luzon",
      province: "Nueva Ecija",
      municipality: "Cabanatuan City",
      barangay: "Barangay Valdefuente",
      latitude: 15.4865,
      longitude: 120.9734,
      deliveryOptions: ["Farm Gate Pickup", "Local Delivery"],
      photoUrls: [
        "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cf?auto=format&fit=crop&w=800&q=80",
      ],
      status: "active" as const,
    },
    {
      id: "mkt_4",
      listingId: "LST-1004",
      sellerId: "SLR-104",
      sellerName: "Davao Fruit Valley Agri",
      sellerPhone: "+63 928 444 9876",
      sellerFarmName: "Davao Mango Orchards",
      sellerRating: 4.85,
      verificationStatus: "Premium Seller" as const,
      cropName: "Mango",
      variety: "Carabao Sweet Mango",
      category: "Fruits",
      quantityAvailableKg: 750,
      originalQuantityKg: 750,
      unit: "kg",
      askingPricePhpKg: 112,
      qualityGrade: "Grade A" as const,
      harvestDate: tomorrow,
      availableDate: tomorrow,
      description: "Naturally ripened Davao Carabao mangoes. High Brix sweetness, smooth fiberless texture.",
      region: "Region XI - Davao",
      province: "Davao del Sur",
      municipality: "Davao City",
      barangay: "Calinan",
      latitude: 7.1907,
      longitude: 125.4553,
      deliveryOptions: ["Farm Gate Pickup", "Local Delivery", "Air Freight"],
      photoUrls: [
        "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=800&q=80",
      ],
      status: "active" as const,
    },
    {
      id: "mkt_5",
      listingId: "LST-1005",
      sellerId: "SLR-105",
      sellerName: "Noli & Family Farms",
      sellerPhone: "+63 919 777 2233",
      sellerFarmName: "Agusan Agri Cooperative",
      sellerRating: 4.8,
      verificationStatus: "DA Co-op Member" as const,
      cropName: "Tomato",
      variety: "Diamante Max Tomatoes",
      category: "Vegetables",
      quantityAvailableKg: 350,
      originalQuantityKg: 400,
      unit: "kg",
      askingPricePhpKg: 60,
      qualityGrade: "Grade A" as const,
      harvestDate: today,
      availableDate: today,
      description: "Firm, thick-skinned Diamante Max tomatoes. Excellent red color and extended transit durability.",
      region: "Region XIII - CARAGA",
      province: "Agusan del Norte",
      municipality: "Cabadbaran City",
      barangay: "Barangay Bay-ang",
      latitude: 9.1233,
      longitude: 125.5342,
      deliveryOptions: ["Farm Gate Pickup", "Local Delivery"],
      photoUrls: [
        "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80",
      ],
      status: "active" as const,
    },
    {
      id: "mkt_6",
      listingId: "LST-1006",
      sellerId: "SLR-106",
      sellerName: "Bukidnon Grain Traders",
      sellerPhone: "+63 922 999 1122",
      sellerFarmName: "Bukidnon High Plains Corn Farm",
      sellerRating: 4.92,
      verificationStatus: "Verified Farmer" as const,
      cropName: "Corn – Yellow",
      variety: "Pioneer Hybrid Yellow Corn",
      category: "Grains & Staples",
      quantityAvailableKg: 2000,
      originalQuantityKg: 2000,
      unit: "kg",
      askingPricePhpKg: 30,
      qualityGrade: "Grade A" as const,
      harvestDate: today,
      availableDate: today,
      description: "Low moisture content (14% MC) yellow corn grain. High kernel weight, ideal for feed mills or grain traders.",
      region: "Region X - Northern Mindanao",
      province: "Bukidnon",
      municipality: "Malaybalay City",
      barangay: "Barangay Casisang",
      latitude: 8.1575,
      longitude: 125.1278,
      deliveryOptions: ["Farm Gate Pickup", "Regional Trucking"],
      photoUrls: [
        "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=800&q=80",
      ],
      status: "active" as const,
    },
  ];

  for (const item of seeds) {
    // Calculate DA Reference price dynamically for the listing location
    const daStats = calculatePriceStatistics(item.cropName, item.region);
    const daRef = daStats.currentPrice > 0 ? daStats.currentPrice : item.askingPricePhpKg;
    const diffPct = Math.round(((item.askingPricePhpKg - daRef) / daRef) * 1000) / 10;

    const fullListing: MarketplaceListingData = {
      ...item,
      daReferencePricePhpKg: daRef,
      priceDifferencePct: diffPct,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    listingsStore.set(fullListing.listingId, fullListing);
  }

  if (ordersStore.size === 0) {
    const sampleOrders: MarketplaceOrderData[] = [
      {
        id: "ord_101",
        orderId: "ORD-2026-001",
        listingId: "LST-1001",
        sellerId: "SLR-101",
        sellerName: "Mang Danilo Agripino",
        buyerName: "Juan Dela Cruz",
        buyerContact: "+63 917 111 2233",
        buyerLocation: "Butuan City, Agusan del Norte",
        cropName: "Rice",
        variety: "Dinorado (Well-Milled)",
        quantityKg: 150,
        agreedPricePhpKg: 48,
        totalAmountPhp: 7200,
        deliveryMethod: "Local Delivery",
        status: "In delivery",
        orderType: "direct_buy",
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: "ord_102",
        orderId: "ORD-2026-002",
        listingId: "LST-1005",
        sellerId: "SLR-105",
        sellerName: "Noli & Family Farms",
        buyerName: "Juan Dela Cruz",
        buyerContact: "+63 917 111 2233",
        buyerLocation: "Butuan City, Agusan del Norte",
        cropName: "Tomato",
        variety: "Diamante Max Tomatoes",
        quantityKg: 50,
        agreedPricePhpKg: 60,
        totalAmountPhp: 3000,
        deliveryMethod: "Farm Gate Pickup",
        status: "Confirmed",
        orderType: "direct_buy",
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 43200000).toISOString(),
      },
    ];
    for (const ord of sampleOrders) {
      ordersStore.set(ord.orderId, ord);
    }
  }
}

// Seed upon module load if enabled
seedMarketplaceListings();

/**
 * Get active marketplace listings with rich filtering, search, sorting, and distance calculation
 */
export function getMarketplaceListings(params: {
  cropName?: string;
  variety?: string;
  category?: string;
  region?: string;
  province?: string;
  qualityGrade?: string;
  minPrice?: number;
  maxPrice?: number;
  minQuantity?: number;
  buyerLocation?: string;
  maxDistanceKm?: number;
  search?: string;
  sortBy?: "newest" | "price_asc" | "price_desc" | "distance" | "quantity";
}): (MarketplaceListingData & { distanceKm: number })[] {
  seedMarketplaceListings();

  let results: (MarketplaceListingData & { distanceKm: number })[] = [];

  const buyerLoc = params.buyerLocation || "Butuan City, Agusan del Norte";

  for (const listing of listingsStore.values()) {
    if (listing.status !== "active") continue;

    // Filters
    if (params.cropName && !listing.cropName.toLowerCase().includes(params.cropName.toLowerCase())) continue;
    if (params.category && params.category !== "all" && listing.category.toLowerCase() !== params.category.toLowerCase()) continue;
    if (params.variety && !listing.variety.toLowerCase().includes(params.variety.toLowerCase())) continue;
    if (params.region && !listing.region.toLowerCase().includes(params.region.toLowerCase())) continue;
    if (params.province && !listing.province.toLowerCase().includes(params.province.toLowerCase())) continue;
    if (params.qualityGrade && params.qualityGrade !== "all" && listing.qualityGrade !== params.qualityGrade) continue;
    if (params.minPrice && listing.askingPricePhpKg < params.minPrice) continue;
    if (params.maxPrice && listing.askingPricePhpKg > params.maxPrice) continue;
    if (params.minQuantity && listing.quantityAvailableKg < params.minQuantity) continue;

    if (params.search) {
      const q = params.search.toLowerCase();
      const match =
        listing.cropName.toLowerCase().includes(q) ||
        listing.variety.toLowerCase().includes(q) ||
        listing.sellerName.toLowerCase().includes(q) ||
        listing.province.toLowerCase().includes(q) ||
        listing.municipality.toLowerCase().includes(q) ||
        listing.description.toLowerCase().includes(q);
      if (!match) continue;
    }

    const dist = getApproxDistanceToBuyer(listing, buyerLoc);
    if (params.maxDistanceKm && dist > params.maxDistanceKm) continue;

    results.push({
      ...listing,
      distanceKm: dist,
    });
  }

  // Sorting
  const sortBy = params.sortBy || "newest";
  results.sort((a, b) => {
    if (sortBy === "price_asc") return a.askingPricePhpKg - b.askingPricePhpKg;
    if (sortBy === "price_desc") return b.askingPricePhpKg - a.askingPricePhpKg;
    if (sortBy === "distance") return a.distanceKm - b.distanceKm;
    if (sortBy === "quantity") return b.quantityAvailableKg - a.quantityAvailableKg;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); // newest
  });

  return results;
}

/**
 * Get a single listing by listingId with fresh DA reference price update
 */
export function getMarketplaceListingById(
  listingId: string,
  buyerLocation?: string
): (MarketplaceListingData & { distanceKm: number }) | null {
  seedMarketplaceListings();

  const listing = listingsStore.get(listingId);
  if (!listing) return null;

  // Refresh DA price
  const daStats = calculatePriceStatistics(listing.cropName, listing.region);
  const daRef = daStats.currentPrice > 0 ? daStats.currentPrice : listing.askingPricePhpKg;
  const diffPct = Math.round(((listing.askingPricePhpKg - daRef) / daRef) * 1000) / 10;

  listing.daReferencePricePhpKg = daRef;
  listing.priceDifferencePct = diffPct;

  const dist = getApproxDistanceToBuyer(listing, buyerLocation || "Butuan City, Agusan del Norte");

  return {
    ...listing,
    distanceKm: dist,
  };
}

/**
 * Create a new farmer listing
 */
export function createMarketplaceListing(data: {
  sellerId?: string;
  sellerName: string;
  sellerPhone: string;
  sellerFarmName?: string;
  cropName: string;
  variety: string;
  category: string;
  quantityAvailableKg: number;
  unit?: string;
  askingPricePhpKg: number;
  qualityGrade?: "Grade A" | "Grade B" | "Organic" | "Export Quality" | "Standard";
  harvestDate?: string;
  availableDate?: string;
  description?: string;
  region: string;
  province: string;
  municipality: string;
  barangay?: string;
  latitude?: number;
  longitude?: number;
  deliveryOptions?: string[];
  photoUrls?: string[];
}): MarketplaceListingData {
  if (data.quantityAvailableKg <= 0) {
    throw new Error("Quantity available must be greater than zero");
  }
  if (data.askingPricePhpKg <= 0) {
    throw new Error("Asking price must be greater than zero");
  }

  const listingId = `LST-${1000 + listingsStore.size + 1}`;
  const sellerId = data.sellerId || `SLR-${Math.floor(100 + Math.random() * 900)}`;

  // Fetch DA reference price
  const daStats = calculatePriceStatistics(data.cropName, data.region);
  const daRef = daStats.currentPrice > 0 ? daStats.currentPrice : data.askingPricePhpKg;
  const diffPct = Math.round(((data.askingPricePhpKg - daRef) / daRef) * 1000) / 10;

  // Coords lookup fallback
  const locKey = `${data.municipality}, ${data.province}`;
  const coords = PH_COORDINATES[locKey] || { lat: data.latitude || 8.9475, lng: data.longitude || 125.5406 };

  const today = new Date().toISOString().split("T")[0];

  const newListing: MarketplaceListingData = {
    id: `mkt_${Date.now()}`,
    listingId,
    sellerId,
    sellerName: data.sellerName,
    sellerPhone: data.sellerPhone,
    sellerFarmName: data.sellerFarmName || `${data.sellerName}'s Farm`,
    sellerRating: 5.0,
    verificationStatus: "Verified Farmer",
    cropName: data.cropName,
    variety: data.variety || "Standard Variety",
    category: data.category || "Vegetables",
    quantityAvailableKg: data.quantityAvailableKg,
    originalQuantityKg: data.quantityAvailableKg,
    unit: data.unit || "kg",
    askingPricePhpKg: data.askingPricePhpKg,
    daReferencePricePhpKg: daRef,
    priceDifferencePct: diffPct,
    qualityGrade: data.qualityGrade || "Grade A",
    harvestDate: data.harvestDate || today,
    availableDate: data.availableDate || today,
    description: data.description || `Fresh ${data.variety} ${data.cropName} harvested directly from ${data.municipality}, ${data.province}.`,
    region: data.region,
    province: data.province,
    municipality: data.municipality,
    barangay: data.barangay || "",
    latitude: coords.lat,
    longitude: coords.lng,
    deliveryOptions: data.deliveryOptions || ["Farm Gate Pickup", "Local Delivery"],
    photoUrls: data.photoUrls || ["https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80"],
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  listingsStore.set(listingId, newListing);
  return newListing;
}

/**
 * Edit or update an existing listing
 */
export function updateMarketplaceListing(
  listingId: string,
  updates: Partial<MarketplaceListingData>
): MarketplaceListingData {
  const listing = listingsStore.get(listingId);
  if (!listing) {
    throw new Error(`Listing ${listingId} not found`);
  }

  if (updates.askingPricePhpKg !== undefined && updates.askingPricePhpKg <= 0) {
    throw new Error("Asking price must be greater than zero");
  }
  if (updates.quantityAvailableKg !== undefined && updates.quantityAvailableKg < 0) {
    throw new Error("Quantity cannot be negative");
  }

  const updated: MarketplaceListingData = {
    ...listing,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  // Recalculate DA difference if price updated
  if (updates.askingPricePhpKg || updates.cropName || updates.region) {
    const daStats = calculatePriceStatistics(updated.cropName, updated.region);
    const daRef = daStats.currentPrice > 0 ? daStats.currentPrice : updated.askingPricePhpKg;
    updated.daReferencePricePhpKg = daRef;
    updated.priceDifferencePct = Math.round(((updated.askingPricePhpKg - daRef) / daRef) * 1000) / 10;
  }

  listingsStore.set(listingId, updated);
  return updated;
}

/**
 * SERVER-SIDE RULE 1: Minimum Allowed Buyer Offer = DA_reference_price * 0.90
 */
export function calculateMinAllowedOffer(daReferencePrice: number): number {
  if (!daReferencePrice || daReferencePrice <= 0) return 0;
  return Math.round(daReferencePrice * 0.90 * 100) / 100;
}

/**
 * Create a buyer offer with strict server-side 10% rule validation
 */
export function createBuyerOffer(data: {
  listingId: string;
  buyerName: string;
  buyerContact: string;
  buyerLocation: string;
  quantityKg: number;
  offeredPricePhpKg: number;
  notes?: string;
}): { offer: MarketplaceOfferData; listing: MarketplaceListingData } {
  const listing = listingsStore.get(data.listingId);
  if (!listing) {
    throw new Error("Listing not found");
  }

  if (listing.status !== "active" || listing.quantityAvailableKg <= 0) {
    throw new Error("This listing is no longer active or out of stock");
  }

  if (data.quantityKg <= 0) {
    throw new Error("Requested quantity must be greater than zero");
  }

  if (data.quantityKg > listing.quantityAvailableKg) {
    throw new Error(`Requested quantity (${data.quantityKg} kg) exceeds available inventory (${listing.quantityAvailableKg} kg)`);
  }

  // Fetch DA Reference Price
  const daStats = calculatePriceStatistics(listing.cropName, listing.region);
  const daRef = daStats.currentPrice > 0 ? daStats.currentPrice : listing.daReferencePricePhpKg;

  if (!daRef || daRef <= 0) {
    throw new Error("DA reference price unavailable. Offers are temporarily unavailable.");
  }

  // SERVER-SIDE 10% RULE CHECK
  const minAllowedOffer = calculateMinAllowedOffer(daRef);

  if (data.offeredPricePhpKg < minAllowedOffer) {
    throw new Error(
      `Offered price ₱${data.offeredPricePhpKg}/kg is below the minimum allowed offer ₱${minAllowedOffer}/kg (90% of DA reference price ₱${daRef}/kg). Offers lower than 10% below the DA benchmark are not permitted.`
    );
  }

  const offerId = `OFR-${2000 + offersStore.size + 1}`;
  const totalAmountPhp = Math.round(data.offeredPricePhpKg * data.quantityKg * 100) / 100;

  const newOffer: MarketplaceOfferData = {
    id: `ofr_${Date.now()}`,
    offerId,
    listingId: data.listingId,
    sellerId: listing.sellerId,
    buyerName: data.buyerName,
    buyerContact: data.buyerContact,
    buyerLocation: data.buyerLocation,
    cropName: listing.cropName,
    quantityKg: data.quantityKg,
    offeredPricePhpKg: data.offeredPricePhpKg,
    daReferencePricePhpKg: daRef,
    minAllowedOfferPhpKg: minAllowedOffer,
    totalAmountPhp,
    notes: data.notes || "",
    status: "Pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  offersStore.set(offerId, newOffer);
  return { offer: newOffer, listing };
}

/**
 * Handle Farmer Response to an Offer (Accept / Reject)
 * If accepted: reserves stock from listing inventory and generates a confirmed order!
 */
export function respondToBuyerOffer(
  offerId: string,
  action: "accept" | "reject"
): { offer: MarketplaceOfferData; order?: MarketplaceOrderData; listing?: MarketplaceListingData } {
  const offer = offersStore.get(offerId);
  if (!offer) {
    throw new Error("Offer not found");
  }

  if (offer.status !== "Pending") {
    throw new Error(`Offer has already been ${offer.status.toLowerCase()}`);
  }

  const listing = listingsStore.get(offer.listingId);
  if (!listing) {
    throw new Error("Listing associated with this offer was not found");
  }

  if (action === "reject") {
    offer.status = "Rejected";
    offer.updatedAt = new Date().toISOString();
    offersStore.set(offerId, offer);
    return { offer };
  }

  // ACTION === ACCEPT
  // Check inventory stock reservation rule
  if (offer.quantityKg > listing.quantityAvailableKg) {
    throw new Error(`Cannot accept offer: Available stock (${listing.quantityAvailableKg} kg) is less than requested offer quantity (${offer.quantityKg} kg)`);
  }

  // Reserve stock from listing
  listing.quantityAvailableKg = Math.round((listing.quantityAvailableKg - offer.quantityKg) * 10) / 10;
  if (listing.quantityAvailableKg <= 0) {
    listing.quantityAvailableKg = 0;
    listing.status = "sold_out";
  }
  listing.updatedAt = new Date().toISOString();
  listingsStore.set(listing.listingId, listing);

  // Mark offer accepted
  offer.status = "Accepted";
  offer.updatedAt = new Date().toISOString();
  offersStore.set(offerId, offer);

  // Generate confirmed order
  const orderId = `ORD-${3000 + ordersStore.size + 1}`;
  const newOrder: MarketplaceOrderData = {
    id: `ord_${Date.now()}`,
    orderId,
    listingId: listing.listingId,
    sellerId: listing.sellerId,
    sellerName: listing.sellerName,
    buyerName: offer.buyerName,
    buyerContact: offer.buyerContact,
    buyerLocation: offer.buyerLocation,
    cropName: listing.cropName,
    variety: listing.variety,
    quantityKg: offer.quantityKg,
    agreedPricePhpKg: offer.offeredPricePhpKg,
    totalAmountPhp: offer.totalAmountPhp,
    deliveryMethod: listing.deliveryOptions[0] || "Farm Gate Pickup",
    status: "Confirmed",
    orderType: "offer_accepted",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  ordersStore.set(orderId, newOrder);
  return { offer, order: newOrder, listing };
}

/**
 * Direct "Buy Now" Purchase Order with automatic stock reservation
 */
export function createDirectOrder(data: {
  listingId: string;
  buyerName: string;
  buyerContact: string;
  buyerLocation: string;
  quantityKg: number;
  deliveryMethod?: string;
}): { order: MarketplaceOrderData; listing: MarketplaceListingData } {
  const listing = listingsStore.get(data.listingId);
  if (!listing) {
    throw new Error("Listing not found");
  }

  if (listing.status !== "active" || listing.quantityAvailableKg <= 0) {
    throw new Error("This listing is no longer active or out of stock");
  }

  if (data.quantityKg <= 0) {
    throw new Error("Quantity must be greater than zero");
  }

  if (data.quantityKg > listing.quantityAvailableKg) {
    throw new Error(`Requested quantity (${data.quantityKg} kg) exceeds available stock (${listing.quantityAvailableKg} kg)`);
  }

  // Deduct inventory stock immediately for direct buy
  listing.quantityAvailableKg = Math.round((listing.quantityAvailableKg - data.quantityKg) * 10) / 10;
  if (listing.quantityAvailableKg <= 0) {
    listing.quantityAvailableKg = 0;
    listing.status = "sold_out";
  }
  listing.updatedAt = new Date().toISOString();
  listingsStore.set(listing.listingId, listing);

  const orderId = `ORD-${3000 + ordersStore.size + 1}`;
  const totalAmountPhp = Math.round(listing.askingPricePhpKg * data.quantityKg * 100) / 100;

  const newOrder: MarketplaceOrderData = {
    id: `ord_${Date.now()}`,
    orderId,
    listingId: listing.listingId,
    sellerId: listing.sellerId,
    sellerName: listing.sellerName,
    buyerName: data.buyerName,
    buyerContact: data.buyerContact,
    buyerLocation: data.buyerLocation,
    cropName: listing.cropName,
    variety: listing.variety,
    quantityKg: data.quantityKg,
    agreedPricePhpKg: listing.askingPricePhpKg,
    totalAmountPhp,
    deliveryMethod: data.deliveryMethod || listing.deliveryOptions[0] || "Farm Gate Pickup",
    status: "Confirmed",
    orderType: "direct_buy",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  ordersStore.set(orderId, newOrder);
  return { order: newOrder, listing };
}

/**
 * Update Order Workflow Status
 */
export function updateOrderStatus(
  orderId: string,
  newStatus: MarketplaceOrderData["status"]
): MarketplaceOrderData {
  const order = ordersStore.get(orderId);
  if (!order) {
    throw new Error("Order not found");
  }

  // If order cancelled and was previously confirmed/accepted, restore stock to listing
  if (newStatus === "Cancelled" && order.status !== "Cancelled" && order.status !== "Completed") {
    const listing = listingsStore.get(order.listingId);
    if (listing) {
      listing.quantityAvailableKg = Math.round((listing.quantityAvailableKg + order.quantityKg) * 10) / 10;
      if (listing.status === "sold_out" && listing.quantityAvailableKg > 0) {
        listing.status = "active";
      }
      listing.updatedAt = new Date().toISOString();
      listingsStore.set(listing.listingId, listing);
    }
  }

  order.status = newStatus;
  order.updatedAt = new Date().toISOString();
  ordersStore.set(orderId, order);
  return order;
}

/**
 * Get Orders for Farmer or Buyer
 */
export function getOrders(params: { sellerId?: string; buyerName?: string }): MarketplaceOrderData[] {
  const results: MarketplaceOrderData[] = [];
  for (const ord of ordersStore.values()) {
    if (params.sellerId && params.sellerId !== "all" && ord.sellerId !== params.sellerId) continue;
    if (params.buyerName && params.buyerName !== "all" && !ord.buyerName.toLowerCase().includes(params.buyerName.toLowerCase())) continue;
    results.push(ord);
  }
  return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/**
 * Get Offers for Farmer or Buyer
 */
export function getOffers(params: { sellerId?: string; listingId?: string; buyerName?: string }): MarketplaceOfferData[] {
  const results: MarketplaceOfferData[] = [];
  for (const ofr of offersStore.values()) {
    if (params.sellerId && params.sellerId !== "all" && ofr.sellerId !== params.sellerId) continue;
    if (params.listingId && ofr.listingId !== params.listingId) continue;
    if (params.buyerName && params.buyerName !== "all" && !ofr.buyerName.toLowerCase().includes(params.buyerName.toLowerCase())) continue;
    results.push(ofr);
  }
  return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/**
 * Farmer Dashboard Analytics
 */
export function getFarmerDashboardData(sellerId: string = "all") {
  seedMarketplaceListings();

  const farmerListings: MarketplaceListingData[] = [];
  for (const lst of listingsStore.values()) {
    if (lst.sellerId === sellerId || sellerId === "all") {
      farmerListings.push(lst);
    }
  }

  const farmerOrders = getOrders({ sellerId: sellerId === "all" ? undefined : sellerId });
  const farmerOffers = getOffers({ sellerId: sellerId === "all" ? undefined : sellerId });

  const activeListings = farmerListings.filter((l) => l.status === "active");
  const totalAvailableKg = activeListings.reduce((sum, l) => sum + l.quantityAvailableKg, 0);

  const pendingOffers = farmerOffers.filter((o) => o.status === "Pending");
  const completedOrders = farmerOrders.filter((o) => o.status === "Completed" || o.status === "Confirmed");

  const totalRevenuePhp = completedOrders.reduce((sum, o) => sum + o.totalAmountPhp, 0);

  // Price comparison vs DA market price across active listings
  const priceComparisons = activeListings.map((l) => {
    const daStats = calculatePriceStatistics(l.cropName, l.region);
    const daPrice = daStats.currentPrice > 0 ? daStats.currentPrice : l.daReferencePricePhpKg;
    const diff = Math.round(((l.askingPricePhpKg - daPrice) / daPrice) * 1000) / 10;
    return {
      listingId: l.listingId,
      cropName: l.cropName,
      variety: l.variety,
      askingPrice: l.askingPricePhpKg,
      daReferencePrice: daPrice,
      differencePercent: diff,
      status: diff < 0 ? "Cheaper than DA" : diff > 0 ? "Above DA Reference" : "Matches DA",
    };
  });

  return {
    sellerId,
    activeListingsCount: activeListings.length,
    totalAvailableKg,
    pendingOffersCount: pendingOffers.length,
    completedOrdersCount: completedOrders.length,
    totalRevenuePhp,
    activeListings,
    pendingOffers,
    recentOrders: farmerOrders.slice(0, 5),
    priceComparisons,
  };
}

/**
 * Buyer Dashboard Analytics
 */
export function getBuyerDashboardData(buyerName: string = "Valued Buyer") {
  seedMarketplaceListings();

  const buyerOrders = getOrders({ buyerName });
  const buyerOffers = getOffers({ buyerName });

  const activeOrders = buyerOrders.filter((o) => o.status !== "Completed" && o.status !== "Cancelled");
  const pendingOffers = buyerOffers.filter((o) => o.status === "Pending");

  // Saved / Favorite listings
  const savedListings: MarketplaceListingData[] = [];
  for (const id of favoritesStore) {
    const lst = listingsStore.get(id);
    if (lst) savedListings.push(lst);
  }

  // Nearby farmers
  const nearbyListings = getMarketplaceListings({ sortBy: "distance" }).slice(0, 4);

  return {
    buyerName,
    activeOrdersCount: activeOrders.length,
    pendingOffersCount: pendingOffers.length,
    savedListingsCount: savedListings.length,
    orders: buyerOrders,
    offers: buyerOffers,
    savedListings,
    nearbyListings,
  };
}

/**
 * Toggle Favorites
 */
export function toggleFavorite(listingId: string): boolean {
  if (favoritesStore.has(listingId)) {
    favoritesStore.delete(listingId);
    return false;
  } else {
    favoritesStore.add(listingId);
    return true;
  }
}

export function isFavorite(listingId: string): boolean {
  return favoritesStore.has(listingId);
}
