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

router.get('/files', async (req, res) => {
  try {
    const bucket = 'mybucket';
    const objects = [];
    
    const stream = minioClient.listObjects(bucket, '', true);
    
    stream.on('data', (obj) => {
      objects.push({
        name: obj.name,
        size: obj.size,
        lastModified: obj.lastModified,
        url: `http://127.0.0.1:9000/${bucket}/${obj.name}`
      });
    });
    
    stream.on('end', () => {
      res.json({
        success: true,
        files: objects
      });
    });
    
    stream.on('error', (err) => {
      console.error(err);
      res.status(500).json({ success: false, error: 'Failed to list files' });
    });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to list files' });
  }
});

module.exports = router;
