# SCloud Backend API

This is the backend API server for SCloud, providing AWS S3 and DynamoDB integration.

## Features

- **Authentication**: User registration and login with JWT tokens
- **File Management**: Upload, download, delete, and share files
- **AWS Integration**: 
  - S3 for file storage
  - DynamoDB for metadata and user data
- **Security**: 
  - Password hashing with bcrypt
  - JWT authentication
  - CORS protection

## API Endpoints

### Authentication

#### POST /api/auth/register
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "securepassword123",
  "gender": "male",
  "dateOfBirth": "1990-01-01"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "email": "user@example.com",
    "username": "johndoe",
    "createdAt": "2025-11-07T12:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST /api/auth/login
Login user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": { ... },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Files

All file endpoints require authentication. Include token in header:
```
Authorization: Bearer <token>
```

#### POST /api/files/upload
Upload a file.

**Request:** multipart/form-data
- `file`: File to upload

**Response:**
```json
{
  "message": "File uploaded successfully",
  "file": {
    "fileId": "uuid",
    "fileName": "document.pdf",
    "fileSize": 1024000,
    "fileType": "application/pdf",
    "s3Key": "users/user@example.com/uuid-document.pdf",
    "uploadDate": "2025-11-07T12:00:00.000Z"
  }
}
```

#### GET /api/files
Get all files for the authenticated user.

**Response:**
```json
{
  "files": [...],
  "count": 5
}
```

#### GET /api/files/:fileId/download
Get presigned download URL (valid for 1 hour).

**Response:**
```json
{
  "downloadUrl": "https://s3.amazonaws.com/...",
  "fileName": "document.pdf",
  "expiresIn": 3600
}
```

#### DELETE /api/files/:fileId
Delete a file.

**Response:**
```json
{
  "message": "File deleted successfully"
}
```

#### GET /api/files/:fileId/share
Get shareable URL (valid for 24 hours).

**Response:**
```json
{
  "shareUrl": "https://s3.amazonaws.com/...",
  "fileName": "document.pdf",
  "expiresIn": 86400
}
```

### Users

#### GET /api/users/profile
Get user profile (requires authentication).

#### PUT /api/users/profile
Update user profile (requires authentication).

**Request Body:**
```json
{
  "username": "newusername",
  "gender": "female",
  "dateOfBirth": "1990-01-01"
}
```

## Installation

```bash
cd backend
npm install
```

## Configuration

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Edit `.env` with your AWS credentials:
```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET_NAME=your-bucket-name
DYNAMODB_USERS_TABLE=scloud-users
DYNAMODB_FILES_TABLE=scloud-files
```

## Running

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

### With PM2
```bash
pm2 start server.js --name scloud-backend
pm2 save
```

## Testing

Health check:
```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2025-11-07T12:00:00.000Z",
  "service": "SCloud Backend API",
  "version": "1.0.0"
}
```

## Error Handling

All errors return JSON in this format:
```json
{
  "error": "Error message description"
}
```

HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not found
- `409`: Conflict (e.g., user already exists)
- `500`: Internal server error

## Security Considerations

1. **Never commit `.env` file** - Contains sensitive credentials
2. **Use HTTPS in production** - Encrypt data in transit
3. **Rotate AWS credentials regularly**
4. **Use IAM roles** instead of access keys when possible
5. **Implement rate limiting** in production
6. **Validate all inputs** on both client and server
7. **Use strong JWT secrets** - Generate with `openssl rand -base64 32`

## Monitoring

View logs with PM2:
```bash
pm2 logs scloud-backend
pm2 monit
```

## License

MIT
