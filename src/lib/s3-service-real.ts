import { API_BASE_URL } from './api-config';

export interface UploadFileParams {
  file: File;
  token: string;
}

export interface FileMetadata {
  fileId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadDate: string;
  s3Key: string;
}

/**
 * Upload a file to S3 via backend API
 */
export async function uploadFileToS3({ file, token }: UploadFileParams): Promise<FileMetadata> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/files/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Upload failed' }));
    throw new Error(error.error || 'Failed to upload file');
  }

  const data = await response.json();
  return data.file;
}

/**
 * Get all user files
 */
export async function getUserFiles(token: string): Promise<FileMetadata[]> {
  const response = await fetch(`${API_BASE_URL}/files`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to get files' }));
    throw new Error(error.error || 'Failed to get files');
  }

  const data = await response.json();
  return data.files;
}

/**
 * Get a presigned URL for downloading a file
 */
export async function getDownloadUrl(fileId: string, token: string): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/files/${fileId}/download`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to get download URL' }));
    throw new Error(error.error || 'Failed to get download URL');
  }

  const data = await response.json();
  return data.downloadUrl;
}

/**
 * Delete a file
 */
export async function deleteFile(fileId: string, token: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/files/${fileId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to delete file' }));
    throw new Error(error.error || 'Failed to delete file');
  }
}

/**
 * Generate a shareable URL for a file (valid for 24 hours)
 */
export async function getShareableUrl(fileId: string, token: string): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/files/${fileId}/share`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to generate share URL' }));
    throw new Error(error.error || 'Failed to generate share URL');
  }

  const data = await response.json();
  return data.shareUrl;
}
