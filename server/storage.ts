import { 
  Advertiser, InsertAdvertiser, GovernmentData, InsertGovernmentData,
  ConditionRule, InsertConditionRule, Location, InsertLocation,
  Audio, InsertAudio, Advertising, InsertAdvertising, Script, InsertScript, Voiceover, InsertVoiceover,
  AdTrigger, InsertAdTrigger, SystemHealth, InsertSystemHealth,
  Venue, InsertVenue, ContractTemplate, InsertContractTemplate,
  AdvertiserContract, InsertAdvertiserContract, VenueContract, InsertVenueContract,
  BillingRecord, InsertBillingRecord, PayoutRecord, InsertPayoutRecord
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, gte, lte, sql, inArray } from "drizzle-orm";
import * as schema from "@shared/schema";

// Utility function to calculate credit status
function calculateCreditStatus(creditBalance: string, budgetCap: string): string {
  const balance = parseFloat(creditBalance);
  
  if (balance <= 0) return "Insufficient";
  if (balance < 100) return "Low"; // Below $100 is considered low
  return "Sufficient";
}

// Interface for storage operations
export interface IStorage {
  // Advertiser operations
  getAllAdvertisers(): Promise<Advertiser[]>;
  getAdvertiserById(id: number): Promise<Advertiser | undefined>;
  getAdvertiserByName(name: string): Promise<Advertiser | undefined>;
  getAdvertiserByDisplayName(displayName: string): Promise<Advertiser | undefined>;
  createAdvertiser(advertiser: InsertAdvertiser): Promise<Advertiser>;
  updateAdvertiser(id: number, updates: Partial<Advertiser>): Promise<Advertiser>;
  deleteAdvertiser(id: number): Promise<boolean>;
  deleteConditionRulesByAdvertiser(advertiserId: number): Promise<boolean>;
  deleteAdvertiserContractsByAdvertiser(advertiserId: number): Promise<boolean>;
  deleteAdTriggersByAdvertiser(advertiserId: number): Promise<boolean>;
  updateAdvertiserBalance(id: number, amount: number): Promise<Advertiser>;
  
  // Government data operations
  getLatestGovernmentData(): Promise<GovernmentData | undefined>;
  saveGovernmentData(data: InsertGovernmentData): Promise<GovernmentData>;
  getGovernmentDataHistory(hours: number): Promise<GovernmentData[]>;
  
  // Condition rules operations
  getAllConditionRules(): Promise<ConditionRule[]>;
  getConditionRuleById(id: string): Promise<ConditionRule | undefined>;
  getConditionRulesByAdvertiser(advertiserId: number): Promise<ConditionRule[]>;
  createConditionRule(rule: InsertConditionRule): Promise<ConditionRule>;
  updateConditionRule(id: string, rule: Partial<ConditionRule>): Promise<ConditionRule>;
  assignRulesToAdvertiser(advertiserId: number, ruleIds: string[]): Promise<boolean>;
  
  // Location operations
  getAllLocations(): Promise<Location[]>;
  getLocationById(id: number): Promise<Location | undefined>;
  createLocation(location: InsertLocation): Promise<Location>;
  
  // Audio operations (new combined table)
  getAllAudio(): Promise<Audio[]>;
  getAudioPaginated(page: number, pageSize: number, filters?: { status?: string; voiceType?: string }): Promise<{ data: Audio[], total: number, totalPages: number }>;
  getAudioById(id: number): Promise<Audio | undefined>;
  createAudio(audio: InsertAudio): Promise<Audio>;
  updateAudio(id: number, audio: Partial<InsertAudio>): Promise<Audio>;

  // Advertising operations
  getAllAdvertising(): Promise<Advertising[]>;
  getAdvertisingById(id: number): Promise<Advertising | undefined>;
  createAdvertising(advertising: InsertAdvertising): Promise<Advertising>;
  updateAdvertising(id: number, updates: Partial<InsertAdvertising>): Promise<Advertising>;
  deleteAdvertising(id: number): Promise<void>;
  getAdvertisingByStatus(status: string): Promise<Advertising[]>;
  
  // Script operations (legacy)
  createScript(script: InsertScript): Promise<Script>;
  getScriptById(id: number): Promise<Script | undefined>;
  getScriptsByRuleId(ruleId: string): Promise<Script[]>;
  
  // Voiceover operations (legacy)
  createVoiceover(voiceover: InsertVoiceover): Promise<Voiceover>;
  getVoiceoverById(id: number): Promise<Voiceover | undefined>;
  getAllVoiceovers(): Promise<Voiceover[]>;
  getVoiceoversWithScripts(): Promise<any[]>;
  updateVoiceoverStatus(id: number, status: string, audioUrl?: string): Promise<Voiceover>;
  
  // Ad trigger operations
  createAdTrigger(trigger: InsertAdTrigger): Promise<AdTrigger>;
  getAdTriggerHistory(limit?: number): Promise<AdTrigger[]>;
  getAdTriggersByAdvertiser(advertiserId: number): Promise<AdTrigger[]>;
  getAdTriggersByLocation(locationId: number): Promise<AdTrigger[]>;
  
  // System health operations
  updateSystemHealth(service: string, status: string, errorMessage?: string, responseTime?: number): Promise<SystemHealth>;
  getSystemHealthStatus(): Promise<SystemHealth[]>;

  // Venue operations
  getAllVenues(): Promise<Venue[]>;
  getVenueById(id: number): Promise<Venue | undefined>;
  createVenue(venue: InsertVenue): Promise<Venue>;
  updateVenue(id: number, venue: Partial<Venue>): Promise<Venue>;

  // Contract template operations
  getAllContractTemplates(): Promise<ContractTemplate[]>;
  getContractTemplateById(id: number): Promise<ContractTemplate | undefined>;
  createContractTemplate(template: InsertContractTemplate): Promise<ContractTemplate>;
  updateContractTemplate(id: number, template: Partial<ContractTemplate>): Promise<ContractTemplate>;

  // Advertiser contract operations
  getAllAdvertiserContracts(): Promise<AdvertiserContract[]>;
  getAdvertiserContractById(id: number): Promise<AdvertiserContract | undefined>;
  getAdvertiserContractByAdvertiserId(advertiserId: number): Promise<AdvertiserContract | undefined>;
  createAdvertiserContract(contract: InsertAdvertiserContract): Promise<AdvertiserContract>;
  updateAdvertiserContract(id: number, contract: Partial<AdvertiserContract>): Promise<AdvertiserContract>;

  // Venue contract operations
  getAllVenueContracts(): Promise<VenueContract[]>;
  getVenueContractById(id: number): Promise<VenueContract | undefined>;
  getVenueContractByVenueId(venueId: number): Promise<VenueContract | undefined>;
  createVenueContract(contract: InsertVenueContract): Promise<VenueContract>;
  updateVenueContract(id: number, contract: Partial<VenueContract>): Promise<VenueContract>;

  // Billing record operations
  getAllBillingRecords(): Promise<BillingRecord[]>;
  getBillingRecordById(id: number): Promise<BillingRecord | undefined>;
  getBillingRecordsByContractId(contractId: number): Promise<BillingRecord[]>;
  createBillingRecord(record: InsertBillingRecord): Promise<BillingRecord>;
  updateBillingRecord(id: number, record: Partial<BillingRecord>): Promise<BillingRecord>;

  // Payout record operations
  getAllPayoutRecords(): Promise<PayoutRecord[]>;
  getPayoutRecordById(id: number): Promise<PayoutRecord | undefined>;
  getPayoutRecordsByContractId(contractId: number): Promise<PayoutRecord[]>;
  createPayoutRecord(record: InsertPayoutRecord): Promise<PayoutRecord>;
  updatePayoutRecord(id: number, record: Partial<PayoutRecord>): Promise<PayoutRecord>;

  // Contract management operations
  processAdTriggerBilling(triggerId: number): Promise<void>;
  calculateAdvertiserMonthlyBill(contractId: number, period: string): Promise<BillingRecord>;
  calculateVenueMonthlyPayout(contractId: number, period: string): Promise<PayoutRecord>;
  getContractPerformanceMetrics(contractId: number, period: string): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  // Advertiser operations
  async getAllAdvertisers(): Promise<Advertiser[]> {
    return await db.select().from(schema.advertisers).orderBy(desc(schema.advertisers.createdAt));
  }

  async getAdvertiserById(id: number): Promise<Advertiser | undefined> {
    const [advertiser] = await db.select().from(schema.advertisers).where(eq(schema.advertisers.id, id));
    return advertiser || undefined;
  }

  async getAdvertiserByName(name: string): Promise<Advertiser | undefined> {
    const [advertiser] = await db.select().from(schema.advertisers).where(eq(schema.advertisers.name, name));
    return advertiser || undefined;
  }

  async getAdvertiserByDisplayName(displayName: string): Promise<Advertiser | undefined> {
    const [advertiser] = await db.select().from(schema.advertisers).where(eq(schema.advertisers.displayName, displayName));
    return advertiser || undefined;
  }

  async createAdvertiser(insertAdvertiser: InsertAdvertiser): Promise<Advertiser> {
    // Calculate credit status based on credit balance and budget cap
    const creditStatus = calculateCreditStatus(
      insertAdvertiser.creditBalance || "0", 
      insertAdvertiser.budgetCap
    );
    
    const [advertiser] = await db
      .insert(schema.advertisers)
      .values({
        ...insertAdvertiser,
        creditStatus
      })
      .returning();
    return advertiser;
  }

  async updateAdvertiserBalance(id: number, amount: number): Promise<Advertiser> {
    const existing = await this.getAdvertiserById(id);
    if (!existing) throw new Error("Advertiser not found");
    
    const newCreditBalance = String(Number(existing.creditBalance) - amount);
    const newSpentAmount = String(Number(existing.spentAmount) + amount);
    const newCreditStatus = calculateCreditStatus(newCreditBalance, existing.budgetCap);
    
    const [advertiser] = await db
      .update(schema.advertisers)
      .set({ 
        creditBalance: newCreditBalance,
        spentAmount: newSpentAmount,
        creditStatus: newCreditStatus
      })
      .where(eq(schema.advertisers.id, id))
      .returning();
    return advertiser;
  }

  // Government data operations
  async getLatestGovernmentData(): Promise<GovernmentData | undefined> {
    const [data] = await db
      .select()
      .from(schema.governmentData)
      .orderBy(desc(schema.governmentData.timestamp))
      .limit(1);
    return data || undefined;
  }

  async saveGovernmentData(insertData: InsertGovernmentData): Promise<GovernmentData> {
    const [data] = await db
      .insert(schema.governmentData)
      .values(insertData)
      .returning();
    return data;
  }

  async getGovernmentDataHistory(hours: number): Promise<GovernmentData[]> {
    const hoursAgo = new Date(Date.now() - hours * 60 * 60 * 1000);
    return await db
      .select()
      .from(schema.governmentData)
      .where(gte(schema.governmentData.timestamp, hoursAgo))
      .orderBy(desc(schema.governmentData.timestamp));
  }

  // Condition rules operations  
  async getAllConditionRules(): Promise<ConditionRule[]> {
    return await db.select().from(schema.conditionRules).orderBy(desc(schema.conditionRules.priority));
  }

  async getActiveConditionRules(): Promise<ConditionRule[]> {
    return await db.select().from(schema.conditionRules).where(eq(schema.conditionRules.isActive, true));
  }

  async getConditionRuleById(ruleId: string): Promise<ConditionRule | undefined> {
    const [rule] = await db
      .select()
      .from(schema.conditionRules)
      .where(eq(schema.conditionRules.ruleId, ruleId));
    return rule || undefined;
  }

  async createConditionRule(insertRule: InsertConditionRule): Promise<ConditionRule> {
    const [rule] = await db
      .insert(schema.conditionRules)
      .values(insertRule)
      .returning();
    return rule;
  }

  async updateConditionRule(ruleId: string, updateData: Partial<ConditionRule>): Promise<ConditionRule> {
    const [rule] = await db
      .update(schema.conditionRules)
      .set(updateData)
      .where(eq(schema.conditionRules.ruleId, ruleId))
      .returning();
    return rule;
  }

  async assignRulesToAdvertiser(advertiserId: number, ruleIds: string[]): Promise<boolean> {
    try {
      // First, unassign all existing rules from this advertiser 
      await db
        .update(schema.conditionRules)
        .set({ advertiserId: null })
        .where(eq(schema.conditionRules.advertiserId, advertiserId));
      
      // Then assign the new rules to this advertiser
      if (ruleIds.length > 0) {
        await db
          .update(schema.conditionRules)
          .set({ advertiserId: advertiserId })
          .where(inArray(schema.conditionRules.ruleId, ruleIds));
      }
      
      return true;
    } catch (error) {
      console.error('Error assigning rules to advertiser:', error);
      return false;
    }
  }

  // Location operations
  async getAllLocations(): Promise<Location[]> {
    return await db.select().from(schema.locations).where(eq(schema.locations.isActive, true));
  }

  async getLocationById(id: number): Promise<Location | undefined> {
    const [location] = await db.select().from(schema.locations).where(eq(schema.locations.id, id));
    return location || undefined;
  }

  async createLocation(insertLocation: InsertLocation): Promise<Location> {
    const [location] = await db
      .insert(schema.locations)
      .values(insertLocation)
      .returning();
    return location;
  }

  // Audio operations (new combined table)
  async getAllAudio(): Promise<Audio[]> {
    return await db.select().from(schema.audio).orderBy(desc(schema.audio.generatedAt));
  }

  async getAudioPaginated(
    page: number, 
    pageSize: number, 
    filters?: { status?: string; voiceType?: string }
  ): Promise<{ data: Audio[], total: number, totalPages: number }> {
    const offset = (page - 1) * pageSize;
    
    // Build base query
    let query = db.select().from(schema.audio);
    let countQuery = db.select({ count: sql<number>`count(*)` }).from(schema.audio);
    
    // Apply filters
    if (filters?.status && filters?.voiceType) {
      // Both filters
      const whereCondition = and(
        eq(schema.audio.status, filters.status),
        eq(schema.audio.voiceType, filters.voiceType)
      );
      query = query.where(whereCondition);
      countQuery = countQuery.where(whereCondition);
    } else if (filters?.status) {
      // Status filter only
      const whereCondition = eq(schema.audio.status, filters.status);
      query = query.where(whereCondition);
      countQuery = countQuery.where(whereCondition);
    } else if (filters?.voiceType) {
      // Voice type filter only
      const whereCondition = eq(schema.audio.voiceType, filters.voiceType);
      query = query.where(whereCondition);
      countQuery = countQuery.where(whereCondition);
    }
    
    // Get total count
    const totalResult = await countQuery;
    const total = Number(totalResult[0].count);
    const totalPages = Math.ceil(total / pageSize);
    
    // Get paginated data
    const data = await query
      .orderBy(desc(schema.audio.generatedAt))
      .limit(pageSize)
      .offset(offset);
    
    return { data, total, totalPages };
  }

  async getAudioById(id: number): Promise<Audio | undefined> {
    const [audio] = await db.select().from(schema.audio).where(eq(schema.audio.id, id));
    return audio || undefined;
  }

  async createAudio(insertAudio: InsertAudio): Promise<Audio> {
    const [audio] = await db
      .insert(schema.audio)
      .values(insertAudio)
      .returning();
    return audio;
  }

  // Advertising operations
  async getAllAdvertising(): Promise<Advertising[]> {
    return await db.select().from(schema.advertising).orderBy(desc(schema.advertising.createdAt));
  }

  async getAdvertisingById(id: number): Promise<Advertising | undefined> {
    const [advertising] = await db.select().from(schema.advertising).where(eq(schema.advertising.id, id));
    return advertising || undefined;
  }

  async createAdvertising(insertAdvertising: InsertAdvertising): Promise<Advertising> {
    const [advertising] = await db
      .insert(schema.advertising)
      .values(insertAdvertising)
      .returning();
    return advertising;
  }

  async updateAdvertising(id: number, updates: Partial<InsertAdvertising>): Promise<Advertising> {
    const [advertising] = await db
      .update(schema.advertising)
      .set(updates)
      .where(eq(schema.advertising.id, id))
      .returning();
    return advertising;
  }

  async deleteAdvertising(id: number): Promise<void> {
    await db.delete(schema.advertising).where(eq(schema.advertising.id, id));
  }

  async getAdvertisingByStatus(status: string): Promise<Advertising[]> {
    return await db
      .select()
      .from(schema.advertising)
      .where(eq(schema.advertising.status, status));
  }

  async updateAudio(id: number, updates: Partial<InsertAudio>): Promise<Audio> {
    const [audio] = await db
      .update(schema.audio)
      .set(updates)
      .where(eq(schema.audio.id, id))
      .returning();
    return audio;
  }

  // Script operations (legacy)
  async createScript(insertScript: InsertScript): Promise<Script> {
    const [script] = await db
      .insert(schema.scripts)
      .values(insertScript)
      .returning();
    return script;
  }

  async getScriptById(id: number): Promise<Script | undefined> {
    const [script] = await db.select().from(schema.scripts).where(eq(schema.scripts.id, id));
    return script || undefined;
  }

  async getScriptsByRuleId(ruleId: string): Promise<Script[]> {
    return await db
      .select()
      .from(schema.scripts)
      .where(eq(schema.scripts.ruleId, ruleId))
      .orderBy(desc(schema.scripts.generatedAt));
  }

  // Voiceover operations
  async createVoiceover(insertVoiceover: InsertVoiceover): Promise<Voiceover> {
    const [voiceover] = await db
      .insert(schema.voiceovers)
      .values(insertVoiceover)
      .returning();
    return voiceover;
  }

  async getVoiceoverById(id: number): Promise<Voiceover | undefined> {
    const [voiceover] = await db.select().from(schema.voiceovers).where(eq(schema.voiceovers.id, id));
    return voiceover || undefined;
  }

  async getAllVoiceovers(): Promise<Voiceover[]> {
    return await db.select().from(schema.voiceovers).orderBy(desc(schema.voiceovers.id));
  }

  async getVoiceoversWithScripts(): Promise<any[]> {
    const result = await db
      .select({
        id: schema.voiceovers.id,
        scriptId: schema.voiceovers.scriptId,
        audioUrl: schema.voiceovers.audioUrl,
        voiceType: schema.voiceovers.voiceType,
        duration: schema.voiceovers.duration,
        status: schema.voiceovers.status,
        createdAt: schema.voiceovers.createdAt,
        script: {
          id: schema.scripts.id,
          ruleId: schema.scripts.ruleId,
          text: schema.scripts.text,
          generatedAt: schema.scripts.generatedAt
        }
      })
      .from(schema.voiceovers)
      .leftJoin(schema.scripts, eq(schema.voiceovers.scriptId, schema.scripts.id))
      .orderBy(desc(schema.voiceovers.id));
    
    return result;
  }

  async updateVoiceoverStatus(id: number, status: string, audioUrl?: string): Promise<Voiceover> {
    const updateData: any = { status };
    if (audioUrl) {
      updateData.audioUrl = audioUrl;
    }
    
    const [voiceover] = await db
      .update(schema.voiceovers)
      .set(updateData)
      .where(eq(schema.voiceovers.id, id))
      .returning();
    return voiceover;
  }

  // Ad trigger operations
  async createAdTrigger(insertTrigger: InsertAdTrigger): Promise<AdTrigger> {
    const [trigger] = await db
      .insert(schema.adTriggers)
      .values(insertTrigger)
      .returning();
    return trigger;
  }

  async getAdTriggerHistory(limit: number = 100): Promise<AdTrigger[]> {
    return await db
      .select()
      .from(schema.adTriggers)
      .orderBy(desc(schema.adTriggers.triggeredAt))
      .limit(limit);
  }

  // Update advertiser operations for billing
  async updateAdvertiser(id: number, updates: Partial<Advertiser>): Promise<Advertiser> {
    // If credit balance or budget cap is being updated, recalculate credit status
    let finalUpdates = { ...updates };
    
    if (updates.creditBalance !== undefined || updates.budgetCap !== undefined) {
      const existing = await this.getAdvertiserById(id);
      if (!existing) throw new Error("Advertiser not found");
      
      const newCreditBalance = updates.creditBalance || existing.creditBalance;
      const newBudgetCap = updates.budgetCap || existing.budgetCap;
      
      finalUpdates.creditStatus = calculateCreditStatus(newCreditBalance, newBudgetCap);
    }
    
    const [advertiser] = await db
      .update(schema.advertisers)
      .set(finalUpdates)
      .where(eq(schema.advertisers.id, id))
      .returning();
    return advertiser;
  }

  async deleteAdvertiser(id: number): Promise<boolean> {
    const result = await db
      .delete(schema.advertisers)
      .where(eq(schema.advertisers.id, id))
      .returning({ id: schema.advertisers.id });
    return result.length > 0;
  }

  // Cascade delete methods for advertiser dependencies
  async deleteConditionRulesByAdvertiser(advertiserId: number): Promise<boolean> {
    const result = await db
      .delete(schema.conditionRules)
      .where(eq(schema.conditionRules.advertiserId, advertiserId))
      .returning({ id: schema.conditionRules.id });
    return result.length > 0;
  }

  async deleteAdvertiserContractsByAdvertiser(advertiserId: number): Promise<boolean> {
    const result = await db
      .delete(schema.advertiserContracts)
      .where(eq(schema.advertiserContracts.advertiserId, advertiserId))
      .returning({ id: schema.advertiserContracts.id });
    return result.length > 0;
  }

  async deleteAdTriggersByAdvertiser(advertiserId: number): Promise<boolean> {
    const result = await db
      .delete(schema.adTriggers)
      .where(eq(schema.adTriggers.advertiserId, advertiserId))
      .returning({ id: schema.adTriggers.id });
    return result.length > 0;
  }

  async getAdTriggersByAdvertiser(advertiserId: number): Promise<AdTrigger[]> {
    return await db
      .select()
      .from(schema.adTriggers)
      .where(eq(schema.adTriggers.advertiserId, advertiserId))
      .orderBy(desc(schema.adTriggers.triggeredAt));
  }

  async getAdTriggersByLocation(locationId: number): Promise<AdTrigger[]> {
    return await db
      .select()
      .from(schema.adTriggers)
      .where(eq(schema.adTriggers.locationId, locationId))
      .orderBy(desc(schema.adTriggers.triggeredAt));
  }

  // System health operations
  async updateSystemHealth(service: string, status: string, errorMessage?: string, responseTime?: number): Promise<SystemHealth> {
    // First, try to update existing record
    const existingHealth = await db
      .select()
      .from(schema.systemHealth)
      .where(eq(schema.systemHealth.service, service))
      .limit(1);

    const updateData = {
      service,
      status,
      errorMessage: errorMessage || null,
      responseTime: responseTime || null,
      lastCheck: new Date()
    };

    if (existingHealth.length > 0) {
      const [health] = await db
        .update(schema.systemHealth)
        .set(updateData)
        .where(eq(schema.systemHealth.service, service))
        .returning();
      return health;
    } else {
      const [health] = await db
        .insert(schema.systemHealth)
        .values(updateData)
        .returning();
      return health;
    }
  }

  async getSystemHealthStatus(): Promise<SystemHealth[]> {
    return await db
      .select()
      .from(schema.systemHealth)
      .orderBy(desc(schema.systemHealth.lastCheck));
  }

  // Venue operations
  async getAllVenues(): Promise<Venue[]> {
    return await db.select().from(schema.venues).orderBy(desc(schema.venues.createdAt));
  }

  async getVenueById(id: number): Promise<Venue | undefined> {
    const [venue] = await db.select().from(schema.venues).where(eq(schema.venues.id, id));
    return venue || undefined;
  }

  async createVenue(insertVenue: InsertVenue): Promise<Venue> {
    const [venue] = await db
      .insert(schema.venues)
      .values(insertVenue)
      .returning();
    return venue;
  }

  async updateVenue(id: number, updateData: Partial<Venue>): Promise<Venue> {
    const [venue] = await db
      .update(schema.venues)
      .set(updateData)
      .where(eq(schema.venues.id, id))
      .returning();
    return venue;
  }

  // Contract template operations
  async getAllContractTemplates(): Promise<ContractTemplate[]> {
    return await db.select().from(schema.contractTemplates).where(eq(schema.contractTemplates.isActive, true));
  }

  async getContractTemplateById(id: number): Promise<ContractTemplate | undefined> {
    const [template] = await db.select().from(schema.contractTemplates).where(eq(schema.contractTemplates.id, id));
    return template || undefined;
  }

  async createContractTemplate(insertTemplate: InsertContractTemplate): Promise<ContractTemplate> {
    const [template] = await db
      .insert(schema.contractTemplates)
      .values(insertTemplate)
      .returning();
    return template;
  }

  async updateContractTemplate(id: number, updateData: Partial<ContractTemplate>): Promise<ContractTemplate> {
    const [template] = await db
      .update(schema.contractTemplates)
      .set(updateData)
      .where(eq(schema.contractTemplates.id, id))
      .returning();
    return template;
  }

  async deleteContractTemplate(id: number): Promise<boolean> {
    const result = await db
      .delete(schema.contractTemplates)
      .where(eq(schema.contractTemplates.id, id))
      .returning({ id: schema.contractTemplates.id });
    return result.length > 0;
  }

  // Advertiser contract operations
  async getAllAdvertiserContracts(): Promise<AdvertiserContract[]> {
    return await db.select().from(schema.advertiserContracts).orderBy(desc(schema.advertiserContracts.createdAt));
  }

  async getAdvertiserContractById(id: number): Promise<AdvertiserContract | undefined> {
    const [contract] = await db.select().from(schema.advertiserContracts).where(eq(schema.advertiserContracts.id, id));
    return contract || undefined;
  }

  async getAdvertiserContractByAdvertiserId(advertiserId: number): Promise<AdvertiserContract | undefined> {
    const [contract] = await db.select().from(schema.advertiserContracts)
      .where(and(eq(schema.advertiserContracts.advertiserId, advertiserId), eq(schema.advertiserContracts.status, "active")));
    return contract || undefined;
  }

  async createAdvertiserContract(insertContract: InsertAdvertiserContract): Promise<AdvertiserContract> {
    const [contract] = await db
      .insert(schema.advertiserContracts)
      .values(insertContract)
      .returning();
    return contract;
  }

  async updateAdvertiserContract(id: number, updateData: Partial<AdvertiserContract>): Promise<AdvertiserContract> {
    const [contract] = await db
      .update(schema.advertiserContracts)
      .set(updateData)
      .where(eq(schema.advertiserContracts.id, id))
      .returning();
    return contract;
  }

  async deleteAdvertiserContract(id: number): Promise<boolean> {
    const result = await db
      .delete(schema.advertiserContracts)
      .where(eq(schema.advertiserContracts.id, id))
      .returning({ id: schema.advertiserContracts.id });
    return result.length > 0;
  }

  // Venue contract operations
  async getAllVenueContracts(): Promise<VenueContract[]> {
    return await db.select().from(schema.venueContracts).orderBy(desc(schema.venueContracts.createdAt));
  }

  async getVenueContractById(id: number): Promise<VenueContract | undefined> {
    const [contract] = await db.select().from(schema.venueContracts).where(eq(schema.venueContracts.id, id));
    return contract || undefined;
  }

  async getVenueContractByVenueId(venueId: number): Promise<VenueContract | undefined> {
    const [contract] = await db.select().from(schema.venueContracts)
      .where(and(eq(schema.venueContracts.venueId, venueId), eq(schema.venueContracts.status, "active")));
    return contract || undefined;
  }

  async createVenueContract(insertContract: InsertVenueContract): Promise<VenueContract> {
    const [contract] = await db
      .insert(schema.venueContracts)
      .values(insertContract)
      .returning();
    return contract;
  }

  async updateVenueContract(id: number, updateData: Partial<VenueContract>): Promise<VenueContract> {
    const [contract] = await db
      .update(schema.venueContracts)
      .set(updateData)
      .where(eq(schema.venueContracts.id, id))
      .returning();
    return contract;
  }

  async deleteVenueContract(id: number): Promise<boolean> {
    const result = await db
      .delete(schema.venueContracts)
      .where(eq(schema.venueContracts.id, id))
      .returning({ id: schema.venueContracts.id });
    return result.length > 0;
  }

  // Billing record operations
  async getAllBillingRecords(): Promise<BillingRecord[]> {
    return await db.select().from(schema.billingRecords).orderBy(desc(schema.billingRecords.invoiceDate));
  }

  async getBillingRecordById(id: number): Promise<BillingRecord | undefined> {
    const [record] = await db.select().from(schema.billingRecords).where(eq(schema.billingRecords.id, id));
    return record || undefined;
  }

  async getBillingRecordsByContractId(contractId: number): Promise<BillingRecord[]> {
    return await db.select().from(schema.billingRecords)
      .where(eq(schema.billingRecords.contractId, contractId))
      .orderBy(desc(schema.billingRecords.invoiceDate));
  }

  async createBillingRecord(insertRecord: InsertBillingRecord): Promise<BillingRecord> {
    const [record] = await db
      .insert(schema.billingRecords)
      .values(insertRecord)
      .returning();
    return record;
  }

  async updateBillingRecord(id: number, updateData: Partial<BillingRecord>): Promise<BillingRecord> {
    const [record] = await db
      .update(schema.billingRecords)
      .set(updateData)
      .where(eq(schema.billingRecords.id, id))
      .returning();
    return record;
  }

  // Payout record operations  
  async getAllPayoutRecords(): Promise<PayoutRecord[]> {
    return await db.select().from(schema.payoutRecords).orderBy(desc(schema.payoutRecords.payoutDate));
  }

  async getPayoutRecordById(id: number): Promise<PayoutRecord | undefined> {
    const [record] = await db.select().from(schema.payoutRecords).where(eq(schema.payoutRecords.id, id));
    return record || undefined;
  }

  async getPayoutRecordsByContractId(contractId: number): Promise<PayoutRecord[]> {
    return await db.select().from(schema.payoutRecords)
      .where(eq(schema.payoutRecords.contractId, contractId))
      .orderBy(desc(schema.payoutRecords.payoutDate));
  }

  async createPayoutRecord(insertRecord: InsertPayoutRecord): Promise<PayoutRecord> {
    const [record] = await db
      .insert(schema.payoutRecords)
      .values(insertRecord)
      .returning();
    return record;
  }

  async updatePayoutRecord(id: number, updateData: Partial<PayoutRecord>): Promise<PayoutRecord> {
    const [record] = await db
      .update(schema.payoutRecords)
      .set(updateData)
      .where(eq(schema.payoutRecords.id, id))
      .returning();
    return record;
  }

  // Contract management operations
  async processAdTriggerBilling(triggerId: number): Promise<void> {
    const trigger = await db.select().from(schema.adTriggers).where(eq(schema.adTriggers.id, triggerId)).limit(1);
    if (!trigger[0]) return;

    const advertiserContract = await this.getAdvertiserContractByAdvertiserId(trigger[0].advertiserId);
    if (!advertiserContract) return;

    // Update contract monthly spend and trigger count
    const currentPeriod = new Date().toISOString().slice(0, 7); // YYYY-MM format
    const newSpend = Number(advertiserContract.currentMonthSpend) + Number(trigger[0].cost);
    
    await this.updateAdvertiserContract(advertiserContract.id, {
      currentMonthSpend: newSpend.toString(),
      currentMonthTriggers: advertiserContract.currentMonthTriggers + 1
    });

    // Update venue contract if exists
    const venue = await this.getVenueById(trigger[0].locationId);
    if (venue) {
      const venueContract = await this.getVenueContractByVenueId(venue.id);
      if (venueContract) {
        let venueEarnings = 0;
        
        // Calculate venue earnings based on payout type
        switch (venueContract.payoutType) {
          case 'fixed_monthly':
            // Fixed amount already set, no per-trigger calculation needed
            break;
          case 'percentage_share':
            if (venueContract.revenueSharePercentage) {
              venueEarnings = Number(trigger[0].cost) * (Number(venueContract.revenueSharePercentage) / 100);
            }
            break;
          case 'guaranteed_plus_bonus':
            if (venueContract.bonusPerTrigger && venueContract.currentMonthTriggers >= (venueContract.bonusThreshold || 0)) {
              venueEarnings = Number(venueContract.bonusPerTrigger);
            }
            break;
        }

        await this.updateVenueContract(venueContract.id, {
          currentMonthEarnings: (Number(venueContract.currentMonthEarnings) + venueEarnings).toString(),
          currentMonthTriggers: venueContract.currentMonthTriggers + 1
        });
      }
    }
  }

  async calculateAdvertiserMonthlyBill(contractId: number, period: string): Promise<BillingRecord> {
    const contract = await this.getAdvertiserContractById(contractId);
    if (!contract) throw new Error('Contract not found');

    let totalAmount = 0;
    let monthlyFee = 0;
    let triggerCosts = Number(contract.currentMonthSpend);

    // Calculate based on billing type
    switch (contract.billingType) {
      case 'monthly_fixed':
        monthlyFee = Number(contract.monthlyFee || 0);
        totalAmount = monthlyFee;
        break;
      case 'per_trigger':
        totalAmount = triggerCosts;
        break;
      case 'hybrid':
        monthlyFee = Number(contract.monthlyFee || 0);
        totalAmount = monthlyFee + triggerCosts;
        break;
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30); // 30 days payment terms

    return await this.createBillingRecord({
      contractId,
      billingPeriod: period,
      totalAmount: totalAmount.toString(),
      monthlyFee: monthlyFee.toString(),
      triggerCosts: triggerCosts.toString(),
      totalTriggers: contract.currentMonthTriggers,
      currency: contract.currency,
      status: 'pending',
      dueDate,
    });
  }

  async calculateVenueMonthlyPayout(contractId: number, period: string): Promise<PayoutRecord> {
    const contract = await this.getVenueContractById(contractId);
    if (!contract) throw new Error('Venue contract not found');

    let totalAmount = 0;
    let fixedAmount = 0;
    let revenueShare = 0;
    let bonusAmount = 0;

    // Calculate based on payout type
    switch (contract.payoutType) {
      case 'fixed_monthly':
        fixedAmount = Number(contract.fixedMonthlyAmount || 0);
        totalAmount = fixedAmount;
        break;
      case 'percentage_share':
        revenueShare = Number(contract.currentMonthEarnings);
        totalAmount = revenueShare;
        break;
      case 'guaranteed_plus_bonus':
        fixedAmount = Number(contract.guaranteedMinimum || 0);
        if (contract.currentMonthTriggers >= (contract.bonusThreshold || 0)) {
          bonusAmount = Number(contract.bonusPerTrigger || 0) * contract.currentMonthTriggers;
        }
        totalAmount = fixedAmount + bonusAmount;
        break;
    }

    return await this.createPayoutRecord({
      contractId,
      payoutPeriod: period,
      totalAmount: totalAmount.toString(),
      fixedAmount: fixedAmount.toString(),
      revenueShare: revenueShare.toString(),
      bonusAmount: bonusAmount.toString(),
      totalTriggers: contract.currentMonthTriggers,
      currency: contract.currency,
      status: 'pending',
    });
  }

  async getContractPerformanceMetrics(contractId: number, period: string): Promise<any> {
    const contract = await this.getAdvertiserContractById(contractId);
    if (!contract) return null;

    const triggers = await this.getAdTriggersByAdvertiser(contract.advertiserId);
    const periodTriggers = triggers.filter(t => 
      t.triggeredAt.toISOString().slice(0, 7) === period
    );

    return {
      contractId,
      period,
      totalTriggers: periodTriggers.length,
      totalSpend: periodTriggers.reduce((sum, t) => sum + Number(t.cost), 0),
      averageCostPerTrigger: periodTriggers.length > 0 
        ? periodTriggers.reduce((sum, t) => sum + Number(t.cost), 0) / periodTriggers.length 
        : 0,
      currency: contract.currency,
      budgetUtilization: contract.monthlyBudget 
        ? (Number(contract.currentMonthSpend) / Number(contract.monthlyBudget)) * 100 
        : 0
    };
  }

  async getConditionRulesByAdvertiser(advertiserId: number): Promise<ConditionRule[]> {
    try {
      const rules = await db
        .select()
        .from(schema.conditionRules)
        .where(eq(schema.conditionRules.advertiserId, advertiserId))
        .orderBy(desc(schema.conditionRules.priority));
      return rules;
    } catch (error) {
      console.error("Error fetching condition rules for advertiser:", error);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();