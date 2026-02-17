import { createCanvas } from 'canvas';
import fs from 'fs/promises';
import { writeFileSync } from 'fs';
import path from 'path';
import logger from './logger.js';

/**
 * Renders script slides as PNG images using node-canvas.
 * Produces clean, professional-looking slides with headings and bullet points.
 */
export class SlideRenderer {
  constructor(config) {
    this.width = config.videoWidth || 1920;
    this.height = config.videoHeight || 1080;
    this.bgColor = config.slideBgColor || '#1a1a2e';
    this.textColor = config.slideTextColor || '#ffffff';
    this.accentColor = config.slideAccentColor || '#e94560';
    this.outputDir = config.outputDir || './output/slides';
  }

  /**
   * Render all slides from a script to PNG files.
   * @param {object} script - Script object from ScriptGenerator
   * @returns {string[]} - Array of file paths to rendered slide images
   */
  async renderAll(script) {
    await fs.mkdir(this.outputDir, { recursive: true });
    const paths = [];

    for (let i = 0; i < script.slides.length; i++) {
      const slide = script.slides[i];
      const filename = `${script.topicId}_slide_${String(i + 1).padStart(2, '0')}.png`;
      const outputPath = path.join(this.outputDir, filename);

      this._renderSlide(slide, i, script.slides.length, outputPath);
      paths.push(outputPath);
      logger.info(`  Rendered slide ${i + 1}/${script.slides.length}: ${outputPath}`);
    }

    return paths;
  }

  _renderSlide(slide, index, total, outputPath) {
    const canvas = createCanvas(this.width, this.height);
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = this.bgColor;
    ctx.fillRect(0, 0, this.width, this.height);

    // Subtle gradient overlay
    const gradient = ctx.createLinearGradient(0, 0, 0, this.height);
    gradient.addColorStop(0, 'rgba(255,255,255,0.03)');
    gradient.addColorStop(1, 'rgba(0,0,0,0.2)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.width, this.height);

    // Accent bar at top
    ctx.fillStyle = this.accentColor;
    ctx.fillRect(0, 0, this.width, 6);

    // Slide number indicator
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = '24px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`${index + 1} / ${total}`, this.width - 60, this.height - 40);

    // Heading
    ctx.textAlign = 'left';
    ctx.fillStyle = this.accentColor;
    ctx.font = 'bold 56px sans-serif';

    const headingY = 140;
    const maxHeadingWidth = this.width - 200;
    const headingLines = this._wrapText(ctx, slide.heading, maxHeadingWidth);

    headingLines.forEach((line, i) => {
      ctx.fillText(line, 100, headingY + i * 68);
    });

    // Underline accent
    const underlineY = headingY + headingLines.length * 68 + 20;
    ctx.fillStyle = this.accentColor;
    ctx.fillRect(100, underlineY, 120, 4);

    // Bullet points
    if (slide.bulletPoints && slide.bulletPoints.length > 0) {
      ctx.fillStyle = this.textColor;
      ctx.font = '36px sans-serif';

      let bulletY = underlineY + 60;
      const bulletIndent = 140;
      const maxBulletWidth = this.width - 280;

      for (const point of slide.bulletPoints) {
        // Bullet dot
        ctx.fillStyle = this.accentColor;
        ctx.beginPath();
        ctx.arc(115, bulletY - 10, 8, 0, Math.PI * 2);
        ctx.fill();

        // Bullet text
        ctx.fillStyle = this.textColor;
        const bulletLines = this._wrapText(ctx, point, maxBulletWidth);
        bulletLines.forEach((line, i) => {
          ctx.fillText(line, bulletIndent, bulletY + i * 46);
        });

        bulletY += bulletLines.length * 46 + 30;
      }
    }

    // Save to file (synchronous since canvas.toBuffer is sync)
    const buffer = canvas.toBuffer('image/png');
    writeFileSync(outputPath, buffer);
  }

  _wrapText(ctx, text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const metrics = ctx.measureText(testLine);

      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine) lines.push(currentLine);
    return lines;
  }
}

export default SlideRenderer;
