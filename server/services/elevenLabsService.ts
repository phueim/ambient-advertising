import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface VoiceSettings {
  stability: number;
  similarity_boost: number;
  style: number;
  use_speaker_boost: boolean;
  speed: number;
}

export interface GenerateVoiceoverRequest {
  script: string;
  voiceType: 'male' | 'female';
  voiceSettings: VoiceSettings;
  advertiserInternalName: string;
}

export interface GenerateVoiceoverResponse {
  audioPath: string;
  fileName: string;
  fileSize: number;
}

class ElevenLabsService {
  private client: ElevenLabsClient;
  private voiceIds: Record<'male' | 'female', string>;

  constructor() {
    this.client = new ElevenLabsClient({
      apiKey: process.env.ELEVENLABS_API_KEY,
    });

    // High-quality voice mappings
    this.voiceIds = {
      male: 'JBFqnCBsd6RMkjVDRZzb', // George - conversational English
      female: '21m00Tcm4TlvDq8ikWAM', // Rachel - narration English
    };
  }

  async generateVoiceover(request: GenerateVoiceoverRequest): Promise<GenerateVoiceoverResponse> {
    const { script, voiceType, voiceSettings, advertiserInternalName } = request;
    
    console.log(`[ElevenLabsService] Starting voiceover generation for: ${script.substring(0, 50)}...`);
    console.log(`[ElevenLabsService] Voice type: ${voiceType}, Advertiser: ${advertiserInternalName}`);
    
    // Check if API key is available
    if (!process.env.ELEVENLABS_API_KEY) {
      throw new Error('ELEVENLABS_API_KEY environment variable is not set');
    }
    
    // Get voice ID based on type
    const voiceId = this.voiceIds[voiceType];
    console.log(`[ElevenLabsService] Using voice ID: ${voiceId}`);
    
    // Generate descriptive filename with timestamp
    const timestamp = Date.now();
    const fileName = `script_${timestamp}_${voiceType}_${advertiserInternalName.replace(/[^a-zA-Z0-9]/g, '_')}.mp3`;
    
    // Create directory structure in public/audio for static serving
    const audioDir = path.join(process.cwd(), 'public', 'audio');
    await fs.mkdir(audioDir, { recursive: true });
    
    const audioPath = path.join(audioDir, fileName);
    console.log(`[ElevenLabsService] Audio will be saved to: ${audioPath}`);
    
    try {
      // Call ElevenLabs API
      console.log(`[ElevenLabsService] Calling ElevenLabs API...`);
      const audioStream = await this.client.textToSpeech.convert(voiceId, {
        text: script,
        modelId: 'eleven_multilingual_v2',
        outputFormat: 'mp3_44100_128',
        voiceSettings: {
          stability: voiceSettings.stability,
          similarityBoost: voiceSettings.similarity_boost,
          style: voiceSettings.style,
          useSpeakerBoost: voiceSettings.use_speaker_boost,
          speed: voiceSettings.speed,
        },
      });

      console.log(`[ElevenLabsService] Received audio stream, processing...`);

      // Convert stream to buffer and save to file
      const chunks: Buffer[] = [];
      const reader = audioStream.getReader();
      
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(Buffer.from(value));
        }
      } finally {
        reader.releaseLock();
      }
      
      const audioBuffer = Buffer.concat(chunks);
      console.log(`[ElevenLabsService] Audio buffer size: ${audioBuffer.length} bytes`);
      
      if (audioBuffer.length === 0) {
        throw new Error('Received empty audio buffer from ElevenLabs API');
      }
      
      await fs.writeFile(audioPath, audioBuffer);
      console.log(`[ElevenLabsService] Audio file written successfully`);
      
      // Get file size
      const stats = await fs.stat(audioPath);
      console.log(`[ElevenLabsService] File size: ${stats.size} bytes`);
      
      return {
        audioPath: `/audio/${fileName}`, // Web-accessible path for serving
        fileName,
        fileSize: stats.size,
      };
      
    } catch (error) {
      console.error(`[ElevenLabsService] Error generating audio:`, error);
      
      // Clean up any empty file that might have been created
      try {
        await fs.unlink(audioPath);
      } catch (unlinkError) {
        // Ignore unlink errors
      }
      
      throw error;
    }
  }
}

export const elevenLabsService = new ElevenLabsService();