import { pgTable, serial, text, timestamp, jsonb } from "drizzle-orm/pg-core";

export const farmingPlans = pgTable("farming_plans", {
  id: serial("id").primaryKey(),
  crop: text("crop").notNull(),
  location: text("location").notNull(),
  plantingDate: text("planting_date").notNull(),
  planData: jsonb("plan_data").notNull(),
  climateProfile: jsonb("climate_profile"),
  dataSourcesUsed: jsonb("data_sources_used"),
  generatedAt: timestamp("generated_at", { withTimezone: true }).defaultNow().notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});

export const userPlantingPlans = pgTable("user_planting_plans", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  crop: text("crop").notNull(),
  plantingDate: text("planting_date").notNull(),
  status: text("status").notNull().default("active"),
  planData: jsonb("plan_data").notNull(),
  completedTasks: jsonb("completed_tasks"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type FarmingPlan = typeof farmingPlans.$inferSelect;
export type UserPlantingPlan = typeof userPlantingPlans.$inferSelect;
