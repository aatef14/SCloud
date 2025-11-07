const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { authenticateToken } = require('../middleware/auth');
const { uploadToS3, getDownloadUrl, deleteFromS3, generateS3Key } = require('../services/s3Service');
const { saveFileMetadata, getUserFiles, getFileById, deleteFileMetadata } = require('../services/dynamodbService');

/**
 * POST /api/files/upload
 * Upload a file
 */
router.post('/upload', authenticateToken, (req, res, next) => {
  const upload = req.app.get('upload');
  upload.single('file')(req, res, async (err) => {
    if (err) {
      return next(err);
    }

    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const fileId = uuidv4();
      const userId = req.user.email;
      const s3Key = generateS3Key(userId, fileId, req.file.originalname);

      // Upload to S3
      await uploadToS3(req.file.buffer, s3Key, req.file.mimetype);

      // Save metadata to DynamoDB
      const fileMetadata = await saveFileMetadata({
        userId,
        fileId,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        fileType: req.file.mimetype,
        s3Key,
        uploadDate: new Date().toISOString(),
      });

      res.status(201).json({
        message: 'File uploaded successfully',
        file: fileMetadata,
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: 'Failed to upload file' });
    }
  });
});

/**
 * GET /api/files
 * Get all files for the authenticated user
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.email;
    const files = await getUserFiles(userId);

    res.json({
      files,
      count: files.length,
    });
  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({ error: 'Failed to get files' });
  }
});

/**
 * GET /api/files/:fileId
 * Get a specific file's metadata
 */
router.get('/:fileId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.email;
    const { fileId } = req.params;

    const file = await getFileById(userId, fileId);

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.json({ file });
  } catch (error) {
    console.error('Get file error:', error);
    res.status(500).json({ error: 'Failed to get file' });
  }
});

/**
 * GET /api/files/:fileId/download
 * Get a presigned URL for downloading a file
 */
router.get('/:fileId/download', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.email;
    const { fileId } = req.params;

    const file = await getFileById(userId, fileId);

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Generate presigned URL (valid for 1 hour)
    const downloadUrl = await getDownloadUrl(file.s3Key, 3600);

    res.json({
      downloadUrl,
      fileName: file.fileName,
      expiresIn: 3600,
    });
  } catch (error) {
    console.error('Download URL error:', error);
    res.status(500).json({ error: 'Failed to generate download URL' });
  }
});

/**
 * DELETE /api/files/:fileId
 * Delete a file
 */
router.delete('/:fileId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.email;
    const { fileId } = req.params;

    // Get file metadata
    const file = await getFileById(userId, fileId);

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Delete from S3
    await deleteFromS3(file.s3Key);

    // Delete metadata from DynamoDB
    await deleteFileMetadata(userId, fileId);

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

/**
 * GET /api/files/:fileId/share
 * Get a shareable URL (valid for 24 hours)
 */
router.get('/:fileId/share', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.email;
    const { fileId } = req.params;

    const file = await getFileById(userId, fileId);

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Generate presigned URL (valid for 24 hours)
    const shareUrl = await getDownloadUrl(file.s3Key, 86400);

    res.json({
      shareUrl,
      fileName: file.fileName,
      expiresIn: 86400,
    });
  } catch (error) {
    console.error('Share URL error:', error);
    res.status(500).json({ error: 'Failed to generate share URL' });
  }
});

module.exports = router;
