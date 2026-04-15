const { z } = require('./common.validator');

const fileParams = z.object({
  fileName: z.string().trim().min(1).max(255),
});

module.exports = { fileParams };
