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
  sellerReviewCount?: number;
  verificationStatus: "Verified Farmer" | "DA Co-op Member" | "Premium Seller" | "Unverified";
  cropName: string;
  cropImageUrl: string; // Standard plant/crop identification image
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
  streetAddress?: string;
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
  buyerBarangay?: string;
  buyerStreetAddress?: string;
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

export interface MarketplaceReviewData {
  id: string;
  reviewId: string;
  orderId: string;
  listingId: string;
  sellerId: string;
  sellerName: string;
  buyerName: string;
  cropName: string;
  variety: string;
  rating: number; // 1 to 5 stars
  productQualityRating?: number;
  sellerExperienceRating?: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Standard Crop Identification Image Mapping
 * Deterministically returns the standard plant/crop identification image based on the selected crop.
 */
export function getCropStandardImage(cropName: string): string {
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

// In-memory data store for real authenticated marketplace listings
const listingsStore: Map<string, MarketplaceListingData> = new Map();
const ordersStore: Map<string, MarketplaceOrderData> = new Map();
const offersStore: Map<string, MarketplaceOfferData> = new Map();
const reviewsStore: Map<string, MarketplaceReviewData> = new Map();
const favoritesStore: Set<string> = new Set(); // store favorite listingIds

/**
 * Get active marketplace listings with rich filtering, search, sorting, and distance calculation
 */
export function getMarketplaceListings(params: {
  sellerId?: string;
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
  let results: (MarketplaceListingData & { distanceKm: number })[] = [];

  const buyerLoc = params.buyerLocation || "Davao Oriental";

  for (const listing of listingsStore.values()) {
    if (listing.status !== "active") continue;

    // Ensure cropImageUrl matches standard crop image
    listing.cropImageUrl = getCropStandardImage(listing.cropName);

    // Sync rating summary from reviews
    const summary = getSellerRatingSummary(listing.sellerId);
    if (summary.totalReviews > 0) {
      listing.sellerRating = summary.averageRating;
      listing.sellerReviewCount = summary.totalReviews;
    } else {
      listing.sellerReviewCount = 0;
    }

    // Filters
    if (params.sellerId && params.sellerId !== "all" && listing.sellerId !== params.sellerId) continue;
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
  const listing = listingsStore.get(listingId);
  if (!listing) return null;

  // Refresh DA price & crop image
  const daStats = calculatePriceStatistics(listing.cropName, listing.region);
  const daRef = daStats.currentPrice > 0 ? daStats.currentPrice : listing.askingPricePhpKg;
  const diffPct = Math.round(((listing.askingPricePhpKg - daRef) / daRef) * 1000) / 10;

  listing.daReferencePricePhpKg = daRef;
  listing.priceDifferencePct = diffPct;
  listing.cropImageUrl = getCropStandardImage(listing.cropName);

  // Sync rating summary
  const summary = getSellerRatingSummary(listing.sellerId);
  if (summary.totalReviews > 0) {
    listing.sellerRating = summary.averageRating;
    listing.sellerReviewCount = summary.totalReviews;
  } else {
    listing.sellerReviewCount = 0;
  }

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
  streetAddress?: string;
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
    cropImageUrl: getCropStandardImage(data.cropName),
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
    streetAddress: data.streetAddress || "",
    latitude: coords.lat,
    longitude: coords.lng,
    deliveryOptions: data.deliveryOptions || ["Farm Gate Pickup", "Local Delivery"],
    photoUrls: data.photoUrls || [],
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
 * Delete / Remove a marketplace listing
 */
export function deleteMarketplaceListing(listingId: string): boolean {
  return listingsStore.delete(listingId);
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
  buyerBarangay?: string;
  buyerStreetAddress?: string;
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
    buyerBarangay: data.buyerBarangay || "",
    buyerStreetAddress: data.buyerStreetAddress || "",
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

/**
 * REVIEWS & RATINGS ENGINE
 */

export function createOrUpdateReview(data: {
  orderId: string;
  buyerName: string;
  rating: number;
  productQualityRating?: number;
  sellerExperienceRating?: number;
  comment: string;
}): MarketplaceReviewData {
  const order = ordersStore.get(data.orderId);
  if (!order) {
    throw new Error("Order not found. You can only review verified completed purchases.");
  }

  // Validate buyer name matches order buyer
  if (data.buyerName && order.buyerName.trim().toLowerCase() !== data.buyerName.trim().toLowerCase()) {
    throw new Error("You can only submit reviews for orders that you purchased.");
  }

  // Valid order status for review
  const validReviewStatuses = ["Completed", "Confirmed", "In delivery", "Preparing", "Ready for pickup"];
  if (!validReviewStatuses.includes(order.status)) {
    throw new Error(`Cannot review order with status "${order.status}". Only verified purchased orders can be reviewed.`);
  }

  if (data.rating < 1 || data.rating > 5) {
    throw new Error("Rating must be between 1 and 5 stars.");
  }

  // Check if review already exists for this orderId
  let existingReview: MarketplaceReviewData | undefined;
  for (const rev of reviewsStore.values()) {
    if (rev.orderId === data.orderId) {
      existingReview = rev;
      break;
    }
  }

  const now = new Date().toISOString();
  let review: MarketplaceReviewData;

  if (existingReview) {
    review = {
      ...existingReview,
      rating: data.rating,
      productQualityRating: data.productQualityRating || data.rating,
      sellerExperienceRating: data.sellerExperienceRating || data.rating,
      comment: data.comment,
      updatedAt: now,
    };
  } else {
    const reviewId = `REV-${1000 + reviewsStore.size + 1}`;
    review = {
      id: `rev_${Date.now()}`,
      reviewId,
      orderId: order.orderId,
      listingId: order.listingId,
      sellerId: order.sellerId,
      sellerName: order.sellerName,
      buyerName: order.buyerName,
      cropName: order.cropName,
      variety: order.variety || "",
      rating: data.rating,
      productQualityRating: data.productQualityRating || data.rating,
      sellerExperienceRating: data.sellerExperienceRating || data.rating,
      comment: data.comment,
      createdAt: now,
      updatedAt: now,
    };
  }

  reviewsStore.set(review.reviewId, review);

  // Recalculate seller rating across all listings
  updateSellerRatingFromReviews(order.sellerId);

  return review;
}

export function updateSellerRatingFromReviews(sellerId: string): number {
  const sellerReviews: MarketplaceReviewData[] = [];
  for (const r of reviewsStore.values()) {
    if (r.sellerId === sellerId) {
      sellerReviews.push(r);
    }
  }

  if (sellerReviews.length === 0) return 0;

  const total = sellerReviews.reduce((sum, r) => sum + r.rating, 0);
  const avg = Math.round((total / sellerReviews.length) * 10) / 10;

  // Update sellerRating and sellerReviewCount on all active listings of this seller
  for (const listing of listingsStore.values()) {
    if (listing.sellerId === sellerId) {
      listing.sellerRating = avg;
      listing.sellerReviewCount = sellerReviews.length;
    }
  }

  return avg;
}

export function getReviews(params: {
  sellerId?: string;
  listingId?: string;
  orderId?: string;
  buyerName?: string;
}): MarketplaceReviewData[] {
  const results: MarketplaceReviewData[] = [];
  for (const r of reviewsStore.values()) {
    if (params.sellerId && params.sellerId !== "all" && r.sellerId !== params.sellerId) continue;
    if (params.listingId && r.listingId !== params.listingId) continue;
    if (params.orderId && r.orderId !== params.orderId) continue;
    if (params.buyerName && params.buyerName !== "all" && r.buyerName.toLowerCase() !== params.buyerName.toLowerCase()) continue;
    results.push(r);
  }
  return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getSellerRatingSummary(sellerId: string): { averageRating: number; totalReviews: number; reviews: MarketplaceReviewData[] } {
  const reviews = getReviews({ sellerId });
  if (reviews.length === 0) {
    return { averageRating: 0, totalReviews: 0, reviews: [] };
  }
  const total = reviews.reduce((sum, r) => sum + r.rating, 0);
  const averageRating = Math.round((total / reviews.length) * 10) / 10;
  return { averageRating, totalReviews: reviews.length, reviews };
}
