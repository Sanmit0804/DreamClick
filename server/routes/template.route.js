const express = require('express');
const { templateController } = require('../controllers/index');
const { authenticate } = require('../middlewares/auth.middleware');

const router = express.Router();

// ── Public: anyone can browse templates ─────────────────────────────────────
// Authenticated users can also pass ?mine=true to filter their own uploads.
// We use authenticate as optional: attach user if token present, else continue.
const optionalAuth = (req, res, next) => {
    const auth = req.headers['authorization'];
    if (!auth) return next();
    authenticate(req, res, next);
};

router.get('/', optionalAuth, templateController.getTemplates);
router.get('/:id', templateController.getTemplateById);

// ── Protected: must be logged in ────────────────────────────────────────────
router.post('/', authenticate, templateController.createTemplate);
router.patch('/:id', authenticate, templateController.updateTemplate);
router.delete('/:id', authenticate, templateController.deleteTemplate);

module.exports = router;