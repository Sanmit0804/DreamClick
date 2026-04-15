const { z, objectId } = require('./common.validator');

const oauthCallbackQuery = z.object({
  code: z.string().optional(),
  error: z.string().optional(),
});

const uploadBody = z.object({
  templateId: objectId,
  triggeredBy: z.string().trim().max(50).default('manual'),
});

const logsQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(['pending', 'processing', 'success', 'failed']).optional(),
});

module.exports = {
  oauthCallbackQuery,
  uploadBody,
  logsQuery,
};
