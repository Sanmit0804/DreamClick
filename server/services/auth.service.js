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

    async emailLogin(email, guestCart = [], guestFavorites = []) {
        if (!email) throw AppError.badRequest('Email is required');
        
        // Find existing user
        let user = await User.findOne({ email });
        
        if (!user) {
            // Create user automatically
            user = new User({
                name: email.split('@')[0],
                email,
                authProvider: 'local' // using local because we bypass password anyways; or we could use 'email' if we add to schema, but user.model specifies 'local', 'google', 'github'
            });
            await user.save({ validateBeforeSave: false }); // bypass password validation
        }

        // Merge cart and favorites
        if (guestCart.length > 0) {
            const uniqueCart = [...new Set([...(user.cart || []).map(id => id.toString()), ...guestCart])];
            user.cart = uniqueCart;
        }
        if (guestFavorites.length > 0) {
            const uniqueFavs = [...new Set([...(user.favorites || []).map(id => id.toString()), ...guestFavorites])];
            user.favorites = uniqueFavs;
        }
        
        await user.save({ validateBeforeSave: false });

        const token = signToken(user);
        return { user, token };
    }
}

module.exports = new AuthService();