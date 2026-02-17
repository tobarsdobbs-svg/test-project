import OpenAI from 'openai';
import fs from 'fs/promises';
import path from 'path';
import logger from './logger.js';

/**
 * Generates a YouTube video script for a given topic using OpenAI.
 * Returns structured script with intro, slides (sections), and outro,
 * plus YouTube metadata (title, description, tags).
 */
export class ScriptGenerator {
  constructor(config) {
    this.openai = new OpenAI({ apiKey: config.openaiApiKey });
    this.model = config.openaiModel || 'gpt-4o-mini';
    this.outputDir = config.outputDir || './output/scripts';
  }

  async generate(topic) {
    logger.info(`Generating script for: ${topic.title}`);

    const prompt = this._buildPrompt(topic);

    const response = await this.openai.chat.completions.create({
      model: this.model,
      messages: [
        {
          role: 'system',
          content: `You are an expert real estate investing educator and YouTube content creator.
You create engaging, educational scripts that are clear, actionable, and suitable for voice narration.
Always respond with valid JSON matching the requested structure.`,
        },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 4000,
    });

    const script = JSON.parse(response.choices[0].message.content);
    script.topicId = topic.id;
    script.generatedAt = new Date().toISOString();

    // Estimate total duration from word count (~150 words/min for narration)
    const totalWords = this._countWords(script);
    script.estimatedDurationSeconds = Math.ceil((totalWords / 150) * 60);

    // Save script to disk
    const outputPath = path.join(this.outputDir, `${topic.id}.json`);
    await fs.mkdir(this.outputDir, { recursive: true });
    await fs.writeFile(outputPath, JSON.stringify(script, null, 2));
    logger.info(`Script saved to ${outputPath} (~${totalWords} words, ~${Math.ceil(totalWords / 150)} min)`);

    return script;
  }

  _buildPrompt(topic) {
    return `Create a YouTube video script for the following real estate investing education topic.

TOPIC: ${topic.title}
TARGET AUDIENCE: ${topic.audience}
KEY POINTS TO COVER:
${topic.keyPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}

Return a JSON object with this exact structure:
{
  "youtube": {
    "title": "Compelling YouTube title (60 chars max, include keywords)",
    "description": "Full YouTube description with summary, timestamps, and call to action (1000-1500 chars)",
    "tags": ["tag1", "tag2", ...] (10-15 relevant tags for SEO)
  },
  "slides": [
    {
      "slideNumber": 1,
      "heading": "Short heading for the slide (5-8 words max)",
      "bulletPoints": ["Key point 1", "Key point 2", "Key point 3"],
      "narration": "The full narration text for this section. This should be conversational, engaging, and educational. Aim for 80-120 words per slide."
    }
  ]
}

Guidelines:
- Create 8-12 slides total
- Slide 1 should be an engaging intro/hook
- The last slide should be a summary with call to action (like, subscribe, comment)
- Use simple language accessible to the target audience
- Include specific numbers, examples, or case studies where relevant
- Each slide's narration should flow naturally for text-to-speech
- Avoid jargon without explaining it first
- Make it actionable — viewers should learn something they can apply`;
  }

  _countWords(script) {
    return script.slides.reduce((total, slide) => {
      return total + slide.narration.split(/\s+/).length;
    }, 0);
  }
}

export default ScriptGenerator;
