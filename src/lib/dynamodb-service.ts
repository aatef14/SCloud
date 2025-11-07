// MOCK DynamoDB Service for Browser Demo
// This is a demonstration of how DynamoDB integration would work
// In production, these operations MUST be performed by a backend server

import { AWS_CONFIG, USE_MOCK_MODE } from './aws-config';

export interface User {
  email: string;
  password: string;
  username?: string;
  gender?: string;
  dateOfBirth?: string;
  createdAt: string;
}

export interface FileRecord {
  userId: string;
  fileId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  s3Key: string;
  uploadDate: string;
}

// Mock storage for demo purposes
const mockUsers = new Map<string, User>();
const mockFiles = new Map<string, FileRecord[]>();

/**
 * Create a new user in DynamoDB (MOCK IMPLEMENTATION)
 * 
 * In production, this should be an API call to your backend:
 * POST /api/auth/register
 * 
 * Backend example (Node.js):
 * const bcrypt = require('bcrypt');
 * const hashedPassword = await bcrypt.hash(password, 10);
 * await dynamoDB.put({ TableName: 'users', Item: { email, password: hashedPassword } });
 */
export async function createUser(email: string, password: string): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  if (USE_MOCK_MODE) {
    if (mockUsers.has(email)) {
      throw new Error('User with this email already exists');
    }
    
    // Simple base64 encoding - NOT SECURE for production!
    const hashedPassword = btoa(password);
    
    mockUsers.set(email, {
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
    });
    
    console.log('👤 [MOCK] User created:', email);
    return;
  }
  
  // In production, replace with actual API call:
  // const response = await fetch('/api/auth/register', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ email, password })
  // });
  // if (!response.ok) throw new Error('Registration failed');
  
  throw new Error('AWS SDK cannot run in browser. See AWS_SETUP_GUIDE.md for backend setup.');
}

/**
 * Authenticate a user (MOCK IMPLEMENTATION)
 * 
 * In production, this should be an API call to your backend:
 * POST /api/auth/login
 */
export async function authenticateUser(email: string, password: string): Promise<User | null> {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  if (USE_MOCK_MODE) {
    const user = mockUsers.get(email);
    
    if (!user) {
      return null;
    }
    
    const hashedPassword = btoa(password);
    
    if (user.password === hashedPassword) {
      console.log('🔐 [MOCK] User authenticated:', email);
      return user;
    }
    
    return null;
  }
  
  // In production, replace with actual API call:
  // const response = await fetch('/api/auth/login', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ email, password })
  // });
  // if (!response.ok) return null;
  // const { user, token } = await response.json();
  // return user;
  
  throw new Error('AWS SDK cannot run in browser. See AWS_SETUP_GUIDE.md for backend setup.');
}

/**
 * Get user profile (MOCK IMPLEMENTATION)
 * 
 * In production: GET /api/users/profile
 */
export async function getUserProfile(email: string): Promise<User | null> {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  if (USE_MOCK_MODE) {
    return mockUsers.get(email) || null;
  }
  
  throw new Error('AWS SDK cannot run in browser. See AWS_SETUP_GUIDE.md for backend setup.');
}

/**
 * Update user profile (MOCK IMPLEMENTATION)
 * 
 * In production: PATCH /api/users/profile
 */
export async function updateUserProfile(
  email: string,
  updates: { username?: string; gender?: string; dateOfBirth?: string }
): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  if (USE_MOCK_MODE) {
    const user = mockUsers.get(email);
    if (user) {
      mockUsers.set(email, { ...user, ...updates });
      console.log('✏️ [MOCK] User profile updated:', email);
    }
    return;
  }
  
  throw new Error('AWS SDK cannot run in browser. See AWS_SETUP_GUIDE.md for backend setup.');
}

/**
 * Delete user account (MOCK IMPLEMENTATION)
 * 
 * In production: DELETE /api/users/account
 */
export async function deleteUser(email: string): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  if (USE_MOCK_MODE) {
    mockUsers.delete(email);
    mockFiles.delete(email);
    console.log('🗑️ [MOCK] User deleted:', email);
    return;
  }
  
  throw new Error('AWS SDK cannot run in browser. See AWS_SETUP_GUIDE.md for backend setup.');
}

/**
 * Save file metadata to DynamoDB (MOCK IMPLEMENTATION)
 * 
 * In production: POST /api/files/metadata
 */
export async function saveFileMetadata(fileRecord: FileRecord): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  if (USE_MOCK_MODE) {
    const userFiles = mockFiles.get(fileRecord.userId) || [];
    userFiles.push(fileRecord);
    mockFiles.set(fileRecord.userId, userFiles);
    console.log('💾 [MOCK] File metadata saved:', fileRecord.fileName);
    return;
  }
  
  throw new Error('AWS SDK cannot run in browser. See AWS_SETUP_GUIDE.md for backend setup.');
}

/**
 * Get all files for a user (MOCK IMPLEMENTATION)
 * 
 * In production: GET /api/files
 */
export async function getUserFiles(userId: string): Promise<FileRecord[]> {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  if (USE_MOCK_MODE) {
    return mockFiles.get(userId) || [];
  }
  
  throw new Error('AWS SDK cannot run in browser. See AWS_SETUP_GUIDE.md for backend setup.');
}

/**
 * Delete file metadata from DynamoDB (MOCK IMPLEMENTATION)
 * 
 * In production: DELETE /api/files/{fileId}
 */
export async function deleteFileMetadata(userId: string, fileId: string): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  if (USE_MOCK_MODE) {
    const userFiles = mockFiles.get(userId) || [];
    const filteredFiles = userFiles.filter(f => f.fileId !== fileId);
    mockFiles.set(userId, filteredFiles);
    console.log('🗑️ [MOCK] File metadata deleted:', fileId);
    return;
  }
  
  throw new Error('AWS SDK cannot run in browser. See AWS_SETUP_GUIDE.md for backend setup.');
}
