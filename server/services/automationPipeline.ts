import { GovernmentDataService } from "./governmentDataService";
import { ConditionEngine } from "./conditionEngine";
import { AIScriptService } from "./aiScriptService";
import { storage } from "../storage";

export interface PipelineResult {
  success: boolean;
  triggeredAds: number;
  errors: string[];
  executionTime: number;
  data: {
    weather: any;
    conditions: any;
    scripts: any[];
  };
}

export class AutomationPipeline {
  private governmentDataService: GovernmentDataService;
  private conditionEngine: ConditionEngine;
  private aiScriptService: AIScriptService;
  private isRunning: boolean = false;
  private intervalId: NodeJS.Timeout | null = null;

  constructor() {
    this.governmentDataService = new GovernmentDataService();
    this.conditionEngine = new ConditionEngine();
    this.aiScriptService = new AIScriptService();
  }

  async startAutomation(intervalMinutes: number = 5): Promise<void> {
    if (this.isRunning) {
      console.log("[AutomationPipeline] Pipeline already running");
      return;
    }

    console.log(`[AutomationPipeline] Starting automation pipeline with ${intervalMinutes} minute intervals`);
    this.isRunning = true;

    // Run immediately
    await this.executePipeline();

    // Set up recurring execution
    this.intervalId = setInterval(async () => {
      try {
        await this.executePipeline();
      } catch (error) {
        console.error("[AutomationPipeline] Error in scheduled execution:", error);
      }
    }, intervalMinutes * 60 * 1000);
  }

  async stopAutomation(): Promise<void> {
    console.log("[AutomationPipeline] Stopping automation pipeline");
    this.isRunning = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  async executePipeline(): Promise<PipelineResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    const scripts: any[] = [];
    let triggeredAds = 0;

    console.log("\n=== AMBIENT ADVERTISING AUTOMATION PIPELINE EXECUTION ===");
    console.log(`Execution started at: ${new Date().toISOString()}`);

    try {
      // Step 1: Fetch Government Data
      console.log("\n[Step 1] Fetching government data...");
      const governmentData = await this.governmentDataService.fetchLatestData();
      
      // Step 2: Evaluate Conditions
      console.log("\n[Step 2] Evaluating condition rules...");
      const conditionMatches = await this.conditionEngine.evaluateConditions(governmentData);
      
      if (conditionMatches.length === 0) {
        console.log("[Step 2] No condition matches found - no ads to trigger");
        return {
          success: true,
          triggeredAds: 0,
          errors,
          executionTime: Date.now() - startTime,
          data: {
            weather: governmentData.weather,
            conditions: [],
            scripts: []
          }
        };
      }

      console.log(`[Step 2] Found ${conditionMatches.length} condition matches`);

      // Step 3: Process each match
      for (const match of conditionMatches.slice(0, 3)) { // Limit to top 3 matches
        try {
          console.log(`\n[Step 3] Processing rule: ${match.rule.ruleId} (priority: ${match.priority})`);
          
          // Check advertiser contract and budget
          const advertiser = await storage.getAdvertiserById(match.rule.advertiserId);
          if (!advertiser) {
            errors.push(`Advertiser not found for rule ${match.rule.ruleId}`);
            continue;
          }

          // Get advertiser's active contract
          const contract = await storage.getAdvertiserContractByAdvertiserId(advertiser.id);
          if (!contract) {
            console.log(`[Step 3] No active contract found for advertiser ${advertiser.displayName}`);
            continue;
          }

          console.log(`[Step 3] Contract found for ${advertiser.displayName}: ${contract.contractName}`);
          console.log(`[Step 3] Billing type: ${contract.billingType}, Per-trigger rate: ${contract.perTriggerRate}`);

          // Calculate cost based on contract
          let unitCost = 0;
          switch (contract.billingType) {
            case 'monthly_fixed':
              // For monthly fixed, no per-trigger cost
              unitCost = 0;
              console.log(`[Step 3] Monthly fixed billing - unitCost set to 0`);
              break;
            case 'per_trigger':
              unitCost = Number(contract.perTriggerRate || 0);
              console.log(`[Step 3] Per-trigger billing - unitCost set to ${unitCost}`);
              break;
            case 'hybrid':
              unitCost = Number(contract.perTriggerRate || 0);
              console.log(`[Step 3] Hybrid billing - unitCost set to ${unitCost}`);
              break;
            default:
              unitCost = Number(contract.perTriggerRate || 10); // fallback
              console.log(`[Step 3] Default fallback - unitCost set to ${unitCost}`);
          }

          // Check budget constraints
          const currentSpend = Number(contract.currentMonthSpend);
          const monthlyBudget = Number(contract.monthlyBudget || 0);
          const maxTriggers = contract.maxTriggersPerMonth || 999999;

          if (monthlyBudget > 0 && (currentSpend + unitCost) > monthlyBudget) {
            console.log(`[Step 3] Advertiser ${advertiser.displayName} would exceed monthly budget (${currentSpend + unitCost} > ${monthlyBudget} ${contract.currency})`);
            continue;
          }

          if (contract.currentMonthTriggers >= maxTriggers) {
            console.log(`[Step 3] Advertiser ${advertiser.displayName} has reached monthly trigger limit (${contract.currentMonthTriggers}/${maxTriggers})`);
            continue;
          }

          // Step 4: Generate AI Script
          console.log("[Step 4] Generating AI script...");
          const scriptResult = await this.aiScriptService.generateScript({
            conditionMatch: match,
            locationContext: "Singapore Mall",
            voiceType: Math.random() > 0.5 ? "female" : "male"
          });

          scripts.push({
            ruleId: match.rule.ruleId,
            advertiser: advertiser.displayName,
            script: scriptResult.script.text,
            confidence: scriptResult.confidence
          });

          // Step 5: Simulate Voice Generation (would be real Suno.com integration)
          console.log("[Step 5] Generating voiceover...");
          const voiceover = await storage.createVoiceover({
            scriptId: scriptResult.script.id,
            voiceType: Math.random() > 0.5 ? "female" : "male",
            status: "pending"
          });

          // Simulate voice generation completion
          setTimeout(async () => {
            await storage.updateVoiceoverStatus(
              voiceover.id,
              "completed",
              `https://mock-suno-api.com/voice/${voiceover.id}.mp3`
            );
          }, 3000);

          // Step 6: Get random location for demo
          const locations = await storage.getAllLocations();
          const randomLocation = locations[Math.floor(Math.random() * locations.length)];
          
          if (!randomLocation) {
            // Create a default location if none exist
            const defaultLocation = await storage.createLocation({
              name: "Demo Mall - Singapore",
              address: "123 Orchard Road, Singapore",
              type: "mall",
              isActive: true
            });
            
            // Step 7: Trigger Ad
            await this.triggerAd(match, scriptResult.script.id, voiceover.id, defaultLocation.id, unitCost);
          } else {
            // Step 7: Trigger Ad
            await this.triggerAd(match, scriptResult.script.id, voiceover.id, randomLocation.id, unitCost);
          }

          triggeredAds++;
          console.log(`[Step 7] ✅ Ad triggered successfully for ${advertiser.displayName}`);

        } catch (error) {
          const errorMsg = `Error processing rule ${match.rule.ruleId}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          errors.push(errorMsg);
          console.error(`[Pipeline Error] ${errorMsg}`);
        }
      }

      const executionTime = Date.now() - startTime;
      console.log(`\n=== PIPELINE EXECUTION COMPLETE ===`);
      console.log(`Total execution time: ${executionTime}ms`);
      console.log(`Ads triggered: ${triggeredAds}`);
      console.log(`Errors: ${errors.length}`);
      
      if (errors.length > 0) {
        console.log("Errors encountered:");
        errors.forEach(error => console.log(`  - ${error}`));
      }

      return {
        success: errors.length === 0,
        triggeredAds,
        errors,
        executionTime,
        data: {
          weather: governmentData.weather,
          conditions: conditionMatches.map(m => ({
            ruleId: m.rule.ruleId,
            priority: m.priority,
            matchedConditions: m.matchedConditions
          })),
          scripts
        }
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorMsg = error instanceof Error ? error.message : "Unknown pipeline error";
      console.error(`[AutomationPipeline] Fatal error: ${errorMsg}`);
      
      return {
        success: false,
        triggeredAds,
        errors: [errorMsg],
        executionTime,
        data: {
          weather: null,
          conditions: [],
          scripts: []
        }
      };
    }
  }

  private async triggerAd(
    match: any, 
    scriptId: number, 
    voiceoverId: number, 
    locationId: number, 
    cost: number
  ): Promise<void> {
    // Create ad trigger record
    const trigger = await storage.createAdTrigger({
      advertiserId: match.rule.advertiserId,
      ruleId: match.rule.ruleId,
      locationId,
      scriptId,
      voiceoverId,
      cost: cost.toString(),
      weatherData: match.variables,
      status: "pending"
    });

    // Process billing through contract system
    await storage.processAdTriggerBilling(trigger.id);

    console.log(`[TriggerEngineWorker] Successfully triggered ad for rule ${match.rule.ruleId}`);

    // Simulate ad playback process
    setTimeout(async () => {
      // Update trigger status to 'played' after simulated playback
      // In production, this would be updated by the playback system
    }, 5000);
  }

  async getSystemStatus(): Promise<{
    isRunning: boolean;
    lastExecution?: Date;
    systemHealth: any[];
  }> {
    const systemHealth = await storage.getSystemHealthStatus();
    
    return {
      isRunning: this.isRunning,
      systemHealth
    };
  }

  async manualTrigger(): Promise<PipelineResult> {
    console.log("[AutomationPipeline] Manual pipeline execution triggered");
    return await this.executePipeline();
  }
}