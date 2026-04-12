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

const toggleCart = async (userId, templateId) => {
    const user = await User.findById(userId);
    if (!user) return null;
    const isCartStr = user.cart.map(id => id.toString());
    if (isCartStr.includes(templateId)) {
        user.cart = user.cart.filter(id => id.toString() !== templateId);
    } else {
        user.cart.push(templateId);
    }
    await user.save({ validateBeforeSave: false });
    return user.cart;
};

const toggleFavorite = async (userId, templateId) => {
    const user = await User.findById(userId);
    if (!user) return null;
    const isFavStr = user.favorites.map(id => id.toString());
    if (isFavStr.includes(templateId)) {
        user.favorites = user.favorites.filter(id => id.toString() !== templateId);
    } else {
        user.favorites.push(templateId);
    }
    await user.save({ validateBeforeSave: false });
    return user.favorites;
};

const deleteUserById = async (userId) => {
    return await User.findByIdAndDelete(userId);
};

module.exports = {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    toggleCart,
    toggleFavorite,
    deleteUserById
};