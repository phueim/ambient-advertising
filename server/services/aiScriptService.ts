import { storage } from "../storage";
import type { ConditionMatch } from "./conditionEngine";
import { Script } from "@shared/schema";

export interface ScriptGenerationRequest {
  conditionMatch: ConditionMatch;
  locationContext?: string;
  voiceType?: "male" | "female";
}

export interface GeneratedScript {
  script: Script;
  confidence: number;
  generationTime: number;
}

export class AIScriptService {
  // Enhanced AI-driven script generation with Singapore context
  
  async generateScript(request: ScriptGenerationRequest): Promise<GeneratedScript> {
    const startTime = Date.now();
    
    try {
      await storage.updateSystemHealth("ai_script", "generating", undefined, 0);

      const { conditionMatch, locationContext } = request;
      const { rule, variables } = conditionMatch;

      // Generate script based on conditions and variables
      const generatedText = this.generateScriptFromConditions(rule, variables);
      
      // Add contextual enhancements
      const enhancedScript = this.enhanceScript(generatedText, variables, locationContext);
      
      // Save script to database
      const script = await storage.createScript({
        ruleId: rule.ruleId,
        text: enhancedScript,
        variables: variables
      });

      const responseTime = Date.now() - startTime;
      await storage.updateSystemHealth("ai_script", "healthy", undefined, responseTime);

      console.log(`[AIScriptService] Generated script for rule ${rule.ruleId} in ${responseTime}ms`);
      console.log(`[AIScriptService] Script: "${enhancedScript.substring(0, 100)}..."`);

      return {
        script,
        confidence: 0.95, // High confidence for template-based generation
        generationTime: responseTime
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      await storage.updateSystemHealth("ai_script", "error", errorMessage, responseTime);
      
      console.error(`[AIScriptService] Error generating script:`, error);
      throw error;
    }
  }

  private processTemplate(template: string, variables: Record<string, any>): string {
    let processed = template;
    
    // Replace template variables
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`\\{${key}\\}`, 'g');
      processed = processed.replace(regex, String(value));
    });

    // Handle missing variables by removing empty placeholders
    processed = processed.replace(/\{[^}]+\}/g, '');
    
    return processed;
  }

  private generateScriptFromConditions(rule: any, variables: Record<string, any>): string {
    // Generate content based on rule conditions instead of messageTemplate
    const conditions = rule.conditions;
    let script = "";

    // Environmental conditions
    if (conditions.temperature_c_greater_than || conditions.temperature_c_less_than) {
      const temp = variables.temperature_c || "current temperature";
      script += `It's ${temp}°C outside. `;
    }

    if (conditions.weather_condition_contains) {
      script += `Current weather: ${variables.condition || conditions.weather_condition_contains}. `;
    }

    if (conditions.aqi_above) {
      script += `Air quality alert - AQI is ${variables.aqi || "elevated"}. `;
    }

    // Time-based conditions
    if (conditions.time_of_day_between_start || conditions.is_weekend) {
      const timeContext = conditions.is_weekend ? "weekend" : "peak hours";
      script += `Perfect timing during ${timeContext}! `;
    }

    // Location-based conditions
    if (conditions.location_type) {
      script += `Great for ${conditions.location_type} visitors. `;
    }

    if (conditions.foot_traffic_level) {
      script += `With ${conditions.foot_traffic_level} foot traffic, `;
    }

    return script || "Special announcement! ";
  }

  private enhanceScript(baseScript: string, variables: Record<string, any>, locationContext?: string): string {
    // Generate professional weather forecast + advertisement
    const weatherNews = this.generateWeatherForecast(variables);
    const professionalAd = this.enhanceProfessionalScript(baseScript, variables, locationContext);
    
    // Combine weather news with advertisement
    return `${weatherNews} ${professionalAd}`.trim();
  }

  private generateWeatherForecast(variables: Record<string, any>): string {
    const time = new Date().toLocaleTimeString('en-SG', { 
      timeZone: 'Asia/Singapore',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    
    const day = new Date().toLocaleDateString('en-SG', {
      timeZone: 'Asia/Singapore',
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });

    let forecast = `Good ${this.getTimeOfDay()}! This is your Singapore weather update for ${day} at ${time} hours. `;

    if (variables.temperature && variables.condition) {
      const temp = Math.round(parseFloat(variables.temperature));
      const condition = variables.condition;
      const humidity = variables.humidity ? Math.round(parseFloat(variables.humidity)) : null;
      
      forecast += `Current temperature is ${temp} degrees Celsius with ${condition.toLowerCase()} conditions. `;
      
      if (humidity) {
        forecast += `Humidity levels at ${humidity} percent. `;
      }
    }

    if (variables.aqi) {
      const aqi = parseInt(variables.aqi);
      let aqiStatus = "good";
      if (aqi > 100) aqiStatus = "unhealthy";
      else if (aqi > 50) aqiStatus = "moderate";
      
      forecast += `Air quality index is ${aqi}, which is ${aqiStatus} for outdoor activities. `;
    }

    // Add professional weather advisory
    forecast += this.getWeatherAdvisory(variables);
    
    return forecast;
  }

  private getTimeOfDay(): string {
    const hour = new Date().getHours();
    if (hour < 12) return "morning";
    if (hour < 17) return "afternoon";
    return "evening";
  }

  private getWeatherAdvisory(variables: Record<string, any>): string {
    let advisory = "";
    
    if (variables.temperature) {
      const temp = parseFloat(variables.temperature);
      if (temp > 32) {
        advisory += "Please stay hydrated and seek shade during outdoor activities. ";
      } else if (temp < 25) {
        advisory += "Pleasant weather conditions for outdoor activities. ";
      }
    }

    if (variables.condition) {
      const condition = variables.condition.toLowerCase();
      if (condition.includes('rain') || condition.includes('thundery')) {
        advisory += "Carry an umbrella and exercise caution during travel. ";
      } else if (condition.includes('hazy')) {
        advisory += "Visibility may be reduced, drive safely. ";
      }
    }

    if (variables.aqi && parseInt(variables.aqi) > 100) {
      advisory += "Consider limiting prolonged outdoor exposure, especially for sensitive individuals. ";
    }

    return advisory + "Now, here's a message from our sponsor. ";
  }

  private enhanceProfessionalScript(baseScript: string, variables: Record<string, any>, locationContext?: string): string {
    let enhanced = baseScript;
    
    // Professional enhancement
    enhanced = this.addLocationContext(enhanced, locationContext);
    enhanced = this.addCallToAction(enhanced);
    enhanced = this.improveReadability(enhanced);
    
    return enhanced;
  }

  private addLocationContext(script: string, locationContext?: string): string {
    if (!locationContext) return script;
    
    let enhanced = script;
    enhanced = enhanced.replace(/\{location\}/g, locationContext);
    
    // Add location-specific enhancements
    if (locationContext.toLowerCase().includes('mall') || locationContext.toLowerCase().includes('shopping')) {
      enhanced += " Visit us on Level 1, near the main atrium.";
    } else if (locationContext.toLowerCase().includes('airport')) {
      enhanced += " Available at our transit lounge location.";
    } else if (locationContext.toLowerCase().includes('mrt') || locationContext.toLowerCase().includes('station')) {
      enhanced += " Conveniently located near the MRT exit.";
    }
    
    return enhanced;
  }

  private addCallToAction(script: string): string {
    const callToActions = [
      "Visit us today and experience the difference.",
      "Call now for exclusive offers available for a limited time.",
      "Stop by our store and speak with our friendly staff.",
      "Limited stock available - visit us while supplies last.",
      "Book your appointment today for personalized service."
    ];
    
    const randomCTA = callToActions[Math.floor(Math.random() * callToActions.length)];
    return `${script} ${randomCTA}`;
  }

  private improveReadability(script: string): string {
    // AI-like improvements for better readability and flow
    let improved = script;
    
    // Fix common issues
    improved = improved.replace(/\s+/g, ' '); // Multiple spaces
    improved = improved.replace(/([.!?])\s*([A-Z])/g, '$1 $2'); // Proper spacing after punctuation
    improved = improved.replace(/—\s*/g, '—'); // Em dash spacing
    improved = improved.replace(/\s*—/g, '—'); // Em dash spacing
    
    // Ensure proper sentence endings
    if (!improved.match(/[.!?]$/)) {
      improved += '.';
    }
    
    return improved;
  }

  // Method for integration with actual OpenAI API (for production)
  private async generateWithOpenAI(prompt: string, variables: Record<string, any>): Promise<string> {
    // This would be implemented when OPENAI_API_KEY is available
    // For now, return template-based result
    throw new Error("OpenAI integration not configured. Using template-based generation.");
    
    /* Production implementation would look like:
    
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    const systemPrompt = `You are an expert copywriter for contextual advertising. 
    Generate natural, engaging ad scripts based on real-time Singapore weather and environmental data.
    Keep scripts concise (15-30 seconds when spoken), actionable, and contextually relevant.
    Always include the advertiser's key message while making it feel natural and timely.`;
    
    const userPrompt = `Generate an ad script for these conditions:
    ${JSON.stringify(variables, null, 2)}
    
    Base message template: "${prompt}"
    
    Make it sound natural and contextually appropriate for Singapore.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 150,
      temperature: 0.7
    });

    return response.choices[0].message.content || prompt;
    */
  }

  async getRecentScripts(ruleId?: string, limit: number = 10): Promise<Script[]> {
    if (ruleId) {
      return await storage.getScriptsByRuleId(ruleId);
    }
    
    // For now, return empty array since we don't have a general "recent scripts" method
    // In production, you'd add this to the storage interface
    return [];
  }

  // Fallback script generation for when AI fails
  generateFallbackScript(ruleId: string, advertiserName: string): string {
    const fallbackTemplates = [
      `Check out the latest offers from ${advertiserName}. Visit us today for great deals.`,
      `${advertiserName} has something special for you. Discover what's new in-store now.`,
      `Don't miss out on exclusive offers from ${advertiserName}. Limited time only.`,
      `Experience quality and value with ${advertiserName}. Visit us today.`
    ];
    
    return fallbackTemplates[Math.floor(Math.random() * fallbackTemplates.length)];
  }

  // Validate generated script meets requirements
  validateScript(script: string): { isValid: boolean; issues: string[] } {
    const issues: string[] = [];
    
    // Check length (should be speakable in 15-30 seconds)
    const wordCount = script.split(/\s+/).length;
    if (wordCount < 10) {
      issues.push("Script too short (under 10 words)");
    } else if (wordCount > 50) {
      issues.push("Script too long (over 50 words)");
    }
    
    // Check for required elements
    if (!script.includes('.') && !script.includes('!') && !script.includes('?')) {
      issues.push("Script lacks proper punctuation");
    }
    
    // Check for prohibited content
    const prohibitedWords = ['free money', 'guarantee', 'miracle', 'urgent'];
    const hasProhibited = prohibitedWords.some(word => 
      script.toLowerCase().includes(word.toLowerCase())
    );
    if (hasProhibited) {
      issues.push("Script contains prohibited advertising language");
    }
    
    return {
      isValid: issues.length === 0,
      issues
    };
  }
}