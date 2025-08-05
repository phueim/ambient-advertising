import { ConditionEngine } from "../services/conditionEngine";
import { AIScriptService } from "../services/aiScriptService";
import { VoiceSynthesisWorker } from "./voiceSynthesisWorker";
import { storage } from "../storage";

export interface TriggerResult {
  triggerId: number;
  advertiserId: number;
  ruleId: string;
  success: boolean;
  error?: string;
}

export class TriggerEngineWorker {
  private conditionEngine: ConditionEngine;
  private aiScriptService: AIScriptService;
  private voiceSynthesisWorker: VoiceSynthesisWorker;
  private isRunning: boolean = false;
  private intervalId: NodeJS.Timeout | null = null;

  constructor(voiceSynthesisWorker: VoiceSynthesisWorker) {
    this.conditionEngine = new ConditionEngine();
    this.aiScriptService = new AIScriptService();
    this.voiceSynthesisWorker = voiceSynthesisWorker;
  }

  async start(intervalMinutes: number = 5): Promise<void> {
    if (this.isRunning) {
      console.log("[TriggerEngineWorker] Already running");
      return;
    }

    this.isRunning = true;
    console.log(`[TriggerEngineWorker] Starting trigger engine every ${intervalMinutes} minutes`);
    
    await storage.updateSystemHealth("trigger_engine", "healthy");
    
    // Run immediately
    await this.evaluateAndTrigger();
    
    // Set up recurring execution
    this.intervalId = setInterval(async () => {
      try {
        await this.evaluateAndTrigger();
      } catch (error) {
        console.error("[TriggerEngineWorker] Error in scheduled execution:", error);
        await storage.updateSystemHealth(
          "trigger_engine", 
          "error", 
          error instanceof Error ? error.message : "Unknown error"
        );
      }
    }, intervalMinutes * 60 * 1000);
  }

  async stop(): Promise<void> {
    console.log("[TriggerEngineWorker] Stopping trigger engine worker");
    this.isRunning = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    await storage.updateSystemHealth("trigger_engine", "stopped");
  }

  private async evaluateAndTrigger(): Promise<TriggerResult[]> {
    const startTime = Date.now();
    const results: TriggerResult[] = [];
    
    try {
      console.log(`[TriggerEngineWorker] ${new Date().toISOString()} - Evaluating triggers...`);
      
      // Get latest government data
      const latestData = await storage.getLatestGovernmentData();
      if (!latestData) {
        console.log("[TriggerEngineWorker] No government data available");
        return results;
      }

      // Evaluate conditions
      const conditionMatches = await this.conditionEngine.evaluateConditions({
        weather: {
          temperature_c: parseFloat(latestData.temperature || "0"),
          humidity_percent: latestData.humidity || 0,
          forecast: latestData.condition || "",
          condition: latestData.condition || "",
          uv_index: latestData.uvIndex || 0,
          timestamp: latestData.timestamp.toISOString()
        },
        timeBased: {
          timestamp: latestData.timestamp.toISOString(),
          hour_of_day: new Date().getHours(),
          day_of_week: new Date().getDay(),
          is_weekend: [0, 6].includes(new Date().getDay()),
          is_business_hours: false, // Default value
          is_peak_hours: false, // Default value
          time_category: 'unknown',
          singapore_time: new Date().toLocaleString('en-SG', { timeZone: 'Asia/Singapore' })
        },
        traffic: {
          timestamp: latestData.timestamp.toISOString(),
          incident_type: undefined,
          location: undefined,
          delay_minutes: undefined
        }
      });

      if (conditionMatches.length === 0) {
        console.log("[TriggerEngineWorker] No condition matches found");
        return results;
      }

      // Process top 3 matches
      for (const match of conditionMatches.slice(0, 3)) {
        const result = await this.processTrigger(match, latestData);
        results.push(result);
      }

      const responseTime = Date.now() - startTime;
      await storage.updateSystemHealth(
        "trigger_engine", 
        "healthy", 
        undefined, 
        responseTime
      );

      console.log(`[TriggerEngineWorker] Trigger evaluation completed in ${responseTime}ms, processed ${results.length} triggers`);
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      
      console.error("[TriggerEngineWorker] Trigger evaluation failed:", errorMessage);
      
      await storage.updateSystemHealth(
        "trigger_engine", 
        "error", 
        errorMessage, 
        responseTime
      );
    }

    return results;
  }

  private async processTrigger(match: any, governmentData: any): Promise<TriggerResult> {
    try {
      // Check advertiser has sufficient credits
      const advertiser = await storage.getAdvertiserById(match.rule.advertiserId);
      if (!advertiser) {
        throw new Error(`Advertiser not found for rule ${match.rule.ruleId}`);
      }

      const unitCost = 10; // $10 per trigger
      if (Number(advertiser.creditBalance) < unitCost) {
        throw new Error(`Insufficient credits: ${advertiser.creditBalance} < ${unitCost}`);
      }

      // Generate AI script
      const scriptResult = await this.aiScriptService.generateScript({
        conditionMatch: match,
        locationContext: "Singapore Mall",
        voiceType: Math.random() > 0.5 ? "female" : "male"
      });

      // Create script record
      const script = await storage.createScript({
        ruleId: match.rule.ruleId,
        text: scriptResult.script.text,
        variables: {
          temperature: governmentData.temperature,
          condition: governmentData.condition,
          advertiser: advertiser.displayName
        }
      });

      // Get first active location (in production, this would be more sophisticated)
      const locations = await storage.getAllLocations();
      const location = locations.find(l => l.isActive);
      if (!location) {
        throw new Error("No active locations available");
      }

      // Create ad trigger
      const adTrigger = await storage.createAdTrigger({
        advertiserId: advertiser.id,
        ruleId: match.rule.ruleId,
        locationId: location.id,
        scriptId: script.id,
        cost: unitCost.toString(),
        weatherData: {
          temperature: governmentData.temperature,
          humidity: governmentData.humidity,
          condition: governmentData.condition,
          timestamp: governmentData.timestamp
        },
        status: "pending"
      });

      // Deduct credits
      await storage.updateAdvertiserBalance(advertiser.id, unitCost);

      // Queue voice synthesis
      await this.voiceSynthesisWorker.enqueueRequest({
        scriptId: script.id,
        text: script.text,
        voiceType: Math.random() > 0.5 ? "female" : "male"
      });

      console.log(`[TriggerEngineWorker] Successfully triggered ad for rule ${match.rule.ruleId}`);

      return {
        triggerId: adTrigger.id,
        advertiserId: advertiser.id,
        ruleId: match.rule.ruleId,
        success: true
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error(`[TriggerEngineWorker] Failed to process trigger for rule ${match.rule.ruleId}:`, errorMessage);

      return {
        triggerId: 0,
        advertiserId: match.rule.advertiserId,
        ruleId: match.rule.ruleId,
        success: false,
        error: errorMessage
      };
    }
  }

  getStatus(): { isRunning: boolean } {
    return {
      isRunning: this.isRunning
    };
  }
}