import { storage } from '../storage.js';

export interface GovernmentData {
  temperature: number;
  weather_condition: string;
  uv_index: number;
  traffic_congestion_level: string;
  flood_alerts: any[];
  timestamp: string;
  hour_of_day: number;
  day_of_week: number;
  is_weekend: boolean;
  is_business_hours: boolean;
  is_peak_hours: boolean;
  time_category: string;
}

export interface MatchedRule {
  ruleId: string;
  advertiserId: number;
  advertiser: {
    id: number;
    name: string;
    displayName: string;
    businessType: string;
  };
  rule: any;
}

class GovernmentDataProcessor {
  
  async processNewGovernmentData(governmentData: GovernmentData): Promise<MatchedRule[]> {
    console.log(`[GovernmentDataProcessor] Processing new government data...`);
    
    // Debug: Log the incoming flat data
    console.log("[GovernmentDataProcessor] Received flat data:", governmentData);
    
    // Get the condition engine to evaluate rules
    const { ConditionEngine } = await import('./conditionEngine.js');
    const conditionEngine = new ConditionEngine();
    
    // Transform flat government data to the nested format expected by ConditionEngine
    const conditionEngineData = {
      weather: {
        timestamp: governmentData.timestamp,
        temperature_c: governmentData.temperature,
        humidity_percent: 50, // Default value if not provided
        condition: governmentData.weather_condition,
        uv_index: governmentData.uv_index,
        forecast: '',
        alerts: []
      },
      timeBased: {
        timestamp: governmentData.timestamp,
        hour_of_day: governmentData.hour_of_day,
        day_of_week: governmentData.day_of_week,
        is_weekend: governmentData.is_weekend,
        is_business_hours: governmentData.is_business_hours,
        is_peak_hours: governmentData.is_peak_hours,
        time_category: governmentData.time_category,
        singapore_time: new Date(governmentData.timestamp).toLocaleString('en-SG', {
          timeZone: 'Asia/Singapore'
        })
      },
      traffic: {
        timestamp: governmentData.timestamp,
        incident_type: 'normal',
        location: 'Singapore',
        delay_minutes: 0,
        roadworks: false,
        accident_severity: 'none'
      }
    };
    
    // Debug: Log the transformed nested data
    console.log("[GovernmentDataProcessor] Transformed nested data:", {
      weather: conditionEngineData.weather,
      timeBased: conditionEngineData.timeBased,
      traffic: conditionEngineData.traffic
    });
    
    // Evaluate conditions and get matched rules
    const matchedRules = await conditionEngine.evaluateConditions(conditionEngineData);
    console.log(`[GovernmentDataProcessor] Found ${matchedRules.length} matched rules`);
    
    // Create advertising records for each match
    const createdRecords = [];
    
    for (const match of matchedRules) {
      try {
        const advertisingRecord = await this.createAdvertisingRecord(
          match.rule.ruleId,
          match.advertiser.id
        );
        
        createdRecords.push({
          ...match,
          advertisingId: advertisingRecord.id
        });
        
        console.log(`[GovernmentDataProcessor] Created advertising record ${advertisingRecord.id} for advertiser ${match.advertiser.displayName}, rule ${match.rule.ruleId}`);
        
      } catch (error) {
        console.error(`[GovernmentDataProcessor] Failed to create advertising record for advertiser ${match.advertiser.id}, rule ${match.rule.ruleId}:`, error);
      }
    }
    
    console.log(`[GovernmentDataProcessor] Successfully created ${createdRecords.length} advertising records`);
    return createdRecords;
  }

  private async createAdvertisingRecord(ruleId: string, advertiserId: number) {
    const advertisingData = {
      ruleId,
      advertiserId,
      audioFile: null, // Will be populated after audio generation
      status: 'Pending' as const,
      createdAt: new Date()
    };
    
    return await storage.createAdvertising(advertisingData);
  }

  async getPendingAdvertisingRecords() {
    const pendingRecords = await storage.getAdvertisingByStatus('Pending');
    console.log(`[GovernmentDataProcessor] Found ${pendingRecords.length} pending advertising records`);
    return pendingRecords;
  }

  async updateAdvertisingStatus(id: number, status: 'Pending' | 'Done' | 'Failed', audioPath?: string) {
    const updateData: any = { status };
    if (audioPath) {
      updateData.audioFile = audioPath;
    }
    
    await storage.updateAdvertising(id, updateData);
    console.log(`[GovernmentDataProcessor] Updated advertising record ${id} to status: ${status}`);
  }

  async getAdvertiserById(advertiserId: number) {
    return await storage.getAdvertiserById(advertiserId);
  }

  async getConditionRuleById(ruleId: string) {
    return await storage.getConditionRuleById(ruleId);
  }
}

export const governmentDataProcessor = new GovernmentDataProcessor();