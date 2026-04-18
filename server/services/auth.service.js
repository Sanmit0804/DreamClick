const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { env } = require('../config/env');
const { AppError } = require('../utils/AppError');
const { userRepository } = require('../repositories');

const signToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );

class AuthService {
  async login(email, password) {
    const user = await userRepository.findByEmail(email, { includePassword: true });
    if (!user) throw AppError.unauthorized('Invalid email or password');

    const isMatch = await bcrypt.compare(password, user.password || '');
    if (!isMatch) throw AppError.unauthorized('Invalid email or password');

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = signToken(user);
    return { user, token };
  }

  async signup(userData) {
    const existingUser = await userRepository.findByEmail(userData.email, { lean: true });
    if (existingUser) throw AppError.conflict('Email already in use');

    const user = await userRepository.create(userData);
    const token = signToken(user);
    return { user, token };
  }

  async emailLogin(email, guestCart = [], guestFavorites = []) {
    if (!email) throw AppError.badRequest('Email is required');

    let user = await userRepository.findByEmail(email);

    if (!user) {
      user = await userRepository.create(
        {
          name: email.split('@')[0],
          email,
          authProvider: 'local',
        },
        { validateBeforeSave: false }
      );
    }

    if (guestCart.length > 0) {
      const uniqueCart = [...new Set([...(user.cart || []).map((id) => id.toString()), ...guestCart])];
      user.cart = uniqueCart;
    }

    if (guestFavorites.length > 0) {
      const uniqueFavs = [...new Set([...(user.favorites || []).map((id) => id.toString()), ...guestFavorites])];
      user.favorites = uniqueFavs;
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = signToken(user);
    return { user, token };
  }
}

module.exports = new AuthService();
