const YoutubeToken = require('../models/youtubeToken.model');
const YoutubeUploadLog = require('../models/youtubeUploadLog.model');

const upsertToken = (email, tokenData) =>
  YoutubeToken.findOneAndUpdate({ email }, tokenData, {
    upsert: true,
    new: true,
    setDefaultsOnInsert: true,
  });

const findTokenByEmail = (email) => YoutubeToken.findOne({ email });

const deleteTokenByEmail = (email) => YoutubeToken.deleteOne({ email });

const createUploadLog = (data) => YoutubeUploadLog.create(data);

const findUploadLogs = ({ filter, skip, limit }) =>
  YoutubeUploadLog.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

const countUploadLogs = (filter) => YoutubeUploadLog.countDocuments(filter);

module.exports = {
  upsertToken,
  findTokenByEmail,
  deleteTokenByEmail,
  createUploadLog,
  findUploadLogs,
  countUploadLogs,
};
