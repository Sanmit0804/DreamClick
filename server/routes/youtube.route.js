const express = require('express');
const { authenticate, requireAdmin } = require('../middlewares/auth.middleware');
const YoutubeController = require('../controllers/youtube.controller');

const router = express.Router();

// ── Public (Google redirects here) ────────────────────────────────────────────
// NOTE: This must NOT be behind auth middleware because Google's redirect won't carry a JWT.
router.get('/oauth/callback', YoutubeController.oauthCallback);

// ── All other routes require admin login ──────────────────────────────────────
router.use(authenticate, requireAdmin);

router.get('/auth/url',    YoutubeController.getAuthUrl);
router.get('/status',      YoutubeController.getStatus);
router.post('/disconnect', YoutubeController.disconnect);
router.post('/upload',     YoutubeController.triggerUpload);
router.get('/logs',        YoutubeController.getLogs);
router.get('/queue',       YoutubeController.getQueue);

module.exports = router;
