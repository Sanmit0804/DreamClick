const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middlewares/auth.middleware');
const settingController = require('../controllers/setting.controller');

// Assuming you have an auth middleware, we should protect the PUT route.
// Let's check how other routes do it or just skip for now and I will add it if I find the middleware.
// For now, I'll export router and add it in index.js

router.route('/')
    .get(settingController.getSettings)
    .put(authenticate, requireAdmin, settingController.updateSettings);

module.exports = router;
