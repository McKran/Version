import { pgTable, serial, text, integer, real, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";

export const marketplaceSellers = pgTable("marketplace_sellers", {
  id: serial("id").primaryKey(),
  sellerId: text("seller_id").notNull().unique(),
  name: text("name").notNull(),
  farmName: text("farm_name"),
  region: text("region").notNull(),
  province: text("province").notNull(),
  municipality: text("municipality").notNull(),
  barangay: text("barangay"),
  contactPhone: text("contact_phone").notNull(),
  verificationStatus: text("verification_status").notNull().default("Verified Farmer"), // Verified Farmer, Premium Seller, Unverified
  rating: real("rating").default(4.8),
  totalSalesCount: integer("total_sales_count").default(0),
  avatarUrl: text("avatar_url"),
  deliveryOptions: jsonb("delivery_options"), // ["Pickup", "Farm Gate", "Local Delivery"]
  createdAt: timestamp("created_at").defaultNow(),
});

export const marketplaceListings = pgTable("marketplace_listings", {
  id: serial("id").primaryKey(),
  listingId: text("listing_id").notNull().unique(),
  sellerId: text("seller_id").notNull(),
  sellerName: text("seller_name").notNull(),
  sellerPhone: text("seller_phone"),
  sellerRating: real("seller_rating").default(4.8),
  verificationStatus: text("verification_status").default("Verified Farmer"),
  cropName: text("crop_name").notNull(), // e.g. Rice, Tomato, Onion, Banana
  variety: text("variety").notNull(), // e.g. Dinorado, Carabao, Red Pinoy
  category: text("category").notNull(), // Grains & Staples, Vegetables, Fruits, Root Crops, etc.
  quantityAvailableKg: real("quantity_available_kg").notNull(),
  originalQuantityKg: real("original_quantity_kg").notNull(),
  unit: text("unit").notNull().default("kg"), // kg, sack, ton
  askingPricePhpKg: real("asking_price_php_kg").notNull(),
  daReferencePricePhpKg: real("da_reference_price_php_kg"),
  priceDifferencePct: real("price_difference_pct"),
  qualityGrade: text("quality_grade").notNull().default("Grade A"), // Grade A, Grade B, Organic, Standard
  harvestDate: text("harvest_date"),
  availableDate: text("available_date"),
  description: text("description"),
  region: text("region").notNull(),
  province: text("province").notNull(),
  municipality: text("municipality").notNull(),
  barangay: text("barangay"),
  latitude: real("latitude"),
  longitude: real("longitude"),
  deliveryOptions: jsonb("delivery_options"), // ["Pickup", "Farm Gate", "Local Delivery"]
  photoUrls: jsonb("photo_urls"),
  status: text("status").notNull().default("active"), // active, paused, sold_out, cancelled
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const marketplaceOrders = pgTable("marketplace_orders", {
  id: serial("id").primaryKey(),
  orderId: text("order_id").notNull().unique(),
  listingId: text("listing_id").notNull(),
  buyerName: text("buyer_name").notNull(),
  buyerContact: text("buyer_contact").notNull(),
  buyerLocation: text("buyer_location").notNull(),
  cropName: text("crop_name").notNull(),
  variety: text("variety"),
  quantityKg: real("quantity_kg").notNull(),
  agreedPricePhpKg: real("agreed_price_php_kg").notNull(),
  totalAmountPhp: real("total_amount_php").notNull(),
  deliveryMethod: text("delivery_method").notNull().default("Pickup"),
  status: text("status").notNull().default("Pending"), 
  // Pending, Offer Submitted, Accepted, Rejected, Confirmed, Preparing, Ready for pickup, In delivery, Completed, Cancelled
  orderType: text("order_type").notNull().default("direct_buy"), // direct_buy, offer_accepted
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const marketplaceOffers = pgTable("marketplace_offers", {
  id: serial("id").primaryKey(),
  offerId: text("offer_id").notNull().unique(),
  listingId: text("listing_id").notNull(),
  buyerName: text("buyer_name").notNull(),
  buyerContact: text("buyer_contact").notNull(),
  buyerLocation: text("buyer_location").notNull(),
  cropName: text("crop_name").notNull(),
  quantityKg: real("quantity_kg").notNull(),
  offeredPricePhpKg: real("offered_price_php_kg").notNull(),
  daReferencePricePhpKg: real("da_reference_price_php_kg").notNull(),
  minAllowedOfferPhpKg: real("min_allowed_offer_php_kg").notNull(), // DA * 0.90
  totalAmountPhp: real("total_amount_php").notNull(),
  notes: text("notes"),
  status: text("status").notNull().default("Pending"), // Pending, Accepted, Rejected, Expired
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type MarketplaceListing = typeof marketplaceListings.$inferSelect;
export type MarketplaceOrder = typeof marketplaceOrders.$inferSelect;
export type MarketplaceOffer = typeof marketplaceOffers.$inferSelect;
