const { z } = require('zod');

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');

const nonEmptyString = (max = 1000) => z.string().trim().min(1).max(max);

const optionalUrl = z
  .string()
  .trim()
  .url()
  .or(z.literal(''))
  .optional()
  .nullable();

module.exports = {
  z,
  objectId,
  nonEmptyString,
  optionalUrl,
};
