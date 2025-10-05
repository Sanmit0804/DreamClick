const User = require('../models/user.model');

class userService {
    async getUsers() {
        const users = await User.find();
        return users;
    }
}

module.exports = new userService();