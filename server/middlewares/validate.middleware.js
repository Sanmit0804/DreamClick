const { AppError } = require('../utils/AppError');

const formatIssues = (issues = []) =>
  issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
  }));

const validate = (schemas = {}) => (req, _res, next) => {
  const targets = ['body', 'params', 'query'];

  for (const target of targets) {
    const schema = schemas[target];
    if (!schema) continue;

    const result = schema.safeParse(req[target]);
    if (!result.success) {
      const details = formatIssues(result.error.issues);
      return next(
        AppError.badRequest(
          details[0]?.message || 'Validation failed',
          'VALIDATION_ERROR',
          details
        )
      );
    }

    req[target] = result.data;
  }

  return next();
};

module.exports = validate;
