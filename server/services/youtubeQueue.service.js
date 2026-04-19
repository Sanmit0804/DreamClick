const fs = require('fs').promises;
const path = require('path');
const PQueueImport = require('p-queue');
const PQueue = PQueueImport.default || PQueueImport;
const { youtubeRepository } = require('../repositories');
const Template = require('../models/template.model');
const { uploadToYouTube } = require('./youtube.service');

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 5_000;

const queue = new PQueue({ concurrency: 1 });
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

const isQuotaExceeded = (err) =>
  err.message?.includes('quotaExceeded') ||
  err.response?.data?.error?.errors?.some((e) => e.reason === 'quotaExceeded');

const enqueueYoutubeUpload = async ({
  videoUrl,
  metadata,
  templateId,
  templateName = '',
  triggeredBy = 'auto',
}) => {
  const log = await youtubeRepository.createUploadLog({
    templateId,
    templateName,
    status: 'pending',
    triggeredBy,
  });

  console.log({ templateId, logId: log._id }, 'YouTube upload enqueued');

  queue.add(async () => {
    await log.updateOne({ status: 'processing' });
    let lastError = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
      try {
        const result = await uploadToYouTube(videoUrl, metadata);

        await log.updateOne({
          status: 'success',
          youtubeVideoId: result.videoId,
          youtubeVideoUrl: result.videoUrl,
          retries: attempt - 1,
          errorMessage: null,
        });

        await Template.findByIdAndUpdate(templateId, {
          youtubeVideoId: result.videoId,
          youtubeVideoUrl: result.videoUrl,
          videoUrl: result.videoUrl, // Use YouTube link as primary video preview to save server space
        });

        // Cleanup local file if it exists in uploads
        try {
          if (videoUrl && videoUrl.includes('/uploads/')) {
            const url = new URL(videoUrl);
            const fileName = path.basename(url.pathname);
            const filePath = path.join(__dirname, '..', 'uploads', fileName);
            await fs.unlink(filePath);
            console.log({ templateId, fileName }, 'Local video deleted after successful YouTube upload');
          }
        } catch (cleanupErr) {
          if (cleanupErr.code !== 'ENOENT') {
            console.warn({ cleanupErr, templateId, videoUrl }, 'Could not delete local video file');
          }
        }

        console.log({ templateId, attempt, videoUrl: result.videoUrl }, 'YouTube upload completed');
        return;
      } catch (err) {
        lastError = err;
        console.error({ err, templateId, attempt }, 'YouTube upload attempt failed');

        if (isQuotaExceeded(err)) {
          console.warn({ templateId }, 'YouTube quota exceeded; stopping retries');
          break;
        }

        if (attempt < MAX_RETRIES) {
          const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1);
          await sleep(delay);
        }
      }
    }

    await log.updateOne({
      status: 'failed',
      retries: MAX_RETRIES,
      errorMessage: lastError?.message || 'Unknown error',
    });
    console.error({ templateId }, 'YouTube upload permanently failed');
  });

  return log._id.toString();
};

const getQueueStats = () => ({
  size: queue.size,
  pending: queue.pending,
  isPaused: queue.isPaused,
});

module.exports = { enqueueYoutubeUpload, getQueueStats };
