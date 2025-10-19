const User = require('../models/user.model');

class userService {
    async getUsers() {
        return await User.find();
    }

    async getUserById(userId) {
        return await User.findById(userId);
    }

    async updateUser(userId, data) {
        return await User.findByIdAndUpdate(userId, data, { new: true, runValidators: true });
    }

    async deleteUserById(userId) {
        return await User.findByIdAndDelete(userId);
    }
}

module.exports = new userService();