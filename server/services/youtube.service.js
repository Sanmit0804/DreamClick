const { google } = require('googleapis');
const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const os = require('os');
const axios = require('axios');
const { youtubeRepository } = require('../repositories');

const getAdminEmail = () => process.env.YOUTUBE_ADMIN_EMAIL || 'dreamclick0823@gmail.com';

const getOAuth2Client = () =>
  new google.auth.OAuth2(
    process.env.YOUTUBE_CLIENT_ID,
    process.env.YOUTUBE_CLIENT_SECRET,
    process.env.YOUTUBE_REDIRECT_URI
  );

const saveTokens = async (tokens) => {
  await youtubeRepository.upsertToken(getAdminEmail(), {
    accessToken: tokens.access_token ?? undefined,
    refreshToken: tokens.refresh_token ?? undefined,
    tokenType: tokens.token_type ?? 'Bearer',
    expiryDate: tokens.expiry_date ?? null,
    scope: tokens.scope ?? null,
  });
};

const getAuthorizedClient = async () => {
  const tokenDoc = await youtubeRepository.findTokenByEmail(getAdminEmail());
  if (!tokenDoc || !tokenDoc.refreshToken) return null;

  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({
    access_token: tokenDoc.accessToken,
    refresh_token: tokenDoc.refreshToken,
    token_type: tokenDoc.tokenType,
    expiry_date: tokenDoc.expiryDate,
    scope: tokenDoc.scope,
  });

  oauth2Client.on('tokens', async (newTokens) => {
    console.log('YouTube access token refreshed');
    await saveTokens({
      ...newTokens,
      refresh_token: newTokens.refresh_token ?? tokenDoc.refreshToken,
    });
  });

  return oauth2Client;
};

const optimizeForShorts = (title = '', description = '') => {
  const shortsTag = '#Shorts';
  const isInTitle = title.toLowerCase().includes('#shorts');
  const isInDesc = description.toLowerCase().includes('#shorts');

  const finalTitle = isInTitle ? title : `${title} ${shortsTag}`.trim();
  const finalDesc = isInDesc ? description : `${description}\n\n${shortsTag} #DreamClick`.trim();

  return { title: finalTitle, description: finalDesc };
};

const createVideoStream = async (videoPath) => {
  if (!videoPath.startsWith('http://') && !videoPath.startsWith('https://')) {
    return { fileStream: fs.createReadStream(videoPath), tempFilePath: null };
  }

  const response = await axios.get(videoPath, {
    responseType: 'arraybuffer',
    timeout: 120_000,
    maxContentLength: 250 * 1024 * 1024,
  });
  const ext = path.extname(new URL(videoPath).pathname) || '.mp4';
  const tempFilePath = path.join(os.tmpdir(), `yt_upload_${Date.now()}${ext}`);
  await fsp.writeFile(tempFilePath, response.data);
  return { fileStream: fs.createReadStream(tempFilePath), tempFilePath };
};

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
  const { fileStream, tempFilePath } = await createVideoStream(videoPath);

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
    console.log({ videoId }, 'YouTube upload succeeded');

    return {
      videoId,
      videoUrl: `https://www.youtube.com/shorts/${videoId}`,
      title,
      description,
    };
  } finally {
    if (tempFilePath) await fsp.rm(tempFilePath, { force: true });
  }
};

const getAuthUrl = () => {
  const oauth2Client = getOAuth2Client();
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/youtube.upload',
      'https://www.googleapis.com/auth/youtube',
      'https://www.googleapis.com/auth/youtube.readonly',
    ],
  });
};

const handleOAuthCallback = async (code) => {
  const oauth2Client = getOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);
  await saveTokens(tokens);
  console.log('YouTube OAuth tokens saved successfully');
  return tokens;
};

const getConnectionStatus = async () => {
  const tokenDoc = await youtubeRepository.findTokenByEmail(getAdminEmail());
  return {
    connected: !!(tokenDoc && tokenDoc.refreshToken),
    email: tokenDoc ? tokenDoc.email : null,
    expiryDate: tokenDoc ? tokenDoc.expiryDate : null,
    updatedAt: tokenDoc ? tokenDoc.updatedAt : null,
  };
};

const disconnectYouTube = async () => {
  const email = getAdminEmail();
  const tokenDoc = await youtubeRepository.findTokenByEmail(email);
  if (tokenDoc && tokenDoc.accessToken) {
    try {
      const oauth2Client = getOAuth2Client();
      await oauth2Client.revokeToken(tokenDoc.accessToken);
    } catch (err) {
      console.warn({ err }, 'Could not revoke YouTube token');
    }
  }
  await youtubeRepository.deleteTokenByEmail(email);
  console.log('YouTube disconnected');
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
