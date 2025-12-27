const mongoose = require('mongoose');

const templateCategorySchema = mongoose.Schema({
    templateCategoryName: {
        type: String,
        required: true,
        trim: true,
    },
    templateCategoryDescription: {
        type: String,
        required: true,
        trim: true,
    },
})

const TemplateCategoryModel = mongoose.model("TemplateCategory", templateCategorySchema);

module.exports = TemplateCategoryModel;