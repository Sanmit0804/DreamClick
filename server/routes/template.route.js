const express = require('express');
const { templateController } = require('../controllers/index');
const { authenticate, optionalAuthenticate } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { templateValidator } = require('../validators');

const router = express.Router();

router.get(
  '/',
  optionalAuthenticate,
  validate({ query: templateValidator.listTemplatesQuery }),
  templateController.getTemplates
);
router.get(
  '/:id',
  validate({ params: templateValidator.templateParams }),
  templateController.getTemplateById
);

router.post(
  '/',
  authenticate,
  validate({ body: templateValidator.templateBody }),
  templateController.createTemplate
);
router.post(
  '/:id/purchase',
  authenticate,
  validate({ params: templateValidator.templateParams }),
  templateController.purchaseTemplate
);
router.patch(
  '/:id',
  authenticate,
  validate({
    params: templateValidator.templateParams,
    body: templateValidator.updateTemplateBody,
  }),
  templateController.updateTemplate
);
router.delete(
  '/:id',
  authenticate,
  validate({ params: templateValidator.templateParams }),
  templateController.deleteTemplate
);

module.exports = router;
