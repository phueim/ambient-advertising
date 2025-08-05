import { pgTable, text, integer, decimal, timestamp, date, boolean, json, serial, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Government Data Storage
export const governmentData = pgTable("government_data", {
  id: serial("id").primaryKey(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  source: varchar("source", { length: 50 }).notNull(), // weather, traffic, air_quality
  rawData: json("raw_data").notNull(),
  temperature: decimal("temperature", { precision: 5, scale: 2 }),
  humidity: integer("humidity"),
  condition: varchar("condition", { length: 100 }),
  uvIndex: integer("uv_index"),
  aqi: integer("aqi"),
  location: varchar("location", { length: 100 }),
});

// Advertisers
export const advertisers = pgTable("advertisers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  displayName: varchar("display_name", { length: 100 }).notNull(),
  businessType: varchar("business_type", { length: 20 }).default("Restaurant").notNull(), // Restaurant, Gym, Mall, Fast Food, Coffee shop
  creditBalance: decimal("credit_balance", { precision: 10, scale: 2 }).default("0.00").notNull(),
  spentAmount: decimal("spent_amount", { precision: 10, scale: 2 }).default("0.00").notNull(),
  budgetCap: decimal("budget_cap", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", { length: 20 }).default("Active").notNull(), // Active, Inactive
  creditStatus: varchar("credit_status", { length: 20 }).default("Sufficient").notNull(), // Sufficient, Insufficient, Low
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Condition Rules for triggering ads
export const conditionRules = pgTable("condition_rules", {
  id: serial("id").primaryKey(),
  ruleId: varchar("rule_id", { length: 50 }).notNull().unique(),
  advertiserId: integer("advertiser_id").references(() => advertisers.id).notNull(),
  priority: integer("priority").notNull(),
  conditions: json("conditions").notNull(), // Store condition logic as JSON
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Physical locations where ads are played
export const locations = pgTable("locations", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  address: text("address"),
  type: varchar("type", { length: 50 }), // mall, supermarket, convenience_store
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Audio content (combines scripts and voiceovers)
export const audio = pgTable("audio", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),                                    // AI-generated script content
  variables: json("variables"),                                    // Store template variables
  audioUrl: text("audio_url"),                                     // Path to generated audio file
  voiceType: varchar("voice_type", { length: 20 }).notNull(),     // male, female
  duration: integer("duration_seconds"),                          // Duration in seconds
  status: varchar("status", { length: 20 }).default("pending").notNull(), // pending, completed, failed
  generatedAt: timestamp("generated_at").defaultNow().notNull(),  // When content was created
  synthesizedAt: timestamp("synthesized_at"),                     // When audio was generated
});

// Advertising campaigns
export const advertising = pgTable("advertising", {
  id: serial("id").primaryKey(),
  ruleId: varchar("rule_id", { length: 50 }).notNull(),
  advertiserId: integer("advertiser_id").references(() => advertisers.id).notNull(),
  audioFile: text("audio_file"), // Path to generated audio file (nullable)
  status: varchar("status", { length: 20 }).default("Pending").notNull(), // Pending, Done, Failed
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Ad Triggers - log of every triggered ad
export const adTriggers = pgTable("ad_triggers", {
  id: serial("id").primaryKey(),
  advertiserId: integer("advertiser_id").references(() => advertisers.id).notNull(),
  ruleId: varchar("rule_id", { length: 50 }).notNull(),
  locationId: integer("location_id").references(() => locations.id).notNull(),
  audioId: integer("audio_id").references(() => audio.id),
  cost: decimal("cost", { precision: 8, scale: 2 }).notNull(),
  weatherData: json("weather_data"), // Snapshot of conditions at trigger time
  status: varchar("status", { length: 20 }).default("pending").notNull(), // pending, played, failed
  triggeredAt: timestamp("triggered_at").defaultNow().notNull(),
});

// System health and monitoring
export const systemHealth = pgTable("system_health", {
  id: serial("id").primaryKey(),
  service: varchar("service", { length: 50 }).notNull(), // data_fetch, ai_script, voice_synthesis, trigger_engine
  status: varchar("status", { length: 20 }).notNull(), // healthy, warning, error
  lastCheck: timestamp("last_check").defaultNow().notNull(),
  errorMessage: text("error_message"),
  responseTime: integer("response_time_ms"),
});

// Venues (partners that host our advertising)
export const venues = pgTable("venues", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  location: varchar("location", { length: 255 }).notNull(),
  type: varchar("type", { length: 100 }).notNull(),
  country: varchar("country", { length: 100 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  capacity: integer("capacity"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Contract templates for different pricing tiers
export const contractTemplates = pgTable("contract_templates", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  tier: varchar("tier", { length: 50 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull(),
  billingType: varchar("billing_type", { length: 50 }).notNull(),
  monthlyFixedFee: decimal("monthly_fixed_fee", { precision: 10, scale: 2 }).default("0.00"),
  perTriggerRate: decimal("per_trigger_rate", { precision: 10, scale: 2 }).default("0.00"),
  minimumGuarantee: decimal("minimum_guarantee", { precision: 10, scale: 2 }).default("0.00"),
  performanceBonusThreshold: decimal("performance_bonus_threshold", { precision: 10, scale: 2 }).default("0.00"),
  performanceBonusRate: decimal("performance_bonus_rate", { precision: 5, scale: 2 }).default("0.00"),
  venuePayoutType: varchar("venue_payout_type", { length: 50 }).notNull(),
  venueFixedMonthly: decimal("venue_fixed_monthly", { precision: 10, scale: 2 }).default("0.00"),
  venuePercentageRate: decimal("venue_percentage_rate", { precision: 5, scale: 2 }).default("0.00"),
  venueMinimumGuarantee: decimal("venue_minimum_guarantee", { precision: 10, scale: 2 }).default("0.00"),
  venuePerformanceBonusThreshold: decimal("venue_performance_bonus_threshold", { precision: 10, scale: 2 }).default("0.00"),
  venuePerformanceBonusRate: decimal("venue_performance_bonus_rate", { precision: 5, scale: 2 }).default("0.00"),
  maxTriggersPerMonth: integer("max_triggers_per_month").default(999999),
  monthlyBudget: decimal("monthly_budget", { precision: 10, scale: 2 }).default("0.00"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Advertiser contracts
export const advertiserContracts = pgTable("advertiser_contracts", {
  id: serial("id").primaryKey(),
  advertiserId: integer("advertiser_id").references(() => advertisers.id).notNull(),
  templateId: integer("template_id").references(() => contractTemplates.id),
  contractName: varchar("contract_name", { length: 255 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull(),
  billingType: varchar("billing_type", { length: 50 }).notNull(),
  monthlyFixedFee: decimal("monthly_fixed_fee", { precision: 10, scale: 2 }).default("0.00"),
  perTriggerRate: decimal("per_trigger_rate", { precision: 10, scale: 2 }).default("0.00"),
  minimumGuarantee: decimal("minimum_guarantee", { precision: 10, scale: 2 }).default("0.00"),
  performanceBonusThreshold: decimal("performance_bonus_threshold", { precision: 10, scale: 2 }).default("0.00"),
  performanceBonusRate: decimal("performance_bonus_rate", { precision: 10, scale: 2 }).default("0.00"),
  maxTriggersPerMonth: integer("max_triggers_per_month").default(999999),
  monthlyBudget: decimal("monthly_budget", { precision: 10, scale: 2 }).default("0.00"),
  currentMonthSpend: decimal("current_month_spend", { precision: 10, scale: 2 }).default("0.00").notNull(),
  currentMonthTriggers: integer("current_month_triggers").default(0).notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),  
  status: varchar("status", { length: 50 }).default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Venue payout contracts
export const venueContracts = pgTable("venue_contracts", {
  id: serial("id").primaryKey(),
  venueId: integer("venue_id").references(() => venues.id).notNull(),
  templateId: integer("template_id").references(() => contractTemplates.id),
  contractName: varchar("contract_name", { length: 255 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull(),
  payoutType: varchar("payout_type", { length: 50 }).notNull(),
  fixedMonthly: decimal("fixed_monthly", { precision: 10, scale: 2 }).default("0.00"),
  percentageRate: decimal("percentage_rate", { precision: 5, scale: 2 }).default("0.00"),
  minimumGuarantee: decimal("minimum_guarantee", { precision: 10, scale: 2 }).default("0.00"),
  performanceBonusThreshold: decimal("performance_bonus_threshold", { precision: 10, scale: 2 }).default("0.00"),
  performanceBonusRate: decimal("performance_bonus_rate", { precision: 10, scale: 2 }).default("0.00"),
  currentMonthRevenue: decimal("current_month_revenue", { precision: 10, scale: 2 }).default("0.00").notNull(),
  currentMonthTriggers: integer("current_month_triggers").default(0).notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  status: varchar("status", { length: 50 }).default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Monthly billing records for advertisers
export const billingRecords = pgTable("billing_records", {
  id: serial("id").primaryKey(),
  contractId: integer("contract_id").references(() => advertiserContracts.id).notNull(),
  billingPeriod: varchar("billing_period", { length: 7 }).notNull(), // YYYY-MM format
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  monthlyFee: decimal("monthly_fee", { precision: 10, scale: 2 }).default("0.00").notNull(),
  triggerCosts: decimal("trigger_costs", { precision: 10, scale: 2 }).default("0.00").notNull(),
  totalTriggers: integer("total_triggers").default(0).notNull(),
  currency: varchar("currency", { length: 3 }).notNull(),
  status: varchar("status", { length: 20 }).default("pending").notNull(), // pending, paid, overdue
  invoiceDate: timestamp("invoice_date").defaultNow().notNull(),
  dueDate: timestamp("due_date").notNull(),
  paidDate: timestamp("paid_date"),
});

// Monthly payout records for venues
export const payoutRecords = pgTable("payout_records", {
  id: serial("id").primaryKey(),
  contractId: integer("contract_id").references(() => venueContracts.id).notNull(),
  payoutPeriod: varchar("payout_period", { length: 7 }).notNull(), // YYYY-MM format
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  fixedAmount: decimal("fixed_amount", { precision: 10, scale: 2 }).default("0.00").notNull(),
  revenueShare: decimal("revenue_share", { precision: 10, scale: 2 }).default("0.00").notNull(),
  bonusAmount: decimal("bonus_amount", { precision: 10, scale: 2 }).default("0.00").notNull(),
  totalTriggers: integer("total_triggers").default(0).notNull(),
  currency: varchar("currency", { length: 3 }).notNull(),
  status: varchar("status", { length: 20 }).default("pending").notNull(), // pending, paid, processing
  payoutDate: timestamp("payout_date").defaultNow().notNull(),
  paidDate: timestamp("paid_date"),
});

// Relations
export const advertiserRelations = relations(advertisers, ({ many }) => ({
  conditionRules: many(conditionRules),
  adTriggers: many(adTriggers),
}));

export const conditionRuleRelations = relations(conditionRules, ({ one }) => ({
  advertiser: one(advertisers, {
    fields: [conditionRules.advertiserId],
    references: [advertisers.id],
  }),
}));

export const audioRelations = relations(audio, ({ many }) => ({
  adTriggers: many(adTriggers),
}));

export const advertisingRelations = relations(advertising, ({ one }) => ({
  advertiser: one(advertisers, {
    fields: [advertising.advertiserId],
    references: [advertisers.id],
  }),
}));

export const adTriggerRelations = relations(adTriggers, ({ one }) => ({
  advertiser: one(advertisers, {
    fields: [adTriggers.advertiserId],
    references: [advertisers.id],
  }),
  location: one(locations, {
    fields: [adTriggers.locationId],
    references: [locations.id],
  }),
  audio: one(audio, {
    fields: [adTriggers.audioId],
    references: [audio.id],
  }),
}));

// New table relations
export const venueRelations = relations(venues, ({ many }) => ({
  contracts: many(venueContracts),
}));

export const contractTemplateRelations = relations(contractTemplates, ({ many }) => ({
  advertiserContracts: many(advertiserContracts),
}));

export const advertiserContractRelations = relations(advertiserContracts, ({ one, many }) => ({
  advertiser: one(advertisers, {
    fields: [advertiserContracts.advertiserId],
    references: [advertisers.id],
  }),
  template: one(contractTemplates, {
    fields: [advertiserContracts.templateId],
    references: [contractTemplates.id],
  }),
  billingRecords: many(billingRecords),
}));

export const venueContractRelations = relations(venueContracts, ({ one, many }) => ({
  venue: one(venues, {
    fields: [venueContracts.venueId],
    references: [venues.id],
  }),
  payoutRecords: many(payoutRecords),
}));

export const billingRecordRelations = relations(billingRecords, ({ one }) => ({
  contract: one(advertiserContracts, {
    fields: [billingRecords.contractId],
    references: [advertiserContracts.id],
  }),
}));

export const payoutRecordRelations = relations(payoutRecords, ({ one }) => ({
  contract: one(venueContracts, {
    fields: [payoutRecords.contractId],
    references: [venueContracts.id],
  }),
}));

// Insert schemas
export const insertGovernmentDataSchema = createInsertSchema(governmentData).omit({ id: true, timestamp: true });
export const insertAdvertiserSchema = createInsertSchema(advertisers).omit({ 
  id: true, 
  createdAt: true, 
  creditStatus: true // Cannot set credit status during creation
}).extend({
  status: z.enum(["Active", "Inactive"]).default("Active"),
  businessType: z.enum(["Restaurant", "Gym", "Mall", "Fast Food", "Coffee shop"]).default("Restaurant")
});

export const updateAdvertiserSchema = createInsertSchema(advertisers).omit({ 
  id: true, 
  createdAt: true, 
  creditStatus: true // Cannot modify credit status during updates
}).partial().extend({
  status: z.enum(["Active", "Inactive"]).optional(),
  businessType: z.enum(["Restaurant", "Gym", "Mall", "Fast Food", "Coffee shop"]).optional()
});
export const insertConditionRuleSchema = createInsertSchema(conditionRules).omit({ id: true, createdAt: true });
export const insertLocationSchema = createInsertSchema(locations).omit({ id: true, createdAt: true });
export const insertAudioSchema = createInsertSchema(audio).omit({ id: true, generatedAt: true, synthesizedAt: true });
export const insertAdvertisingSchema = createInsertSchema(advertising).omit({ id: true, createdAt: true }).extend({
  status: z.enum(["Pending", "Done", "Failed"]).default("Pending")
});
export const insertAdTriggerSchema = createInsertSchema(adTriggers).omit({ id: true, triggeredAt: true });
export const insertSystemHealthSchema = createInsertSchema(systemHealth).omit({ id: true, lastCheck: true });

// New insert schemas
export const insertVenueSchema = createInsertSchema(venues).omit({ id: true, createdAt: true });
export const insertContractTemplateSchema = createInsertSchema(contractTemplates).omit({ id: true, createdAt: true });
export const insertAdvertiserContractSchema = createInsertSchema(advertiserContracts).omit({ id: true, createdAt: true });
export const insertVenueContractSchema = createInsertSchema(venueContracts).omit({ id: true, createdAt: true });
export const insertBillingRecordSchema = createInsertSchema(billingRecords).omit({ id: true });
export const insertPayoutRecordSchema = createInsertSchema(payoutRecords).omit({ id: true });

// Types
export type GovernmentData = typeof governmentData.$inferSelect;
export type InsertGovernmentData = z.infer<typeof insertGovernmentDataSchema>;

export type Advertiser = typeof advertisers.$inferSelect;
export type InsertAdvertiser = z.infer<typeof insertAdvertiserSchema>;
export type UpdateAdvertiser = z.infer<typeof updateAdvertiserSchema>;

export type ConditionRule = typeof conditionRules.$inferSelect;
export type InsertConditionRule = z.infer<typeof insertConditionRuleSchema>;

export type Location = typeof locations.$inferSelect;
export type InsertLocation = z.infer<typeof insertLocationSchema>;

export type Audio = typeof audio.$inferSelect;
export type InsertAudio = z.infer<typeof insertAudioSchema>;

export type Advertising = typeof advertising.$inferSelect;
export type InsertAdvertising = z.infer<typeof insertAdvertisingSchema>;

export type AdTrigger = typeof adTriggers.$inferSelect;
export type InsertAdTrigger = z.infer<typeof insertAdTriggerSchema>;

export type SystemHealth = typeof systemHealth.$inferSelect;
export type InsertSystemHealth = z.infer<typeof insertSystemHealthSchema>;

// New types
export type Venue = typeof venues.$inferSelect;
export type InsertVenue = z.infer<typeof insertVenueSchema>;

export type ContractTemplate = typeof contractTemplates.$inferSelect;
export type InsertContractTemplate = z.infer<typeof insertContractTemplateSchema>;

export type AdvertiserContract = typeof advertiserContracts.$inferSelect;
export type InsertAdvertiserContract = z.infer<typeof insertAdvertiserContractSchema>;

export type VenueContract = typeof venueContracts.$inferSelect;
export type InsertVenueContract = z.infer<typeof insertVenueContractSchema>;

export type BillingRecord = typeof billingRecords.$inferSelect;
export type InsertBillingRecord = z.infer<typeof insertBillingRecordSchema>;

export type PayoutRecord = typeof payoutRecords.$inferSelect;
export type InsertPayoutRecord = z.infer<typeof insertPayoutRecordSchema>;