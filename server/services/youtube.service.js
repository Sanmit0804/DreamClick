/**
 * youtube.service.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Core YouTube Data API v3 service layer.
 *
 * Responsibilities:
 *  • Build and manage the OAuth2 client
 *  • Persist / refresh tokens via MongoDB (YoutubeToken model)
 *  • uploadToYouTube(videoPath, metadata) — the public upload function
 *  • Shorts optimisation (title/description injection of #Shorts)
 * ─────────────────────────────────────────────────────────────────────────────
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const YoutubeToken = require('../models/youtubeToken.model');

// ── OAuth2 client ─────────────────────────────────────────────────────────────
const getOAuth2Client = () => {
  return new google.auth.OAuth2(
    process.env.YOUTUBE_CLIENT_ID,
    process.env.YOUTUBE_CLIENT_SECRET,
    process.env.YOUTUBE_REDIRECT_URI   // e.g. http://localhost:5000/youtube/oauth/callback
  );
};

// ── Token helpers ─────────────────────────────────────────────────────────────

/**
 * Persist (upsert) tokens to MongoDB.
 * @param {object} tokens  – object from oauth2Client.getToken() or setCredentials
 */
const saveTokens = async (tokens) => {
  const email = process.env.YOUTUBE_ADMIN_EMAIL || 'dreamclick0823@gmail.com';
  await YoutubeToken.findOneAndUpdate(
    { email },
    {
      accessToken: tokens.access_token ?? undefined,
      refreshToken: tokens.refresh_token ?? undefined,
      tokenType: tokens.token_type ?? 'Bearer',
      expiryDate: tokens.expiry_date ?? null,
      scope: tokens.scope ?? null,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
};

/**
 * Load stored tokens and attach them to an OAuth2 client.
 * Returns null if no tokens are saved yet (admin hasn't authorised).
 * @returns {google.auth.OAuth2 | null}
 */
const getAuthorizedClient = async () => {
  const email = process.env.YOUTUBE_ADMIN_EMAIL || 'dreamclick0823@gmail.com';
  const tokenDoc = await YoutubeToken.findOne({ email });

  if (!tokenDoc || !tokenDoc.refreshToken) return null;

  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({
    access_token: tokenDoc.accessToken,
    refresh_token: tokenDoc.refreshToken,
    token_type: tokenDoc.tokenType,
    expiry_date: tokenDoc.expiryDate,
    scope: tokenDoc.scope,
  });

  // Auto-refresh when access token is expired / missing
  oauth2Client.on('tokens', async (newTokens) => {
    console.log('[YouTube] 🔄 Access token refreshed automatically');
    await saveTokens({
      ...newTokens,
      refresh_token: newTokens.refresh_token ?? tokenDoc.refreshToken,
    });
  });

  return oauth2Client;
};

// ── Shorts helpers ────────────────────────────────────────────────────────────

/**
 * Ensure the title/description qualifies the video as a YouTube Short.
 */
const optimizeForShorts = (title = '', description = '') => {
  const shortsTag = '#Shorts';
  const isInTitle = title.toLowerCase().includes('#shorts');
  const isInDesc = description.toLowerCase().includes('#shorts');

  const finalTitle = isInTitle || isInTitle ? title : `${title} ${shortsTag}`.trim();
  const finalDesc = isInDesc ? description : `${description}\n\n${shortsTag} #DreamClick`.trim();

  return { title: finalTitle, description: finalDesc };
};

// ── Main upload function ──────────────────────────────────────────────────────

/**
 * Upload a video file to YouTube as a Short.
 *
 * @param {string}  videoPath  – Absolute path to the local video file.
 *                               If videoPath starts with "http", it is assumed
 *                               to be a public URL (downloaded to a temp file first).
 * @param {object}  metadata
 *   @param {string}   metadata.title
 *   @param {string}   metadata.description
 *   @param {string[]} [metadata.tags]
 *   @param {string}   [metadata.privacyStatus] – 'public' | 'private' | 'unlisted'
 *   @param {string}   [metadata.categoryId]    – YouTube category (default: '22' = People & Blogs)
 * @returns {object} YouTube API response (snippet + status)
 */
const uploadToYouTube = async (videoPath, metadata = {}) => {
  const oauth2Client = await getAuthorizedClient();
  if (!oauth2Client) {
    throw new Error('YouTube is not connected. Please authorise via the Admin panel first.');
  }

  const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

  const {
    title: rawTitle = 'DreamClick Template',
    description: rawDesc = 'Check out this awesome template from DreamClick!',
    tags = ['DreamClick', 'Shorts', 'Template', 'CapCut', 'VideoEditing'],
    privacyStatus = process.env.YOUTUBE_DEFAULT_PRIVACY || 'public',
    categoryId = '22',
  } = metadata;

  const { title, description } = optimizeForShorts(rawTitle, rawDesc);

  // If videoPath is a URL, download it to a temp buffer first
  let fileStream;
  let tempFilePath = null;

  if (videoPath.startsWith('http://') || videoPath.startsWith('https://')) {
    const axios = require('axios');
    const os = require('os');
    const response = await axios.get(videoPath, { responseType: 'arraybuffer', timeout: 120_000 });
    const ext = path.extname(new URL(videoPath).pathname) || '.mp4';
    tempFilePath = path.join(os.tmpdir(), `yt_upload_${Date.now()}${ext}`);
    fs.writeFileSync(tempFilePath, response.data);
    fileStream = fs.createReadStream(tempFilePath);
  } else {
    fileStream = fs.createReadStream(videoPath);
  }

  try {
    const response = await youtube.videos.insert({
      part: ['snippet', 'status'],
      requestBody: {
        snippet: {
          title,
          description,
          tags,
          categoryId,
          defaultLanguage: 'en',
          defaultAudioLanguage: 'en',
        },
        status: {
          privacyStatus,
          selfDeclaredMadeForKids: false,
        },
      },
      media: {
        mimeType: 'video/mp4',
        body: fileStream,
      },
    });

    const videoId = response.data.id;
    console.log(`[YouTube] ✅ Uploaded successfully! ID: ${videoId}`);
    console.log(`[YouTube] 🔗 https://www.youtube.com/shorts/${videoId}`);

    return {
      videoId,
      videoUrl: `https://www.youtube.com/shorts/${videoId}`,
      title,
      description,
    };
  } finally {
    // Cleanup temp file if we created one
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
  }
};

// ── OAuth flow helpers ────────────────────────────────────────────────────────

/**
 * Generate the Google OAuth consent page URL for the admin to visit.
 */
const getAuthUrl = () => {
  const oauth2Client = getOAuth2Client();
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',      // force so we always get a refresh_token
    scope: [
      'https://www.googleapis.com/auth/youtube.upload',
      'https://www.googleapis.com/auth/youtube',
      'https://www.googleapis.com/auth/youtube.readonly',
    ],
  });
};

/**
 * Exchange the auth code (from OAuth callback) for tokens and save them.
 * @param {string} code
 */
const handleOAuthCallback = async (code) => {
  const oauth2Client = getOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);
  await saveTokens(tokens);
  console.log('[YouTube] ✅ OAuth tokens saved successfully');
  return tokens;
};

/**
 * Check whether valid (connected) tokens exist.
 * @returns {{ connected: boolean, email: string|null, expiryDate: number|null }}
 */
const getConnectionStatus = async () => {
  const email = process.env.YOUTUBE_ADMIN_EMAIL || 'dreamclick0823@gmail.com';
  const tokenDoc = await YoutubeToken.findOne({ email });
  return {
    connected: !!(tokenDoc && tokenDoc.refreshToken),
    email: tokenDoc ? tokenDoc.email : null,
    expiryDate: tokenDoc ? tokenDoc.expiryDate : null,
    updatedAt: tokenDoc ? tokenDoc.updatedAt : null,
  };
};

/**
 * Revoke and delete stored tokens (disconnect YouTube).
 */
const disconnectYouTube = async () => {
  const email = process.env.YOUTUBE_ADMIN_EMAIL || 'dreamclick0823@gmail.com';
  const tokenDoc = await YoutubeToken.findOne({ email });
  if (tokenDoc && tokenDoc.accessToken) {
    try {
      const oauth2Client = getOAuth2Client();
      await oauth2Client.revokeToken(tokenDoc.accessToken);
    } catch (e) {
      console.warn('[YouTube] Could not revoke token (may already be expired):', e.message);
    }
  }
  await YoutubeToken.deleteOne({ email });
  console.log('[YouTube] 🔌 Disconnected');
};

module.exports = {
  getAuthUrl,
  handleOAuthCallback,
  getConnectionStatus,
  disconnectYouTube,
  uploadToYouTube,
  saveTokens,
  getAuthorizedClient,
};
