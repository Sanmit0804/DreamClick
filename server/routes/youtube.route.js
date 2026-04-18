const express = require('express');
const { authenticate, requireAdmin } = require('../middlewares/auth.middleware');
const YoutubeController = require('../controllers/youtube.controller');
const validate = require('../middlewares/validate.middleware');
const { youtubeValidator } = require('../validators');

const router = express.Router();

router.get(
  '/oauth/callback',
  validate({ query: youtubeValidator.oauthCallbackQuery }),
  YoutubeController.oauthCallback
);

router.use(authenticate, requireAdmin);

router.get('/auth/url', YoutubeController.getAuthUrl);
router.get('/status', YoutubeController.getStatus);
router.post('/disconnect', YoutubeController.disconnect);
router.post('/upload', validate({ body: youtubeValidator.uploadBody }), YoutubeController.triggerUpload);
router.get('/logs', validate({ query: youtubeValidator.logsQuery }), YoutubeController.getLogs);
router.get('/queue', YoutubeController.getQueue);

module.exports = router;
