const mongoose = require('mongoose');

/**
 * Stores the YouTube OAuth2 tokens for the admin account.
 * Only ONE document ever exists (keyed by the email/channel).
 */
const youtubeTokenSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    accessToken: { type: String, default: null },
    refreshToken: { type: String, required: true },
    tokenType: { type: String, default: 'Bearer' },
    expiryDate: { type: Number, default: null }, // epoch ms
    scope: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('YoutubeToken', youtubeTokenSchema);
