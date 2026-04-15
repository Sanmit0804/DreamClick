const User = require('../models/user.model');
const { AppError } = require('../utils/AppError');
const { userRepository } = require('../repositories');

const getUsers = async () => userRepository.findAll();

const getUserById = async (userId) => userRepository.findById(userId);

const createUser = async (data) => userRepository.create(data);

const updateUser = async (userId, data) => userRepository.updateById(userId, data);

const toggleCart = async (userId, templateId) => {
  const user = await User.findById(userId);
  if (!user) throw AppError.notFound('User not found');

  const currentCart = user.cart.map((id) => id.toString());
  if (currentCart.includes(templateId)) {
    user.cart = user.cart.filter((id) => id.toString() !== templateId);
  } else {
    user.cart.push(templateId);
  }

  await user.save({ validateBeforeSave: false });
  return user.cart;
};

const toggleFavorite = async (userId, templateId) => {
  const user = await User.findById(userId);
  if (!user) throw AppError.notFound('User not found');

  const currentFavorites = user.favorites.map((id) => id.toString());
  if (currentFavorites.includes(templateId)) {
    user.favorites = user.favorites.filter((id) => id.toString() !== templateId);
  } else {
    user.favorites.push(templateId);
  }

  await user.save({ validateBeforeSave: false });
  return user.favorites;
};

const deleteUserById = async (userId) => userRepository.deleteById(userId);

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  toggleCart,
  toggleFavorite,
  deleteUserById,
};
