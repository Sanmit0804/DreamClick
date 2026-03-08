const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { AppError } = require('../utils/AppError');

const signToken = (user) =>
    jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );

class AuthService {
    async login(email, password) {
        const user = await User.findOne({ email }).select('+password');
        if (!user) throw AppError.unauthorized('Invalid email or password');

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) throw AppError.unauthorized('Invalid email or password');

        const token = signToken(user);
        return { user, token };
    }

    async signup(userData) {
        const existingUser = await User.findOne({ email: userData.email });
        if (existingUser) throw AppError.conflict('Email already in use');

        const user = new User({ ...userData });
        await user.save();

        const token = signToken(user);
        return { user, token };
    }
}

module.exports = new AuthService();