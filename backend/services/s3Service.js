const { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { s3Client, S3_BUCKET } = require('../config/aws');

/**
 * Upload a file to S3
 */
async function uploadToS3(fileBuffer, key, contentType) {
  try {
    const command = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType,
    });

    await s3Client.send(command);
    return key;
  } catch (error) {
    console.error('S3 Upload Error:', error);
    throw new Error(`Failed to upload file to S3: ${error.message}`);
  }
}

/**
 * Get a presigned URL for downloading a file
 */
async function getDownloadUrl(key, expiresIn = 3600) {
  try {
    const command = new GetObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn });
    return url;
  } catch (error) {
    console.error('S3 Get URL Error:', error);
    throw new Error(`Failed to generate download URL: ${error.message}`);
  }
}

/**
 * Delete a file from S3
 */
async function deleteFromS3(key) {
  try {
    const command = new DeleteObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
    });

    await s3Client.send(command);
    return true;
  } catch (error) {
    console.error('S3 Delete Error:', error);
    throw new Error(`Failed to delete file from S3: ${error.message}`);
  }
}

/**
 * Generate S3 key for a file
 */
function generateS3Key(userId, fileId, fileName) {
  return `users/${userId}/${fileId}-${fileName}`;
}

module.exports = {
  uploadToS3,
  getDownloadUrl,
  deleteFromS3,
  generateS3Key,
};
