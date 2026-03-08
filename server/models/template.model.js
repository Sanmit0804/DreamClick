const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema(
    {
        templateName: {
            type: String,
            required: [true, 'Template name is required'],
            trim: true,
            maxlength: [120, 'Template name must be under 120 characters'],
        },
        templateDescription: {
            type: String,
            required: [true, 'Description is required'],
            trim: true,
            maxlength: [1000, 'Description must be under 1000 characters'],
        },
        videoUrl: {
            type: String,
            required: [true, 'Preview video URL is required'],
            trim: true,
        },
        templateFileUrl: {
            type: String, // URL to downloadable VN template file (stored in MinIO)
            trim: true,
            default: null,
        },
        templatePrice: {
            type: Number,
            required: [true, 'Price is required'],
            min: [0, 'Price cannot be negative'],
        },
        templateOldPrice: {
            type: Number,
            default: null,
        },
        templateThumbnail: {
            type: String,
            default: null,
        },
        templateCategory: {
            type: String,
            trim: true,
            default: 'General',
        },
        templateTags: {
            type: [String],
            default: [],
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Uploader user ID is required'],
            index: true,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Index for common queries
templateSchema.index({ templateCategory: 1 });
templateSchema.index({ createdAt: -1 });

const TemplateModel = mongoose.model('Template', templateSchema);
module.exports = TemplateModel;