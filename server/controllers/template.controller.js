const catchAsync = require("../utils/catchAsync");

class TemplateController {
    static getTemplates = catchAsync(async (req, res) => {
        const result = await TemplateService.getTemplates();
        res.status(200).json(result);
    })

    static createTemplate = catchAsync(async (req, res) => {
        const result = await TemplateService.createTemplate(req.body);
        res.status(201).json(result);
    })

    static getTemplateById = catchAsync(async (req, res) => {
        const result = await TemplateService.getTemplateById(req.params.id);
        res.status(200).json(result);
    })

    static updateTemplate = catchAsync(async (req, res) => {
        const result = await TemplateService.updateTemplate(req.params.id, req.body);
        res.status(200).json(result);
    })

    static deleteTemplateById = catchAsync(async (req, res) => {
        const result = await TemplateService.deleteTemplateById(req.params.id);
        res.status(200).json(result);
    })
}

module.exports = TemplateController