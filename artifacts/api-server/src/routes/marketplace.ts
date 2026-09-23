import { Router } from "express";
import { AI_MODELS, generateContentWithFallback } from "../lib/ai-config";
import { getCached, setCached, TTL } from "../lib/db-cache";
import {
  getMarketplaceListings,
  getMarketplaceListingById,
  createMarketplaceListing,
  updateMarketplaceListing,
  deleteMarketplaceListing,
  createBuyerOffer,
  respondToBuyerOffer,
  createDirectOrder,
  updateOrderStatus,
  getOrders,
  getOffers,
  getFarmerDashboardData,
  getBuyerDashboardData,
  toggleFavorite,
  isFavorite,
  calculateMinAllowedOffer,
  createOrUpdateReview,
  getReviews,
  getSellerRatingSummary,
  getCropStandardImage,
} from "../lib/marketplace-store";
import { calculatePriceStatistics } from "../lib/da-price-engine";

const router = Router();

/**
 * 1. GET /api/marketplace/listings
 */
router.get("/marketplace/listings", async (req, res) => {
  try {
    const cropName = (req.query.cropName || req.query.crop) as string;
    const variety = req.query.variety as string;
    const category = req.query.category as string;
    const region = req.query.region as string;
    const province = req.query.province as string;
    const qualityGrade = req.query.qualityGrade as string;
    const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined;
    const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined;
    const minQuantity = req.query.minQuantity ? parseFloat(req.query.minQuantity as string) : undefined;
    const buyerLocation = (req.query.buyerLocation || req.query.location) as string;
    const maxDistanceKm = req.query.maxDistanceKm ? parseFloat(req.query.maxDistanceKm as string) : undefined;
    const search = req.query.search as string;
    const sortBy = req.query.sortBy as any;

    const listings = getMarketplaceListings({
      cropName,
      variety,
      category,
      region,
      province,
      qualityGrade,
      minPrice,
      maxPrice,
      minQuantity,
      buyerLocation,
      maxDistanceKm,
      search,
      sortBy,
    });

    res.json(listings);
  } catch (err) {
    req.log?.error({ err }, "Error fetching marketplace listings");
    res.status(500).json({ error: "Failed to fetch marketplace listings" });
  }
});

/**
 * 2. GET /api/marketplace/listings/:id
 */
router.get("/marketplace/listings/:id", async (req, res) => {
  try {
    const listingId = req.params.id;
    const buyerLocation = (req.query.buyerLocation || req.query.location) as string;

    const listing = getMarketplaceListingById(listingId, buyerLocation);
    if (!listing) {
      res.status(404).json({ error: "Marketplace listing not found" });
      return;
    }

    const favorite = isFavorite(listingId);
    const minAllowedOffer = calculateMinAllowedOffer(listing.daReferencePricePhpKg);

    res.json({
      ...listing,
      isFavorite: favorite,
      minAllowedOfferPhpKg: minAllowedOffer,
    });
  } catch (err) {
    req.log?.error({ err }, "Error fetching listing details");
    res.status(500).json({ error: "Failed to fetch listing details" });
  }
});

/**
 * 3. POST /api/marketplace/listings
 */
router.post("/marketplace/listings", async (req, res) => {
  try {
    const body = req.body || {};
    
    // Auto fill defaults if fields are missing or empty
    const normalizedPayload = {
      ...body,
      sellerName: body.sellerName || "Authenticated Farmer",
      sellerPhone: body.sellerPhone || "+63 917 000 0000",
      sellerFarmName: body.sellerFarmName || `${body.sellerName || "Farmer"}'s Organic Farm`,
      cropName: body.cropName || "Rice",
      variety: body.variety || "Standard Harvest",
      category: body.category || "Grains & Staples",
      quantityAvailableKg: Number(body.quantityAvailableKg) || 100,
      askingPricePhpKg: Number(body.askingPricePhpKg) || 50,
      region: body.region || "Region XI - Davao Region",
      province: body.province || "Davao Oriental",
      municipality: body.municipality || "Mati City",
      barangay: body.barangay || "Central",
      streetAddress: body.streetAddress || "",
      description: body.description || "Fresh harvest ready for order.",
      deliveryOptions: Array.isArray(body.deliveryOptions) && body.deliveryOptions.length > 0 ? body.deliveryOptions : ["Farm Gate Pickup", "Local Delivery"],
      photoUrls: Array.isArray(body.photoUrls) && body.photoUrls.length > 0 ? body.photoUrls : ["https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80"],
    };

    const newListing = createMarketplaceListing(normalizedPayload);
    res.status(201).json(newListing);
  } catch (err: any) {
    req.log?.error({ err }, "Error creating marketplace listing");
    res.status(400).json({ error: err.message || "Failed to create listing" });
  }
});

/**
 * 4. PUT /api/marketplace/listings/:id
 */
router.put("/marketplace/listings/:id", async (req, res) => {
  try {
    const listingId = req.params.id;
    const updates = req.body;

    const updated = updateMarketplaceListing(listingId, updates);
    res.json(updated);
  } catch (err: any) {
    req.log?.error({ err }, "Error updating marketplace listing");
    res.status(400).json({ error: err.message || "Failed to update listing" });
  }
});

/**
 * 4b. DELETE /api/marketplace/listings/:id
 */
router.delete("/marketplace/listings/:id", async (req, res) => {
  try {
    const listingId = req.params.id;
    const deleted = deleteMarketplaceListing(listingId);
    if (!deleted) {
      res.status(404).json({ error: "Listing not found or already deleted" });
      return;
    }
    res.json({ success: true, listingId });
  } catch (err: any) {
    req.log?.error({ err }, "Error deleting marketplace listing");
    res.status(400).json({ error: err.message || "Failed to delete listing" });
  }
});

/**
 * 5. POST /api/marketplace/offers
 */
router.post("/marketplace/offers", async (req, res) => {
  try {
    const { listingId, buyerName, buyerContact, buyerLocation, quantityKg, offeredPricePhpKg, notes } = req.body;

    if (!listingId || !buyerName || !buyerContact || !quantityKg || !offeredPricePhpKg) {
      res.status(400).json({ error: "Missing required offer parameters" });
      return;
    }

    const result = createBuyerOffer({
      listingId,
      buyerName,
      buyerContact,
      buyerLocation: buyerLocation || "General Public",
      quantityKg: parseFloat(quantityKg),
      offeredPricePhpKg: parseFloat(offeredPricePhpKg),
      notes,
    });

    res.status(201).json(result);
  } catch (err: any) {
    req.log?.error({ err }, "Server-side offer validation rejected offer");
    res.status(400).json({ error: err.message || "Offer rejected by server validation rules" });
  }
});

/**
 * 6. PATCH /api/marketplace/offers/:id/respond
 */
router.patch("/marketplace/offers/:id/respond", async (req, res) => {
  try {
    const offerId = req.params.id;
    const { action } = req.body;

    if (action !== "accept" && action !== "reject") {
      res.status(400).json({ error: "Action must be 'accept' or 'reject'" });
      return;
    }

    const result = respondToBuyerOffer(offerId, action);
    res.json(result);
  } catch (err: any) {
    req.log?.error({ err }, "Error responding to buyer offer");
    res.status(400).json({ error: err.message || "Failed to respond to offer" });
  }
});

/**
 * 7. POST /api/marketplace/orders
 */
router.post("/marketplace/orders", async (req, res) => {
  try {
    const { listingId, buyerName, buyerContact, buyerLocation, buyerBarangay, buyerStreetAddress, quantityKg, deliveryMethod } = req.body;

    if (!listingId || !buyerName || !buyerContact || !quantityKg) {
      res.status(400).json({ error: "Missing required order parameters" });
      return;
    }

    const result = createDirectOrder({
      listingId,
      buyerName,
      buyerContact,
      buyerLocation: buyerLocation || "General Public",
      buyerBarangay,
      buyerStreetAddress,
      quantityKg: parseFloat(quantityKg),
      deliveryMethod,
    });

    res.status(201).json(result);
  } catch (err: any) {
    req.log?.error({ err }, "Error creating direct order");
    res.status(400).json({ error: err.message || "Failed to create order" });
  }
});

/**
 * 8. PATCH /api/marketplace/orders/:id/status
 */
router.patch("/marketplace/orders/:id/status", async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;

    if (!status) {
      res.status(400).json({ error: "Missing status field" });
      return;
    }

    const updatedOrder = updateOrderStatus(orderId, status);
    res.json(updatedOrder);
  } catch (err: any) {
    req.log?.error({ err }, "Error updating order status");
    res.status(400).json({ error: err.message || "Failed to update order status" });
  }
});

/**
 * 9. GET /api/marketplace/farmer-dashboard
 */
router.get("/marketplace/farmer-dashboard", async (req, res) => {
  try {
    const sellerId = (req.query.sellerId as string) || "all";
    const dash = getFarmerDashboardData(sellerId);
    res.json(dash);
  } catch (err) {
    req.log?.error({ err }, "Error fetching farmer dashboard");
    res.status(500).json({ error: "Failed to fetch farmer dashboard" });
  }
});

/**
 * 10. GET /api/marketplace/buyer-dashboard
 */
router.get("/marketplace/buyer-dashboard", async (req, res) => {
  try {
    const buyerName = (req.query.buyerName as string) || "Valued Buyer";
    const dash = getBuyerDashboardData(buyerName);
    res.json(dash);
  } catch (err) {
    req.log?.error({ err }, "Error fetching buyer dashboard");
    res.status(500).json({ error: "Failed to fetch buyer dashboard" });
  }
});

/**
 * 11. POST /api/marketplace/favorites/toggle
 */
router.post("/marketplace/favorites/toggle", async (req, res) => {
  try {
    const { listingId } = req.body;
    if (!listingId) {
      res.status(400).json({ error: "Missing listingId" });
      return;
    }

    const favored = toggleFavorite(listingId);
    res.json({ listingId, isFavorite: favored });
  } catch (err) {
    res.status(500).json({ error: "Failed to toggle favorite" });
  }
});

/**
 * 12. GET /api/marketplace/listings/:id/ai-analysis & /ai-eval
 */
async function handleListingAiAnalysis(req: any, res: any) {
  let listingId = "";
  let listing: any = null;
  let cacheKey = "";
  try {
    listingId = req.params.id;
    const buyerLocation = (req.query.buyerLocation as string) || "Butuan City, Agusan del Norte";

    listing = getMarketplaceListingById(listingId, buyerLocation);
    if (!listing) {
      res.status(404).json({ error: "Listing not found" });
      return;
    }

    const lang = (((req.query.lang || req.body?.lang) as string) || "en").toLowerCase() === "fil" ? "fil" : "en";
    cacheKey = `mkt_gemini_${listingId}_${listing.askingPricePhpKg}_${lang}`;
    const cached = await getCached<any>(cacheKey);
    if (cached) {
      res.json(cached);
      return;
    }

    const daStats = calculatePriceStatistics(listing.cropName, listing.region);
    const minOffer = calculateMinAllowedOffer(listing.daReferencePricePhpKg);

    const langInstruction = lang === "fil"
      ? "CRITICAL LANGUAGE RULE: Write priceAssessment, offerAdvice, farmerTip, and keyHighlights in natural, clear Filipino (Tagalog)."
      : "Write all string fields in clear English.";

    const prompt = `You are an expert Philippine agricultural economist and market advisor.

${langInstruction}

EVALUATE THIS FARMER MARKETPLACE LISTING:
Crop: ${listing.cropName} (${listing.variety})
Quality Grade: ${listing.qualityGrade}
Farmer Asking Price: ₱${listing.askingPricePhpKg}/${listing.unit}
Official DA Reference Price: ₱${listing.daReferencePricePhpKg}/${listing.unit}
Price Variance: ${listing.priceDifferencePct > 0 ? "+" : ""}${listing.priceDifferencePct}% vs DA Reference
Minimum Permitted Buyer Offer (10% Rule): ₱${minOffer}/${listing.unit}
Location: ${listing.municipality}, ${listing.province} (${listing.region})
Available Stock: ${listing.quantityAvailableKg} kg

TASK:
Provide a concise, professional market analysis JSON report containing:
1. "priceAssessment": A 2-sentence evaluation explaining whether the farmer's asking price is cheap, average, or premium compared to official DA Bantay Presyo benchmarks.
2. "offerAdvice": A 2-sentence advice for buyers on negotiating or making an offer within the permitted 10% rule (min ₱${minOffer}/${listing.unit}).
3. "farmerTip": A 1-sentence tip for the farmer to maximize sales or inventory movement.
4. "fairnessScore": "High" | "Fair" | "Premium"
5. "keyHighlights": 3 bullet points highlighting value factors (e.g. fresh harvest, DA certified co-op, direct farm-gate savings).

Respond ONLY with valid JSON matching these exact keys.`;

    const resp = await generateContentWithFallback({
      preferredModel: AI_MODELS.MARKETPLACE_EVAL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    const parsed = JSON.parse(resp.text ?? "{}");

    const analysis = {
      listingId,
      cropName: listing.cropName,
      farmerPrice: listing.askingPricePhpKg,
      daReferencePrice: listing.daReferencePricePhpKg,
      minAllowedOffer: minOffer,
      priceAssessment: parsed.priceAssessment || `The farmer's asking price of ₱${listing.askingPricePhpKg}/${listing.unit} is ${Math.abs(listing.priceDifferencePct)}% ${listing.priceDifferencePct >= 0 ? "above" : "below"} the official DA reference benchmark of ₱${listing.daReferencePricePhpKg}/${listing.unit}.`,
      offerAdvice: parsed.offerAdvice || `Buyers can submit offers starting from ₱${minOffer}/${listing.unit} (up to 10% below the DA reference price).`,
      farmerTip: parsed.farmerTip || "Offering local delivery options can increase buyer response rates by up to 35%.",
      fairnessScore: parsed.fairnessScore || (listing.priceDifferencePct <= 0 ? "High" : "Fair"),
      keyHighlights: parsed.keyHighlights || [
        `Direct farm harvest from ${listing.municipality}, ${listing.province}`,
        `DA Reference Price Benchmark: ₱${listing.daReferencePricePhpKg}/${listing.unit}`,
        `Quality Grade: ${listing.qualityGrade}`,
      ],
      generatedAt: new Date().toISOString(),
    };

    await setCached(cacheKey, analysis, TTL.MARKET_INSIGHT);
    res.json(analysis);
  } catch (err) {
    req.log?.error({ err }, "Error generating Grownox marketplace analysis");
    if (!listing) {
      res.status(500).json({ error: "Failed to evaluate listing" });
      return;
    }
    // Return structured fallback analysis based on DA data benchmarks so the UI doesn't break
    const minOffer = Math.round((listing.daReferencePricePhpKg || 50) * 0.9);
    const fallbackAnalysis = {
      listingId,
      cropName: listing.cropName,
      farmerPrice: listing.askingPricePhpKg,
      daReferencePrice: listing.daReferencePricePhpKg,
      minAllowedOffer: minOffer,
      priceAssessment: `The farmer's asking price of ₱${listing.askingPricePhpKg}/${listing.unit} is ${Math.abs(listing.priceDifferencePct)}% ${listing.priceDifferencePct >= 0 ? "above" : "below"} the official DA reference benchmark of ₱${listing.daReferencePricePhpKg}/${listing.unit}.`,
      offerAdvice: `Buyers can submit offers starting from ₱${minOffer}/${listing.unit} (up to 10% below the DA reference price).`,
      farmerTip: "Direct farm-gate listings provide fresh local produce directly to buyers.",
      fairnessScore: listing.priceDifferencePct <= 0 ? "High" : listing.priceDifferencePct <= 10 ? "Fair" : "Premium",
      keyHighlights: [
        `Direct farm harvest from ${listing.municipality}, ${listing.province}`,
        `DA Reference Price Benchmark: ₱${listing.daReferencePricePhpKg}/${listing.unit}`,
        `Quality Grade: ${listing.qualityGrade}`,
      ],
      generatedAt: new Date().toISOString(),
    };
    await setCached(cacheKey, fallbackAnalysis, TTL.MARKET_INSIGHT);
    res.json(fallbackAnalysis);
  }
}

router.get("/marketplace/listings/:id/ai-analysis", handleListingAiAnalysis);
router.get("/marketplace/listings/:id/ai-eval", handleListingAiAnalysis);

/**
 * REVIEWS & RATINGS ENDPOINTS
 */

/**
 * POST /api/marketplace/reviews
 * Allows buyers to submit or update a review for a verified completed order
 */
router.post("/marketplace/reviews", async (req, res) => {
  try {
    const { orderId, buyerName, rating, productQualityRating, sellerExperienceRating, comment } = req.body;

    if (!orderId || !rating || !comment) {
      res.status(400).json({ error: "Missing required review fields (orderId, rating, comment)" });
      return;
    }

    const review = createOrUpdateReview({
      orderId,
      buyerName: buyerName || "Buyer",
      rating: Number(rating),
      productQualityRating: productQualityRating ? Number(productQualityRating) : undefined,
      sellerExperienceRating: sellerExperienceRating ? Number(sellerExperienceRating) : undefined,
      comment,
    });

    const summary = getSellerRatingSummary(review.sellerId);

    res.status(201).json({ review, sellerSummary: summary });
  } catch (err: any) {
    req.log?.error({ err }, "Error submitting marketplace review");
    res.status(400).json({ error: err.message || "Failed to submit review" });
  }
});

/**
 * GET /api/marketplace/reviews
 * Fetch reviews filtered by sellerId, listingId, orderId, or buyerName
 */
router.get("/marketplace/reviews", async (req, res) => {
  try {
    const sellerId = req.query.sellerId as string;
    const listingId = req.query.listingId as string;
    const orderId = req.query.orderId as string;
    const buyerName = req.query.buyerName as string;

    const reviewsList = getReviews({ sellerId, listingId, orderId, buyerName });
    res.json(reviewsList);
  } catch (err) {
    req.log?.error({ err }, "Error fetching reviews");
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

/**
 * GET /api/marketplace/sellers/:sellerId/reviews
 * Fetch rating summary and all verified reviews for a specific seller
 */
router.get("/marketplace/sellers/:sellerId/reviews", async (req, res) => {
  try {
    const sellerId = req.params.sellerId;
    const summary = getSellerRatingSummary(sellerId);
    res.json(summary);
  } catch (err) {
    req.log?.error({ err }, "Error fetching seller review summary");
    res.status(500).json({ error: "Failed to fetch seller review summary" });
  }
});

export default router;
