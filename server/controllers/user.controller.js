const userService = require('../services/user.service');
const catchAsync = require('../utils/catchAsync');

class userController {
    static getUsers = catchAsync(async (req, res) => {
        const result = await userService.getUsers();
        res.status(200).json(result)
    })
}

module.exports = userController;