// services/voiceService.js (CORRECTED WITH REAL VOICE IDS)
import axios from 'axios';
import fs from 'fs';
import path from 'path';

class VoiceService {
  constructor() {
    this.apiKey = process.env.MURF_API_KEY;
    this.baseURL = 'https://api.murf.ai/v1';
    this.outputDir = 'audio_output';
    this.availableVoices = [];
    this.ensureOutputDirectory();
    
    console.log('🎤 Murf Voice Service initializing...');
    console.log('🔑 API Key configured:', !!this.apiKey);
  }

  ensureOutputDirectory() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  // ✅ FIRST: Get actual available voices from Murf
  async loadAvailableVoices() {
    try {
      if (!this.apiKey) {
        console.log('❌ No API key for voice loading');
        return [];
      }

      console.log('📋 Loading available voices from Murf...');

      const response = await axios.get(`${this.baseURL}/speech/voices`, {
        headers: {
          'api-key': this.apiKey,
          'Accept': 'application/json'
        },
        timeout: 10000
      });

      this.availableVoices = response.data.voices || response.data || [];
      console.log('✅ Loaded voices:', this.availableVoices.length);
      
      // Log first few voices for debugging
      if (this.availableVoices.length > 0) {
        console.log('🎭 Sample voices:');
        this.availableVoices.slice(0, 5).forEach(voice => {
          console.log(`  - ${voice.voiceId || voice.id} (${voice.gender}, ${voice.language})`);
        });
      }

      return this.availableVoices;

    } catch (error) {
      console.error('❌ Failed to load voices:', error.response?.data || error.message);
      return [];
    }
  }

  // ✅ Use REAL voice IDs from Murf
  getEducationalVoiceId(subject) {
    // If no voices loaded, use fallback
    if (this.availableVoices.length === 0) {
      console.log('⚠️ No voices loaded, using fallback');
      return 'fallback-voice';
    }

    // Find appropriate voice based on criteria
    const englishVoices = this.availableVoices.filter(voice => 
      voice.language?.toLowerCase().includes('en') || 
      voice.voiceId?.toLowerCase().includes('en')
    );

    // Subject-specific voice selection
    let preferredVoice;
    
    if (subject.includes('machine learning') || subject.includes('programming')) {
      // Tech topics - prefer clear, professional voices
      preferredVoice = englishVoices.find(voice => 
        voice.gender?.toLowerCase() === 'female' || 
        voice.voiceId?.toLowerCase().includes('aria') ||
        voice.voiceId?.toLowerCase().includes('natalie')
      );
    } else if (subject.includes('mathematics') || subject.includes('science')) {
      // Academic topics - prefer articulate voices
      preferredVoice = englishVoices.find(voice => 
        voice.voiceId?.toLowerCase().includes('brian') ||
        voice.voiceId?.toLowerCase().includes('davis') ||
        voice.gender?.toLowerCase() === 'male'
      );
    }

    // Fallback to first English voice
    const selectedVoice = preferredVoice || englishVoices[0] || this.availableVoices[0];
    const voiceId = selectedVoice?.voiceId || selectedVoice?.id;
    
    console.log('🎭 Selected voice:', voiceId, 'for subject:', subject);
    return voiceId;
  }

  async generateEducationalVoice(text, subject = 'general') {
    try {
      if (!this.apiKey) {
        return this.generateFallbackVoice(text, subject);
      }

      // Load voices if not already loaded
      if (this.availableVoices.length === 0) {
        await this.loadAvailableVoices();
      }

      const cleanText = this.cleanTextForTTS(text);
      const voiceId = this.getEducationalVoiceId(subject);

      if (!voiceId || voiceId === 'fallback-voice') {
        return this.generateFallbackVoice(text, subject);
      }

      console.log('🎤 Generating voice with Murf API...');
      console.log('🎭 Using voice ID:', voiceId);

      // Murf's current non-streaming text-to-speech endpoint.
      const response = await axios.post(`${this.baseURL}/speech/generate`, {
        voiceId: voiceId,
        text: cleanText,
        format: 'MP3'
      }, {
        headers: {
          'api-key': this.apiKey,
          'Content-Type': 'application/json'
        },
        responseType: 'json', // Murf returns JSON with audio URL
        timeout: 30000
      });

      console.log('✅ Murf API responded:', response.status);

      // Murf returns JSON with audioFile URL
      const audioUrl = response.data.audioFile;
      
      if (audioUrl) {
        // Download the audio file
        const audioResponse = await axios.get(audioUrl, {
          responseType: 'arraybuffer'
        });

        // Save audio file
        const filename = `murf_voice_${Date.now()}.mp3`;
        const filePath = path.join(this.outputDir, filename);
        
        fs.writeFileSync(filePath, audioResponse.data);
        
        const stats = fs.statSync(filePath);
        console.log('🎵 Audio downloaded and saved:', filename, 'Size:', stats.size);

        return {
          success: true,
          filename: filename,
          filePath: filePath,
          duration: response.data.audioLengthInSeconds || this.estimateDuration(cleanText),
          size: stats.size,
          voiceId: voiceId,
          provider: 'Murf AI',
          type: 'murf-api',
          audioUrl: audioUrl
        };
      } else {
        throw new Error('No audio URL in response');
      }

    } catch (error) {
      console.error('❌ Murf API Error:');
      console.error('- Status:', error.response?.status);
      console.error('- Data:', error.response?.data);
      console.error('- Message:', error.message);
      
      return this.generateFallbackVoice(text, subject);
    }
  }

  async testConnection() {
    try {
      if (!this.apiKey) {
        return { status: 'no-api-key', message: 'API key not configured' };
      }

      console.log('🧪 Testing Murf API connection by loading voices...');

      const voices = await this.loadAvailableVoices();
      
      if (voices.length > 0) {
        return { 
          status: 'connected', 
          message: `Murf API connection successful - ${voices.length} voices available`,
          voicesCount: voices.length,
          sampleVoices: voices.slice(0, 3).map(v => v.voiceId || v.id)
        };
      } else {
        return { 
          status: 'connected-no-voices', 
          message: 'Connected but no voices found'
        };
      }

    } catch (error) {
      return { 
        status: 'failed', 
        message: error.message,
        details: error.response?.data 
      };
    }
  }

  generateFallbackVoice(text, subject) {
    // Do not advertise a fake audio file. The chat route treats a truthy value
    // as downloadable audio, while browser TTS is not implemented in the UI.
    console.warn('⚠️ Voice unavailable; returning the text response without audio.');
    return null;
  }

  cleanTextForTTS(text) {
    return text
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/\n\n+/g, '. ')
      .replace(/\n/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 1000); // Murf has 1000 character limit per request
  }

  estimateDuration(text) {
    const words = text.split(' ').filter(word => word.length > 0).length;
    return Math.ceil((words / 140) * 60);
  }

  async healthCheck() {
    const connectionTest = await this.testConnection();
    
    return {
      status: connectionTest.status === 'connected' ? 'healthy' : 'degraded',
      service: 'Voice Service',
      provider: 'Murf AI',
      connection: connectionTest,
      voicesLoaded: this.availableVoices.length,
      timestamp: new Date().toISOString()
    };
  }
}

const voiceService = new VoiceService();
export { voiceService };
export const generateEducationalVoice = voiceService.generateEducationalVoice.bind(voiceService);
