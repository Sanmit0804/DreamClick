const express = require('express');
const multer = require('multer');
const path = require('path');
const minioClient = require('../config/minio');
const { env } = require('../config/env');
const logger = require('../config/logger');
const validate = require('../middlewares/validate.middleware');
const { uploadValidator } = require('../validators');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: Number(process.env.UPLOAD_MAX_BYTES) || 100 * 1024 * 1024,
    files: 1,
  },
});

const buildFileUrl = (bucket, fileName) =>
  `${env.minio.publicUrl.replace(/\/$/, '')}/${bucket}/${encodeURIComponent(fileName)}`;

router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'File is required' });
    }

    const bucket = env.minio.bucket;
    const originalName = path.basename(req.file.originalname).replace(/[^\w.\- ]+/g, '_');
    const fileName = `${Date.now()}-${originalName}`;

    await minioClient.putObject(bucket, fileName, req.file.buffer, req.file.size, {
      'Content-Type': req.file.mimetype,
    });

    res.json({
      success: true,
      message: 'File uploaded successfully',
      fileUrl: buildFileUrl(bucket, fileName),
    });
  } catch (err) {
    logger.error({ err }, 'Upload failed');
    res.status(500).json({ success: false, error: 'Upload failed' });
  }
});

router.get('/files', async (_req, res) => {
  try {
    const bucket = env.minio.bucket;
    const objects = [];

    const stream = minioClient.listObjects(bucket, '', true);

    stream.on('data', (obj) => {
      objects.push({
        name: obj.name,
        size: obj.size,
        lastModified: obj.lastModified,
        url: buildFileUrl(bucket, obj.name),
      });
    });

    stream.on('end', () => {
      res.json({
        success: true,
        files: objects,
      });
    });

    stream.on('error', (err) => {
      logger.error({ err }, 'Failed to list files');
      res.status(500).json({ success: false, error: 'Failed to list files' });
    });
  } catch (err) {
    logger.error({ err }, 'Failed to list files');
    res.status(500).json({ success: false, error: 'Failed to list files' });
  }
});

router.delete('/files/:fileName', validate({ params: uploadValidator.fileParams }), async (req, res) => {
  try {
    const bucket = env.minio.bucket;
    const fileName = path.basename(req.params.fileName);

    try {
      await minioClient.statObject(bucket, fileName);
    } catch (err) {
      if (err.code === 'NotFound') {
        return res.status(404).json({
          success: false,
          error: 'File not found',
        });
      }
      throw err;
    }

    await minioClient.removeObject(bucket, fileName);

    res.json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (err) {
    logger.error({ err }, 'Failed to delete file');
    res.status(500).json({
      success: false,
      error: 'Failed to delete file',
    });
  }
});

module.exports = router;
