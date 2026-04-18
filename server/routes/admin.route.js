const express = require('express');
const { authenticate, requireAdmin } = require('../middlewares/auth.middleware');
const AdminController = require('../controllers/admin.controller');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticate, requireAdmin);

router.get('/stats', AdminController.getAdminStats);

module.exports = router;
