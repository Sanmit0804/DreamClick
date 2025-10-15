const User = require('../models/user.model');

class userService {
    async getUsers() {
        const users = await User.find();
        return users;
    }

    async deleteUserById(userId) {
        const deletedUser = await User.findByIdAndDelete(userId);
        return deletedUser;
    }
}

module.exports = new userService();