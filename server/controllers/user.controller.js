const userService = require('../services/user.service');
const catchAsync = require('../utils/catchAsync');

class userController {
    static getUsers = catchAsync(async (req, res) => {
        const result = await userService.getUsers();
        res.status(200).json(result);
    });

    static getUserById = catchAsync(async (req, res) => {
        const userId = req.params.id;
        const user = await userService.getUserById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    });

    static updateUser = catchAsync(async (req, res) => {
        const userId = req.params.id;
        const updateData = req.body;
        const updatedUser = await userService.updateUser(userId, updateData);
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found or update failed' });
        }
        res.status(200).json(updatedUser);
    });

    static deleteUserById = catchAsync(async (req, res) => {
        const userId = req.params.id;
        const result = await userService.deleteUserById(userId);
        if (!result) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User deleted successfully', data: result });
    });
}

module.exports = userController;
