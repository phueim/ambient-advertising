import { Router } from "express";
import { z } from "zod";
import { createServer } from "http";
import { storage } from "./storage";
import { 
  insertAdvertiserSchema, updateAdvertiserSchema, insertConditionRuleSchema, insertLocationSchema,
  insertAudioSchema, insertAdvertisingSchema, insertAdTriggerSchema
} from "@shared/schema";
import { GeminiScriptService } from "./services/geminiScriptService";
import { elevenLabsService } from "./services/elevenLabsService.js";
import { voiceSettingsEngine } from "./services/voiceSettingsEngine.js";
import { advertisingPipelineService } from "./services/advertisingPipelineService.js";

const router = Router();

// Health check endpoint
router.get("/api/health", async (req, res) => {
  try {
    const healthStatus = await storage.getSystemHealthStatus();
    res.json({ status: "ok", services: healthStatus });
  } catch (error) {
    res.status(500).json({ error: "Health check failed" });
  }
});

// Worker management endpoints
router.get("/api/workers/status", async (req, res) => {
  try {
    const workerManager = (global as any).workerManager;
    if (!workerManager) {
      return res.status(503).json({ error: "Worker manager not initialized" });
    }
    
    const status = workerManager.getWorkersStatus();
    const healthSummary = await workerManager.getSystemHealthSummary();
    
    res.json({
      ...status,
      health: healthSummary
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to get worker status" });
  }
});

router.post("/api/workers/start", async (req, res) => {
  try {
    const workerManager = (global as any).workerManager;
    if (!workerManager) {
      return res.status(503).json({ error: "Worker manager not initialized" });
    }
    
    const { dataIngestionInterval, triggerEngineInterval } = req.body;
    
    await workerManager.startAllWorkers({
      dataIngestionInterval: dataIngestionInterval || 5,
      triggerEngineInterval: triggerEngineInterval || 5
    });
    
    res.json({ message: "Workers started successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to start workers" });
  }
});

router.post("/api/workers/stop", async (req, res) => {
  try {
    const workerManager = (global as any).workerManager;
    if (!workerManager) {
      return res.status(503).json({ error: "Worker manager not initialized" });
    }
    
    await workerManager.stopAllWorkers();
    res.json({ message: "Workers stopped successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to stop workers" });
  }
});

router.post("/api/workers/restart", async (req, res) => {
  try {
    const workerManager = (global as any).workerManager;
    if (!workerManager) {
      return res.status(503).json({ error: "Worker manager not initialized" });
    }
    
    const { dataIngestionInterval, triggerEngineInterval } = req.body;
    
    await workerManager.restartAllWorkers({
      dataIngestionInterval: dataIngestionInterval || 5,
      triggerEngineInterval: triggerEngineInterval || 5
    });
    
    res.json({ message: "Workers restarted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to restart workers" });
  }
});

// Billing and transaction endpoints
router.get("/api/v1/billing/transactions", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const triggers = await storage.getAdTriggerHistory(limit);
    
    // Transform triggers to transaction format
    const transactions = triggers.map(trigger => ({
      id: trigger.id,
      advertiserId: trigger.advertiserId,
      amount: `-${trigger.cost}`,
      type: "debit",
      description: `Ad trigger: ${trigger.ruleId}`,
      timestamp: trigger.triggeredAt,
      advertiserName: `Advertiser ${trigger.advertiserId}` // In production, join with advertiser data
    }));
    
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

router.post("/api/v1/billing/add-credits", async (req, res) => {
  try {
    const { advertiserId, amount, type, description } = req.body;
    
    if (!advertiserId || !amount) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    // Get current advertiser
    const advertiser = await storage.getAdvertiserById(advertiserId);
    if (!advertiser) {
      return res.status(404).json({ error: "Advertiser not found" });
    }
    
    // Update credit balance (add credits)
    const currentBalance = parseFloat(advertiser.creditBalance);
    const newBalance = currentBalance + parseFloat(amount);
    
    // Update database (this would need to be implemented in storage)
    // For now, we'll simulate the response
    
    res.json({
      success: true,
      transaction: {
        advertiserId,
        amount: `+${amount}`,
        type: type || "credit",
        description: description || `Credit top-up - $${amount}`,
        timestamp: new Date().toISOString(),
        newBalance: newBalance.toFixed(2)
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to add credits" });
  }
});

// Contract Templates API
router.get("/api/v1/contract-templates", async (req, res) => {
  try {
    const templates = await storage.getAllContractTemplates();
    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch contract templates" });
  }
});

router.post("/api/v1/contract-templates", async (req, res) => {
  try {
    const template = await storage.createContractTemplate(req.body);
    res.json(template);
  } catch (error) {
    res.status(500).json({ error: "Failed to create contract template" });
  }
});

router.put("/api/v1/contract-templates/:id", async (req, res) => {
  try {
    console.log("Updating contract template:", req.params.id, req.body);
    const template = await storage.updateContractTemplate(parseInt(req.params.id), req.body);
    if (!template) {
      return res.status(404).json({ error: "Contract template not found" });
    }
    res.json(template);
  } catch (error) {
    console.error("Error updating contract template:", error);
    res.status(500).json({ 
      error: "Failed to update contract template",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

router.delete("/api/v1/contract-templates/:id", async (req, res) => {
  try {
    const success = await storage.deleteContractTemplate(parseInt(req.params.id));
    if (!success) {
      return res.status(404).json({ error: "Contract template not found" });
    }
    res.json({ success: true, message: "Contract template deleted successfully" });
  } catch (error) {
    console.error("Error deleting contract template:", error);
    res.status(500).json({ 
      error: "Failed to delete contract template",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// Advertiser Contracts API
router.get("/api/v1/advertiser-contracts", async (req, res) => {
  try {
    const contracts = await storage.getAllAdvertiserContracts();
    res.json(contracts);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch advertiser contracts" });
  }
});

router.get("/api/v1/advertiser-contracts/:id", async (req, res) => {
  try {
    const contract = await storage.getAdvertiserContractById(parseInt(req.params.id));
    if (!contract) {
      return res.status(404).json({ error: "Contract not found" });
    }
    res.json(contract);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch contract" });
  }
});

router.post("/api/v1/advertiser-contracts", async (req, res) => {
  try {
    console.log("Creating advertiser contract with data:", req.body);
    
    // Validate required fields
    const { advertiserId, templateId, contractName, startDate, endDate } = req.body;
    if (!advertiserId || !templateId || !contractName || !startDate || !endDate) {
      return res.status(400).json({ 
        error: "Missing required fields", 
        required: ["advertiserId", "templateId", "contractName", "startDate", "endDate"] 
      });
    }

    // Get template to copy billing information
    const template = await storage.getContractTemplateById(templateId);
    if (!template) {
      return res.status(404).json({ error: "Contract template not found" });
    }

    // Create contract with template data
    const contractData = {
      advertiserId,
      templateId,
      contractName,
      currency: template.currency,
      billingType: template.billingType,
      monthlyFixedFee: template.monthlyFixedFee,
      perTriggerRate: template.perTriggerRate,
      minimumGuarantee: template.minimumGuarantee,
      performanceBonusThreshold: template.performanceBonusThreshold,
      performanceBonusRate: template.performanceBonusRate,
      maxTriggersPerMonth: template.maxTriggersPerMonth,
      monthlyBudget: template.monthlyBudget,
      currentMonthSpend: "0.00",
      currentMonthTriggers: 0,
      startDate,
      endDate,
      status: "active"
    };

    const contract = await storage.createAdvertiserContract(contractData);
    res.json(contract);
  } catch (error) {
    console.error("Error creating advertiser contract:", error);
    res.status(500).json({ 
      error: "Failed to create advertiser contract",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

router.put("/api/v1/advertiser-contracts/:id", async (req, res) => {
  try {
    console.log("Updating advertiser contract:", req.params.id, req.body);
    const contract = await storage.updateAdvertiserContract(parseInt(req.params.id), req.body);
    if (!contract) {
      return res.status(404).json({ error: "Advertiser contract not found" });
    }
    res.json(contract);
  } catch (error) {
    console.error("Error updating advertiser contract:", error);
    res.status(500).json({ 
      error: "Failed to update advertiser contract",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

router.delete("/api/v1/advertiser-contracts/:id", async (req, res) => {
  try {
    const success = await storage.deleteAdvertiserContract(parseInt(req.params.id));
    if (!success) {
      return res.status(404).json({ error: "Advertiser contract not found" });
    }
    res.json({ success: true, message: "Advertiser contract deleted successfully" });
  } catch (error) {
    console.error("Error deleting advertiser contract:", error);
    res.status(500).json({ 
      error: "Failed to delete advertiser contract",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// Venues API
router.get("/api/v1/venues", async (req, res) => {
  try {
    const venues = await storage.getAllVenues();
    res.json(venues);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch venues" });
  }
});

router.post("/api/v1/venues", async (req, res) => {
  try {
    const venue = await storage.createVenue(req.body);
    res.json(venue);
  } catch (error) {
    res.status(500).json({ error: "Failed to create venue" });
  }
});

// Venue Contracts API
router.get("/api/v1/venue-contracts", async (req, res) => {
  try {
    const contracts = await storage.getAllVenueContracts();
    res.json(contracts);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch venue contracts" });
  }
});

router.post("/api/v1/venue-contracts", async (req, res) => {
  try {
    console.log("Creating venue contract with data:", req.body);
    
    // Validate required fields
    const { venueId, templateId, contractName, startDate, endDate } = req.body;
    if (!venueId || !templateId || !contractName || !startDate || !endDate) {
      return res.status(400).json({ 
        error: "Missing required fields", 
        required: ["venueId", "templateId", "contractName", "startDate", "endDate"] 
      });
    }

    // Get template to copy payout information
    const template = await storage.getContractTemplateById(templateId);
    if (!template) {
      return res.status(404).json({ error: "Contract template not found" });
    }

    // Create contract with template data
    const contractData = {
      venueId,
      templateId,
      contractName,
      currency: template.currency,
      payoutType: template.venuePayoutType,
      fixedMonthly: template.venueFixedMonthly,
      percentageRate: template.venuePercentageRate,
      minimumGuarantee: template.venueMinimumGuarantee,
      performanceBonusThreshold: template.venuePerformanceBonusThreshold,
      performanceBonusRate: template.venuePerformanceBonusRate,
      currentMonthRevenue: "0.00",
      currentMonthTriggers: 0,
      startDate,
      endDate,
      status: "active"
    };

    const contract = await storage.createVenueContract(contractData);
    res.json(contract);
  } catch (error) {
    console.error("Error creating venue contract:", error);
    res.status(500).json({ 
      error: "Failed to create venue contract",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

router.put("/api/v1/venue-contracts/:id", async (req, res) => {
  try {
    console.log("Updating venue contract:", req.params.id, req.body);
    const contract = await storage.updateVenueContract(parseInt(req.params.id), req.body);
    if (!contract) {
      return res.status(404).json({ error: "Venue contract not found" });
    }
    res.json(contract);
  } catch (error) {
    console.error("Error updating venue contract:", error);
    res.status(500).json({ 
      error: "Failed to update venue contract",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

router.delete("/api/v1/venue-contracts/:id", async (req, res) => {
  try {
    const success = await storage.deleteVenueContract(parseInt(req.params.id));
    if (!success) {
      return res.status(404).json({ error: "Venue contract not found" });
    }
    res.json({ success: true, message: "Venue contract deleted successfully" });
  } catch (error) {
    console.error("Error deleting venue contract:", error);
    res.status(500).json({ 
      error: "Failed to delete venue contract",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// Billing Records API
router.get("/api/v1/billing-records", async (req, res) => {
  try {
    const records = await storage.getAllBillingRecords();
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch billing records" });
  }
});

router.get("/api/v1/billing-records/contract/:contractId", async (req, res) => {
  try {
    const records = await storage.getBillingRecordsByContractId(parseInt(req.params.contractId));
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch billing records for contract" });
  }
});

// Payout Records API
router.get("/api/v1/payout-records", async (req, res) => {
  try {
    const records = await storage.getAllPayoutRecords();
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch payout records" });
  }
});

router.get("/api/v1/payout-records/contract/:contractId", async (req, res) => {
  try {
    const records = await storage.getPayoutRecordsByContractId(parseInt(req.params.contractId));
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch payout records for contract" });
  }
});

// Contract Performance Metrics API
router.get("/api/v1/contracts/:contractId/metrics", async (req, res) => {
  try {
    const { contractId } = req.params;
    const { period } = req.query;
    const currentPeriod = period || new Date().toISOString().slice(0, 7); // YYYY-MM format
    
    const metrics = await storage.getContractPerformanceMetrics(parseInt(contractId), currentPeriod as string);
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch contract metrics" });
  }
});

// Monthly Billing Generation API
router.post("/api/v1/contracts/:contractId/generate-bill", async (req, res) => {
  try {
    const { contractId } = req.params;
    const { period } = req.body;
    const billingPeriod = period || new Date().toISOString().slice(0, 7);
    
    const billingRecord = await storage.calculateAdvertiserMonthlyBill(parseInt(contractId), billingPeriod);
    res.json(billingRecord);
  } catch (error) {
    res.status(500).json({ error: "Failed to generate monthly bill" });
  }
});

// Monthly Payout Generation API  
router.post("/api/v1/venue-contracts/:contractId/generate-payout", async (req, res) => {
  try {
    const { contractId } = req.params;
    const { period } = req.body;
    const payoutPeriod = period || new Date().toISOString().slice(0, 7);
    
    const payoutRecord = await storage.calculateVenueMonthlyPayout(parseInt(contractId), payoutPeriod);
    res.json(payoutRecord);
  } catch (error) {
    res.status(500).json({ error: "Failed to generate monthly payout" });
  }
});

// Test endpoint to seed contract system manually
router.post("/api/test-seed-contracts", async (req, res) => {
  try {
    const { seedContractSystem } = await import("./contractSeedData");
    await seedContractSystem();
    res.json({ success: true, message: "Contract system seeded successfully" });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Failed to seed contract system" });
  }
});

// Government data endpoints
router.get("/api/v1/fetch-government-data", async (req, res) => {
  try {
    const latestData = await storage.getLatestGovernmentData();
    res.json(latestData);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch government data" });
  }
});

router.get("/api/v1/government-data/history", async (req, res) => {
  try {
    const hours = parseInt(req.query.hours as string) || 24;
    const history = await storage.getGovernmentDataHistory(hours);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch data history" });
  }
});

// Advertiser endpoints
router.get("/api/v1/advertisers", async (req, res) => {
  try {
    const advertisers = await storage.getAllAdvertisers();
    res.json(advertisers);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch advertisers" });
  }
});

router.get("/api/v1/advertisers/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const advertiser = await storage.getAdvertiserById(id);
    if (!advertiser) {
      return res.status(404).json({ error: "Advertiser not found" });
    }
    res.json(advertiser);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch advertiser" });
  }
});

router.post("/api/v1/advertisers", async (req, res) => {
  try {
    const validatedData = insertAdvertiserSchema.parse(req.body);
    
    // Validation 1: Internal name and display name cannot be the same
    if (validatedData.name.toLowerCase() === validatedData.displayName.toLowerCase()) {
      return res.status(400).json({ 
        error: "Validation failed", 
        message: "Internal name and display name cannot be the same" 
      });
    }
    
    // Validation 2: Check for duplicate internal names (system-wide)
    const existingAdvertiserByName = await storage.getAdvertiserByName(validatedData.name);
    if (existingAdvertiserByName) {
      return res.status(400).json({ 
        error: "Validation failed", 
        message: "An advertiser with this internal name already exists" 
      });
    }
    
    // Validation 3: Check for duplicate display names (system-wide)
    const existingAdvertiserByDisplayName = await storage.getAdvertiserByDisplayName(validatedData.displayName);
    if (existingAdvertiserByDisplayName) {
      return res.status(400).json({ 
        error: "Validation failed", 
        message: "An advertiser with this display name already exists" 
      });
    }
    
    const advertiser = await storage.createAdvertiser(validatedData);
    
    // Handle rule assignments if provided
    if (req.body.assignedRules && Array.isArray(req.body.assignedRules)) {
      await storage.assignRulesToAdvertiser(advertiser.id, req.body.assignedRules);
    }
    
    res.status(201).json(advertiser);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation failed", details: error.errors });
    }
    res.status(500).json({ error: "Failed to create advertiser" });
  }
});

router.put("/api/v1/advertisers/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const validatedData = updateAdvertiserSchema.parse(req.body);
    
    // Get existing advertiser
    const existingAdvertiser = await storage.getAdvertiserById(id);
    if (!existingAdvertiser) {
      return res.status(404).json({ error: "Advertiser not found" });
    }
    
    // Determine final values after update
    const finalName = validatedData.name || existingAdvertiser.name;
    const finalDisplayName = validatedData.displayName || existingAdvertiser.displayName;
    
    // Validation 1: Internal name and display name cannot be the same
    if (finalName.toLowerCase() === finalDisplayName.toLowerCase()) {
      return res.status(400).json({ 
        error: "Validation failed", 
        message: "Internal name and display name cannot be the same" 
      });
    }
    
    // Validation 2: Check for duplicate internal names (if name is being updated)
    if (validatedData.name && validatedData.name !== existingAdvertiser.name) {
      const duplicateByName = await storage.getAdvertiserByName(validatedData.name);
      if (duplicateByName) {
        return res.status(400).json({ 
          error: "Validation failed", 
          message: "An advertiser with this internal name already exists" 
        });
      }
    }
    
    // Validation 3: Check for duplicate display names (if display name is being updated)
    if (validatedData.displayName && validatedData.displayName !== existingAdvertiser.displayName) {
      const duplicateByDisplayName = await storage.getAdvertiserByDisplayName(validatedData.displayName);
      if (duplicateByDisplayName) {
        return res.status(400).json({ 
          error: "Validation failed", 
          message: "An advertiser with this display name already exists" 
        });
      }
    }
    
    const advertiser = await storage.updateAdvertiser(id, validatedData);
    
    // Handle rule assignments if provided
    if (req.body.assignedRules && Array.isArray(req.body.assignedRules)) {
      await storage.assignRulesToAdvertiser(id, req.body.assignedRules);
    }
    
    res.json(advertiser);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation failed", details: error.errors });
    }
    res.status(500).json({ error: "Failed to update advertiser" });
  }
});

router.delete("/api/v1/advertisers/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    // Check if advertiser exists
    const advertiser = await storage.getAdvertiserById(id);
    if (!advertiser) {
      return res.status(404).json({ error: "Advertiser not found" });
    }

    // Delete related records first (cascade delete)
    console.log(`Starting cascade delete for advertiser ${id}...`);
    
    // 1. Delete condition rules
    try {
      await storage.deleteConditionRulesByAdvertiser(id);
      console.log(`Deleted condition rules for advertiser ${id}`);
    } catch (error) {
      console.log(`No condition rules to delete for advertiser ${id}`);
    }

    // 2. Delete advertiser contracts
    try {
      await storage.deleteAdvertiserContractsByAdvertiser(id);
      console.log(`Deleted contracts for advertiser ${id}`);
    } catch (error) {
      console.log(`No contracts to delete for advertiser ${id}`);
    }

    // 3. Delete ad triggers
    try {
      await storage.deleteAdTriggersByAdvertiser(id);
      console.log(`Deleted ad triggers for advertiser ${id}`);
    } catch (error) {
      console.log(`No ad triggers to delete for advertiser ${id}`);
    }

    // 4. Finally delete the advertiser
    const deleted = await storage.deleteAdvertiser(id);
    if (!deleted) {
      return res.status(404).json({ error: "Advertiser not found" });
    }

    console.log(`Successfully deleted advertiser ${id} with all related records`);
    res.json({ message: "Advertiser deleted successfully" });
  } catch (error) {
    console.error("Error deleting advertiser:", error);
    res.status(500).json({ 
      error: "Failed to delete advertiser",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// Condition rules endpoints (consolidated)
router.get("/api/v1/condition-rules", async (req, res) => {
  try {
    console.log("Fetching condition rules...");
    const rules = await storage.getAllConditionRules();
    console.log(`Successfully fetched ${rules.length} rules`);
    res.json(rules);
  } catch (error) {
    console.error("Error fetching condition rules:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : error);
    res.status(500).json({ 
      error: "Failed to fetch condition rules",
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

router.get("/api/v1/advertisers/:id/condition-rules", async (req, res) => {
  try {
    const advertiserId = parseInt(req.params.id);
    if (isNaN(advertiserId)) {
      return res.status(400).json({ error: "Invalid advertiser ID" });
    }
    
    const rules = await storage.getConditionRulesByAdvertiser(advertiserId);
    res.json(rules);
  } catch (error) {
    console.error("Error fetching condition rules for advertiser:", error);
    res.status(500).json({ 
      error: "Failed to fetch condition rules for advertiser",
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

router.get("/api/v1/condition-rules/:id", async (req, res) => {
  try {
    const rule = await storage.getConditionRuleById(req.params.id);
    if (!rule) {
      return res.status(404).json({ error: "Condition rule not found" });
    }
    res.json(rule);
  } catch (error) {
    console.error("Error fetching condition rule:", error);
    res.status(500).json({ error: "Failed to fetch condition rule" });
  }
});

router.post("/api/v1/condition-rules", async (req, res) => {
  try {
    const validatedData = insertConditionRuleSchema.parse(req.body);
    const rule = await storage.createConditionRule(validatedData);
    res.status(201).json(rule);
  } catch (error) {
    console.error("Error creating condition rule:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation failed", details: error.errors });
    }
    res.status(500).json({ error: "Failed to create condition rule" });
  }
});

router.patch("/api/v1/condition-rules/:id", async (req, res) => {
  try {
    const rule = await storage.updateConditionRule(req.params.id, req.body);
    res.json(rule);
  } catch (error) {
    console.error("Error updating condition rule:", error);
    res.status(500).json({ error: "Failed to update condition rule" });
  }
});

router.put("/api/v1/condition-rules/:ruleId", async (req, res) => {
  try {
    const { ruleId } = req.params;
    const updates = req.body;
    
    const rule = await storage.updateConditionRule(ruleId, updates);
    res.json(rule);
  } catch (error) {
    console.error("Error updating condition rule:", error);
    res.status(500).json({ error: "Failed to update condition rule" });
  }
});

// Location endpoints
router.get("/api/v1/locations", async (req, res) => {
  try {
    const locations = await storage.getAllLocations();
    res.json(locations);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch locations" });
  }
});

router.post("/api/v1/locations", async (req, res) => {
  try {
    const validatedData = insertLocationSchema.parse(req.body);
    const location = await storage.createLocation(validatedData);
    res.status(201).json(location);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation failed", details: error.errors });
    }
    res.status(500).json({ error: "Failed to create location" });
  }
});

// Ad trigger endpoints
router.get("/api/v1/ad-triggers", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const triggers = await storage.getAdTriggerHistory(limit);
    res.json(triggers);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch ad triggers" });
  }
});

router.get("/api/v1/ad-triggers/advertiser/:id", async (req, res) => {
  try {
    const advertiserId = parseInt(req.params.id);
    const triggers = await storage.getAdTriggersByAdvertiser(advertiserId);
    res.json(triggers);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch advertiser triggers" });
  }
});

router.get("/api/v1/ad-triggers/location/:id", async (req, res) => {
  try {
    const locationId = parseInt(req.params.id);
    const triggers = await storage.getAdTriggersByLocation(locationId);
    res.json(triggers);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch location triggers" });
  }
});

router.post("/api/v1/trigger-ad", async (req, res) => {
  try {
    const validatedData = insertAdTriggerSchema.parse(req.body);
    const trigger = await storage.createAdTrigger(validatedData);
    
    // Update advertiser balance
    const advertiser = await storage.updateAdvertiserBalance(
      validatedData.advertiserId, 
      Number(validatedData.cost)
    );
    
    res.status(201).json({
      status: "success",
      trigger,
      remaining_credit: advertiser.creditBalance
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation failed", details: error.errors });
    }
    res.status(500).json({ 
      status: "failure",
      error: "Failed to trigger ad" 
    });
  }
});

// Script endpoints
router.post("/api/v1/scripts", async (req, res) => {
  try {
    const validatedData = insertAudioSchema.parse(req.body);
    const script = await storage.createScript(validatedData);
    res.status(201).json(script);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation failed", details: error.errors });
    }
    res.status(500).json({ error: "Failed to create script" });
  }
});

router.get("/api/v1/scripts/rule/:ruleId", async (req, res) => {
  try {
    const scripts = await storage.getScriptsByRuleId(req.params.ruleId);
    res.json(scripts);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch scripts" });
  }
});

// Promotional Script Generation endpoint removed - now handled directly in AudioGenerationService

// Voiceover endpoints
// ElevenLabs voiceover generation endpoint
router.post("/api/v1/voiceovers/generate", async (req, res) => {
  try {
    const { script, rule, voiceType, advertiser_internal_name } = req.body;
    
    if (!script || !rule || !voiceType || !advertiser_internal_name) {
      return res.status(400).json({ 
        error: "Missing required fields", 
        required: ["script", "rule", "voiceType", "advertiser_internal_name"] 
      });
    }

    if (!['male', 'female'].includes(voiceType)) {
      return res.status(400).json({ error: "voiceType must be 'male' or 'female'" });
    }

    // Get voice settings based on rule
    const voiceSettings = voiceSettingsEngine.getVoiceSettings(rule);
    
    // Generate voiceover using ElevenLabs
    const result = await elevenLabsService.generateVoiceover({
      script,
      voiceType,
      voiceSettings,
      advertiserInternalName: advertiser_internal_name,
    });

    res.status(201).json({
      success: true,
      audio_path: result.audioPath,
      file_name: result.fileName,
      file_size: result.fileSize,
      voice_type: voiceType,
      voice_settings: voiceSettings,
      advertiser: advertiser_internal_name,
      generated_at: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error generating voiceover:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to generate voiceover",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

router.post("/api/v1/generate-voiceover", async (req, res) => {
  try {
    const { scriptId, voiceType } = req.body;
    
    if (!scriptId || !voiceType) {
      return res.status(400).json({ error: "scriptId and voiceType are required" });
    }
    
    const voiceover = await storage.createVoiceover({
      scriptId,
      voiceType,
      status: "pending"
    });
    
    // In a real implementation, this would trigger the voice synthesis process
    // For now, we'll simulate the process
    setTimeout(async () => {
      await storage.updateVoiceoverStatus(
        voiceover.id, 
        "completed", 
        `https://mock-audio-service.com/voiceover/${voiceover.id}.mp3`
      );
    }, 2000);
    
    res.status(201).json({
      audio_url: `https://mock-audio-service.com/voiceover/${voiceover.id}.mp3`,
      duration_sec: 15,
      voiceover_id: voiceover.id
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to generate voiceover" });
  }
});

// Reporting endpoints
router.get("/api/v1/report", async (req, res) => {
  try {
    const { type, date_from, date_to } = req.query;
    
    if (type === "system") {
      const systemHealth = await storage.getSystemHealthStatus();
      res.json({
        type: "system",
        data: systemHealth,
        generated_at: new Date().toISOString()
      });
    } else if (type === "advertiser") {
      const advertisers = await storage.getAllAdvertisers();
      const triggers = await storage.getAdTriggerHistory(1000);
      
      const report = advertisers.map(advertiser => {
        const advertiserTriggers = triggers.filter(t => t.advertiserId === advertiser.id);
        const totalSpent = advertiserTriggers.reduce((sum, t) => sum + Number(t.cost), 0);
        
        return {
          advertiser_id: advertiser.id,
          name: advertiser.displayName,
          triggers_count: advertiserTriggers.length,
          credits_used: totalSpent,
          credit_balance: Number(advertiser.creditBalance),
          cost_per_trigger: advertiserTriggers.length > 0 ? totalSpent / advertiserTriggers.length : 0
        };
      });
      
      res.json({
        type: "advertiser",
        data: report,
        generated_at: new Date().toISOString()
      });
    } else {
      res.status(400).json({ error: "Invalid report type. Use 'system' or 'advertiser'" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to generate report" });
  }
});

// Audio files and voiceover preview endpoints
router.get("/api/v1/audio", async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const getAllParam = req.query.getAll === 'true';
    
    if (getAllParam) {
      // Return all audio files for dropdown usage
      const audioFiles = await storage.getAllAudio();
      res.json(audioFiles);
    } else {
      // Build filters from query parameters
      const filters: { status?: string; voiceType?: string } = {};
      if (req.query.status && req.query.status !== 'all') {
        filters.status = req.query.status as string;
      }
      if (req.query.voiceType && req.query.voiceType !== 'all') {
        filters.voiceType = req.query.voiceType as string;
      }
      
      // Return paginated results with filters
      const result = await storage.getAudioPaginated(page, pageSize, Object.keys(filters).length > 0 ? filters : undefined);
      res.json(result);
    }
  } catch (error) {
    console.error('Error fetching audio files:', error);
    res.status(500).json({ message: 'Failed to fetch audio files' });
  }
});

router.get("/api/voiceovers", async (req, res) => {
  try {
    // This endpoint is now deprecated - redirect to new audio API
    const audioFiles = await storage.getAllAudio();
    console.log('Fetched audio files:', audioFiles.length);
    res.json(audioFiles);
  } catch (error) {
    console.error('Error fetching audio files:', error);
    console.error('Error stack:', error);
    res.status(500).json({ message: 'Failed to fetch voiceovers', details: error instanceof Error ? error.message : String(error) });
  }
});

router.get("/api/voiceovers/:id", async (req, res) => {
  try {
    const audio = await storage.getAudioById(parseInt(req.params.id));
    if (!audio) {
      return res.status(404).json({ message: 'Audio not found' });
    }
    res.json(audio);
  } catch (error) {
    console.error('Error fetching audio:', error);
    res.status(500).json({ message: 'Failed to fetch audio' });
  }
});

// Advertising endpoints
router.get("/api/v1/advertising", async (req, res) => {
  try {
    const advertising = await storage.getAllAdvertising();
    res.json(advertising);
  } catch (error) {
    console.error('Error fetching advertising:', error);
    res.status(500).json({ error: 'Failed to fetch advertising' });
  }
});

router.get("/api/v1/advertising/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const advertising = await storage.getAdvertisingById(id);
    if (!advertising) {
      return res.status(404).json({ error: "Advertising not found" });
    }
    res.json(advertising);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch advertising" });
  }
});

router.post("/api/v1/advertising", async (req, res) => {
  try {
    const validatedData = insertAdvertisingSchema.parse(req.body);
    const advertising = await storage.createAdvertising(validatedData);
    res.status(201).json(advertising);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation failed", details: error.errors });
    }
    res.status(500).json({ error: "Failed to create advertising" });
  }
});

router.put("/api/v1/advertising/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const validatedData = insertAdvertisingSchema.partial().parse(req.body);
    const advertising = await storage.updateAdvertising(id, validatedData);
    res.json(advertising);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation failed", details: error.errors });
    }
    res.status(500).json({ error: "Failed to update advertising" });
  }
});

router.delete("/api/v1/advertising/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await storage.deleteAdvertising(id);
    res.json({ message: "Advertising deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete advertising" });
  }
});

// Advertising Pipeline endpoints
router.post("/api/v1/advertising-pipeline/process-pending", async (req, res) => {
  try {
    console.log("[API] Manual trigger of advertising pipeline...");
    const result = await advertisingPipelineService.processPendingRecordsManually();
    
    res.json({
      success: true,
      result,
      message: `Processed ${result.processedRecords} records. Success: ${result.successfulGenerations}, Failed: ${result.failedGenerations}`
    });
  } catch (error) {
    console.error("[API] Pipeline processing error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to process pending records",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

router.get("/api/v1/advertising-pipeline/stats", async (req, res) => {
  try {
    const stats = await advertisingPipelineService.getPipelineStats();
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error("[API] Pipeline stats error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get pipeline stats",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

router.post("/api/v1/advertising-pipeline/retry-failed", async (req, res) => {
  try {
    console.log("[API] Retrying failed advertising records...");
    const result = await advertisingPipelineService.retryFailedRecords();
    
    res.json({
      success: true,
      result,
      message: `Retried failed records. Success: ${result.successfulGenerations}, Failed: ${result.failedGenerations}`
    });
  } catch (error) {
    console.error("[API] Pipeline retry error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to retry failed records",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// Government Data endpoints
router.get("/api/government-data/latest", async (req, res) => {
  let latestData = null;
  let matchedRules = [];
  let generatedScripts: any[] = [];
  let pipelineResult = null;
  let createdCampaigns: any[] = [];
  
  try {
    console.log("[API] /api/government-data/latest - Starting request");
    
    // Import and create services directly since they might not be global
    const { GovernmentDataService } = await import("./services/governmentDataService");
    const { ConditionEngine } = await import("./services/conditionEngine");
    const { advertisingPipelineService } = await import("./services/advertisingPipelineService");
    
    const govDataService = new GovernmentDataService();
    const conditionEngine = new ConditionEngine();

    // Get the latest government data
    latestData = await govDataService.fetchLatestData();
    console.log("[API] Government data fetched successfully");
    
    // Get matched rules
    matchedRules = await conditionEngine.evaluateConditions(latestData);
    console.log(`[API] Found ${matchedRules.length} matched rules`);
    
    // Debug: Log the data structure being used
    console.log("[API] ConditionEngine data structure:", {
      weather: latestData.weather ? Object.keys(latestData.weather) : 'missing',
      timeBased: latestData.timeBased ? Object.keys(latestData.timeBased) : 'missing',
      traffic: latestData.traffic ? Object.keys(latestData.traffic) : 'missing'
    });
    
  } catch (error) {
    console.error('Error fetching core government data:', error);
    return res.status(500).json({ 
      error: "Failed to fetch government data",
      details: error instanceof Error ? error.message : String(error)
    });
  }

  // NOTE: Script generation now happens in the automation pipeline to avoid duplication

  // NEW: Trigger complete advertising automation pipeline
  try {
    if (matchedRules.length > 0) {
      console.log("[API] Starting advertising automation pipeline...");
      
      // Convert government data to pipeline format (flat structure expected by AdvertisingPipelineService)
      const governmentData = {
        temperature: latestData.weather?.temperature_c || 0,
        weather_condition: latestData.weather?.condition || 'unknown',
        hour_of_day: latestData.timeBased?.hour_of_day || 0,
        day_of_week: latestData.timeBased?.day_of_week || 0,
        is_weekend: latestData.timeBased?.is_weekend || false,
        is_business_hours: latestData.timeBased?.is_business_hours || false,
        is_peak_hours: latestData.timeBased?.is_peak_hours || false,
        time_category: latestData.timeBased?.time_category || 'unknown',
        uv_index: latestData.weather?.uv_index || 0,
        traffic_congestion_level: 'moderate', // Default value
        flood_alerts: [],
        timestamp: latestData.weather?.timestamp || new Date().toISOString()
      };
      
      // Debug: Log the flat data structure being passed to pipeline
      console.log("[API] Pipeline data structure:", governmentData);
      
      // Trigger the full advertising pipeline (creates campaigns + generates audio)
      pipelineResult = await advertisingPipelineService.processGovernmentDataUpdate(governmentData);
      
      console.log(`[API] Pipeline completed - Processed: ${pipelineResult.processedRecords}, Success: ${pipelineResult.successfulGenerations}, Failed: ${pipelineResult.failedGenerations}`);
      
      if (pipelineResult.errors.length > 0) {
        console.error(`[API] Pipeline errors:`, pipelineResult.errors);
      }
      
      // Get the created advertising campaigns
      const { storage } = await import("./storage");
      const allCampaigns = await storage.getAllAdvertising(); // Already ordered by createdAt desc
      createdCampaigns = allCampaigns.slice(0, 10); // Get last 10 campaigns
      
    } else {
      console.log("[API] Skipping automation pipeline - no matched rules");
    }
  } catch (pipelineError) {
    console.error('[API] Advertising automation pipeline failed:', pipelineError);
    // Don't fail the entire request if pipeline fails
  }
  
  // Always return the response, even if pipeline failed
  res.json({
    data: latestData,
    matchedRules: matchedRules,
    generatedScripts: generatedScripts, // Now empty - scripts are generated in automation pipeline to avoid duplication
    automation: {
      pipelineResult: pipelineResult,
      createdCampaigns: createdCampaigns,
      pipelineTriggered: !!pipelineResult,
      note: "Scripts and audio are generated in the automation pipeline. Check createdCampaigns for results."
    },
    timestamp: new Date().toISOString()
  });
});

router.get("/api/government-data/history", async (req, res) => {
  try {
    const hours = parseInt(req.query.hours as string) || 24; // Default to last 24 hours
    
    const history = await storage.getGovernmentDataHistory(hours);
    
    res.json({
      data: history,
      count: history.length,
      hours: hours
    });
  } catch (error) {
    console.error('Error fetching government data history:', error);
    res.status(500).json({ error: "Failed to fetch government data history" });
  }
});

export default router;

// Function to register routes with the app (for compatibility with existing server setup)
export function registerRoutes(app: any) {
  app.use(router);
  
  // Create HTTP server
  return createServer(app);
}
