const Template = require('../models/template.model');

class TemplateService {
    static getTemplates = async () => {
        return await Template.find();
    }

    static getTemplateById = async (templateId) => {
        return await Template.findById(templateId);
    }

    static createTemplate = async (data) => {
        const newTemplate = new Template(data);
        return await newTemplate.save();
    }

    static updateTemplate = async (templateId, data) => {
        return await Template.findByIdAndUpdate(templateId, data, { new: true, runValidators: true });
    }

    static deleteTemplateById = async (templateId) => {
        return await Template.findByIdAndDelete(templateId);
    }
}

module.exports = TemplateService