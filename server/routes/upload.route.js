const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const minioClient = require('../config/minio');
const { env } = require('../config/env');
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

const buildFileUrl = (bucket, fileName) => {
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  return `${protocol}://localhost:${process.env.PORT || 5000}/uploads/${encodeURIComponent(fileName)}`;
};

router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'File is required' });
    }

    const bucket = env.minio.bucket;
    const originalName = path.basename(req.file.originalname).replace(/[^\w.\- ]+/g, '_');
    const fileName = `${Date.now()}-${originalName}`;

    // Fix: Fall back to local file system if MinIO is not running
    const uploadDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const filePath = path.join(uploadDir, fileName);
    await fs.promises.writeFile(filePath, req.file.buffer);

    res.json({
      success: true,
      message: 'File uploaded successfully',
      fileUrl: buildFileUrl(bucket, fileName),
    });
  } catch (err) {
    console.error({ err }, 'Upload failed');
    res.status(500).json({ success: false, error: 'Upload failed' });
  }
});

router.get('/files', async (_req, res) => {
  try {
    const bucket = env.minio.bucket;
    const uploadDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      return res.json({ success: true, files: [] });
    }

    const files = await fs.promises.readdir(uploadDir);
    const objects = [];

    for (const file of files) {
      const stats = await fs.promises.stat(path.join(uploadDir, file));
      objects.push({
        name: file,
        size: stats.size,
        lastModified: stats.mtime,
        url: buildFileUrl(bucket, file),
      });
    }

    res.json({
      success: true,
      files: objects,
    });
  } catch (err) {
    console.error({ err }, 'Failed to list files');
    res.status(500).json({ success: false, error: 'Failed to list files' });
  }
});

router.delete('/files/:fileName', validate({ params: uploadValidator.fileParams }), async (req, res) => {
  try {
    const fileName = path.basename(req.params.fileName);
    const filePath = path.join(__dirname, '..', 'uploads', fileName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: 'File not found',
      });
    }

    await fs.promises.unlink(filePath);

    res.json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (err) {
    console.error({ err }, 'Failed to delete file');
    res.status(500).json({
      success: false,
      error: 'Failed to delete file',
    });
  }
});

module.exports = router;
