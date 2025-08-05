import { VoiceSettings } from './elevenLabsService.js';

export interface ConditionRule {
  type: string;
  conditions?: Record<string, any>;
  [key: string]: any;
}

class VoiceSettingsEngine {
  private ruleSettingsMap: Record<string, VoiceSettings>;

  constructor() {
    // Define voice settings based on rule types
    this.ruleSettingsMap = {
      // Weather-related rules
      'weather-alert': {
        stability: 0.8,
        similarity_boost: 0.9,
        style: 0.3,
        use_speaker_boost: true,
        speed: 1.0,
      },
      'weather-sunny': {
        stability: 0.5,
        similarity_boost: 0.7,
        style: 0.6,
        use_speaker_boost: true,
        speed: 0.9,
      },
      'weather-rainy': {
        stability: 0.7,
        similarity_boost: 0.8,
        style: 0.4,
        use_speaker_boost: true,
        speed: 1.0,
      },

      // Traffic-related rules
      'traffic-update': {
        stability: 0.6,
        similarity_boost: 0.8,
        style: 0.5,
        use_speaker_boost: true,
        speed: 1.2,
      },
      'traffic-jam': {
        stability: 0.7,
        similarity_boost: 0.8,
        style: 0.4,
        use_speaker_boost: true,
        speed: 1.1,
      },
      'traffic-clear': {
        stability: 0.4,
        similarity_boost: 0.7,
        style: 0.7,
        use_speaker_boost: true,
        speed: 0.9,
      },

      // Air quality rules
      'air-quality': {
        stability: 0.8,
        similarity_boost: 0.9,
        style: 0.2,
        use_speaker_boost: true,
        speed: 1.0,
      },
      'air-quality-good': {
        stability: 0.5,
        similarity_boost: 0.7,
        style: 0.6,
        use_speaker_boost: true,
        speed: 0.9,
      },
      'air-quality-poor': {
        stability: 0.8,
        similarity_boost: 0.9,
        style: 0.3,
        use_speaker_boost: true,
        speed: 1.0,
      },

      // Promotional rules
      'promotional': {
        stability: 0.4,
        similarity_boost: 0.7,
        style: 0.8,
        use_speaker_boost: true,
        speed: 0.9,
      },
      'promotional-sale': {
        stability: 0.3,
        similarity_boost: 0.6,
        style: 0.9,
        use_speaker_boost: true,
        speed: 0.8,
      },
      'promotional-event': {
        stability: 0.4,
        similarity_boost: 0.7,
        style: 0.8,
        use_speaker_boost: true,
        speed: 0.9,
      },

      // Time-based rules
      'time-morning': {
        stability: 0.6,
        similarity_boost: 0.8,
        style: 0.5,
        use_speaker_boost: true,
        speed: 0.9,
      },
      'time-evening': {
        stability: 0.7,
        similarity_boost: 0.8,
        style: 0.4,
        use_speaker_boost: true,
        speed: 1.0,
      },
      'time-night': {
        stability: 0.8,
        similarity_boost: 0.9,
        style: 0.2,
        use_speaker_boost: true,
        speed: 1.1,
      },

      // Emergency/Alert rules
      'emergency': {
        stability: 0.9,
        similarity_boost: 1.0,
        style: 0.1,
        use_speaker_boost: true,
        speed: 1.2,
      },
      'flood-alert': {
        stability: 0.9,
        similarity_boost: 0.95,
        style: 0.2,
        use_speaker_boost: true,
        speed: 1.1,
      },

      // Default fallback
      'default': {
        stability: 0.6,
        similarity_boost: 0.8,
        style: 0.5,
        use_speaker_boost: true,
        speed: 1.0,
      },
    };
  }

  getVoiceSettings(rule: ConditionRule): VoiceSettings {
    // Try to match by rule type first
    let ruleKey = rule.type?.toLowerCase();
    
    // If direct match exists, use it
    if (ruleKey && this.ruleSettingsMap[ruleKey]) {
      return { ...this.ruleSettingsMap[ruleKey] };
    }

    // Try to find partial matches for compound rule types
    for (const [key, settings] of Object.entries(this.ruleSettingsMap)) {
      if (ruleKey?.includes(key.split('-')[0])) {
        return { ...settings };
      }
    }

    // Check conditions for weather-specific rules
    if (rule.conditions) {
      if (rule.conditions.weather_condition) {
        const weather = rule.conditions.weather_condition.toLowerCase();
        if (weather.includes('rain') || weather.includes('storm')) {
          return { ...this.ruleSettingsMap['weather-rainy'] };
        }
        if (weather.includes('sun') || weather.includes('clear')) {
          return { ...this.ruleSettingsMap['weather-sunny'] };
        }
      }

      if (rule.conditions.time_category) {
        switch (rule.conditions.time_category) {
          case 'morning':
            return { ...this.ruleSettingsMap['time-morning'] };
          case 'evening':
            return { ...this.ruleSettingsMap['time-evening'] };
          case 'night':
            return { ...this.ruleSettingsMap['time-night'] };
        }
      }

      if (rule.conditions.time_range) {
        const hour = new Date().getHours();
        if (hour >= 6 && hour < 12) {
          return { ...this.ruleSettingsMap['time-morning'] };
        }
        if (hour >= 18 && hour < 22) {
          return { ...this.ruleSettingsMap['time-evening'] };
        }
        if (hour >= 22 || hour < 6) {
          return { ...this.ruleSettingsMap['time-night'] };
        }
      }
    }

    // Fallback to default settings
    return { ...this.ruleSettingsMap['default'] };
  }

  // Add new rule mapping
  addRuleMapping(ruleType: string, settings: VoiceSettings): void {
    this.ruleSettingsMap[ruleType.toLowerCase()] = { ...settings };
  }

  // Get all available rule mappings
  getAllRuleMappings(): Record<string, VoiceSettings> {
    return { ...this.ruleSettingsMap };
  }
}

export const voiceSettingsEngine = new VoiceSettingsEngine();