const express = require('express');
const { templateController } = require('../controllers/index');

const router = express.Router();

router
    .route('/')
    .get(templateController.getTemplates)
    .post(templateController.createTemplate);

router
    .route('/:id')
    .get(templateController.getTemplateById)
    .patch(templateController.updateTemplate)
    .delete(templateController.deleteTemplateById);

module.exports = router;