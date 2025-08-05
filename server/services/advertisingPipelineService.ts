import { governmentDataProcessor, type GovernmentData } from './governmentDataProcessor.js';
import { audioGenerationService } from './audioGenerationService.js';

export interface PipelineResult {
  processedRecords: number;
  successfulGenerations: number;
  failedGenerations: number;
  errors: string[];
}

class AdvertisingPipelineService {

  /**
   * Main entry point - processes new government data and triggers the complete pipeline
   */
  async processGovernmentDataUpdate(governmentData: GovernmentData): Promise<PipelineResult> {
    console.log(`[AdvertisingPipeline] Starting pipeline for new government data...`);
    
    const result: PipelineResult = {
      processedRecords: 0,
      successfulGenerations: 0,
      failedGenerations: 0,
      errors: []
    };

    try {
      // Step 1: Process government data and create advertising records
      const matchedRules = await governmentDataProcessor.processNewGovernmentData(governmentData);
      result.processedRecords = matchedRules.length;
      
      if (matchedRules.length === 0) {
        console.log(`[AdvertisingPipeline] No matching rules found for current data`);
        return result;
      }
      
      // Step 2: Process each advertising record (generate script + audio)
      await this.processAllPendingRecords(result);
      
      console.log(`[AdvertisingPipeline] Pipeline completed. Processed: ${result.processedRecords}, Success: ${result.successfulGenerations}, Failed: ${result.failedGenerations}`);
      
      return result;
      
    } catch (error) {
      console.error(`[AdvertisingPipeline] Pipeline failed:`, error);
      result.errors.push(error instanceof Error ? error.message : 'Unknown error');
      return result;
    }
  }

  /**
   * Process all pending advertising records
   */
  async processAllPendingRecords(result?: PipelineResult): Promise<PipelineResult> {
    if (!result) {
      result = {
        processedRecords: 0,
        successfulGenerations: 0,
        failedGenerations: 0,
        errors: []
      };
    }

    console.log(`[AdvertisingPipeline] Processing pending advertising records...`);
    
    try {
      // Get all pending advertising records
      const pendingRecords = await governmentDataProcessor.getPendingAdvertisingRecords();
      console.log(`[AdvertisingPipeline] Found ${pendingRecords.length} pending records to process`);
      
      if (pendingRecords.length === 0) {
        console.log(`[AdvertisingPipeline] No pending records to process`);
        return result;
      }

      // Process each record with delay to prevent API rate limiting
      for (let i = 0; i < pendingRecords.length; i++) {
        const record = pendingRecords[i];
        console.log(`[AdvertisingPipeline] Processing record ${i + 1}/${pendingRecords.length}: ${record.id}`);
        
        await this.processSingleAdvertisingRecord(record, result);
        
        // Add 5-second delay between each audio generation to prevent API rate limiting
        if (i < pendingRecords.length - 1) {
          console.log(`[AdvertisingPipeline] Waiting 5 seconds before next audio generation...`);
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }
      
      return result;
      
    } catch (error) {
      console.error(`[AdvertisingPipeline] Failed to process pending records:`, error);
      result.errors.push(error instanceof Error ? error.message : 'Failed to process pending records');
      return result;
    }
  }

  /**
   * Process a single advertising record through the complete pipeline
   */
  private async processSingleAdvertisingRecord(record: any, result: PipelineResult): Promise<void> {
    console.log(`[AdvertisingPipeline] Processing advertising record ${record.id} (Rule: ${record.ruleId}, Advertiser: ${record.advertiserId})`);
    
    try {
      // Generate script and audio
      const audioResult = await audioGenerationService.processAdvertisingRecord(record);
      
      if (audioResult.success && audioResult.audioPath) {
        // Update record to Done status with audio path
        await governmentDataProcessor.updateAdvertisingStatus(
          record.id, 
          'Done', 
          audioResult.audioPath
        );
        
        result.successfulGenerations++;
        console.log(`[AdvertisingPipeline] Successfully processed record ${record.id}: ${audioResult.audioPath}`);
        
      } else {
        // Update record to Failed status
        await governmentDataProcessor.updateAdvertisingStatus(
          record.id, 
          'Failed'
        );
        
        result.failedGenerations++;
        const errorMsg = `Record ${record.id}: ${audioResult.error || 'Unknown error'}`;
        result.errors.push(errorMsg);
        console.error(`[AdvertisingPipeline] Failed to process record ${record.id}: ${audioResult.error}`);
      }
      
    } catch (error) {
      // Update record to Failed status
      try {
        await governmentDataProcessor.updateAdvertisingStatus(record.id, 'Failed');
      } catch (updateError) {
        console.error(`[AdvertisingPipeline] Failed to update record ${record.id} to Failed status:`, updateError);
      }
      
      result.failedGenerations++;
      const errorMsg = `Record ${record.id}: ${error instanceof Error ? error.message : 'Unknown error'}`;
      result.errors.push(errorMsg);
      console.error(`[AdvertisingPipeline] Exception processing record ${record.id}:`, error);
    }
  }

  /**
   * Manual trigger to process any pending records
   */
  async processPendingRecordsManually(): Promise<PipelineResult> {
    console.log(`[AdvertisingPipeline] Manual processing of pending records triggered`);
    return await this.processAllPendingRecords();
  }

  /**
   * Get pipeline statistics
   */
  async getPipelineStats() {
    try {
      const pendingCount = (await governmentDataProcessor.getPendingAdvertisingRecords()).length;
      
      // Get counts by status (would need to implement these in storage)
      const allRecords = await this.getAllAdvertisingRecords();
      const doneCount = allRecords.filter(r => r.status === 'Done').length;
      const failedCount = allRecords.filter(r => r.status === 'Failed').length;
      
      return {
        pending: pendingCount,
        completed: doneCount,
        failed: failedCount,
        total: allRecords.length
      };
      
    } catch (error) {
      console.error(`[AdvertisingPipeline] Failed to get pipeline stats:`, error);
      return {
        pending: 0,
        completed: 0,
        failed: 0,
        total: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async getAllAdvertisingRecords() {
    // This would need to be implemented in storage service
    // For now, return empty array
    return [];
  }

  /**
   * Retry failed records
   */
  async retryFailedRecords(): Promise<PipelineResult> {
    console.log(`[AdvertisingPipeline] Retrying failed records...`);
    
    try {
      // Get failed records and reset them to pending
      const failedRecords = await this.getFailedAdvertisingRecords();
      
      // Reset failed records to pending
      for (const record of failedRecords) {
        await governmentDataProcessor.updateAdvertisingStatus(record.id, 'Pending');
      }
      
      // Process the now-pending records
      return await this.processAllPendingRecords();
      
    } catch (error) {
      console.error(`[AdvertisingPipeline] Failed to retry failed records:`, error);
      return {
        processedRecords: 0,
        successfulGenerations: 0,
        failedGenerations: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  private async getFailedAdvertisingRecords() {
    // This would need to be implemented in storage service
    // For now, return empty array
    return [];
  }
}

export const advertisingPipelineService = new AdvertisingPipelineService();