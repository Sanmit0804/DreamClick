const catchAsync = require('../utils/catchAsync');
const { adminService } = require('../services/index');

class AdminController {
    static getAdminStats = catchAsync(async (_req, res) => {
        const data = await adminService.getAdminStats();
        res.status(200).json({ success: true, data });
    });
}

module.exports = AdminController;
