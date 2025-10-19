const User = require('../models/user.model');

class userService {
    async getUsers() {
        return await User.find();
    }

    async getUserById(userId) {
        return await User.findById(userId);
    }

    async createUser(data) {
        const newUser = new User(data);
        return await newUser.save();
    }

    async updateUser(userId, data) {
        return await User.findByIdAndUpdate(userId, data, { new: true, runValidators: true });
    }

    async deleteUserById(userId) {
        return await User.findByIdAndDelete(userId);
    }
}

module.exports = new userService();