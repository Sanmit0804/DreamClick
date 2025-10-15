const userService = require('../services/user.service');
const catchAsync = require('../utils/catchAsync');

class userController {
    static getUsers = catchAsync(async (req, res) => {
        const result = await userService.getUsers();
        res.status(200).json(result)
    })

    static deleteUserById = catchAsync(async (req, res) => {
        console.log("deleting user", req.params.id);
        const userId = req.params.id;
        const result = await userService.deleteUserById(userId);
        res.status(200).json({ message: 'User deleted successfully', data: result });
    })
}

module.exports = userController;