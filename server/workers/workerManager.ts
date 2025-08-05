import { DataIngestionWorker } from "./dataIngestionWorker";
import { VoiceSynthesisWorker } from "./voiceSynthesisWorker";
import { TriggerEngineWorker } from "./triggerEngineWorker";
import { storage } from "../storage";

export class WorkerManager {
  private dataIngestionWorker: DataIngestionWorker;
  private voiceSynthesisWorker: VoiceSynthesisWorker;
  private triggerEngineWorker: TriggerEngineWorker;
  private isRunning: boolean = false;

  constructor() {
    this.dataIngestionWorker = new DataIngestionWorker();
    this.voiceSynthesisWorker = new VoiceSynthesisWorker();
    this.triggerEngineWorker = new TriggerEngineWorker(this.voiceSynthesisWorker);
  }

  async startAllWorkers(config?: {
    dataIngestionInterval?: number;
    triggerEngineInterval?: number;
  }): Promise<void> {
    if (this.isRunning) {
      console.log("[WorkerManager] Workers already running");
      return;
    }

    console.log("[WorkerManager] Starting all AI automation workers...");
    this.isRunning = true;

    try {
      // Start voice synthesis worker first (no interval, queue-based)
      await this.voiceSynthesisWorker.start();
      
      // Start data ingestion worker
      await this.dataIngestionWorker.start(config?.dataIngestionInterval || 5);
      
      // Start trigger engine worker
      await this.triggerEngineWorker.start(config?.triggerEngineInterval || 5);
      
      // Update system health
      await storage.updateSystemHealth("worker_manager", "healthy", "All workers started successfully");
      
      console.log("[WorkerManager] ✅ All workers started successfully");
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("[WorkerManager] ❌ Failed to start workers:", errorMessage);
      
      await storage.updateSystemHealth("worker_manager", "error", errorMessage);
      throw error;
    }
  }

  async stopAllWorkers(): Promise<void> {
    console.log("[WorkerManager] Stopping all workers...");
    this.isRunning = false;

    try {
      await Promise.all([
        this.dataIngestionWorker.stop(),
        this.voiceSynthesisWorker.stop(),
        this.triggerEngineWorker.stop()
      ]);

      await storage.updateSystemHealth("worker_manager", "stopped", "All workers stopped");
      
      console.log("[WorkerManager] ✅ All workers stopped successfully");
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("[WorkerManager] ❌ Failed to stop workers:", errorMessage);
      
      await storage.updateSystemHealth("worker_manager", "error", errorMessage);
    }
  }

  async restartAllWorkers(config?: {
    dataIngestionInterval?: number;
    triggerEngineInterval?: number;
  }): Promise<void> {
    console.log("[WorkerManager] Restarting all workers...");
    
    await this.stopAllWorkers();
    
    // Wait a moment before restarting
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await this.startAllWorkers(config);
  }

  getWorkersStatus(): {
    isRunning: boolean;
    workers: {
      dataIngestion: { isRunning: boolean; intervalMinutes: number };
      voiceSynthesis: { isRunning: boolean; queueLength: number };
      triggerEngine: { isRunning: boolean };
    };
  } {
    return {
      isRunning: this.isRunning,
      workers: {
        dataIngestion: this.dataIngestionWorker.getStatus(),
        voiceSynthesis: this.voiceSynthesisWorker.getStatus(),
        triggerEngine: this.triggerEngineWorker.getStatus(),
      }
    };
  }

  async getSystemHealthSummary(): Promise<{
    overallStatus: "healthy" | "warning" | "error";
    services: Array<{
      service: string;
      status: string;
      lastCheck: Date;
      responseTime?: number;
      errorMessage?: string;
    }>;
  }> {
    const healthRecords = await storage.getSystemHealthStatus();
    
    let overallStatus: "healthy" | "warning" | "error" = "healthy";
    
    // Determine overall status
    for (const record of healthRecords) {
      if (record.status === "error") {
        overallStatus = "error";
        break;
      } else if (record.status === "warning" && overallStatus === "healthy") {
        overallStatus = "warning";
      }
    }

    return {
      overallStatus,
      services: healthRecords.map(record => ({
        service: record.service,
        status: record.status,
        lastCheck: record.lastCheck,
        responseTime: record.responseTime || undefined,
        errorMessage: record.errorMessage || undefined
      }))
    };
  }
}