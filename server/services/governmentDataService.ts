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



export interface AirQualityData {
  timestamp: string;
  aqi: number;
  category: string;
}

export class GovernmentDataService {
  private readonly SINGAPORE_WEATHER_API = "https://api.data.gov.sg/v1/environment/2-hour-weather-forecast";
  private readonly SINGAPORE_AIR_QUALITY_API = "https://api.data.gov.sg/v1/environment/psi";
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

  private generateMockAirQualityData(): AirQualityData {
    const aqi = Math.floor(Math.random() * 200) + 20; // 20-220 AQI
    let category = "Good";
    
    if (aqi > 100) category = "Unhealthy";
    else if (aqi > 50) category = "Moderate";
    
    return {
      timestamp: new Date().toISOString(),
      aqi,
      category
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
    airQuality: AirQualityData;
    traffic: TrafficData;
  }> {
    const startTime = Date.now();
    
    try {
      // Update system health to show data fetching is in progress
      await storage.updateSystemHealth("data_fetch", "fetching", null, 0);

      // For now, use mock data. In production, replace with actual API calls
      const weather = this.generateMockWeatherData();
      const airQuality = this.generateMockAirQualityData();
      const traffic = this.generateMockTrafficData();

      // Save to database
      await storage.saveGovernmentData({
        source: "weather",
        rawData: weather,
        temperature: weather.temperature_c.toString(),
        humidity: weather.humidity_percent,
        condition: weather.condition,
        uvIndex: weather.uv_index,
        aqi: undefined,
        location: "Singapore"
      });

      await storage.saveGovernmentData({
        source: "air_quality",
        rawData: airQuality,
        temperature: undefined,
        humidity: undefined,
        condition: undefined,
        uvIndex: undefined,
        aqi: airQuality.aqi,
        location: "Singapore"
      });



      const responseTime = Date.now() - startTime;
      await storage.updateSystemHealth("data_fetch", "healthy", null, responseTime);

      console.log(`[GovernmentDataService] Data fetched successfully in ${responseTime}ms`);
      console.log(`[GovernmentDataService] Weather: ${weather.temperature_c}°C, ${weather.condition}, ${weather.humidity_percent}% humidity`);
      console.log(`[GovernmentDataService] Air Quality: AQI ${airQuality.aqi} (${airQuality.category})`);

      return { weather, airQuality, traffic };
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

  // Method to fetch real Singapore air quality data
  private async fetchRealSingaporeAirQuality(): Promise<AirQualityData> {
    try {
      const response = await fetch(this.SINGAPORE_AIR_QUALITY_API);
      const data = await response.json();
      
      const reading = data.items?.[0]?.readings?.psi_twenty_four_hourly;
      if (!reading) throw new Error("No air quality data available");
      
      const nationalAQI = reading.national || 50;
      let category = "Good";
      if (nationalAQI > 100) category = "Unhealthy";
      else if (nationalAQI > 50) category = "Moderate";
      
      return {
        timestamp: new Date().toISOString(),
        aqi: nationalAQI,
        category
      };
    } catch (error) {
      console.error("Error fetching real Singapore air quality:", error);
      throw error;
    }
  }
}