import path from 'path';
import fs from 'fs/promises';
import { elevenLabsService } from './elevenLabsService.js';
import { voiceSettingsEngine } from './voiceSettingsEngine.js';
import { storage } from '../storage.js';
import { GeminiScriptService } from './geminiScriptService.js';

export interface AudioGenerationRequest {
  advertisingId: number;
  ruleId: string;
  advertiserId: number;
  advertiserInternalName: string;
  advertiserDisplayName: string;
  businessType: string;
  timestamp: Date;
}

export interface ScriptGenerationResult {
  script: string;
  voiceStyle: string;
}

export interface AudioGenerationResult {
  success: boolean;
  audioPath?: string;
  error?: string;
}

class AudioGenerationService {
  private geminiScriptService: GeminiScriptService;

  constructor() {
    this.geminiScriptService = new GeminiScriptService();
  }

  async generateScriptAndAudio(request: AudioGenerationRequest): Promise<AudioGenerationResult> {
    console.log(`[AudioGenerationService] Starting audio generation for advertising ID ${request.advertisingId}`);
    
    try {
      // Step 1: Generate script
      const scriptResult = await this.generateScript(request);
      if (!scriptResult) {
        throw new Error('Failed to generate script');
      }
      
      console.log(`[AudioGenerationService] Generated script: ${scriptResult.script.substring(0, 100)}...`);
      
      // Step 2: Create audio record in database with script
      const audioRecord = await this.createAudioRecord(request, scriptResult);
      console.log(`[AudioGenerationService] Created audio record with ID: ${audioRecord.id}`);
      
      // Step 3: Generate voiceover
      const audioResult = await this.generateVoiceover(request, scriptResult.script, scriptResult.voiceStyle as 'male' | 'female');
      if (!audioResult.success) {
        // Update audio record status to failed
        await storage.updateAudio(audioRecord.id, { status: 'failed' });
        throw new Error(audioResult.error || 'Failed to generate voiceover');
      }
      
      // Step 4: Update audio record with file path and completed status
      await storage.updateAudio(audioRecord.id, { 
        audioUrl: audioResult.audioPath,
        status: 'completed'
      });
      
      console.log(`[AudioGenerationService] Generated audio file: ${audioResult.audioPath}`);
      
      return {
        success: true,
        audioPath: audioResult.audioPath
      };
      
    } catch (error) {
      console.error(`[AudioGenerationService] Failed to generate audio for advertising ID ${request.advertisingId}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async generateScript(request: AudioGenerationRequest): Promise<ScriptGenerationResult | null> {
    try {
      // Use GeminiScriptService directly instead of HTTP call
      const scriptRequest = {
        advertiserDisplayName: request.advertiserDisplayName,
        businessType: request.businessType,
        ruleId: request.ruleId,
        currentTime: new Date().toLocaleString("en-SG", { timeZone: "Asia/Singapore" })
      };
      
      const result = await this.geminiScriptService.generatePromotionalScript(scriptRequest);
      
      return {
        script: result.script,
        voiceStyle: result.voiceStyle
      };
      
    } catch (error) {
      console.error(`[AudioGenerationService] Script generation failed:`, error);
      return null;
    }
  }

  private async createAudioRecord(request: AudioGenerationRequest, scriptResult: ScriptGenerationResult) {
    const audioData = {
      text: scriptResult.script,
      voiceType: scriptResult.voiceStyle,
      status: 'pending' as const,
      variables: {
        ruleId: request.ruleId,
        advertiserId: request.advertiserId,
        advertiserDisplayName: request.advertiserDisplayName,
        businessType: request.businessType,
        timestamp: request.timestamp
      }
    };
    
    return await storage.createAudio(audioData);
  }


  private async generateVoiceover(request: AudioGenerationRequest, script: string, voiceType: 'male' | 'female'): Promise<AudioGenerationResult> {
    try {
      // Get rule details for voice settings
      const rule = await storage.getConditionRuleById(request.ruleId);
      if (!rule) {
        throw new Error(`Rule not found: ${request.ruleId}`);
      }
      
      // Get voice settings based on rule
      const voiceSettings = voiceSettingsEngine.getVoiceSettings({
        type: request.ruleId,
        conditions: rule.conditions as Record<string, any>
      });
      
      // Generate voiceover using ElevenLabs service (files saved to public/audio/)
      const result = await elevenLabsService.generateVoiceover({
        script,
        voiceType,
        voiceSettings,
        advertiserInternalName: request.advertiserInternalName
      });
      
      return {
        success: true,
        audioPath: result.audioPath
      };
      
    } catch (error) {
      console.error(`[AudioGenerationService] Voiceover generation failed:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async processAdvertisingRecord(advertisingRecord: any): Promise<AudioGenerationResult> {
    // Get advertiser details
    const advertiser = await storage.getAdvertiserById(advertisingRecord.advertiserId);
    if (!advertiser) {
      return {
        success: false,
        error: `Advertiser not found: ${advertisingRecord.advertiserId}`
      };
    }
    
    const request: AudioGenerationRequest = {
      advertisingId: advertisingRecord.id,
      ruleId: advertisingRecord.ruleId,
      advertiserId: advertisingRecord.advertiserId,
      advertiserInternalName: advertiser.name,
      advertiserDisplayName: advertiser.displayName,
      businessType: advertiser.businessType,
      timestamp: advertisingRecord.createdAt
    };
    
    return await this.generateScriptAndAudio(request);
  }
}

export const audioGenerationService = new AudioGenerationService();