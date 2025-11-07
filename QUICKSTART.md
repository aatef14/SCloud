# SCloud - Quick Start Guide

Complete guide to deploy SCloud with AWS S3, DynamoDB, and EC2.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Quick Start (5 Steps)](#quick-start-5-steps)
3. [Detailed Deployment Guide](#detailed-deployment-guide)
4. [Local Development](#local-development)
5. [Troubleshooting](#troubleshooting)

---

## Overview

**SCloud** is a cloud storage application (like Dropbox) with:
- ☁️ **AWS S3** for file storage
- 🗄️ **DynamoDB** for metadata and user data
- 🚀 **EC2** for hosting (backend + frontend)
- 🔐 **JWT authentication**
- 📤 File upload, download, delete, and share

---

## Quick Start (5 Steps)

### Step 1: Push to GitHub

```bash
cd "/root/figma/SCloud Next.js Application"

# Initialize git (if not done)
git init

# Add all files
git add .
git commit -m "Initial commit: SCloud application with backend"

# Push to GitHub (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/scloud-app.git
git branch -M main
git push -u origin main
```

### Step 2: Create AWS Resources

1. **Create S3 Bucket:**
   - Go to https://console.aws.amazon.com/s3/
   - Create bucket: `scloud-files-YOUR_NAME` (must be unique globally)
   - Enable versioning
   - Add CORS configuration (see DEPLOYMENT_GUIDE.md)

2. **Create DynamoDB Tables:**
   - Go to https://console.aws.amazon.com/dynamodb/
   - Create table: `scloud-users` (Partition key: `email` - String)
   - Create table: `scloud-files` (Partition key: `userId` - String, Sort key: `fileId` - String)

3. **Create IAM User:**
   - Go to https://console.aws.amazon.com/iam/
   - Create user: `scloud-backend-user`
   - Attach policies: `AmazonS3FullAccess`, `AmazonDynamoDBFullAccess`
   - Create access keys → **Save credentials!**

### Step 3: Launch EC2 Instance

1. Go to https://console.aws.amazon.com/ec2/
2. Launch instance:
   - Name: `scloud-server`
   - AMI: **Ubuntu Server 22.04 LTS**
   - Instance type: **t2.medium** (recommended) or **t2.small**
   - Create key pair: `scloud-key.pem` → Download it!
   - Security group:
     - SSH (22) - Your IP
     - HTTP (80) - Anywhere
     - HTTPS (443) - Anywhere
     - Custom TCP (3001) - Anywhere
   - Storage: 20 GB
3. Launch instance
4. **Optional but recommended:** Allocate Elastic IP

### Step 4: Deploy to EC2

**Connect to EC2:**
```bash
chmod 400 ~/Downloads/scloud-key.pem
ssh -i ~/Downloads/scloud-key.pem ubuntu@YOUR_EC2_IP
```

**Run deployment script:**
```bash
# Copy the deploy script or run commands manually
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git nginx
sudo npm install -g pm2

# Clone your repository
cd ~
git clone https://github.com/YOUR_USERNAME/scloud-app.git
cd scloud-app

# Make scripts executable
chmod +x scripts/*.sh

# Run deployment
./scripts/deploy.sh
```

**Or use the automated script** (after cloning):
```bash
cd ~/scloud-app
bash scripts/deploy.sh
```

### Step 5: Configure Environment

**Edit backend .env file:**
```bash
cd ~/scloud-app/backend
nano .env
```

Add your AWS credentials:
```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=YOUR_ACCESS_KEY_HERE
AWS_SECRET_ACCESS_KEY=YOUR_SECRET_KEY_HERE
S3_BUCKET_NAME=scloud-files-YOUR_NAME
DYNAMODB_USERS_TABLE=scloud-users
DYNAMODB_FILES_TABLE=scloud-files
PORT=3001
NODE_ENV=production
FRONTEND_URL=http://YOUR_EC2_IP
JWT_SECRET=$(openssl rand -base64 32)
```

Save: `Ctrl+O`, Enter, `Ctrl+X`

**Restart backend:**
```bash
pm2 restart scloud-backend
```

**Access your app:**
```
http://YOUR_EC2_IP
```

🎉 **Done!** Your SCloud app is live!

---

## Detailed Deployment Guide

For complete step-by-step instructions, see **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)**

Topics covered:
- Detailed AWS setup
- Security best practices
- SSL/HTTPS setup
- Domain configuration
- Cost optimization
- Monitoring and maintenance

---

## Local Development

### Backend Development

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit with your AWS credentials
nano .env

# Run in development mode
npm run dev
```

Backend runs at: http://localhost:3001

### Frontend Development

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env
nano .env
```

Add:
```env
VITE_API_URL=http://localhost:3001/api
VITE_USE_MOCK_MODE=false
```

```bash
# Run development server
npm run dev
```

Frontend runs at: http://localhost:3000

### Test the Integration

1. Start backend: `cd backend && npm run dev`
2. Start frontend: `npm run dev`
3. Open http://localhost:3000
4. Register a new account
5. Upload a test file
6. Verify file appears in S3 bucket
7. Check DynamoDB tables for metadata

---

## Project Structure

```
scloud-app/
├── backend/                    # Backend API server
│   ├── config/                 # AWS configuration
│   ├── middleware/             # Auth middleware
│   ├── routes/                 # API routes
│   ├── services/               # S3 and DynamoDB services
│   ├── server.js               # Main server file
│   ├── package.json
│   └── .env.example
├── src/                        # Frontend source
│   ├── components/             # React components
│   ├── lib/                    # Services and utilities
│   │   ├── auth-service-real.ts
│   │   ├── s3-service-real.ts
│   │   └── api-config.ts
│   └── App.tsx
├── scripts/                    # Deployment scripts
│   ├── deploy.sh               # Full deployment
│   ├── update.sh               # Quick update
│   ├── setup-ssl.sh            # SSL setup
│   └── backup.sh               # Database backup
├── DEPLOYMENT_GUIDE.md         # Complete deployment guide
├── package.json
└── vite.config.ts
```

---

## Useful Commands

### EC2 Management

```bash
# Connect to EC2
ssh -i scloud-key.pem ubuntu@YOUR_EC2_IP

# Update application
cd ~/scloud-app
./scripts/update.sh

# View backend logs
pm2 logs scloud-backend

# Check backend status
pm2 status

# Restart backend
pm2 restart scloud-backend

# View Nginx logs
sudo tail -f /var/log/nginx/error.log
```

### Git Workflow

```bash
# After making changes locally
git add .
git commit -m "Your commit message"
git push origin main

# Then on EC2
cd ~/scloud-app
git pull origin main
./scripts/update.sh
```

---

## Troubleshooting

### Backend won't start

```bash
# Check logs
pm2 logs scloud-backend

# Common issues:
# 1. Missing .env file
cd ~/scloud-app/backend
cp .env.example .env
nano .env  # Add your AWS credentials

# 2. Wrong AWS credentials
nano .env  # Verify credentials

# 3. Port already in use
pm2 delete scloud-backend
pm2 start server.js --name scloud-backend
```

### Files not uploading

```bash
# Check S3 bucket CORS configuration
# Check AWS credentials in .env
# Check backend logs: pm2 logs scloud-backend
```

### Frontend shows 502 Bad Gateway

```bash
# Check if backend is running
pm2 status

# Check Nginx configuration
sudo nginx -t

# Restart services
pm2 restart scloud-backend
sudo systemctl restart nginx
```

### Can't connect to EC2

```bash
# Check security group allows your IP on port 22
# Verify you're using correct key file
# Verify key permissions: chmod 400 scloud-key.pem
```

---

## Cost Estimation

### AWS Free Tier (First 12 Months)
- ✅ EC2: 750 hours/month of t2.micro
- ✅ S3: 5 GB storage + 20,000 GET requests
- ✅ DynamoDB: 25 GB storage + 200M requests

### After Free Tier
- EC2 t2.small: ~$15/month
- S3: ~$0.023/GB/month
- DynamoDB: On-demand pricing (~$0.25/GB/month)
- **Total**: ~$20-30/month for small usage

---

## Next Steps

1. ✅ **Setup SSL:** `./scripts/setup-ssl.sh yourdomain.com`
2. ✅ **Setup monitoring:** CloudWatch alarms
3. ✅ **Setup backups:** `./scripts/backup.sh`
4. ✅ **Add CI/CD:** GitHub Actions
5. ✅ **Implement file sharing**
6. ✅ **Add file previews**
7. ✅ **Setup storage quotas**

---

## Support

- 📖 **Full Documentation:** [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- 📖 **Backend API:** [backend/README.md](./backend/README.md)
- 🌐 **AWS Documentation:** https://docs.aws.amazon.com/
- 💬 **Issues:** Open an issue on GitHub

---

## Security Checklist

Before going to production:

- [ ] Enable MFA on AWS root account
- [ ] Use IAM user (not root) for programmatic access
- [ ] Restrict security group rules to necessary ports
- [ ] Setup HTTPS with SSL certificate
- [ ] Never commit `.env` files to Git
- [ ] Use strong JWT secret (generated randomly)
- [ ] Enable S3 bucket versioning
- [ ] Setup CloudWatch logging
- [ ] Regular security audits
- [ ] Keep system and dependencies updated

---

**Need help?** See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions!

---

Made with ❤️ for cloud storage
