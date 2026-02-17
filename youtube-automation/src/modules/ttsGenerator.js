import OpenAI from 'openai';
import fs from 'fs/promises';
import { createWriteStream } from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';
import logger from './logger.js';

/**
 * Generates audio narration from script text using OpenAI TTS.
 * Produces one MP3 file per slide plus a combined full audio track.
 */
export class TTSGenerator {
  constructor(config) {
    this.openai = new OpenAI({ apiKey: config.openaiApiKey });
    this.voice = config.ttsVoice || 'onyx';
    this.model = config.ttsModel || 'tts-1';
    this.outputDir = config.outputDir || './output/audio';
  }

  /**
   * Generate audio for an entire script.
   * @param {object} script - The script object from ScriptGenerator
   * @returns {object} - Paths to generated audio files and durations
   */
  async generateAll(script) {
    logger.info(`Generating TTS audio for ${script.slides.length} slides`);
    await fs.mkdir(this.outputDir, { recursive: true });

    const slideAudio = [];

    for (let i = 0; i < script.slides.length; i++) {
      const slide = script.slides[i];
      const filename = `${script.topicId}_slide_${String(i + 1).padStart(2, '0')}.mp3`;
      const outputPath = path.join(this.outputDir, filename);

      logger.info(`  Generating audio for slide ${i + 1}/${script.slides.length}: "${slide.heading}"`);

      await this._generateAudio(slide.narration, outputPath);

      slideAudio.push({
        slideNumber: i + 1,
        path: outputPath,
        text: slide.narration,
      });

      // Small delay to respect rate limits
      if (i < script.slides.length - 1) {
        await this._delay(500);
      }
    }

    // Combine all slide audio into a single track using ffmpeg concat
    const combinedPath = path.join(this.outputDir, `${script.topicId}_full.mp3`);
    await this._combineAudio(slideAudio.map((s) => s.path), combinedPath);

    logger.info(`Full audio saved to ${combinedPath}`);

    return {
      slides: slideAudio,
      combined: combinedPath,
    };
  }

  async _generateAudio(text, outputPath) {
    const response = await this.openai.audio.speech.create({
      model: this.model,
      voice: this.voice,
      input: text,
      response_format: 'mp3',
    });

    const buffer = Buffer.from(await response.arrayBuffer());
    await fs.writeFile(outputPath, buffer);
  }

  async _combineAudio(files, outputPath) {
    // Create an ffmpeg concat list file
    const listPath = outputPath + '.list';
    const listContent = files.map((f) => `file '${path.resolve(f)}'`).join('\n');
    await fs.writeFile(listPath, listContent);

    // Use ffmpeg to concatenate (will be called from video assembly)
    // For now, store the list path for the video module to use
    this.concatListPath = listPath;

    // Also do a simple binary concat for standalone audio
    const chunks = [];
    for (const file of files) {
      chunks.push(await fs.readFile(file));
    }
    await fs.writeFile(outputPath, Buffer.concat(chunks));

    // Clean up list file
    await fs.unlink(listPath).catch(() => {});
  }

  _delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export default TTSGenerator;
