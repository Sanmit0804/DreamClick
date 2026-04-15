/**
 * youtube.controller.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Handles all admin-facing YouTube API endpoints:
 *
 *   GET  /youtube/auth/url         → generate OAuth consent URL
 *   GET  /youtube/oauth/callback   → exchange code for tokens (Google redirects here)
 *   GET  /youtube/status           → check connection status
 *   POST /youtube/disconnect       → revoke tokens
 *   POST /youtube/upload           → manual trigger upload for a template
 *   GET  /youtube/logs             → list upload audit logs
 *   GET  /youtube/queue            → queue stats
 * ─────────────────────────────────────────────────────────────────────────────
 */

const catchAsync = require('../utils/catchAsync');
const { AppError } = require('../utils/AppError');
const {
  getAuthUrl,
  handleOAuthCallback,
  getConnectionStatus,
  disconnectYouTube,
} = require('../services/youtube.service');
const { enqueueYoutubeUpload, getQueueStats } = require('../services/youtubeQueue.service');
const YoutubeUploadLog = require('../models/youtubeUploadLog.model');
const Template = require('../models/template.model');

class YoutubeController {
  /**
   * GET /youtube/auth/url
   * Returns the Google OAuth consent URL.
   */
  static getAuthUrl = catchAsync(async (_req, res) => {
    const url = getAuthUrl();
    res.status(200).json({ success: true, url });
  });

  /**
   * GET /youtube/oauth/callback?code=...
   * Google redirects here after user grants permission.
   * Saves tokens and redirects admin back to the panel.
   */
  static oauthCallback = catchAsync(async (req, res) => {
    const { code, error } = req.query;

    if (error) {
      const adminUrl = `${process.env.FRONTEND_URL?.split(',')[0] || 'http://localhost:3000'}/admin/youtube?error=${encodeURIComponent(error)}`;
      return res.redirect(adminUrl);
    }

    if (!code) throw AppError.badRequest('Missing OAuth code');

    await handleOAuthCallback(code);

    const adminUrl = `${process.env.FRONTEND_URL?.split(',')[0] || 'http://localhost:3000'}/admin/youtube?connected=true`;
    res.redirect(adminUrl);
  });

  /**
   * GET /youtube/status
   */
  static getStatus = catchAsync(async (_req, res) => {
    const status = await getConnectionStatus();
    const queueStats = getQueueStats();
    res.status(200).json({ success: true, data: { ...status, queue: queueStats } });
  });

  /**
   * POST /youtube/disconnect
   */
  static disconnect = catchAsync(async (_req, res) => {
    await disconnectYouTube();
    res.status(200).json({ success: true, message: 'YouTube account disconnected.' });
  });

  /**
   * POST /youtube/upload
   * Body: { templateId, triggeredBy? }
   * Manually trigger an upload for any existing template by its ID.
   */
  static triggerUpload = catchAsync(async (req, res) => {
    const { templateId, triggeredBy = 'manual' } = req.body;
    if (!templateId) throw AppError.badRequest('templateId is required');

    const template = await Template.findById(templateId).lean();
    if (!template) throw AppError.notFound('Template not found');

    if (!template.videoUrl) {
      throw AppError.badRequest('Template has no video URL to upload');
    }

    const logId = await enqueueYoutubeUpload({
      videoUrl: template.videoUrl,
      templateId: template._id.toString(),
      templateName: template.templateName,
      triggeredBy,
      metadata: {
        title: template.templateName,
        description: template.templateDescription,
        tags: [
          ...(template.templateTags || []),
          'DreamClick',
          'CapCut',
          'VideoTemplate',
          'Shorts',
        ],
      },
    });

    res.status(202).json({
      success: true,
      message: 'Upload queued. Check /youtube/logs for status.',
      logId,
    });
  });

  /**
   * GET /youtube/logs?page=1&limit=20&status=  
   */
  static getLogs = catchAsync(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;
    const filter = req.query.status ? { status: req.query.status } : {};

    const [logs, total] = await Promise.all([
      YoutubeUploadLog.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      YoutubeUploadLog.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: logs,
      meta: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  });

  /**
   * GET /youtube/queue
   */
  static getQueue = catchAsync(async (_req, res) => {
    res.status(200).json({ success: true, data: getQueueStats() });
  });
}

module.exports = YoutubeController;
