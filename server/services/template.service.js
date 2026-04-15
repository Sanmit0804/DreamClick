const User = require('../models/user.model');
const { AppError } = require('../utils/AppError');
const logger = require('../config/logger');
const { templateRepository } = require('../repositories');
const { enqueueYoutubeUpload } = require('./youtubeQueue.service');

class TemplateService {
  static async getTemplates({ userId } = {}) {
    const filter = userId ? { userId } : {};
    return templateRepository.findAll(filter);
  }

  static async getTemplateById(templateId) {
    const template = await templateRepository.findById(templateId);
    if (!template) throw AppError.notFound('Template not found');
    return template;
  }

  static async createTemplate(data, requestingUserId) {
    const template = await templateRepository.create({ ...data, userId: requestingUserId });

    if (template.videoUrl) {
      try {
        await enqueueYoutubeUpload({
          videoUrl: template.videoUrl,
          templateId: template._id.toString(),
          templateName: template.templateName,
          triggeredBy: 'auto',
          metadata: {
            title: template.templateName,
            description: template.templateDescription,
            tags: [
              ...(template.templateTags || []),
              'DreamClick',
              'CapCut',
              'VideoTemplate',
              'Shorts',
            ],
          },
        });
        logger.info({ templateId: template._id }, 'YouTube upload queued for template');
      } catch (err) {
        logger.warn({ err, templateId: template._id }, 'Could not queue YouTube upload');
      }
    }

    return template;
  }

  static async updateTemplate(templateId, data, requestingUser) {
    const template = await templateRepository.findDocumentById(templateId);
    if (!template) throw AppError.notFound('Template not found');

    const isOwner = template.userId.toString() === requestingUser.id;
    const isAdmin = requestingUser.role === 'admin';

    if (!isOwner && !isAdmin) {
      throw AppError.forbidden('You do not have permission to update this template');
    }

    Object.assign(template, data);
    return template.save();
  }

  static async deleteTemplate(templateId, requestingUser) {
    const template = await templateRepository.findDocumentById(templateId);
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
    const user = await User.findById(requestingUser.id);
    if (!user) throw AppError.notFound('User not found');

    const template = await templateRepository.findDocumentById(templateId);
    if (!template) throw AppError.notFound('Template not found');

    const alreadyPurchased = user.purchases.find((p) => p.templateId.toString() === templateId);
    if (alreadyPurchased) throw AppError.badRequest('You have already purchased this template');

    user.purchases.push({
      templateId,
      amount: template.templatePrice || 0,
      paymentStatus: 'captured',
      downloadToken: `mock-token-${Date.now()}`,
    });

    user.cart = user.cart.filter((id) => id.toString() !== templateId);
    await user.save({ validateBeforeSave: false });

    logger.info({ templateId, userId: user._id }, 'Template purchased');

    return {
      message: 'Purchase successful',
      downloadToken: user.purchases[user.purchases.length - 1].downloadToken,
    };
  }
}

module.exports = TemplateService;
