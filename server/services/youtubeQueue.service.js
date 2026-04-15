/**
 * youtubeQueue.service.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Background upload queue with:
 *  • Concurrency = 1  (uploads are sequential, prevents API quota bursts)
 *  • Automatic retry (up to MAX_RETRIES times) with exponential back-off
 *  • Persistent logging to YoutubeUploadLog collection
 * ─────────────────────────────────────────────────────────────────────────────
 */

const PQueueImport = require('p-queue');
const PQueue = PQueueImport.default || PQueueImport;
const YoutubeUploadLog = require('../models/youtubeUploadLog.model');
const Template = require('../models/template.model');
const { uploadToYouTube } = require('./youtube.service');

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 5_000; // 5 s initial back-off

// Single-concurrency queue so we never run two uploads simultaneously
const queue = new PQueue({ concurrency: 1 });

/**
 * Sleep helper.
 * @param {number} ms
 */
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

/**
 * Schedule a YouTube upload in the background queue.
 *
 * @param {object}  options
 * @param {string}  options.videoUrl      – MinIO / CDN URL of the video
 * @param {object}  options.metadata      – title, description, tags, etc.
 * @param {string}  options.templateId    – MongoDB ObjectId of the template
 * @param {string}  [options.templateName]
 * @param {string}  [options.triggeredBy] – 'auto' | 'manual'
 * @returns {Promise<string>}  The log document _id (so callers can poll status)
 */
const enqueueYoutubeUpload = async ({
  videoUrl,
  metadata,
  templateId,
  templateName = '',
  triggeredBy = 'auto',
}) => {
  // Create an audit log entry immediately (pending)
  const log = await YoutubeUploadLog.create({
    templateId,
    templateName,
    status: 'pending',
    triggeredBy,
  });

  console.log(`[YT Queue] 📥 Enqueued upload for template "${templateName}" (log: ${log._id})`);

  // Push the actual work into the queue (non-blocking)
  queue.add(async () => {
    await log.updateOne({ status: 'processing' });
    console.log(`[YT Queue] ⚙️  Processing upload for "${templateName}"`);

    let lastError = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const result = await uploadToYouTube(videoUrl, metadata);

        await log.updateOne({
          status: 'success',
          youtubeVideoId: result.videoId,
          youtubeVideoUrl: result.videoUrl,
          retries: attempt - 1,
          errorMessage: null,
        });

        // Also update the Template document itself!
        await Template.findByIdAndUpdate(templateId, {
          youtubeVideoId: result.videoId,
          youtubeVideoUrl: result.videoUrl,
        });

        console.log(
          `[YT Queue] ✅ Upload success on attempt ${attempt} — ${result.videoUrl}`
        );
        return; // done
      } catch (err) {
        lastError = err;
        console.error(
          `[YT Queue] ❌ Attempt ${attempt}/${MAX_RETRIES} failed: ${err.message}`
        );

        // Handle YouTube quota exceeded (HTTP 403 / quotaExceeded)
        const isQuota =
          err.message?.includes('quotaExceeded') ||
          err.response?.data?.error?.errors?.some(
            (e) => e.reason === 'quotaExceeded'
          );
        if (isQuota) {
          console.warn('[YT Queue] ⚠️  Quota exceeded — stopping retries.');
          break;
        }

        if (attempt < MAX_RETRIES) {
          const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1); // 5s, 10s, 20s
          console.log(`[YT Queue] ⏳ Retrying in ${delay / 1000}s…`);
          await sleep(delay);
        }
      }
    }

    // All retries exhausted
    await log.updateOne({
      status: 'failed',
      retries: MAX_RETRIES,
      errorMessage: lastError?.message || 'Unknown error',
    });
    console.error(`[YT Queue] 💀 Upload permanently failed for "${templateName}"`);
  });

  return log._id.toString();
};

/**
 * Get queue stats (for admin dashboard).
 */
const getQueueStats = () => ({
  size: queue.size,
  pending: queue.pending,
  isPaused: queue.isPaused,
});

module.exports = { enqueueYoutubeUpload, getQueueStats };
