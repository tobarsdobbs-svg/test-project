#!/usr/bin/env node

import { Command } from 'commander';
import config, { validateConfig } from './modules/config.js';
import { ScriptGenerator } from './modules/scriptGenerator.js';
import { TTSGenerator } from './modules/ttsGenerator.js';
import { SlideRenderer } from './modules/slideRenderer.js';
import { VideoAssembler } from './modules/videoAssembler.js';
import { YouTubeUploader } from './modules/youtubeUploader.js';
import { History } from './modules/history.js';
import { getAllTopics, getTopicById, getRandomTopic } from './modules/topics.js';
import logger from './modules/logger.js';

const program = new Command();

program
  .name('youtube-automation')
  .description('Automated YouTube video creation for real estate investing education')
  .version('1.0.0');

// ─── List Topics ───────────────────────────────────────────────────────────────
program
  .command('topics')
  .description('List all available video topics')
  .option('-c, --category <category>', 'Filter by category')
  .action(async (opts) => {
    const topics = getAllTopics();
    const history = await new History().load();
    const usedIds = history.getUsedTopicIds();

    console.log('\n📋 Available Video Topics:\n');
    console.log('─'.repeat(70));

    for (const topic of topics) {
      if (opts.category && topic.category !== opts.category) continue;
      const used = usedIds.includes(topic.id) ? ' [DONE]' : '';
      console.log(`  ${topic.id}${used}`);
      console.log(`    ${topic.title}`);
      console.log(`    Category: ${topic.category} | Audience: ${topic.audience}`);
      console.log('');
    }

    console.log(`Total: ${topics.length} topics | Generated: ${usedIds.length}`);
  });

// ─── Generate (script + audio + slides + video) ───────────────────────────────
program
  .command('generate')
  .description('Generate a complete video (script, audio, slides, video)')
  .option('-t, --topic <topicId>', 'Specific topic ID to generate')
  .option('-r, --random', 'Pick a random unused topic')
  .option('--script-only', 'Only generate the script (no audio/video)')
  .option('--skip-video', 'Generate script + audio + slides but skip video assembly')
  .action(async (opts) => {
    validateConfig(['openaiApiKey']);

    const history = await new History().load();
    let topic;

    if (opts.topic) {
      topic = getTopicById(opts.topic);
      if (!topic) {
        console.error(`Topic not found: ${opts.topic}`);
        console.log('Run "npm run topics" to see available topics.');
        process.exit(1);
      }
    } else if (opts.random) {
      topic = getRandomTopic(history.getUsedTopicIds());
    } else {
      // Default: pick next unused topic in order
      const allTopics = getAllTopics();
      const usedIds = history.getUsedTopicIds();
      topic = allTopics.find((t) => !usedIds.includes(t.id));
      if (!topic) {
        console.log('All topics have been generated! Add more topics to topics.js');
        process.exit(0);
      }
    }

    console.log(`\n🎬 Generating video for: ${topic.title}\n`);
    console.log('─'.repeat(70));

    // Step 1: Generate script
    console.log('\n📝 Step 1/4: Generating script...');
    const scriptGen = new ScriptGenerator({
      ...config,
      outputDir: config.scriptOutputDir,
    });
    const script = await scriptGen.generate(topic);
    console.log(`   Script ready: ${script.slides.length} slides, ~${script.estimatedDurationSeconds}s`);

    if (opts.scriptOnly) {
      console.log('\n✅ Script generated (--script-only mode). Exiting.');
      history.addEntry({ topicId: topic.id, stage: 'script' });
      await history.save();
      return;
    }

    // Step 2: Generate TTS audio
    console.log('\n🔊 Step 2/4: Generating audio narration...');
    const ttsGen = new TTSGenerator({
      ...config,
      outputDir: config.audioOutputDir,
    });
    const audioResult = await ttsGen.generateAll(script);
    console.log(`   Audio ready: ${audioResult.slides.length} segments`);

    // Step 3: Render slides
    console.log('\n🖼️  Step 3/4: Rendering slides...');
    const slideRenderer = new SlideRenderer({
      ...config,
      outputDir: config.slideOutputDir,
    });
    const slidePaths = await slideRenderer.renderAll(script);
    console.log(`   Slides ready: ${slidePaths.length} images`);

    if (opts.skipVideo) {
      console.log('\n✅ Script + audio + slides generated (--skip-video mode). Exiting.');
      history.addEntry({ topicId: topic.id, stage: 'slides' });
      await history.save();
      return;
    }

    // Step 4: Assemble video
    console.log('\n🎥 Step 4/4: Assembling video...');
    const assembler = new VideoAssembler({
      ...config,
      outputDir: config.videoOutputDir,
    });
    const videoPath = await assembler.assemble(script, slidePaths, audioResult);
    console.log(`   Video ready: ${videoPath}`);

    // Save to history
    history.addEntry({
      topicId: topic.id,
      title: script.youtube.title,
      videoPath,
      stage: 'video',
    });
    await history.save();

    console.log('\n' + '─'.repeat(70));
    console.log('✅ Video generation complete!');
    console.log(`   File: ${videoPath}`);
    console.log(`   Title: ${script.youtube.title}`);
    console.log('\nTo upload to YouTube, run: npm run publish');
  });

// ─── Upload to YouTube ────────────────────────────────────────────────────────
program
  .command('publish')
  .description('Upload a generated video to YouTube')
  .option('-t, --topic <topicId>', 'Topic ID of the video to upload')
  .option('-l, --latest', 'Upload the most recently generated video')
  .option('--public', 'Set video as public immediately (default: private)')
  .action(async (opts) => {
    validateConfig(['openaiApiKey', 'youtubeClientId', 'youtubeClientSecret']);

    const history = await new History().load();
    const uploader = new YouTubeUploader(config);

    const authenticated = await uploader.initialize();
    if (!authenticated) {
      console.log('Not authenticated. Run "npm run auth" first.');
      process.exit(1);
    }

    // Find the video to upload
    let entry;
    if (opts.topic) {
      entry = history.entries.find((e) => e.topicId === opts.topic && e.stage === 'video');
    } else if (opts.latest) {
      const videos = history.entries.filter((e) => e.stage === 'video');
      entry = videos[videos.length - 1];
    } else {
      // Find first video not yet uploaded
      entry = history.entries.find((e) => e.stage === 'video' && !e.uploaded);
    }

    if (!entry) {
      console.log('No video found to upload. Run "npm run generate" first.');
      process.exit(1);
    }

    // Load the script for metadata
    const scriptPath = `${config.scriptOutputDir}/${entry.topicId}.json`;
    const { default: fsModule } = await import('fs');
    const script = JSON.parse(fsModule.readFileSync(scriptPath, 'utf-8'));

    console.log(`\n📤 Uploading: ${script.youtube.title}\n`);

    const result = await uploader.upload(entry.videoPath, script.youtube);

    if (opts.public) {
      await uploader.publish(result.videoId);
      result.status = 'public';
    }

    // Update history
    entry.uploaded = true;
    entry.videoId = result.videoId;
    entry.youtubeUrl = result.url;
    entry.uploadedAt = new Date().toISOString();
    await history.save();

    console.log('\n✅ Upload complete!');
    console.log(`   URL: ${result.url}`);
    console.log(`   Status: ${result.status}`);
  });

// ─── YouTube Auth ──────────────────────────────────────────────────────────────
program
  .command('auth')
  .description('Authenticate with YouTube (one-time setup)')
  .action(async () => {
    validateConfig(['youtubeClientId', 'youtubeClientSecret']);

    const uploader = new YouTubeUploader(config);
    await uploader.authenticate();
    console.log('\n✅ YouTube authentication complete!');
  });

// ─── Full Pipeline (generate + upload) ────────────────────────────────────────
program
  .command('pipeline')
  .description('Run the full pipeline: generate video and upload to YouTube')
  .option('-t, --topic <topicId>', 'Specific topic ID')
  .option('-r, --random', 'Pick a random unused topic')
  .option('-n, --count <number>', 'Number of videos to generate', '1')
  .action(async (opts) => {
    validateConfig(['openaiApiKey', 'youtubeClientId', 'youtubeClientSecret']);

    const count = parseInt(opts.count, 10);

    for (let i = 0; i < count; i++) {
      if (count > 1) {
        console.log(`\n${'═'.repeat(70)}`);
        console.log(`  Video ${i + 1} of ${count}`);
        console.log(`${'═'.repeat(70)}`);
      }

      // Generate
      await program.commands.find((c) => c.name() === 'generate')
        .parseAsync(['node', 'index.js', ...(opts.topic ? ['-t', opts.topic] : ['-r'])]);

      // Upload latest
      await program.commands.find((c) => c.name() === 'publish')
        .parseAsync(['node', 'index.js', '-l']);

      // Delay between videos to respect API limits
      if (i < count - 1) {
        console.log('\nWaiting 30 seconds before next video...');
        await new Promise((r) => setTimeout(r, 30000));
      }
    }

    console.log(`\n✅ Pipeline complete! Generated and uploaded ${count} video(s).`);
  });

// ─── History ──────────────────────────────────────────────────────────────────
program
  .command('history')
  .description('Show generation and upload history')
  .action(async () => {
    const history = await new History().load();
    const entries = history.entries;

    if (entries.length === 0) {
      console.log('\nNo history yet. Run "npm run generate" to create your first video.');
      return;
    }

    console.log('\n📜 Production History:\n');
    console.log('─'.repeat(70));

    for (const entry of entries) {
      console.log(`  ${entry.timestamp} | ${entry.topicId}`);
      if (entry.title) console.log(`    Title: ${entry.title}`);
      console.log(`    Stage: ${entry.stage}`);
      if (entry.youtubeUrl) console.log(`    YouTube: ${entry.youtubeUrl}`);
      console.log('');
    }
  });

program.parse();
