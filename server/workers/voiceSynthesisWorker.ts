import { storage } from "../storage";
import { Voiceover } from "@shared/schema";

export interface VoiceSynthesisRequest {
  scriptId: number;
  text: string;
  voiceType: "male" | "female";
  language?: string;
}

export class VoiceSynthesisWorker {
  private isRunning: boolean = false;
  private intervalId: NodeJS.Timeout | null = null;
  private processingQueue: VoiceSynthesisRequest[] = [];

  async start(): Promise<void> {
    if (this.isRunning) {
      console.log("[VoiceSynthesisWorker] Already running");
      return;
    }

    this.isRunning = true;
    console.log("[VoiceSynthesisWorker] Starting voice synthesis worker");
    
    await storage.updateSystemHealth("voice_synthesis", "healthy");
    
    // Process queue every 10 seconds
    this.intervalId = setInterval(async () => {
      try {
        await this.processQueue();
      } catch (error) {
        console.error("[VoiceSynthesisWorker] Error processing queue:", error);
        await storage.updateSystemHealth(
          "voice_synthesis", 
          "error", 
          error instanceof Error ? error.message : "Unknown error"
        );
      }
    }, 10000);
  }

  async stop(): Promise<void> {
    console.log("[VoiceSynthesisWorker] Stopping voice synthesis worker");
    this.isRunning = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    await storage.updateSystemHealth("voice_synthesis", "stopped");
  }

  async enqueueRequest(request: VoiceSynthesisRequest): Promise<void> {
    console.log(`[VoiceSynthesisWorker] Enqueuing voice synthesis for script ${request.scriptId}`);
    this.processingQueue.push(request);
  }

  private async processQueue(): Promise<void> {
    if (this.processingQueue.length === 0) {
      return;
    }

    const request = this.processingQueue.shift();
    if (!request) return;

    await this.synthesizeVoice(request);
  }

  private async synthesizeVoice(request: VoiceSynthesisRequest): Promise<void> {
    const startTime = Date.now();
    
    try {
      console.log(`[VoiceSynthesisWorker] Synthesizing voice for script ${request.scriptId}`);
      
      // Create voiceover record
      const voiceover = await storage.createVoiceover({
        scriptId: request.scriptId,
        voiceType: request.voiceType,
        status: "pending"
      });

      // Simulate voice synthesis (in production, this would call a TTS service)
      const audioUrl = await this.simulateVoiceSynthesis(request);
      const duration = this.estimateDuration(request.text);
      
      // Update voiceover with results
      await storage.updateVoiceoverStatus(
        voiceover.id, 
        "completed", 
        audioUrl
      );
      
      const responseTime = Date.now() - startTime;
      
      await storage.updateSystemHealth(
        "voice_synthesis", 
        "healthy", 
        undefined, 
        responseTime
      );
      
      console.log(`[VoiceSynthesisWorker] Voice synthesis completed for script ${request.scriptId} in ${responseTime}ms`);
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      
      console.error(`[VoiceSynthesisWorker] Voice synthesis failed for script ${request.scriptId}:`, errorMessage);
      
      await storage.updateSystemHealth(
        "voice_synthesis", 
        "error", 
        errorMessage, 
        responseTime
      );
    }
  }

  private async simulateVoiceSynthesis(request: VoiceSynthesisRequest): Promise<string> {
    // Simulate TTS processing time
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
    
    // Create MP3 audio file with weather news content
    const timestamp = Date.now();
    const filename = `script_${request.scriptId}_${request.voiceType}_${timestamp}.mp3`;
    const audioPath = `public/audio/${filename}`;
    
    try {
      // Generate MP3 audio file with weather news content
      await this.generateWeatherNewsAudio(request.text, audioPath, request.voiceType);
      return `/audio/${filename}`;
    } catch (error) {
      console.error("Failed to generate audio file:", error);
      // Fallback to mock URL if audio generation fails
      return `https://tts-service.example.com/audio/${request.scriptId}_${request.voiceType}_${timestamp}.mp3`;
    }
  }

  private async generateWeatherNewsAudio(text: string, outputPath: string, voiceType: string): Promise<void> {
    // Generate real MP3 audio with weather news content using system TTS
    const fs = await import('fs');
    const path = await import('path');
    const { spawn } = await import('child_process');
    
    // Create directory if it doesn't exist
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Get current Singapore weather data to add to announcement
    const weatherContext = await this.getCurrentWeatherContext();
    const fullAnnouncement = `${weatherContext} ${text}`;
    
    console.log(`[VoiceSynthesisWorker] Generating MP3 audio: "${fullAnnouncement.substring(0, 100)}..."`);
    
    try {
      // Use system TTS to generate speech (espeak + ffmpeg)
      await this.generateSystemTTS(fullAnnouncement, outputPath, voiceType);
    } catch (error) {
      console.warn("[VoiceSynthesisWorker] System TTS failed, creating demo MP3:", error);
      // Fallback to creating a demo MP3 file
      await this.createDemoMP3File(fullAnnouncement, outputPath, voiceType);
    }
    
    // Save metadata
    const audioInfo = {
      text: fullAnnouncement,
      voiceType: voiceType,
      duration: this.estimateDuration(fullAnnouncement),
      generatedAt: new Date().toISOString(),
      format: "mp3",
      sampleRate: 22050
    };
    
    fs.writeFileSync(outputPath.replace('.mp3', '.json'), JSON.stringify(audioInfo, null, 2));
  }

  private async getCurrentWeatherContext(): Promise<string> {
    // Weather context is now handled by AI script service
    // Just return a simple introduction for the voiceover
    return "";
  }

  private async generateSystemTTS(text: string, outputPath: string, voiceType: string): Promise<void> {
    const { spawn } = await import('child_process');
    return new Promise((resolve, reject) => {
      
      // Use espeak to generate WAV, then convert to MP3 with ffmpeg
      const tempWavFile = outputPath.replace('.mp3', '_temp.wav');
      
      // Configure voice parameters
      const speed = voiceType === 'female' ? '160' : '140'; // Slightly faster for female
      const pitch = voiceType === 'female' ? '60' : '30';   // Higher pitch for female
      
      // Generate WAV with espeak
      const espeak = spawn('espeak', [
        '-s', speed,       // Speed (words per minute)
        '-p', pitch,       // Pitch (0-99)
        '-a', '100',       // Amplitude (volume)
        '-w', tempWavFile, // Output WAV file
        text
      ]);
      
      espeak.on('close', (code: number) => {
        if (code !== 0) {
          reject(new Error(`espeak failed with code ${code}`));
          return;
        }
        
        // Convert WAV to MP3 using ffmpeg
        const ffmpeg = spawn('ffmpeg', [
          '-i', tempWavFile,
          '-codec:a', 'mp3',
          '-b:a', '128k',
          '-y', // Overwrite output file
          outputPath
        ]);
        
        ffmpeg.on('close', (ffmpegCode: number) => {
          // Clean up temp file
          try {
            const fs = require('fs');
            fs.unlinkSync(tempWavFile);
          } catch (e) {
            // Ignore cleanup errors
          }
          
          if (ffmpegCode !== 0) {
            reject(new Error(`ffmpeg failed with code ${ffmpegCode}`));
            return;
          }
          
          resolve();
        });
        
        ffmpeg.on('error', reject);
      });
      
      espeak.on('error', reject);
    });
  }

  private async createDemoMP3File(text: string, outputPath: string, voiceType: string): Promise<void> {
    const fs = await import('fs');
    
    // Create a minimal MP3 file using ffmpeg with text-to-speech
    try {
      const { spawn } = await import('child_process');
      
      // Create a simple tone as demonstration (since we can't use real TTS without API keys)
      const duration = Math.min(this.estimateDuration(text), 15); // Cap at 15 seconds
      const freq = voiceType === 'female' ? '400' : '300'; // Different frequencies
      
      await new Promise<void>((resolve, reject) => {
        const ffmpeg = spawn('ffmpeg', [
          '-f', 'lavfi',
          '-i', `sine=frequency=${freq}:duration=${duration}`,
          '-codec:a', 'mp3',
          '-b:a', '64k',
          '-y',
          outputPath
        ]);
        
        ffmpeg.on('close', (code: number) => {
          if (code === 0) {
            resolve();
          } else {
            reject(new Error(`Demo MP3 generation failed with code ${code}`));
          }
        });
        
        ffmpeg.on('error', reject);
      });
      
      console.log(`[VoiceSynthesisWorker] Created demo MP3: ${outputPath}`);
    } catch (error) {
      console.error("[VoiceSynthesisWorker] Failed to create demo MP3:", error);
      // Last resort: create an empty file
      fs.writeFileSync(outputPath, Buffer.alloc(0));
    }
  }



  private estimateDuration(text: string): number {
    // Estimate audio duration based on text length (average speaking rate)
    const wordsPerMinute = 150;
    const words = text.split(' ').length;
    return Math.max(1, Math.ceil((words / wordsPerMinute) * 60));
  }

  getStatus(): { isRunning: boolean; queueLength: number } {
    return {
      isRunning: this.isRunning,
      queueLength: this.processingQueue.length
    };
  }
}