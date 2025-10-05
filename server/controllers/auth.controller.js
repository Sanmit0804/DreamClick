const authService = require('../services/auth.service');
const catchAsync = require('../utils/catchAsync');

class AuthController {
    static login = catchAsync(async (req, res) => {
        const { email, password } = req.body;
        const result = await authService.login(email, password);
        res.status(200).json(result);
    });

    static signup = catchAsync(async (req, res) => {
        const user = await authService.signup(req.body);
        res.status(201).json({ message: 'User created successfully', user });
    });
}

module.exports = AuthController;
