const Template = require('../models/template.model');
const { AppError } = require('../utils/AppError');

class TemplateService {
    /**
     * Get all templates, optionally filtered by userId.
     * Populates uploader's name and avatar for display.
     */
    static async getTemplates({ userId } = {}) {
        const filter = userId ? { userId } : {};
        return await Template.find(filter)
            .populate('userId', 'name creatorProfile.avatar')
            .sort({ createdAt: -1 });
    }

    /**
     * Get a single template by its ID.
     */
    static async getTemplateById(templateId) {
        const template = await Template.findById(templateId).populate(
            'userId',
            'name creatorProfile.avatar'
        );
        if (!template) {
            throw AppError.notFound('Template not found');
        }
        return template;
    }

    /**
     * Create a new template. Requires the requesting user's ID.
     */
    static async createTemplate(data, requestingUserId) {
        const template = new Template({ ...data, userId: requestingUserId });
        return await template.save();
    }

    /**
     * Update a template. Only the owner or an admin can update.
     */
    static async updateTemplate(templateId, data, requestingUser) {
        const template = await Template.findById(templateId);
        if (!template) throw AppError.notFound('Template not found');

        const isOwner = template.userId.toString() === requestingUser.id;
        const isAdmin = requestingUser.role === 'admin';

        if (!isOwner && !isAdmin) {
            throw AppError.forbidden('You do not have permission to update this template');
        }

        Object.assign(template, data);
        return await template.save();
    }

    /**
     * Delete a template.
     * Only the uploader (owner) or an admin can delete.
     */
    static async deleteTemplate(templateId, requestingUser) {
        const template = await Template.findById(templateId);
        if (!template) throw AppError.notFound('Template not found');

        const isOwner = template.userId.toString() === requestingUser.id;
        const isAdmin = requestingUser.role === 'admin';

        if (!isOwner && !isAdmin) {
            throw AppError.forbidden('You do not have permission to delete this template');
        }

        await template.deleteOne();
        return { message: 'Template deleted successfully' };
    }

    static async purchaseTemplate(templateId, requestingUser) {
        const User = require('../models/user.model');
        const user = await User.findById(requestingUser.id);
        if (!user) throw AppError.notFound('User not found');

        const template = await Template.findById(templateId);
        if (!template) throw AppError.notFound('Template not found');

        // Check if already purchased
        const alreadyPurchased = user.purchases.find(p => p.templateId.toString() === templateId);
        if (alreadyPurchased) throw AppError.badRequest('You have already purchased this template');

        user.purchases.push({
            templateId,
            amount: template.templatePrice || 0,
            paymentStatus: 'captured', // Mock payment
            downloadToken: 'mock-token-' + Date.now()
        });

        // Remove from cart if it was there
        user.cart = user.cart.filter(id => id.toString() !== templateId);

        await user.save({ validateBeforeSave: false });

        // Mock sending email
        console.log(`[Email] Sending download link for template ${template.templateName} to ${user.email}`);

        return { message: 'Purchase successful', downloadToken: user.purchases[user.purchases.length - 1].downloadToken };
    }
}

module.exports = TemplateService;