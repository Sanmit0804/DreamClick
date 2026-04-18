const { z, objectId } = require('./common.validator');

const templateBody = z.object({
  templateName: z.string().trim().min(1).max(120),
  templateDescription: z.string().trim().min(1).max(1000),
  videoUrl: z.string().trim().min(1).max(2048),
  templateFileUrl: z.string().trim().max(2048).optional().nullable(),
  youtubeVideoId: z.string().trim().max(200).optional().nullable(),
  youtubeVideoUrl: z.string().trim().max(2048).optional().nullable(),
  templatePrice: z.coerce.number().min(0),
  templateOldPrice: z.coerce.number().min(0).optional().nullable(),
  templateThumbnail: z.string().trim().max(2048).optional().nullable(),
  templateCategory: z.string().trim().max(100).default('General'),
  templateTags: z.array(z.string().trim().max(50)).default([]),
});

const updateTemplateBody = templateBody.partial().refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field is required',
});

const templateParams = z.object({
  id: objectId,
});

const listTemplatesQuery = z.object({
  mine: z.enum(['true', 'false']).optional(),
});

module.exports = {
  templateBody,
  updateTemplateBody,
  templateParams,
  listTemplatesQuery,
};
