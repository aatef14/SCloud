# SCloud Architecture Overview

## 🏛️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          CLIENT (Browser)                        │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              React Frontend (Port 80/443)                │   │
│  │                                                           │   │
│  │  • Landing Page         • File Upload UI                │   │
│  │  • Login/Register       • File List                      │   │
│  │  • Dashboard           • Profile Management              │   │
│  │                                                           │   │
│  │  Built with: React, TypeScript, Tailwind CSS            │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                    │
│                              │ HTTP/HTTPS Requests                │
│                              ▼                                    │
└─────────────────────────────────────────────────────────────────┘
                               │
                               │
┌──────────────────────────────┴───────────────────────────────────┐
│                        EC2 INSTANCE                               │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    Nginx (Port 80/443)                      │ │
│  │  • Serves React build files                                │ │
│  │  • Proxies API requests to backend                         │ │
│  │  • SSL/TLS termination                                     │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              │                                    │
│                              │ Proxy: /api → localhost:3001       │
│                              ▼                                    │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              Node.js Backend (Port 3001)                    │ │
│  │                                                             │ │
│  │  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐  │ │
│  │  │   Routes    │  │  Middleware  │  │    Services     │  │ │
│  │  │             │  │              │  │                 │  │ │
│  │  │ /auth       │  │ JWT Auth     │  │ S3 Service      │  │ │
│  │  │ /files      │  │ CORS         │  │ DynamoDB        │  │ │
│  │  │ /users      │  │ Error        │  │ Service         │  │ │
│  │  └─────────────┘  └──────────────┘  └─────────────────┘  │ │
│  │                                                             │ │
│  │  Managed by: PM2 Process Manager                           │ │
│  └────────────────────────────────────────────────────────────┘ │
│                         │              │                         │
└─────────────────────────┼──────────────┼─────────────────────────┘
                          │              │
                          │              │
           ┌──────────────┘              └──────────────┐
           │                                            │
           ▼                                            ▼
┌──────────────────────┐                    ┌──────────────────────┐
│     AWS S3 Bucket    │                    │   AWS DynamoDB       │
│                      │                    │                      │
│  • File Storage      │                    │  Tables:             │
│  • Presigned URLs    │                    │  • scloud-users      │
│  • CORS Enabled      │                    │  • scloud-files      │
│  • Versioning        │                    │                      │
│                      │                    │  Features:           │
│  Structure:          │                    │  • On-demand pricing │
│  users/              │                    │  • Auto-scaling      │
│    {email}/          │                    │  • GSI on fileId     │
│      {fileId}-{name} │                    │                      │
└──────────────────────┘                    └──────────────────────┘
```

## 🔄 Request Flow

### 1. User Registration/Login

```
User Browser
    │
    │ POST /api/auth/register
    ▼
Nginx (EC2)
    │
    │ Proxy to backend
    ▼
Express Backend
    │
    │ 1. Validate input
    │ 2. Hash password (bcrypt)
    │ 3. Create user in DynamoDB
    ▼
DynamoDB
    │
    │ Store user data
    ▼
Backend
    │
    │ Generate JWT token
    ▼
User Browser
    │
    │ Store token in localStorage
    └─ Ready to make authenticated requests
```

### 2. File Upload

```
User Browser
    │
    │ 1. Select file
    │ 2. POST /api/files/upload (with JWT)
    ▼
Nginx (EC2)
    │
    │ Proxy to backend
    ▼
Express Backend
    │
    ├─ 1. Verify JWT token
    │
    ├─ 2. Process multipart upload (Multer)
    │
    ├─ 3. Generate unique fileId
    │
    ├─ 4. Upload to S3
    ▼
AWS S3
    │
    │ Store file at: users/{email}/{fileId}-{filename}
    │
    ▼ Success
Backend
    │
    ├─ 5. Save metadata to DynamoDB
    ▼
DynamoDB
    │
    │ Store: userId, fileId, fileName, fileSize, s3Key, etc.
    │
    ▼ Success
Backend
    │
    │ 6. Return file metadata
    ▼
User Browser
    │
    └─ Update file list UI
```

### 3. File Download

```
User Browser
    │
    │ GET /api/files/{fileId}/download (with JWT)
    ▼
Nginx (EC2)
    │
    │ Proxy to backend
    ▼
Express Backend
    │
    ├─ 1. Verify JWT token
    │
    ├─ 2. Query DynamoDB for file metadata
    ▼
DynamoDB
    │
    │ Return: s3Key, fileName, etc.
    │
    ▼
Backend
    │
    ├─ 3. Generate presigned S3 URL (valid 1 hour)
    ▼
AWS S3
    │
    │ Create temporary signed URL
    │
    ▼
Backend
    │
    │ 4. Return presigned URL
    ▼
User Browser
    │
    │ 5. Download directly from S3 using presigned URL
    ▼
AWS S3
    │
    └─ File downloaded (bypassing backend for efficiency)
```

## 🔐 Security Layers

```
┌─────────────────────────────────────────────────────────┐
│ Layer 1: Network Security                               │
│                                                          │
│  • EC2 Security Group (Firewall)                        │
│    - Port 22: SSH (Your IP only)                        │
│    - Port 80: HTTP (Anywhere)                           │
│    - Port 443: HTTPS (Anywhere)                         │
│    - Port 3001: Backend (Localhost only via Nginx)      │
│                                                          │
│  • HTTPS/SSL (Let's Encrypt)                            │
│  • CORS Protection                                      │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│ Layer 2: Application Security                           │
│                                                          │
│  • JWT Token Authentication                             │
│    - Signed with secret key                             │
│    - Expires in 7 days                                  │
│    - Verified on every request                          │
│                                                          │
│  • Password Hashing (bcrypt)                            │
│    - Salt rounds: 10                                    │
│    - Never stored in plain text                         │
│                                                          │
│  • Input Validation                                     │
│    - Email format validation                            │
│    - Password strength requirements                     │
│    - File size limits (100MB)                           │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│ Layer 3: AWS Security                                   │
│                                                          │
│  • IAM User Permissions                                 │
│    - Least privilege principle                          │
│    - Restricted to specific S3 bucket                   │
│    - Restricted to specific DynamoDB tables             │
│                                                          │
│  • S3 Security                                          │
│    - Presigned URLs (temporary access)                  │
│    - Server-side encryption (SSE)                       │
│    - Block public access                                │
│    - Bucket versioning                                  │
│                                                          │
│  • DynamoDB Security                                    │
│    - Encryption at rest                                 │
│    - Item-level permissions                             │
│    - Backup and point-in-time recovery                  │
└─────────────────────────────────────────────────────────┘
```

## 📊 Data Flow Diagram

### User Data (DynamoDB: scloud-users)

```
{
  "email": "user@example.com",        // Partition Key
  "username": "johndoe",
  "password": "$2b$10$hashed...",     // Bcrypt hash
  "gender": "male",
  "dateOfBirth": "1990-01-01",
  "createdAt": "2025-11-07T12:00:00Z",
  "updatedAt": "2025-11-07T12:00:00Z"
}
```

### File Metadata (DynamoDB: scloud-files)

```
{
  "userId": "user@example.com",       // Partition Key
  "fileId": "uuid-1234-5678",         // Sort Key
  "fileName": "document.pdf",
  "fileSize": 1024000,                // bytes
  "fileType": "application/pdf",
  "s3Key": "users/user@example.com/uuid-1234-5678-document.pdf",
  "uploadDate": "2025-11-07T12:00:00Z"
}
```

### File Storage (S3)

```
s3://scloud-files-bucket/
    └── users/
        └── user@example.com/
            ├── uuid-1234-document.pdf
            ├── uuid-5678-image.jpg
            └── uuid-9012-report.xlsx
```

## 🔄 Deployment Workflow

```
┌─────────────────────────────────────────────────────────┐
│ 1. LOCAL DEVELOPMENT                                    │
│                                                          │
│  Developer Machine                                      │
│    ├─ Edit code                                         │
│    ├─ Test locally                                      │
│    └─ Commit to Git                                     │
└─────────────────────────────────────────────────────────┘
                          │
                          │ git push
                          ▼
┌─────────────────────────────────────────────────────────┐
│ 2. VERSION CONTROL                                      │
│                                                          │
│  GitHub Repository                                      │
│    └─ Store code history                                │
└─────────────────────────────────────────────────────────┘
                          │
                          │ git pull
                          ▼
┌─────────────────────────────────────────────────────────┐
│ 3. EC2 INSTANCE                                         │
│                                                          │
│  cd ~/scloud-app                                        │
│  git pull origin main                                   │
│  ./scripts/update.sh                                    │
│    ├─ npm install (backend)                             │
│    ├─ npm install (frontend)                            │
│    ├─ npm run build (frontend)                          │
│    ├─ pm2 restart scloud-backend                        │
│    └─ nginx reload                                      │
└─────────────────────────────────────────────────────────┘
                          │
                          │ Serving traffic
                          ▼
┌─────────────────────────────────────────────────────────┐
│ 4. PRODUCTION                                           │
│                                                          │
│  Users access:                                          │
│    • http://YOUR_EC2_IP                                 │
│    • https://yourdomain.com (with SSL)                  │
└─────────────────────────────────────────────────────────┘
```

## 📈 Scaling Considerations

### Current Setup (Single EC2)
- **Good for:** 100-1000 users
- **Limitations:** Single point of failure
- **Cost:** ~$20-30/month

### Future Scaling Options

```
1. Load Balancer + Multiple EC2 Instances
   ├─ Elastic Load Balancer (ELB)
   ├─ Auto Scaling Group (2-5 instances)
   └─ Cost: ~$50-100/month

2. Serverless Architecture
   ├─ AWS Lambda (backend functions)
   ├─ API Gateway
   ├─ CloudFront (CDN)
   └─ Cost: Pay-per-use (~$10-50/month)

3. Containerized Deployment
   ├─ Docker containers
   ├─ AWS ECS or EKS
   └─ Cost: ~$70-150/month
```

## 🎯 Key Design Decisions

### Why DynamoDB over RDS?
- ✅ NoSQL fits our data model (key-value)
- ✅ Auto-scaling
- ✅ Better for file metadata queries
- ✅ Lower cost at scale

### Why Presigned URLs?
- ✅ Direct S3 download (faster)
- ✅ Reduces backend load
- ✅ Temporary access (security)
- ✅ No data transfer through backend

### Why PM2?
- ✅ Automatic restart on crash
- ✅ Load balancing (cluster mode)
- ✅ Zero-downtime deployments
- ✅ Easy monitoring

### Why Nginx?
- ✅ Reverse proxy
- ✅ SSL termination
- ✅ Static file serving
- ✅ Better performance than Node.js for static files

---

**This architecture is production-ready and can handle thousands of users!**
