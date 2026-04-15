const Template = require('../models/template.model');

const findAll = (filter = {}) =>
  Template.find(filter)
    .populate('userId', 'name creatorProfile.avatar')
    .sort({ createdAt: -1 })
    .lean();

const findById = (id, options = {}) => {
  const query = Template.findById(id).populate('userId', 'name creatorProfile.avatar');
  return options.lean === false ? query : query.lean();
};

const create = (data) => new Template(data).save();

const findDocumentById = (id) => Template.findById(id);

const updateById = (id, data) =>
  Template.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });

module.exports = {
  findAll,
  findById,
  create,
  findDocumentById,
  updateById,
};
