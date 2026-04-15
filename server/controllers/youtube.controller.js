const catchAsync = require('../utils/catchAsync');
const { AppError } = require('../utils/AppError');
const {
  getAuthUrl,
  handleOAuthCallback,
  getConnectionStatus,
  disconnectYouTube,
} = require('../services/youtube.service');
const { enqueueYoutubeUpload, getQueueStats } = require('../services/youtubeQueue.service');
const Template = require('../models/template.model');
const { youtubeRepository } = require('../repositories');

class YoutubeController {
  static getAuthUrl = catchAsync(async (_req, res) => {
    const url = getAuthUrl();
    res.status(200).json({ success: true, url });
  });

  static oauthCallback = catchAsync(async (req, res) => {
    const { code, error } = req.query;

    if (error) {
      const adminUrl = `${process.env.FRONTEND_URL?.split(',')[0] || 'http://localhost:3000'}/admin/youtube?error=${encodeURIComponent(error)}`;
      return res.redirect(adminUrl);
    }

    if (!code) throw AppError.badRequest('Missing OAuth code');

    await handleOAuthCallback(code);

    const adminUrl = `${process.env.FRONTEND_URL?.split(',')[0] || 'http://localhost:3000'}/admin/youtube?connected=true`;
    return res.redirect(adminUrl);
  });

  static getStatus = catchAsync(async (_req, res) => {
    const status = await getConnectionStatus();
    const queueStats = getQueueStats();
    res.status(200).json({ success: true, data: { ...status, queue: queueStats } });
  });

  static disconnect = catchAsync(async (_req, res) => {
    await disconnectYouTube();
    res.status(200).json({ success: true, message: 'YouTube account disconnected.' });
  });

  static triggerUpload = catchAsync(async (req, res) => {
    const { templateId, triggeredBy = 'manual' } = req.body;

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

  static getLogs = catchAsync(async (req, res) => {
    const page = req.query.page || 1;
    const limit = req.query.limit || 20;
    const skip = (page - 1) * limit;
    const filter = req.query.status ? { status: req.query.status } : {};

    const [logs, total] = await Promise.all([
      youtubeRepository.findUploadLogs({ filter, skip, limit }),
      youtubeRepository.countUploadLogs(filter),
    ]);

    res.status(200).json({
      success: true,
      data: logs,
      meta: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  });

  static getQueue = catchAsync(async (_req, res) => {
    res.status(200).json({ success: true, data: getQueueStats() });
  });
}

module.exports = YoutubeController;
