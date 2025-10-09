const express = require('express');
const multer = require('multer');
const minioClient = require('../config/minio');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', upload.single('file'), async (req, res) => {
  try {
    const bucket = 'mybucket';
    const fileName = `${Date.now()}-${req.file.originalname}`;

    await minioClient.putObject(bucket, fileName, req.file.buffer);

    res.json({
      success: true,
      message: 'File uploaded successfully',
      fileUrl: `http://127.0.0.1:9000/${bucket}/${fileName}`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Upload failed' });
  }
});

module.exports = router;
