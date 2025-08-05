import { GovernmentDataService } from "../services/governmentDataService";
import { storage } from "../storage";
import { advertisingPipelineService } from "../services/advertisingPipelineService.js";

export class DataIngestionWorker {
  private governmentDataService: GovernmentDataService;
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;
  private intervalMinutes: number = 5;

  constructor() {
    this.governmentDataService = new GovernmentDataService();
  }

  async start(intervalMinutes: number = 5): Promise<void> {
    if (this.isRunning) {
      console.log("[DataIngestionWorker] Already running");
      return;
    }

    this.intervalMinutes = intervalMinutes;
    this.isRunning = true;
    
    console.log(`[DataIngestionWorker] Starting data ingestion every ${intervalMinutes} minutes`);
    
    // Update system health
    await storage.updateSystemHealth("data_ingestion", "healthy", undefined, 0);
    
    // Run immediately
    await this.ingestData();
    
    // Set up recurring execution
    this.intervalId = setInterval(async () => {
      try {
        await this.ingestData();
      } catch (error) {
        console.error("[DataIngestionWorker] Error in scheduled execution:", error);
        await storage.updateSystemHealth(
          "data_ingestion", 
          "error", 
          error instanceof Error ? error.message : "Unknown error"
        );
      }
    }, intervalMinutes * 60 * 1000);
  }

  async stop(): Promise<void> {
    console.log("[DataIngestionWorker] Stopping data ingestion worker");
    this.isRunning = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    await storage.updateSystemHealth("data_ingestion", "stopped");
  }

  private async ingestData(): Promise<void> {
    const startTime = Date.now();
    
    try {
      console.log(`[DataIngestionWorker] ${new Date().toISOString()} - Fetching government data...`);
      
      const data = await this.governmentDataService.fetchLatestData();
      
      // Save to database
      await storage.saveGovernmentData({
        source: "weather",
        rawData: data,
        temperature: data.weather?.temperature_c?.toString(),
        humidity: data.weather?.humidity_percent,
        condition: data.weather?.forecast,
        uvIndex: data.weather?.uv_index,

        location: "Singapore"
      });
      
      const responseTime = Date.now() - startTime;
      
      await storage.updateSystemHealth(
        "data_ingestion", 
        "healthy", 
        undefined, 
        responseTime
      );
      
      console.log(`[DataIngestionWorker] Data ingestion completed in ${responseTime}ms`);
      
      // Trigger advertising pipeline for new data
      try {
        console.log(`[DataIngestionWorker] Triggering advertising pipeline...`);
        
        // Convert data format for pipeline
        const governmentData = {
          temperature: data.weather?.temperature_c || 0,
          weather_condition: data.weather?.condition || 'unknown',
          hour_of_day: data.timeBased?.hour_of_day || 0,
        day_of_week: data.timeBased?.day_of_week || 0,
        is_weekend: data.timeBased?.is_weekend || false,
        is_business_hours: data.timeBased?.is_business_hours || false,
        is_peak_hours: data.timeBased?.is_peak_hours || false,
        time_category: data.timeBased?.time_category || 'unknown',
          uv_index: data.weather?.uv_index || 0,
          traffic_congestion_level: 'moderate', // Default value
          flood_alerts: [],
          timestamp: new Date().toISOString()
        };
        
        const pipelineResult = await advertisingPipelineService.processGovernmentDataUpdate(governmentData);
        
        console.log(`[DataIngestionWorker] Pipeline result - Processed: ${pipelineResult.processedRecords}, Success: ${pipelineResult.successfulGenerations}, Failed: ${pipelineResult.failedGenerations}`);
        
        if (pipelineResult.errors.length > 0) {
          console.error(`[DataIngestionWorker] Pipeline errors:`, pipelineResult.errors);
        }
        
      } catch (pipelineError) {
        console.error(`[DataIngestionWorker] Failed to trigger advertising pipeline:`, pipelineError);
        // Don't fail the entire data ingestion if pipeline fails
      }
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      
      console.error("[DataIngestionWorker] Data ingestion failed:", errorMessage);
      
      await storage.updateSystemHealth(
        "data_ingestion", 
        "error", 
        errorMessage, 
        responseTime
      );
    }
  }

  getStatus(): { isRunning: boolean; intervalMinutes: number } {
    return {
      isRunning: this.isRunning,
      intervalMinutes: this.intervalMinutes
    };
  }
}