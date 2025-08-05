import { storage } from "../storage";
import { ConditionRule, Advertiser } from "@shared/schema";
import type { WeatherData, AirQualityData, TrafficData } from "./governmentDataService";

export interface ConditionMatch {
  rule: ConditionRule;
  advertiser: {
    id: number;
    name: string;
    displayName: string;
    businessType: string;
    status: string;
  };
  priority: number;
  matchedConditions: string[];
  variables: Record<string, any>;
}

export class ConditionEngine {
  async evaluateConditions(data: {
    weather: WeatherData;
    airQuality: AirQualityData;
    traffic: TrafficData;
  }): Promise<ConditionMatch[]> {
    const startTime = Date.now();
    
    try {
      // Update system health
      await storage.updateSystemHealth("condition_engine", "evaluating", undefined, 0);

      const rules = await storage.getAllConditionRules();
      const advertisers = await storage.getAllAdvertisers();
      
      // Create a map for quick advertiser lookup
      const advertiserMap = new Map(advertisers.map(adv => [adv.id, adv]));
      
      const matches: ConditionMatch[] = [];

      for (const rule of rules) {
        const match = this.evaluateRule(rule, data, advertiserMap);
        if (match) {
          matches.push(match);
        }
      }

      // Sort by priority (higher priority first)
      matches.sort((a, b) => b.priority - a.priority);

      const responseTime = Date.now() - startTime;
      await storage.updateSystemHealth("condition_engine", "healthy", undefined, responseTime);

      console.log(`[ConditionEngine] Evaluated ${rules.length} rules, found ${matches.length} matches in ${responseTime}ms`);
      
      if (matches.length > 0) {
        console.log(`[ConditionEngine] Top match: ${matches[0].rule.ruleId} (priority: ${matches[0].priority})`);
      }

      return matches;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      await storage.updateSystemHealth("condition_engine", "error", errorMessage, responseTime);
      
      console.error(`[ConditionEngine] Error evaluating conditions:`, error);
      throw error;
    }
  }

  private evaluateRule(rule: ConditionRule, data: {
    weather: WeatherData;
    airQuality: AirQualityData;
    traffic: TrafficData;
  }, advertiserMap: Map<number, Advertiser>): ConditionMatch | null {
    try {
      const conditions = rule.conditions as any;
      const matchedConditions: string[] = [];
      const variables: Record<string, any> = {};

      // Extract current time for time-based conditions
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const timeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;

      // Temperature conditions
      if (conditions.temperature_c_greater_than !== undefined) {
        if (data.weather.temperature_c > conditions.temperature_c_greater_than) {
          matchedConditions.push(`Temperature ${data.weather.temperature_c}°C > ${conditions.temperature_c_greater_than}°C`);
          variables.temperature_c = data.weather.temperature_c;
        } else {
          return null;
        }
      }

      if (conditions.temperature_c_between !== undefined) {
        const [min, max] = conditions.temperature_c_between;
        if (data.weather.temperature_c >= min && data.weather.temperature_c <= max) {
          matchedConditions.push(`Temperature ${data.weather.temperature_c}°C between ${min}°C and ${max}°C`);
          variables.temperature_c = data.weather.temperature_c;
        } else {
          return null;
        }
      }

      // Humidity conditions
      if (conditions.humidity_percent_above !== undefined) {
        if (data.weather.humidity_percent > conditions.humidity_percent_above) {
          matchedConditions.push(`Humidity ${data.weather.humidity_percent}% > ${conditions.humidity_percent_above}%`);
          variables.humidity_percent = data.weather.humidity_percent;
        } else {
          return null;
        }
      }

      // Weather condition string matching
      if (conditions.weather_condition_contains !== undefined) {
        const conditionsToCheck = Array.isArray(conditions.weather_condition_contains) 
          ? conditions.weather_condition_contains 
          : [conditions.weather_condition_contains];
        
        const matchFound = conditionsToCheck.some(conditionStr => 
          data.weather.condition.toLowerCase().includes(conditionStr.toLowerCase())
        );
        
        if (matchFound) {
          matchedConditions.push(`Weather condition '${data.weather.condition}' matches pattern`);
          variables.condition = data.weather.condition;
        } else {
          return null;
        }
      }

      if (conditions.weather_condition_not_contains !== undefined) {
        const conditionsToCheck = Array.isArray(conditions.weather_condition_not_contains) 
          ? conditions.weather_condition_not_contains 
          : [conditions.weather_condition_not_contains];
        
        const matchFound = conditionsToCheck.some(conditionStr => 
          data.weather.condition.toLowerCase().includes(conditionStr.toLowerCase())
        );
        
        if (!matchFound) {
          matchedConditions.push(`Weather condition '${data.weather.condition}' does not match excluded patterns`);
          variables.condition = data.weather.condition;
        } else {
          return null;
        }
      }

      // UV Index conditions
      if (conditions.uv_index_above !== undefined) {
        if (data.weather.uv_index > conditions.uv_index_above) {
          matchedConditions.push(`UV Index ${data.weather.uv_index} > ${conditions.uv_index_above}`);
          variables.uv_index = data.weather.uv_index;
        } else {
          return null;
        }
      }

      // Air Quality conditions
      if (conditions.aqi_above !== undefined) {
        if (data.airQuality.aqi > conditions.aqi_above) {
          matchedConditions.push(`AQI ${data.airQuality.aqi} > ${conditions.aqi_above}`);
          variables.aqi = data.airQuality.aqi;
          variables.air_quality_category = data.airQuality.category;
        } else {
          return null;
        }
      }

      // Time-based conditions
      if (conditions.time_of_day_between !== undefined) {
        const [startTime, endTime] = conditions.time_of_day_between;
        const currentTimeMinutes = currentHour * 60 + currentMinute;
        const startTimeMinutes = this.timeStringToMinutes(startTime);
        const endTimeMinutes = this.timeStringToMinutes(endTime);
        
        let isInRange = false;
        if (startTimeMinutes <= endTimeMinutes) {
          // Same day range
          isInRange = currentTimeMinutes >= startTimeMinutes && currentTimeMinutes <= endTimeMinutes;
        } else {
          // Crosses midnight
          isInRange = currentTimeMinutes >= startTimeMinutes || currentTimeMinutes <= endTimeMinutes;
        }
        
        if (isInRange) {
          matchedConditions.push(`Current time ${timeString} is within range ${startTime}-${endTime}`);
          variables.current_time = timeString;
        } else {
          return null;
        }
      }

      // Temperature drop conditions (would require historical data - simulated for demo)
      if (conditions.temperature_drop_in_last_hour_c_greater_than !== undefined) {
        // Simulate temperature drop for demo purposes
        const simulatedDrop = Math.random() * 8; // 0-8°C drop
        if (simulatedDrop > conditions.temperature_drop_in_last_hour_c_greater_than) {
          matchedConditions.push(`Temperature dropped ${simulatedDrop.toFixed(1)}°C in last hour`);
          variables.delta = simulatedDrop.toFixed(1);
          variables.temperature_c = data.weather.temperature_c;
        } else {
          return null;
        }
      }



      // Add common variables for all matches
      variables.location = "Singapore";
      variables.timestamp = new Date().toLocaleString("en-SG", { timeZone: "Asia/Singapore" });

      // If we got here, all conditions matched
      if (matchedConditions.length > 0) {
        const advertiser = advertiserMap.get(rule.advertiserId);
        if (!advertiser) {
          console.error(`[ConditionEngine] Advertiser not found for rule ${rule.ruleId}, advertiser ID: ${rule.advertiserId}`);
          return null;
        }
        
        return {
          rule,
          advertiser: {
            id: advertiser.id,
            name: advertiser.name,
            displayName: advertiser.displayName,
            businessType: advertiser.businessType,
            status: advertiser.status
          },
          priority: rule.priority,
          matchedConditions,
          variables
        };
      }

      return null;
    } catch (error) {
      console.error(`[ConditionEngine] Error evaluating rule ${rule.ruleId}:`, error);
      return null;
    }
  }

  private timeStringToMinutes(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }

  async getActiveRules(): Promise<ConditionRule[]> {
    return await storage.getAllConditionRules();
  }

  async createRule(rule: any): Promise<ConditionRule> {
    return await storage.createConditionRule({
      ruleId: rule.ruleId,
      advertiserId: rule.advertiserId,
      priority: rule.priority,
      conditions: rule.conditions,
      isActive: true
    });
  }

  async updateRule(ruleId: string, updates: Partial<ConditionRule>): Promise<ConditionRule> {
    return await storage.updateConditionRule(ruleId, updates);
  }
}