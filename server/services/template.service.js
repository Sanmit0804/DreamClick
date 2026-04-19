const fs = require('fs').promises;
const path = require('path');
const User = require('../models/user.model');
const { AppError } = require('../utils/AppError');
const { templateRepository } = require('../repositories');
const { enqueueYoutubeUpload } = require('./youtubeQueue.service');

const cleanupLocalFile = async (fileUrl) => {
  try {
    if (!fileUrl || !fileUrl.includes('/uploads/')) return;
    const url = new URL(fileUrl);
    const fileName = path.basename(url.pathname);
    const filePath = path.join(__dirname, '..', 'uploads', fileName);
    await fs.unlink(filePath);
    console.log(`Cleaned up local file: ${fileName}`);
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.warn(`Could not cleanup local file: ${fileUrl}`, err.message);
    }
  }
};

const triggerYoutubeUpload = async (template) => {
  if (!template.videoUrl || template.videoUrl.includes('youtube.com')) return;

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
    console.log({ templateId: template._id }, 'YouTube upload queued');
  } catch (err) {
    console.warn({ err, templateId: template._id }, 'Could not queue YouTube upload');
  }
};

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

    await triggerYoutubeUpload(template);

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

    const oldVideoUrl = template.videoUrl;
    const oldFileUrl = template.templateFileUrl;

    Object.assign(template, data);
    const updatedTemplate = await template.save();

    // If video changed, trigger new YouTube upload
    if (data.videoUrl && data.videoUrl !== oldVideoUrl) {
      await triggerYoutubeUpload(updatedTemplate);
      // Clean up the old local video if it was local
      if (oldVideoUrl && oldVideoUrl !== data.videoUrl) {
        await cleanupLocalFile(oldVideoUrl);
      }
    }

    // If template file changed, clean up the old one
    if (data.templateFileUrl && data.templateFileUrl !== oldFileUrl) {
      await cleanupLocalFile(oldFileUrl);
    }

    return updatedTemplate;
  }

  static async deleteTemplate(templateId, requestingUser) {
    const template = await templateRepository.findDocumentById(templateId);
    if (!template) throw AppError.notFound('Template not found');

    const isOwner = template.userId.toString() === requestingUser.id;
    const isAdmin = requestingUser.role === 'admin';

    if (!isOwner && !isAdmin) {
      throw AppError.forbidden('You do not have permission to delete this template');
    }

    const videoUrl = template.videoUrl;
    const fileUrl = template.templateFileUrl;

    await template.deleteOne();

    // Cleanup local files
    await cleanupLocalFile(videoUrl);
    await cleanupLocalFile(fileUrl);

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

    console.log({ templateId, userId: user._id }, 'Template purchased');

    return {
      message: 'Purchase successful',
      downloadToken: user.purchases[user.purchases.length - 1].downloadToken,
    };
  }
}

module.exports = TemplateService;
