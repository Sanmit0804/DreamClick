const User = require('../models/index').UserModel;

const getUsers = async () => {
    return await User.find();
};

const getUserById = async (userId) => {
    return await User.findById(userId);
};

const createUser = async (data) => {
    const newUser = new User(data);
    return await newUser.save();
};

const updateUser = async (userId, data) => {
    return await User.findByIdAndUpdate(userId, data, { new: true, runValidators: true });
};

const deleteUserById = async (userId) => {
    return await User.findByIdAndDelete(userId);
};

module.exports = {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUserById
};