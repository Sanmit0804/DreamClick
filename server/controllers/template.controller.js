const TemplateService = require('../services/template.service');
const catchAsync = require('../utils/catchAsync');
const { AppError } = require('../utils/AppError');

class TemplateController {
    /**
     * GET /api/templates
     * Optional query: ?mine=true for logged-in user's own templates
     */
    static getTemplates = catchAsync(async (req, res) => {
        const filterUserId = req.query.mine === 'true' && req.user ? req.user.id : undefined;
        const templates = await TemplateService.getTemplates({ userId: filterUserId });
        res.status(200).json({ success: true, data: templates });
    });

    /**
     * GET /api/templates/:id
     */
    static getTemplateById = catchAsync(async (req, res) => {
        const template = await TemplateService.getTemplateById(req.params.id);
        res.status(200).json({ success: true, data: template });
    });

    /**
     * POST /api/templates  (Auth required)
     */
    static createTemplate = catchAsync(async (req, res) => {
        if (!req.user) throw AppError.unauthorized('You must be logged in to upload a template');
        const template = await TemplateService.createTemplate(req.body, req.user.id);
        res.status(201).json({ success: true, data: template });
    });

    /**
     * PATCH /api/templates/:id  (Auth required, owner or admin)
     */
    static updateTemplate = catchAsync(async (req, res) => {
        const template = await TemplateService.updateTemplate(req.params.id, req.body, req.user);
        res.status(200).json({ success: true, data: template });
    });

    /**
     * DELETE /api/templates/:id  (Auth required, owner or admin)
     */
    static deleteTemplate = catchAsync(async (req, res) => {
        const result = await TemplateService.deleteTemplate(req.params.id, req.user);
        res.status(200).json({ success: true, ...result });
    });
}

module.exports = TemplateController;