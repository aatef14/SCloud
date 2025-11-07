// MOCK S3 Service for Browser Demo
// This is a demonstration of how S3 integration would work
// In production, these operations MUST be performed by a backend server

import { AWS_CONFIG, USE_MOCK_MODE } from './aws-config';

export interface UploadFileParams {
  file: File;
  userId: string;
  fileId: string;
}

export interface FileMetadata {
  key: string;
  fileName: string;
  size: number;
  type: string;
  uploadDate: string;
}

// Mock storage for demo purposes
const mockFileStorage = new Map<string, { file: File; key: string; uploadDate: string }>();

/**
 * Upload a file to S3 (MOCK IMPLEMENTATION)
 * 
 * In production, this should be an API call to your backend:
 * POST /api/files/upload
 * 
 * Backend example (Node.js):
 * const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
 * const s3 = new S3Client({ region: 'us-east-1' });
 * await s3.send(new PutObjectCommand({ Bucket, Key, Body }));
 */
export async function uploadFileToS3({ file, userId, fileId }: UploadFileParams): Promise<string> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const key = `users/${userId}/${fileId}-${file.name}`;
  
  if (USE_MOCK_MODE) {
    // Store file in memory for demo
    mockFileStorage.set(key, {
      file,
      key,
      uploadDate: new Date().toISOString(),
    });
    
    console.log('📤 [MOCK] File uploaded to S3:', key);
    return key;
  }
  
  // In production, replace with actual API call:
  // const formData = new FormData();
  // formData.append('file', file);
  // const response = await fetch('/api/files/upload', {
  //   method: 'POST',
  //   body: formData,
  //   headers: { 'Authorization': `Bearer ${token}` }
  // });
  // const { key } = await response.json();
  // return key;
  
  throw new Error('AWS SDK cannot run in browser. See AWS_SETUP_GUIDE.md for backend setup.');
}

/**
 * Get a presigned URL for downloading a file (MOCK IMPLEMENTATION)
 * 
 * In production, this should be an API call to your backend:
 * GET /api/files/download?key={key}
 * 
 * Backend generates a presigned URL and returns it
 */
export async function getDownloadUrl(key: string, expiresIn: number = 3600): Promise<string> {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  if (USE_MOCK_MODE) {
    const stored = mockFileStorage.get(key);
    if (stored) {
      // Create a blob URL for demo purposes
      const url = URL.createObjectURL(stored.file);
      console.log('📥 [MOCK] Generated download URL for:', key);
      return url;
    }
    throw new Error('File not found in mock storage');
  }
  
  // In production, replace with actual API call:
  // const response = await fetch(`/api/files/download?key=${key}`, {
  //   headers: { 'Authorization': `Bearer ${token}` }
  // });
  // const { url } = await response.json();
  // return url;
  
  throw new Error('AWS SDK cannot run in browser. See AWS_SETUP_GUIDE.md for backend setup.');
}

/**
 * Delete a file from S3 (MOCK IMPLEMENTATION)
 * 
 * In production, this should be an API call to your backend:
 * DELETE /api/files/{key}
 */
export async function deleteFileFromS3(key: string): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  if (USE_MOCK_MODE) {
    mockFileStorage.delete(key);
    console.log('🗑️ [MOCK] File deleted from S3:', key);
    return;
  }
  
  // In production, replace with actual API call:
  // await fetch(`/api/files/${encodeURIComponent(key)}`, {
  //   method: 'DELETE',
  //   headers: { 'Authorization': `Bearer ${token}` }
  // });
  
  throw new Error('AWS SDK cannot run in browser. See AWS_SETUP_GUIDE.md for backend setup.');
}

/**
 * List all files for a user in S3 (MOCK IMPLEMENTATION)
 * This is typically handled by the DynamoDB query instead
 */
export async function listUserFiles(userId: string): Promise<FileMetadata[]> {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  if (USE_MOCK_MODE) {
    const userFiles: FileMetadata[] = [];
    mockFileStorage.forEach((stored, key) => {
      if (key.startsWith(`users/${userId}/`)) {
        userFiles.push({
          key,
          fileName: stored.file.name,
          size: stored.file.size,
          type: stored.file.type || 'unknown',
          uploadDate: stored.uploadDate,
        });
      }
    });
    return userFiles;
  }
  
  throw new Error('AWS SDK cannot run in browser. See AWS_SETUP_GUIDE.md for backend setup.');
}

/**
 * Generate a presigned URL for sharing a file (MOCK IMPLEMENTATION)
 */
export async function getShareableUrl(key: string, expiresIn: number = 86400): Promise<string> {
  return getDownloadUrl(key, expiresIn);
}
