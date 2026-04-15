const mongoose = require('mongoose');

/**
 * Audit log for every YouTube upload attempt.
 * Admins can view this from the admin panel.
 */
const youtubeUploadLogSchema = new mongoose.Schema(
  {
    templateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Template',
      required: true,
    },
    templateName: { type: String, default: '' },
    youtubeVideoId: { type: String, default: null },   // set on success
    youtubeVideoUrl: { type: String, default: null },  // https://youtube.com/shorts/<id>
    status: {
      type: String,
      enum: ['pending', 'processing', 'success', 'failed'],
      default: 'pending',
    },
    retries: { type: Number, default: 0 },
    errorMessage: { type: String, default: null },
    triggeredBy: { type: String, default: 'auto' }, // 'auto' | 'manual'
  },
  { timestamps: true }
);

youtubeUploadLogSchema.index({ status: 1, createdAt: -1 });
youtubeUploadLogSchema.index({ templateId: 1, createdAt: -1 });

module.exports = mongoose.model('YoutubeUploadLog', youtubeUploadLogSchema);
