import { storage } from "../storage";
import { GovernmentData } from "@shared/schema";

export interface WeatherData {
  timestamp: string;
  temperature_c: number;
  humidity_percent: number;
  condition: string;
  uv_index: number;
  forecast?: string;
  alerts?: string[];
}

export interface TrafficData {
  timestamp: string;
  incident_type?: string;
  location?: string;
  delay_minutes?: number;
  roadworks?: boolean;
  accident_severity?: string;
}



export interface TimeBasedData {
  timestamp: string;
  hour_of_day: number; // 0-23
  day_of_week: number; // 0-6 (Sunday=0)
  is_weekend: boolean;
  is_business_hours: boolean; // 9AM-6PM Singapore time
  is_peak_hours: boolean; // Rush hour periods
  time_category: string; // 'morning', 'afternoon', 'evening', 'night'
  singapore_time: string; // Formatted Singapore time
}

export class GovernmentDataService {
  private readonly SINGAPORE_WEATHER_API = "https://api.data.gov.sg/v1/environment/2-hour-weather-forecast";

  private readonly SINGAPORE_TRAFFIC_API = "https://api.data.gov.sg/v1/transport/traffic-images";

  // Mock realistic Singapore weather data for demo
  private generateMockWeatherData(): WeatherData {
    const conditions = ["Fair", "Partly Cloudy", "Cloudy", "Light Rain", "Moderate Rain", "Heavy Rain", "Thundery Showers"];
    const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
    
    // Singapore typical weather patterns
    let temperature = 26 + Math.random() * 10; // 26-36°C
    let humidity = 60 + Math.random() * 35; // 60-95%
    let uvIndex = Math.floor(Math.random() * 12) + 1; // 1-12
    
    // Adjust based on weather condition
    if (randomCondition.includes("Rain") || randomCondition.includes("Thundery")) {
      temperature -= 2; // Cooler when raining
      humidity += 10; // Higher humidity
      uvIndex = Math.max(1, uvIndex - 3); // Lower UV when cloudy/rainy
    }
    
    const alerts = [];
    if (temperature > 35) alerts.push("Heat Warning");
    if (randomCondition.includes("Heavy Rain") || randomCondition.includes("Thundery")) {
      alerts.push("Heavy Rain Advisory");
    }
    
    return {
      timestamp: new Date().toISOString(),
      temperature_c: Math.round(temperature * 10) / 10,
      humidity_percent: Math.round(humidity),
      condition: randomCondition,
      uv_index: uvIndex,
      alerts: alerts.length > 0 ? alerts : undefined,
      forecast: `Singapore weather: ${randomCondition.toLowerCase()} conditions expected`
    };
  }

  private generateMockTimeBasedData(): TimeBasedData {
    const now = new Date();
    const singaporeTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Singapore"}));
    
    const hour = singaporeTime.getHours();
    const dayOfWeek = singaporeTime.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isBusinessHours = hour >= 9 && hour < 18 && !isWeekend;
    const isPeakHours = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19); // Rush hours
    
    let timeCategory = 'night';
    if (hour >= 6 && hour < 12) timeCategory = 'morning';
    else if (hour >= 12 && hour < 17) timeCategory = 'afternoon';
    else if (hour >= 17 && hour < 21) timeCategory = 'evening';
    
    return {
      timestamp: now.toISOString(),
      hour_of_day: hour,
      day_of_week: dayOfWeek,
      is_weekend: isWeekend,
      is_business_hours: isBusinessHours,
      is_peak_hours: isPeakHours,
      time_category: timeCategory,
      singapore_time: singaporeTime.toLocaleString('en-SG', {
        timeZone: 'Asia/Singapore',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    };
  }

  private generateMockTrafficData(): TrafficData {
    const incidents = ["Accident", "Vehicle Breakdown", "Road Works", "Heavy Traffic"];
    const locations = ["PIE", "CTE", "ECP", "AYE", "BKE", "SLE", "TPE", "KJE"];
    
    const hasIncident = Math.random() > 0.7; // 30% chance of incident
    
    if (!hasIncident) {
      return {
        timestamp: new Date().toISOString()
      };
    }
    
    return {
      timestamp: new Date().toISOString(),
      incident_type: incidents[Math.floor(Math.random() * incidents.length)],
      location: locations[Math.floor(Math.random() * locations.length)],
      delay_minutes: Math.floor(Math.random() * 30) + 5,
      roadworks: Math.random() > 0.8,
      accident_severity: Math.random() > 0.5 ? "Minor" : "Major"
    };
  }



  async fetchLatestData(): Promise<{
    weather: WeatherData;
    timeBased: TimeBasedData;
    traffic: TrafficData;
  }> {
    const startTime = Date.now();
    
    try {
      // Update system health to show data fetching is in progress
      await storage.updateSystemHealth("data_fetch", "fetching", null, 0);

      // For now, use mock data. In production, replace with actual API calls
      const weather = this.generateMockWeatherData();
      const timeBased = this.generateMockTimeBasedData();
      const traffic = this.generateMockTrafficData();

      // Save to database
      await storage.saveGovernmentData({
        source: "weather",
        rawData: weather,
        temperature: weather.temperature_c.toString(),
        humidity: weather.humidity_percent,
        condition: weather.condition,
        uvIndex: weather.uv_index,
        location: "Singapore"
      });

      await storage.saveGovernmentData({
        source: "time_based",
        rawData: timeBased,
        temperature: undefined,
        humidity: undefined,
        condition: timeBased.time_category,
        uvIndex: undefined,
        location: "Singapore"
      });



      const responseTime = Date.now() - startTime;
      await storage.updateSystemHealth("data_fetch", "healthy", null, responseTime);

      console.log(`[GovernmentDataService] Data fetched successfully in ${responseTime}ms`);
      console.log(`[GovernmentDataService] Weather: ${weather.temperature_c}°C, ${weather.condition}, ${weather.humidity_percent}% humidity`);
      console.log(`[GovernmentDataService] Time-Based: ${timeBased.time_category} (${timeBased.singapore_time}), Peak: ${timeBased.is_peak_hours}`);

      return { weather, timeBased, traffic };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      await storage.updateSystemHealth("data_fetch", "error", errorMessage, responseTime);
      
      console.error(`[GovernmentDataService] Error fetching data:`, error);
      throw error;
    }
  }

  async getLatestStoredData(): Promise<GovernmentData | undefined> {
    return await storage.getLatestGovernmentData();
  }

  async getDataHistory(hours: number = 24): Promise<GovernmentData[]> {
    return await storage.getGovernmentDataHistory(hours);
  }

  // Method to fetch real Singapore government APIs (for production)
  private async fetchRealSingaporeWeather(): Promise<WeatherData> {
    try {
      const response = await fetch(this.SINGAPORE_WEATHER_API);
      const data = await response.json();
      
      // Transform Singapore API data to our format
      const forecast = data.items?.[0]?.forecasts?.[0];
      if (!forecast) throw new Error("No weather data available");
      
      return {
        timestamp: new Date().toISOString(),
        temperature_c: 30, // Singapore API doesn't provide temperature in 2-hour forecast
        humidity_percent: 80, // Default values - would need separate API calls
        condition: forecast.forecast,
        uv_index: 8, // Would need UV index API
        forecast: forecast.forecast
      };
    } catch (error) {
      console.error("Error fetching real Singapore weather:", error);
      throw error;
    }
  }


}