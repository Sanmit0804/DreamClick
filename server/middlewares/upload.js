const multer = require('multer');
const multerS3 = require('multer-s3');
const { s3 } = require('../config/s3');

const upload = multer({
  storage: multerS3({
    s3,
    bucket: process.env.AWS_BUCKET_NAME,
    key: (_req, file, cb) => {
      cb(null, `uploads/${Date.now()}-${file.originalname}`);
    },
    contentType: multerS3.AUTO_CONTENT_TYPE,
  }),
});

module.exports = upload;
