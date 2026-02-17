import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs/promises';
import path from 'path';
import logger from './logger.js';

/**
 * Assembles slide images and audio narration into a final MP4 video using ffmpeg.
 * Each slide is shown for the duration of its corresponding audio narration.
 */
export class VideoAssembler {
  constructor(config) {
    this.width = config.videoWidth || 1920;
    this.height = config.videoHeight || 1080;
    this.fps = config.videoFps || 30;
    this.slideDuration = config.slideDuration || 8;
    this.outputDir = config.outputDir || './output/videos';
  }

  /**
   * Assemble a video from slides and audio.
   * @param {object} script - Script from ScriptGenerator
   * @param {string[]} slidePaths - Array of slide image file paths
   * @param {object} audioResult - Result from TTSGenerator.generateAll()
   * @returns {string} - Path to the final MP4 file
   */
  async assemble(script, slidePaths, audioResult) {
    await fs.mkdir(this.outputDir, { recursive: true });

    const outputPath = path.join(this.outputDir, `${script.topicId}.mp4`);

    logger.info(`Assembling video: ${slidePaths.length} slides + audio`);

    // Strategy: Create a concat demuxer input that shows each slide
    // for a set duration, then combine with the full audio track.

    // Create a concat file listing each slide with its duration
    const concatPath = path.join(this.outputDir, `${script.topicId}_concat.txt`);
    const concatLines = slidePaths.map((slidePath) => {
      return `file '${path.resolve(slidePath)}'\nduration ${this.slideDuration}`;
    });
    // Repeat last slide (ffmpeg concat demuxer requirement)
    concatLines.push(`file '${path.resolve(slidePaths[slidePaths.length - 1])}'`);
    await fs.writeFile(concatPath, concatLines.join('\n'));

    // Assemble video
    await this._runFfmpeg(concatPath, audioResult.combined, outputPath);

    // Clean up concat file
    await fs.unlink(concatPath).catch(() => {});

    logger.info(`Video assembled: ${outputPath}`);
    return outputPath;
  }

  _runFfmpeg(concatFile, audioPath, outputPath) {
    return new Promise((resolve, reject) => {
      ffmpeg()
        // Slide images via concat demuxer
        .input(concatFile)
        .inputOptions(['-f', 'concat', '-safe', '0'])
        // Audio track
        .input(audioPath)
        // Output settings
        .outputOptions([
          '-c:v', 'libx264',        // H.264 video codec
          '-preset', 'medium',       // Encoding speed/quality tradeoff
          '-crf', '23',              // Quality (lower = better, 18-28 typical)
          '-c:a', 'aac',             // AAC audio codec
          '-b:a', '192k',            // Audio bitrate
          '-pix_fmt', 'yuv420p',     // Pixel format for compatibility
          '-shortest',               // End when shortest stream ends
          '-movflags', '+faststart', // Web-optimized MP4
          `-vf`, `scale=${this.width}:${this.height}:force_original_aspect_ratio=decrease,pad=${this.width}:${this.height}:(ow-iw)/2:(oh-ih)/2`,
        ])
        .output(outputPath)
        .on('start', (cmd) => {
          logger.info(`ffmpeg command: ${cmd}`);
        })
        .on('progress', (progress) => {
          if (progress.percent) {
            logger.info(`  Encoding: ${Math.round(progress.percent)}%`);
          }
        })
        .on('end', () => {
          logger.info('ffmpeg encoding complete');
          resolve(outputPath);
        })
        .on('error', (err) => {
          logger.error(`ffmpeg error: ${err.message}`);
          reject(err);
        })
        .run();
    });
  }
}

export default VideoAssembler;
