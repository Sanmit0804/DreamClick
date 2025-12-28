const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
    templateName: {
        type: String,
        required: true,
        trim: true,
    },
    templateDescription: {
        type: String,
        required: true,
        trim: true,
    },
    templateContent: {
        type: String,
        required: true,
        trim: true,
    },
    templatePrice: {
        type: Number,
        required: true,
    },
    templateThumbnail: {
        type: String,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    templateCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TemplateCategory',
        required: true,
    },
    templateTags: {
        type: [String],
    },
}, { timestamps: true });

const TemplateModel = mongoose.model("Template", templateSchema);
module.exports = TemplateModel;