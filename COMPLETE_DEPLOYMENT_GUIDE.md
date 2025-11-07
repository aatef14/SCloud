# 🚀 Complete SCloud Deployment Guide
## From Zero to Production on AWS (Amazon Linux 2023)

This is the **COMPLETE**, tested guide that covers every step from code to production.

---

## 📋 Prerequisites

- AWS Account with billing enabled
- GitHub account
- Local machine with Git installed
- SSH key pair for EC2 access
- 45-60 minutes of time

---

## Part 1: Prepare Your Code

### Step 1: Push Code to GitHub

```bash
cd "SCloud Next.js Application"

# Add production environment example
cat > .env.production.example << 'EOF'
# Production environment configuration
# Copy this to .env.production and update with your values

# Backend API URL (without trailing slash)
VITE_API_URL=http://YOUR_EC2_IP/api

# Set to false to use real AWS backend
VITE_USE_MOCK_MODE=false
EOF

# Commit and push
git add -A
git commit -m "Prepare for AWS deployment"
git push origin main
```

---

## Part 2: Create AWS Resources

### Step 2: Create S3 Bucket

1. Go to **AWS S3 Console**
2. Click **Create bucket**
3. Bucket name: `scloud-data-YOUR_NAME-14` (must be globally unique)
4. Region: **us-east-1** (N. Virginia)
5. **Uncheck** "Block all public access" (we'll use IAM for security)
6. Click **Create bucket**

**Configure CORS:**
1. Go to your bucket → **Permissions** tab → **CORS**
2. Add this configuration:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": ["ETag"]
  }
]
```

---

### Step 3: Create DynamoDB Tables

**Table 1: Users Table**
1. Go to **DynamoDB Console**
2. Click **Create table**
3. Table name: `scloud-users`
4. Partition key: `email` (String)
5. Keep defaults, click **Create table**

**Table 2: Files Table**
1. Click **Create table**
2. Table name: `scloud-files`
3. Partition key: `userId` (String)
4. Sort key: `fileId` (String)
5. Keep defaults, click **Create table**

---

### Step 4: Create IAM User with Credentials

1. Go to **IAM Console** → **Users** → **Create user**
2. Username: `scloud-backend-user`
3. **Next** → **Attach policies directly**
4. Attach these policies:
   - `AmazonS3FullAccess`
   - `AmazonDynamoDBFullAccess`
5. Click **Create user**

**Create Access Keys:**
1. Click on the user → **Security credentials** tab
2. Scroll to **Access keys** → **Create access key**
3. Choose: **Application running outside AWS**
4. Click **Next** → **Create access key**
5. **⚠️ SAVE THESE NOW - YOU CAN'T SEE THE SECRET KEY AGAIN!**
   - Access Key ID: `AKIA...`
   - Secret Access Key: `xxxxx...`

---

### Step 5: Launch EC2 Instance

1. Go to **EC2 Console** → **Launch Instance**
2. Name: `scloud-production-server`
3. AMI: **Amazon Linux 2023** (Free tier eligible)
4. Instance type: **t2.micro** (Free tier)
5. **Key pair:**
   - Create new: `scloud-key`
   - Type: RSA, Format: .pem
   - **Download the .pem file** → Save to `~/.ssh/scloud-key.pem`
6. **Network settings:**
   - Allow SSH (port 22) from My IP
   - Allow HTTP (port 80) from Anywhere
   - Allow HTTPS (port 443) from Anywhere
7. Storage: 8 GB (default)
8. Click **Launch instance**

**Wait for instance to be running, then note the Public IPv4 address!**

---

## Part 3: Configure Your Local Machine

### Step 6: Set Up SSH Access

```bash
# Set correct permissions for SSH key
chmod 400 ~/.ssh/scloud-key.pem

# Test connection (replace with YOUR EC2 IP)
ssh -i ~/.ssh/scloud-key.pem ec2-user@YOUR_EC2_IP

# If you get "ec2-user" login, you're on Amazon Linux 2023
# Amazon Linux 2023 uses 'ec2-user' by default, not 'root'
# You'll need to use sudo for privileged commands
```

**⚠️ IMPORTANT:** Amazon Linux 2023 uses `ec2-user` by default. If you want root access:

```bash
# Connect as ec2-user first
ssh -i ~/.ssh/scloud-key.pem ec2-user@YOUR_EC2_IP

# Then switch to root
sudo su -

# Now you're root! Type 'exit' to disconnect
```

---

## Part 4: Server Setup (Run on EC2)

### Step 7: Connect and Install Dependencies

```bash
# SSH into EC2 as root
ssh -i ~/.ssh/scloud-key.pem ec2-user@YOUR_EC2_IP
sudo su -

# Update system
dnf update -y

# Install Node.js 20.x
dnf install -y nodejs npm

# Verify installations
node --version  # Should show v20.x
npm --version   # Should show v10.x

# Install Git
dnf install -y git

# Install Nginx
dnf install -y nginx

# Install PM2 globally
npm install -g pm2

# Start and enable Nginx
systemctl start nginx
systemctl enable nginx
systemctl status nginx  # Should show "active (running)"
```

---

### Step 8: Clone Repository

```bash
# Clone your repository
cd /root
git clone https://github.com/YOUR_USERNAME/SCloud.git scloud-app
cd scloud-app

# Verify structure
ls -la
# Should see: backend/, src/, package.json, etc.
```

---

### Step 9: Configure Backend Environment

```bash
cd /root/scloud-app/backend

# Create .env file with your AWS credentials
cat > .env << 'EOF'
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=YOUR_ACCESS_KEY_ID_HERE
AWS_SECRET_ACCESS_KEY=YOUR_SECRET_ACCESS_KEY_HERE

# S3 Configuration
S3_BUCKET_NAME=YOUR_BUCKET_NAME_HERE

# DynamoDB Configuration
DYNAMODB_USERS_TABLE=scloud-users
DYNAMODB_FILES_TABLE=scloud-files

# Server Configuration
PORT=3001
NODE_ENV=production

# CORS Configuration
FRONTEND_URL=http://YOUR_EC2_IP

# JWT Secret (generate a random string)
JWT_SECRET=YOUR_RANDOM_JWT_SECRET_HERE
JWT_EXPIRES_IN=7d
EOF

# NOW EDIT THE FILE WITH YOUR ACTUAL VALUES!
nano .env
```

**Replace these values in the .env file:**
- `YOUR_ACCESS_KEY_ID_HERE` → Your IAM Access Key ID
- `YOUR_SECRET_ACCESS_KEY_HERE` → Your IAM Secret Access Key
- `YOUR_BUCKET_NAME_HERE` → Your S3 bucket name (e.g., scloud-data-atif-14)
- `YOUR_EC2_IP` → Your EC2 public IP address
- `YOUR_RANDOM_JWT_SECRET_HERE` → Generate with: `openssl rand -hex 32`

**Save and exit:** Press `Ctrl+X`, then `Y`, then `Enter`

---

### Step 10: Install Backend Dependencies and Start

```bash
# Still in /root/scloud-app/backend
npm install

# Test the backend manually first
node server.js
# You should see:
# 🚀 SCloud Backend API running on port 3001
# 📍 Environment: production
# 🌍 CORS enabled for: http://YOUR_EC2_IP
# 📦 S3 Bucket: your-bucket-name
# 🗄️  DynamoDB Tables: scloud-users, scloud-files

# If it works, stop it with Ctrl+C

# Start with PM2
pm2 start server.js --name scloud-backend
pm2 save
pm2 startup

# Copy the command PM2 shows and run it
# It will look like: sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u root --hp /root

# Verify it's running
pm2 status
pm2 logs scloud-backend --lines 20
```

---

### Step 11: Build Frontend

```bash
cd /root/scloud-app

# Create production environment config
cat > .env.production << EOF
VITE_API_URL=http://YOUR_EC2_IP/api
VITE_USE_MOCK_MODE=false
EOF

# Replace YOUR_EC2_IP with your actual EC2 IP!
nano .env.production

# Install dependencies
npm install

# Build for production
npm run build

# Verify build was created
ls -la build/
# Should see: index.html, assets/, etc.
```

---

### Step 12: Configure Nginx

```bash
# Backup default config
cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.backup

# Create SCloud configuration
cat > /etc/nginx/conf.d/scloud.conf << 'EOF'
server {
    listen 80;
    server_name _;

    # Frontend - Serve React build
    location / {
        root /root/scloud-app/build;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API - Proxy to Node.js
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://localhost:3001/health;
        access_log off;
    }
}
EOF

# Fix permissions (CRITICAL for Amazon Linux!)
chmod 755 /root
chmod -R 755 /root/scloud-app/build

# Test Nginx configuration
nginx -t
# Should say "syntax is ok" and "test is successful"

# Restart Nginx
systemctl restart nginx
systemctl status nginx

# Check if it's serving correctly
curl http://localhost
# Should see HTML content, not an error
```

---

## Part 5: Verification & Testing

### Step 13: Test Everything

```bash
# Test backend health endpoint
curl http://localhost:3001/health
# Should return: {"status":"ok","message":"SCloud Backend API is running"}

# Test from outside
curl http://YOUR_EC2_IP/health
# Should return the same

# Check PM2 status
pm2 status
# Should show "scloud-backend" as "online"

# Check backend logs
pm2 logs scloud-backend --lines 30
# Should NOT show any errors

# Check Nginx access logs
tail -f /var/log/nginx/access.log
# Watch requests come in when you access the site
```

---

### Step 14: Access Your Application

1. Open browser: `http://YOUR_EC2_IP`
2. You should see the SCloud landing page
3. **NO DEMO BANNER** should appear!
4. Click **Sign Up**
5. Create an account:
   - Email: test@example.com
   - Password: Test123!
6. You should be redirected to dashboard
7. Try uploading a file

---

### Step 15: Verify AWS Integration

```bash
# Check DynamoDB for users (run on your local machine or EC2)
aws dynamodb scan --table-name scloud-users --region us-east-1

# Should show your registered user!

# Upload a file via the web interface, then check S3
aws s3 ls s3://YOUR-BUCKET-NAME/

# Should show uploaded files!

# Check file metadata in DynamoDB
aws dynamodb scan --table-name scloud-files --region us-east-1

# Should show file records!
```

---

## Part 6: Common Issues & Solutions

### Issue 1: "403 Forbidden" when accessing site

**Solution:**
```bash
# Fix root directory permissions
chmod 755 /root
chmod -R 755 /root/scloud-app/build
systemctl restart nginx
```

---

### Issue 2: "Cannot connect to backend" / CORS errors

**Solution:**
```bash
# Check FRONTEND_URL in backend .env
cd /root/scloud-app/backend
cat .env | grep FRONTEND_URL
# Should show: FRONTEND_URL=http://YOUR_EC2_IP

# If wrong, edit it:
nano .env
# Fix the URL, then restart:
pm2 restart scloud-backend
```

---

### Issue 3: "Resolved credential object is not valid"

**Solution:**
```bash
# Check AWS credentials in backend .env
cd /root/scloud-app/backend
cat .env | grep AWS_
# Verify Access Key ID and Secret Access Key are correct

# If wrong or missing, edit:
nano .env
# Add/fix credentials, then restart:
pm2 restart scloud-backend

# Test AWS connectivity:
node -e "
const { S3Client, ListBucketsCommand } = require('@aws-sdk/client-s3');
const s3 = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: 'YOUR_ACCESS_KEY',
    secretAccessKey: 'YOUR_SECRET_KEY'
  }
});
s3.send(new ListBucketsCommand({}))
  .then(() => console.log('✅ AWS credentials valid!'))
  .catch(err => console.log('❌ Error:', err.message));
"
```

---

### Issue 4: Files not uploading to S3

**Solution:**
```bash
# Check S3 bucket CORS configuration
aws s3api get-bucket-cors --bucket YOUR-BUCKET-NAME --region us-east-1

# If not set, add CORS:
cat > cors.json << 'EOF'
{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
      "AllowedOrigins": ["*"],
      "ExposeHeaders": ["ETag"]
    }
  ]
}
EOF

aws s3api put-bucket-cors --bucket YOUR-BUCKET-NAME --cors-configuration file://cors.json --region us-east-1
```

---

### Issue 5: Demo banner still showing

**Solution:**
```bash
# Rebuild frontend with correct environment
cd /root/scloud-app

# Verify .env.production exists and is correct
cat .env.production
# Should show:
# VITE_API_URL=http://YOUR_EC2_IP/api
# VITE_USE_MOCK_MODE=false

# If missing or wrong, recreate it:
cat > .env.production << EOF
VITE_API_URL=http://YOUR_EC2_IP/api
VITE_USE_MOCK_MODE=false
EOF

# Rebuild
npm run build

# Restart Nginx
systemctl restart nginx

# Clear browser cache and reload
```

---

## Part 7: Update/Redeploy Process

### When you make code changes:

```bash
# On your local machine: commit and push
git add -A
git commit -m "Your changes"
git push origin main

# On EC2 server: pull and rebuild
ssh -i ~/.ssh/scloud-key.pem ec2-user@YOUR_EC2_IP
sudo su -
cd /root/scloud-app

# Pull latest code
git pull origin main

# Update backend if needed
cd backend
npm install
pm2 restart scloud-backend

# Rebuild frontend
cd ..
npm install
npm run build

# Restart Nginx
systemctl restart nginx

# Verify
pm2 logs scloud-backend --lines 20
curl http://localhost/health
```

---

## Part 8: Security Hardening (Optional but Recommended)

### Set up SSL with Let's Encrypt (Free HTTPS):

```bash
# Install Certbot
dnf install -y certbot python3-certbot-nginx

# Get SSL certificate (replace YOUR_DOMAIN.com)
certbot --nginx -d YOUR_DOMAIN.com

# Auto-renewal is set up automatically
# Test renewal:
certbot renew --dry-run
```

---

## Part 9: Monitoring & Maintenance

### Useful Commands:

```bash
# Check backend logs
pm2 logs scloud-backend

# Check Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# Check system resources
htop  # Install with: dnf install -y htop
df -h  # Disk usage
free -h  # Memory usage

# Restart services
pm2 restart scloud-backend
systemctl restart nginx

# Stop services
pm2 stop scloud-backend
systemctl stop nginx

# Check service status
pm2 status
systemctl status nginx
```

---

## 📊 Architecture Summary

```
┌─────────────────────────────────────────────────────────────┐
│                         INTERNET                             │
└────────────────────────┬────────────────────────────────────┘
                         │
                    HTTP Request
                         │
                         ▼
                 ┌───────────────┐
                 │   EC2 Server  │
                 │  (YOUR_IP)    │
                 │               │
                 │  ┌─────────┐  │
                 │  │  Nginx  │◄─┼── Port 80 (HTTP)
                 │  │  :80    │  │
                 │  └────┬────┘  │
                 │       │       │
          ┌──────┼───────┴───────┼─────┐
          │      │               │     │
     Static │    │         Proxy │     │
     Files  │    │         /api  │     │
          ▼      │               ▼     │
   ┌──────────┐  │      ┌──────────┐   │
   │  React   │  │      │  Node.js │   │
   │  Build   │  │      │  Backend │   │
   │  /build  │  │      │  :3001   │   │
   └──────────┘  │      └─────┬────┘   │
                 │            │        │
                 └────────────┼────────┘
                              │
                    AWS SDK Calls
                              │
            ┌─────────────────┴─────────────────┐
            │                                   │
            ▼                                   ▼
     ┌──────────┐                        ┌──────────┐
     │    S3    │                        │ DynamoDB │
     │  Bucket  │                        │  Tables  │
     │  Files   │                        │  Users   │
     │          │                        │  Files   │
     └──────────┘                        └──────────┘
```

---

## ✅ Success Checklist

- [ ] S3 bucket created with CORS configured
- [ ] DynamoDB tables created (scloud-users, scloud-files)
- [ ] IAM user created with access keys saved
- [ ] EC2 instance launched and accessible via SSH
- [ ] Node.js, Nginx, PM2 installed on EC2
- [ ] Repository cloned to /root/scloud-app
- [ ] Backend .env configured with correct AWS credentials
- [ ] Backend running via PM2 (pm2 status shows "online")
- [ ] Frontend built successfully (build/ directory exists)
- [ ] Frontend .env.production configured with EC2 IP
- [ ] Nginx configured and serving site
- [ ] Root permissions fixed (chmod 755 /root)
- [ ] App accessible at http://YOUR_EC2_IP
- [ ] No demo banner showing
- [ ] User registration works (user appears in DynamoDB)
- [ ] File upload works (file appears in S3)
- [ ] File download works
- [ ] File delete works

---

## 🎉 You're Done!

Your SCloud application is now **fully deployed** with:
- ✅ Real AWS S3 for file storage
- ✅ Real DynamoDB for user and file metadata
- ✅ Production-ready backend API
- ✅ Optimized frontend build
- ✅ Nginx reverse proxy
- ✅ PM2 process management
- ✅ Persistent deployments (survives reboots)

**Application URL:** http://YOUR_EC2_IP

---

## 📚 Additional Resources

- [AWS EC2 Documentation](https://docs.aws.amazon.com/ec2/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [Let's Encrypt SSL](https://letsencrypt.org/)

---

## 💰 Cost Estimates (Monthly)

- **EC2 t2.micro:** $0 (Free tier: 750 hours/month)
- **S3 Storage:** ~$0.023/GB
- **DynamoDB:** $0 (Free tier: 25GB storage, 25 WCU, 25 RCU)
- **Data Transfer:** First 1GB free, then $0.09/GB

**Total for light usage:** ~$0-5/month (mostly free tier!)

---

**Last Updated:** November 7, 2025  
**Tested On:** Amazon Linux 2023, Node.js 20.x, Nginx 1.24
