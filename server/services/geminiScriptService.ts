import { GoogleGenerativeAI } from '@google/generative-ai';

export interface PromotionalScriptRequest {
  advertiserDisplayName: string;
  businessType: string;
  ruleId: string;
  currentTime: string;
}

export interface PromotionalScriptResponse {
  script: string;
  voiceStyle: "male" | "female";
}

export class GeminiScriptService {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private timeout: number;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ 
      model: process.env.GEMINI_MODEL || "gemini-1.5-flash" 
    });
    this.timeout = parseInt(process.env.GEMINI_TIMEOUT || "30000");
    
    console.log(`[GeminiScriptService] Initialized with model: ${process.env.GEMINI_MODEL || "gemini-1.5-flash"}`);
  }

  private getSystemPrompt(): string {
    return `Create a short promotional script for Singapore businesses based on weather conditions.

Rules:
- Write exactly 2-3 sentences
- Be polite and friendly 
- Include the business name
- Reference the weather condition
- Add a gentle call-to-action

Weather meanings:
- very_hot_singapore: Very hot (>32°C) - suggest cooling/AC
- rainy_singapore: Rainy - suggest shelter/warmth  
- hazy_singapore: Hazy air - suggest clean indoor spaces

Response format - JSON only:
{
  "script": "Your 2-3 sentence script here",
  "voiceStyle": "male" or "female"
}

Voice style: Use "female" for cafes/restaurants/retail, "male" for gyms/tech/automotive.`;
  }

  private getUserPrompt(request: PromotionalScriptRequest): string {
    return `Business: ${request.advertiserDisplayName}
Type: ${request.businessType}  
Weather: ${request.ruleId}
Time: ${request.currentTime}

Create a promotional script in JSON format.`;
  }

  private interpretRuleId(ruleId: string): string {
    const ruleInterpretations: Record<string, string> = {
      "very_hot_singapore": "Very hot weather in Singapore (above 32°C) - people are seeking cooling relief",
      "hot_humid_mall": "Hot and humid conditions in shopping mall environment - visitors need air-conditioned comfort",
      "rainy_singapore": "Rainy weather in Singapore - people seeking shelter and warmth",
      "hazy_singapore": "Hazy/polluted air conditions in Singapore - people prefer clean indoor environments",
      "cool_morning_singapore": "Cool morning weather in Singapore - pleasant conditions for activities",
      "humid_afternoon": "Humid afternoon conditions - people need refreshing relief",
      "thunderstorm_singapore": "Thunderstorm weather - people seeking safe indoor shelter",
      "weekend_hot": "Hot weekend weather - people looking for leisure activities with cooling",
      "lunch_time_heat": "Hot weather during lunch time - office workers need cooling relief"
    };

    return ruleInterpretations[ruleId] || `Environmental condition: ${ruleId.replace(/_/g, ' ')} - adapt messaging accordingly`;
  }

  async generatePromotionalScript(request: PromotionalScriptRequest): Promise<PromotionalScriptResponse> {
    try {
      const systemPrompt = this.getSystemPrompt();
      const userPrompt = this.getUserPrompt(request);
      const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

      console.log(`[GeminiScriptService] Generating script for ${request.advertiserDisplayName}`);

      // Create timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Gemini API timeout')), this.timeout);
      });

      // Generate content using Gemini
      const generatePromise = this.model.generateContent(fullPrompt);
      
      const result = await Promise.race([generatePromise, timeoutPromise]);
      const response = result.response;
      const text = response.text();

      if (!text) {
        throw new Error('No response from Gemini');
      }

      // Parse the JSON response from Gemini
      let parsedResponse: PromotionalScriptResponse;
      try {
        let cleanResponse = text.trim();
        
        // Remove thinking process (between <think> and </think> tags)
        cleanResponse = cleanResponse.replace(/<think>[\s\S]*?<\/think>/g, '');
        
        // Extract JSON from code blocks (common with AI models)
        const codeBlockMatch = cleanResponse.match(/```json\s*([\s\S]*?)\s*```/);
        if (codeBlockMatch) {
          parsedResponse = JSON.parse(codeBlockMatch[1].trim());
        } else {
          // Try to find JSON object in the response
          const jsonMatch = cleanResponse.match(/\{[\s\S]*?\}/);
          if (jsonMatch) {
            parsedResponse = JSON.parse(jsonMatch[0]);
          } else {
            throw new Error('No JSON found in response');
          }
        }
        
        // Validate required fields
        if (!parsedResponse.script || !parsedResponse.voiceStyle) {
          throw new Error('Invalid JSON format - missing required fields');
        }
        
      } catch (parseError) {
        console.warn("Failed to parse JSON response from Gemini, using fallback parsing");
        console.warn("Parse error:", parseError instanceof Error ? parseError.message : 'Unknown error');
        console.warn("Raw response:", text.substring(0, 300) + "...");
        
        // Fallback: create response with default values
        parsedResponse = {
          script: `Visit ${request.advertiserDisplayName} for great ${request.businessType.toLowerCase()} experience. Perfect for current weather conditions. Come and enjoy our services today!`,
          voiceStyle: this.getDefaultVoiceStyle(request.businessType)
        };
      }

      // Validate the response
      if (!parsedResponse.script) {
        throw new Error("Invalid response format from Gemini");
      }

      // Ensure voice style is valid
      if (parsedResponse.voiceStyle !== "male" && parsedResponse.voiceStyle !== "female") {
        parsedResponse.voiceStyle = this.getDefaultVoiceStyle(request.businessType);
      }

      console.log(`[GeminiScriptService] Generated script for ${request.advertiserDisplayName} (${request.businessType}) - Rule: ${request.ruleId}`);
      console.log(`[GeminiScriptService] Script: "${parsedResponse.script}"`);
      console.log(`[GeminiScriptService] Voice Style: ${parsedResponse.voiceStyle}`);

      return parsedResponse;

    } catch (error) {
      console.error(`[GeminiScriptService] Error generating script:`, error);
      
      // Return a fallback script
      return this.getFallbackScript(request);
    }
  }

  private getDefaultVoiceStyle(businessType: string): "male" | "female" {
    // Choose voice style based on business type and typical target audience
    const femaleVoiceTypes = ["Coffee shop", "Restaurant", "Mall", "Beauty", "Fashion", "Healthcare"];
    const businessTypeLower = businessType.toLowerCase();
    
    for (const type of femaleVoiceTypes) {
      if (businessTypeLower.includes(type.toLowerCase())) {
        return "female";
      }
    }
    
    return "male"; // Default to male voice
  }

  private getFallbackScript(request: PromotionalScriptRequest): PromotionalScriptResponse {
    const environmentalContext = this.interpretRuleId(request.ruleId);
    const isHotWeather = request.ruleId.includes('hot') || request.ruleId.includes('humid');
    const isRainy = request.ruleId.includes('rainy') || request.ruleId.includes('thunderstorm');
    const isHazy = request.ruleId.includes('hazy');

    const fallbackScripts: Record<string, string> = {
      "Restaurant": this.getContextualFallback("Restaurant", request.advertiserDisplayName, isHotWeather, isRainy, isHazy),
      "Coffee shop": this.getContextualFallback("Coffee shop", request.advertiserDisplayName, isHotWeather, isRainy, isHazy),
      "Gym": this.getContextualFallback("Gym", request.advertiserDisplayName, isHotWeather, isRainy, isHazy),
      "Mall": this.getContextualFallback("Mall", request.advertiserDisplayName, isHotWeather, isRainy, isHazy),
      "Fast Food": this.getContextualFallback("Fast Food", request.advertiserDisplayName, isHotWeather, isRainy, isHazy)
    };

    const script = fallbackScripts[request.businessType] || 
      `Beat the ${isHotWeather ? 'heat' : isRainy ? 'rain' : 'weather'} at ${request.advertiserDisplayName}. Our comfortable, air-conditioned space offers quality service and exceptional value. Visit us today and see what makes us special.`;

    return {
      script,
      voiceStyle: this.getDefaultVoiceStyle(request.businessType)
    };
  }

  private getContextualFallback(businessType: string, businessName: string, isHot: boolean, isRainy: boolean, isHazy: boolean): string {
    const contextualScripts: Record<string, any> = {
      "Restaurant": {
        hot: `Escape the Singapore heat at ${businessName}. Enjoy fresh, delicious meals in our cool, air-conditioned dining space. Perfect for beating the hot weather.`,
        rainy: `Take shelter from the rain at ${businessName}. Enjoy a warm, satisfying meal while staying dry and comfortable. Great food, perfect timing.`,
        hazy: `Breathe easy at ${businessName} with our clean, air-filtered dining environment. Fresh ingredients and fresh air make every meal special.`,
        default: `Visit ${businessName} for an exceptional dining experience. Our fresh ingredients and authentic flavors will delight your taste buds.`
      },
      "Coffee shop": {
        hot: `Cool down at ${businessName} with our iced beverages and air-conditioned comfort. Fresh coffee and pastries in a refreshingly cool space.`,
        rainy: `Warm up at ${businessName} while the rain pours outside. Hot coffee, cozy atmosphere, and delicious pastries await you.`,
        hazy: `Enjoy clean air and fresh coffee at ${businessName}. Our filtered indoor environment serves the perfect brew in comfortable surroundings.`,
        default: `Start your day right at ${businessName}. We serve freshly brewed coffee and delicious pastries in a cozy atmosphere.`
      },
      "Gym": {
        hot: `Beat the heat with our air-conditioned fitness facilities at ${businessName}. Cool, comfortable workouts with state-of-the-art equipment.`,
        rainy: `Don't let the rain stop your fitness goals. ${businessName} offers indoor training with expert guidance and modern equipment.`,
        hazy: `Exercise in clean, filtered air at ${businessName}. Our indoor facilities provide the perfect environment for your fitness journey.`,
        default: `Transform your fitness journey at ${businessName}. Our state-of-the-art equipment and expert trainers are here to help.`
      },
      "Mall": {
        hot: `Escape the heat at ${businessName}. Enjoy cool, air-conditioned shopping with amazing deals across all our stores.`,
        rainy: `Stay dry and shop comfortably at ${businessName}. All your favorite stores under one roof, perfect for rainy day shopping.`,
        hazy: `Breathe easy while you shop at ${businessName}. Our climate-controlled environment offers comfortable shopping with clean, filtered air.`,
        default: `Discover amazing deals and experiences at ${businessName}. From shopping to dining, everything you need under one roof.`
      },
      "Fast Food": {
        hot: `Cool down with refreshing meals at ${businessName}. Quick service, cold drinks, and air-conditioned comfort when you need it most.`,
        rainy: `Quick, warm meals at ${businessName} while you wait out the rain. Fast service and cozy indoor seating available.`,
        hazy: `Fresh, fast food in clean indoor air at ${businessName}. Quick service and comfortable dining away from the hazy conditions.`,
        default: `Craving something delicious? ${businessName} serves fresh, fast, and flavorful meals with unbeatable value.`
      }
    };

    const businessScripts = contextualScripts[businessType];
    if (!businessScripts) {
      return `Beat the weather at ${businessName}. Quality service and exceptional value in a comfortable environment.`;
    }

    if (isHot && businessScripts.hot) return businessScripts.hot;
    if (isRainy && businessScripts.rainy) return businessScripts.rainy;
    if (isHazy && businessScripts.hazy) return businessScripts.hazy;
    return businessScripts.default;
  }

  // Health check method
  async healthCheck(): Promise<boolean> {
    try {
      const healthPromise = this.model.generateContent("Say 'OK' if you can respond.");
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Health check timeout')), 5000);
      });

      const result = await Promise.race([healthPromise, timeoutPromise]);
      const response = result.response;
      const text = response.text();
      
      return text && text.includes("OK");
    } catch (error) {
      console.error("[GeminiScriptService] Health check failed:", error);
      return false;
    }
  }
}