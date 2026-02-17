import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const config = {
  // OpenAI
  openaiApiKey: process.env.OPENAI_API_KEY,
  openaiModel: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  ttsVoice: process.env.OPENAI_TTS_VOICE || 'onyx',
  ttsModel: process.env.OPENAI_TTS_MODEL || 'tts-1',

  // YouTube
  youtubeClientId: process.env.YOUTUBE_CLIENT_ID,
  youtubeClientSecret: process.env.YOUTUBE_CLIENT_SECRET,
  youtubeRedirectUri: process.env.YOUTUBE_REDIRECT_URI || 'http://localhost:3000/oauth2callback',

  // Video
  videoWidth: parseInt(process.env.VIDEO_WIDTH || '1920', 10),
  videoHeight: parseInt(process.env.VIDEO_HEIGHT || '1080', 10),
  videoFps: parseInt(process.env.VIDEO_FPS || '30', 10),
  slideDuration: parseInt(process.env.SLIDE_DURATION || '8', 10),

  // Slide styling
  slideBgColor: process.env.SLIDE_BG_COLOR || '#1a1a2e',
  slideTextColor: process.env.SLIDE_TEXT_COLOR || '#ffffff',
  slideAccentColor: process.env.SLIDE_ACCENT_COLOR || '#e94560',

  // Output directories
  outputDir: process.env.OUTPUT_DIR || './output',
  get scriptOutputDir() { return path.join(this.outputDir, 'scripts'); },
  get audioOutputDir() { return path.join(this.outputDir, 'audio'); },
  get slideOutputDir() { return path.join(this.outputDir, 'slides'); },
  get videoOutputDir() { return path.join(this.outputDir, 'videos'); },
};

export function validateConfig(requiredKeys) {
  const missing = requiredKeys.filter((key) => !config[key]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required configuration: ${missing.join(', ')}\n` +
      'Copy .env.example to .env and fill in the values.'
    );
  }
}

export default config;
