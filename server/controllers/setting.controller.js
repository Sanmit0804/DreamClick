const { SettingModel } = require('../models');

// @desc    Get all settings
// @route   GET /api/settings
// @access  Public (or Private depending on needs, maybe some public, some private)
// Let's make it public to easily fetch appName etc, but filter sensitive if any.
// Since these are just settings, public is fine for now, or we can make a public and a private endpoint.
const getSettings = async (req, res) => {
    try {
        let settings = await SettingModel.findOne();
        if (!settings) {
            // Create default settings if none exist
            settings = await SettingModel.create({});
        }
        res.status(200).json({ success: true, data: settings });
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Update settings
// @route   PUT /api/settings
// @access  Private/Admin
const updateSettings = async (req, res) => {
    try {
        let settings = await SettingModel.findOne();
        if (!settings) {
            settings = await SettingModel.create({});
        }

        // Update fields
        const updatableFields = ['appName', 'contactEmail', 'supportPhone', 'socialLinks', 'seo', 'maintenanceMode', 'features', 'branding', 'layout'];
        
        updatableFields.forEach(field => {
            if (req.body[field] !== undefined) {
                settings[field] = req.body[field];
            }
        });

        await settings.save();

        res.status(200).json({ success: true, data: settings, message: 'Settings updated successfully' });
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = {
    getSettings,
    updateSettings
};
