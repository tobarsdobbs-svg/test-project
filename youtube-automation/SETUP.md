# YouTube Automation - Real Estate Investing Education

Automated system to generate and publish YouTube videos on real estate investing topics.

## Architecture

```
Topic Bank ──► Script Generator (OpenAI) ──► TTS Audio (OpenAI) ──► Slide Renderer (Canvas) ──► Video Assembly (ffmpeg) ──► YouTube Upload (API v3)
```

## Cost Estimate Per Video

| Component | Service | Cost |
|-----------|---------|------|
| Script generation | OpenAI GPT-4o-mini | ~$0.01-0.03 |
| TTS narration (~1000 words) | OpenAI TTS-1 | ~$0.03-0.06 |
| Slide rendering | Local (node-canvas) | Free |
| Video assembly | Local (ffmpeg) | Free |
| YouTube upload | YouTube Data API | Free (quota-limited) |
| **Total per video** | | **~$0.04-0.09** |

For higher quality: use GPT-4o (~$0.10/script) and TTS-1-HD (~$0.06-0.12/audio) = ~$0.16-0.22/video.

## Prerequisites

- **Node.js** >= 18
- **ffmpeg** installed and available in PATH
- **OpenAI API key** (for script generation and TTS)
- **Google Cloud project** with YouTube Data API v3 enabled (for uploads)

## Setup

### 1. Install dependencies

```bash
cd youtube-automation
npm install
```

### 2. Install ffmpeg (if not already installed)

```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt install ffmpeg

# Windows (via chocolatey)
choco install ffmpeg
```

### 3. Configure environment

```bash
cp .env.example .env
# Edit .env with your API keys
```

### 4. Set up Google Cloud OAuth (for YouTube uploads)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Enable the **YouTube Data API v3**
4. Go to **Credentials** > **Create Credentials** > **OAuth 2.0 Client ID**
5. Set application type to **Web application**
6. Add `http://localhost:3000/oauth2callback` as an authorized redirect URI
7. Copy the Client ID and Client Secret to your `.env` file

### 5. Authenticate with YouTube (one-time)

```bash
npm run auth
```

This opens a browser window for Google OAuth. After authorizing, tokens are saved locally.

## Usage

### List available topics

```bash
npm run topics
```

### Generate a video

```bash
# Generate the next unused topic
npm run generate

# Generate a specific topic
npm run generate -- -t brrrr-method

# Generate a random unused topic
npm run generate -- -r

# Generate script only (no audio/video)
npm run generate -- --script-only

# Generate everything except video assembly
npm run generate -- --skip-video
```

### Upload to YouTube

```bash
# Upload the most recent video (as private)
npm run publish -- -l

# Upload and make public immediately
npm run publish -- -l --public

# Upload a specific topic's video
npm run publish -- -t rental-property-basics
```

### Full pipeline (generate + upload)

```bash
# Generate and upload one video
npm run pipeline

# Generate and upload 3 random videos
npm run pipeline -- -r -n 3
```

### View history

```bash
node src/index.js history
```

## Customization

### Adding new topics

Edit `src/modules/topics.js` to add entries to the `TOPICS` array.

### Changing slide appearance

Modify the environment variables in `.env`:
- `SLIDE_BG_COLOR` - background color (hex)
- `SLIDE_TEXT_COLOR` - text color (hex)
- `SLIDE_ACCENT_COLOR` - accent/heading color (hex)

Or modify `src/modules/slideRenderer.js` for deeper layout changes.

### Changing narration voice

Set `OPENAI_TTS_VOICE` in `.env` to one of: `alloy`, `echo`, `fable`, `onyx`, `nova`, `shimmer`.

### Upgrading video quality

For better results at higher cost:
- Set `OPENAI_MODEL=gpt-4o` for better scripts
- Set `OPENAI_TTS_MODEL=tts-1-hd` for higher quality audio
- Reduce `VIDEO_CRF` for higher quality video encoding

## File Structure

```
youtube-automation/
├── src/
│   ├── index.js              # CLI entry point and orchestrator
│   └── modules/
│       ├── config.js          # Environment config loader
│       ├── history.js         # Production history tracker
│       ├── logger.js          # Winston logger
│       ├── scriptGenerator.js # AI script generation (OpenAI)
│       ├── slideRenderer.js   # Slide image rendering (Canvas)
│       ├── topics.js          # Topic bank
│       ├── ttsGenerator.js    # Text-to-speech (OpenAI TTS)
│       ├── videoAssembler.js  # ffmpeg video assembly
│       └── youtubeUploader.js # YouTube Data API v3 upload
├── output/
│   ├── scripts/               # Generated JSON scripts
│   ├── audio/                 # TTS audio files
│   ├── slides/                # Rendered slide PNGs
│   └── videos/                # Final MP4 videos
├── .env.example               # Environment template
├── package.json
└── SETUP.md
```
