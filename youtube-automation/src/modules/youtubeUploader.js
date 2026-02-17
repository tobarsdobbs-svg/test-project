import { google } from 'googleapis';
import fs from 'fs/promises';
import { createReadStream } from 'fs';
import path from 'path';
import http from 'http';
import { URL } from 'url';
import logger from './logger.js';

const TOKEN_PATH = './youtube-tokens.json';

/**
 * Handles YouTube authentication and video uploads via the YouTube Data API v3.
 */
export class YouTubeUploader {
  constructor(config) {
    this.clientId = config.youtubeClientId;
    this.clientSecret = config.youtubeClientSecret;
    this.redirectUri = config.youtubeRedirectUri || 'http://localhost:3000/oauth2callback';
    this.oauth2Client = null;
    this.youtube = null;
  }

  /**
   * Initialize OAuth2 client and load saved tokens if available.
   */
  async initialize() {
    this.oauth2Client = new google.auth.OAuth2(
      this.clientId,
      this.clientSecret,
      this.redirectUri
    );

    // Try to load saved tokens
    try {
      const tokens = JSON.parse(await fs.readFile(TOKEN_PATH, 'utf-8'));
      this.oauth2Client.setCredentials(tokens);
      logger.info('Loaded saved YouTube authentication tokens');
    } catch {
      logger.info('No saved tokens found. Run "npm run auth" to authenticate.');
      return false;
    }

    this.youtube = google.youtube({ version: 'v3', auth: this.oauth2Client });
    return true;
  }

  /**
   * Run interactive OAuth2 flow to get tokens.
   * Opens a local HTTP server to receive the callback.
   */
  async authenticate() {
    this.oauth2Client = new google.auth.OAuth2(
      this.clientId,
      this.clientSecret,
      this.redirectUri
    );

    const authUrl = this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/youtube.upload',
        'https://www.googleapis.com/auth/youtube',
      ],
    });

    console.log('\n========================================');
    console.log('YouTube Authentication Required');
    console.log('========================================');
    console.log('\nOpen this URL in your browser:\n');
    console.log(authUrl);
    console.log('\nWaiting for authentication callback...\n');

    // Start local server to receive OAuth callback
    const code = await this._waitForCallback();

    const { tokens } = await this.oauth2Client.getToken(code);
    this.oauth2Client.setCredentials(tokens);

    // Save tokens for future use
    await fs.writeFile(TOKEN_PATH, JSON.stringify(tokens, null, 2));
    logger.info('Authentication successful! Tokens saved.');

    this.youtube = google.youtube({ version: 'v3', auth: this.oauth2Client });
    return true;
  }

  /**
   * Upload a video to YouTube.
   * @param {string} videoPath - Path to the MP4 file
   * @param {object} metadata - YouTube metadata (title, description, tags)
   * @param {string} thumbnailPath - Optional path to thumbnail image
   * @returns {object} - YouTube API response with video ID
   */
  async upload(videoPath, metadata, thumbnailPath = null) {
    if (!this.youtube) {
      throw new Error('Not authenticated. Run authenticate() first.');
    }

    logger.info(`Uploading video: ${metadata.title}`);

    const fileSize = (await fs.stat(videoPath)).size;
    logger.info(`File size: ${(fileSize / 1024 / 1024).toFixed(1)} MB`);

    const response = await this.youtube.videos.insert({
      part: ['snippet', 'status'],
      requestBody: {
        snippet: {
          title: metadata.title,
          description: metadata.description,
          tags: metadata.tags,
          categoryId: '27', // Education category
          defaultLanguage: 'en',
        },
        status: {
          privacyStatus: 'private', // Start as private, manually review before publishing
          selfDeclaredMadeForKids: false,
        },
      },
      media: {
        body: createReadStream(videoPath),
      },
    });

    const videoId = response.data.id;
    logger.info(`Video uploaded successfully! ID: ${videoId}`);
    logger.info(`URL: https://youtube.com/watch?v=${videoId}`);
    logger.info(`Status: Private (review and publish manually or use the publish command)`);

    // Upload thumbnail if provided
    if (thumbnailPath) {
      try {
        await this.youtube.thumbnails.set({
          videoId,
          media: {
            body: createReadStream(thumbnailPath),
          },
        });
        logger.info('Custom thumbnail uploaded');
      } catch (err) {
        logger.warn(`Thumbnail upload failed (may require verified account): ${err.message}`);
      }
    }

    return {
      videoId,
      url: `https://youtube.com/watch?v=${videoId}`,
      status: 'private',
    };
  }

  /**
   * Set a video's privacy status to public.
   * @param {string} videoId - YouTube video ID
   */
  async publish(videoId) {
    if (!this.youtube) {
      throw new Error('Not authenticated. Run authenticate() first.');
    }

    await this.youtube.videos.update({
      part: ['status'],
      requestBody: {
        id: videoId,
        status: {
          privacyStatus: 'public',
        },
      },
    });

    logger.info(`Video ${videoId} is now public`);
    return { videoId, status: 'public' };
  }

  _waitForCallback() {
    return new Promise((resolve, reject) => {
      const server = http.createServer((req, res) => {
        const url = new URL(req.url, `http://localhost:3000`);
        const code = url.searchParams.get('code');

        if (code) {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end('<h1>Authentication successful!</h1><p>You can close this window.</p>');
          server.close();
          resolve(code);
        } else {
          res.writeHead(400);
          res.end('No authorization code received');
        }
      });

      server.listen(3000, () => {
        logger.info('OAuth callback server listening on port 3000');
      });

      // Timeout after 5 minutes
      setTimeout(() => {
        server.close();
        reject(new Error('Authentication timed out'));
      }, 5 * 60 * 1000);
    });
  }
}

export default YouTubeUploader;
