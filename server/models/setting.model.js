const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema(
  {
    appName: {
      type: String,
      default: 'DreamClick',
      required: true,
    },
    contactEmail: {
      type: String,
      default: 'support@dreamclick.com',
    },
    supportPhone: {
      type: String,
      default: '',
    },
    socialLinks: {
      facebook: { type: String, default: '' },
      twitter: { type: String, default: '' },
      instagram: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      youtube: { type: String, default: '' },
    },
    seo: {
      title: { type: String, default: 'DreamClick - Create amazing content' },
      description: { type: String, default: 'The best platform for creators.' },
      keywords: { type: String, default: 'creator, platform, dreamclick' },
      faviconUrl: { type: String, default: '' },
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    features: {
      enableRegistrations: { type: Boolean, default: true },
      enableYoutubeUploads: { type: Boolean, default: true },
    },
    branding: {
      logoUrl: { type: String, default: '' },
      themeColor: { type: String, default: '#000000' },
    },
    layout: {
      showFooter: { type: Boolean, default: true },
      showHeader: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

// Ensure there is only one settings document
settingSchema.pre('save', async function (next) {
  if (this.isNew) {
    const count = await this.constructor.countDocuments();
    if (count > 0) {
      return next(new Error('Only one settings document can be created.'));
    }
  }
  next();
});

const Setting = mongoose.model('Setting', settingSchema);

module.exports = Setting;
