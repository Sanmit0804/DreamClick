const User = require('../models/user.model');

const findAll = () => User.find().lean();

const findById = (id, options = {}) => {
  const query = User.findById(id);
  if (options.includePassword) query.select('+password');
  return options.lean === false ? query : query.lean();
};

const findByEmail = (email, options = {}) => {
  const query = User.findOne({ email });
  if (options.includePassword) query.select('+password');
  return options.lean ? query.lean() : query;
};

const create = (data, saveOptions = undefined) => new User(data).save(saveOptions);

const updateById = (id, data) =>
  User.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  }).lean();

const deleteById = (id) => User.findByIdAndDelete(id).lean();

module.exports = {
  findAll,
  findById,
  findByEmail,
  create,
  updateById,
  deleteById,
};
