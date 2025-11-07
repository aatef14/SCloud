# Complete AWS Deployment Guide for SCloud

This guide will take you from local development to a fully deployed application using AWS S3, DynamoDB, and EC2.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Step 1: Push Code to Git Repository](#step-1-push-code-to-git-repository)
3. [Step 2: AWS Account Setup](#step-2-aws-account-setup)
4. [Step 3: Create S3 Bucket](#step-3-create-s3-bucket)
5. [Step 4: Create DynamoDB Tables](#step-4-create-dynamodb-tables)
6. [Step 5: Create IAM User](#step-5-create-iam-user)
7. [Step 6: Launch EC2 Instance](#step-6-launch-ec2-instance)
8. [Step 7: Deploy Backend to EC2](#step-7-deploy-backend-to-ec2)
9. [Step 8: Deploy Frontend to EC2](#step-8-deploy-frontend-to-ec2)
10. [Step 9: Configure Domain (Optional)](#step-9-configure-domain-optional)
11. [Step 10: Setup SSL Certificate](#step-10-setup-ssl-certificate)
12. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before starting, ensure you have:
- ✅ An AWS Account with billing enabled
- ✅ Git installed on your local machine
- ✅ GitHub/GitLab account (or any Git hosting service)
- ✅ Basic knowledge of terminal/command line
- ✅ SSH key pair for secure access

**Estimated Costs:**
- S3: ~$0.023/GB per month (first 50 TB)
- DynamoDB: Free tier: 25 GB storage + 200M requests/month
- EC2 t2.micro: Free tier eligible (750 hours/month for 12 months)
- After free tier: ~$8-10/month for t2.micro instance

---

## Step 1: Push Code to Git Repository

### 1.1 Initialize Git Repository (if not already done)

```bash
cd "/root/figma/SCloud Next.js Application"
git init
```

### 1.2 Create .gitignore file

```bash
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Build outputs
dist/
build/
.vite/

# Environment variables
.env
.env.local
.env.production
.env.development

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log

# Backend
backend/node_modules/
backend/.env
backend/dist/

# Temporary files
*.tmp
.cache/
EOF
```

### 1.3 Create GitHub Repository

1. Go to https://github.com/new
2. Create a new repository named `scloud-app` (or your preferred name)
3. Do NOT initialize with README (we already have code)

### 1.4 Add and Commit Files

```bash
git add .
git commit -m "Initial commit: SCloud application"
```

### 1.5 Push to GitHub

```bash
# Replace <your-username> with your GitHub username
git remote add origin https://github.com/<your-username>/scloud-app.git
git branch -M main
git push -u origin main
```

**Alternative: Using SSH**
```bash
git remote add origin git@github.com:<your-username>/scloud-app.git
git branch -M main
git push -u origin main
```

---

## Step 2: AWS Account Setup

### 2.1 Create AWS Account
1. Go to https://aws.amazon.com/
2. Click "Create an AWS Account"
3. Follow the registration process
4. Add payment method (required, but free tier available)
5. Verify your identity

### 2.2 Choose AWS Region
- Pick a region close to your users
- Recommended: `us-east-1` (N. Virginia) - most services available
- Note: Keep the same region for ALL services

### 2.3 Enable MFA (Multi-Factor Authentication) - HIGHLY RECOMMENDED
1. Go to IAM Console → My Security Credentials
2. Enable MFA for your root account
3. Use Google Authenticator or similar app

---

## Step 3: Create S3 Bucket

### 3.1 Create Bucket via AWS Console

1. Go to **S3 Console**: https://console.aws.amazon.com/s3/
2. Click **"Create bucket"**
3. Configure:
   - **Bucket name**: `scloud-files-bucket-<your-unique-id>` (must be globally unique)
   - **Region**: `us-east-1` (or your chosen region)
   - **Block Public Access**: Keep all boxes CHECKED (for security)
   - **Bucket Versioning**: Enable (recommended)
   - **Encryption**: Enable Server-Side Encryption (SSE-S3)
4. Click **"Create bucket"**

### 3.2 Configure CORS

1. Open your newly created bucket
2. Go to **Permissions** tab
3. Scroll to **Cross-origin resource sharing (CORS)**
4. Click **Edit**
5. Paste this configuration:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": ["ETag", "x-amz-server-side-encryption", "x-amz-request-id"],
    "MaxAgeSeconds": 3000
  }
]
```

6. Click **Save changes**

**Note**: For production, replace `"AllowedOrigins": ["*"]` with your actual domain:
```json
"AllowedOrigins": ["https://yourdomain.com"]
```

### 3.3 Create Folder Structure (Optional)

S3 doesn't have real folders, but we'll use prefixes:
- Files will be stored as: `users/{userId}/{fileId}-{filename}`

---

## Step 4: Create DynamoDB Tables

### 4.1 Create Users Table

1. Go to **DynamoDB Console**: https://console.aws.amazon.com/dynamodb/
2. Click **"Create table"**
3. Configure:
   - **Table name**: `scloud-users`
   - **Partition key**: `email` (String)
   - **Table settings**: Use default settings (On-demand pricing recommended)
4. Click **"Create table"**

### 4.2 Create Files Table

1. Click **"Create table"** again
2. Configure:
   - **Table name**: `scloud-files`
   - **Partition key**: `userId` (String)
   - **Sort key**: `fileId` (String)
   - **Table settings**: Use default settings (On-demand pricing)
3. Click **"Create table"**

### 4.3 Create Global Secondary Index (GSI) for Files Table

1. Open the `scloud-files` table
2. Go to **Indexes** tab
3. Click **"Create index"**
4. Configure:
   - **Partition key**: `fileId` (String)
   - **Index name**: `fileId-index`
   - **Projected attributes**: All
5. Click **"Create index"**

Wait for the index status to become "ACTIVE" (usually takes 1-2 minutes)

---

## Step 5: Create IAM User

### 5.1 Create IAM User with Programmatic Access

1. Go to **IAM Console**: https://console.aws.amazon.com/iam/
2. Click **"Users"** → **"Create user"**
3. Configure:
   - **User name**: `scloud-backend-user`
   - Click **"Next"**

### 5.2 Set Permissions

1. Select **"Attach policies directly"**
2. Search and select:
   - ✅ `AmazonS3FullAccess`
   - ✅ `AmazonDynamoDBFullAccess`
3. Click **"Next"** → **"Create user"**

### 5.3 Create Access Keys

1. Click on the newly created user `scloud-backend-user`
2. Go to **"Security credentials"** tab
3. Scroll to **"Access keys"**
4. Click **"Create access key"**
5. Select **"Application running on AWS compute service"**
6. Click **"Next"** → **"Create access key"**
7. **IMPORTANT**: Download or copy:
   - Access Key ID
   - Secret Access Key
   - You won't be able to see the secret again!

### 5.4 Create Custom Policy (Production Best Practice)

For better security, create a custom policy instead of using full access:

1. Go to IAM → Policies → Create policy
2. Use the JSON editor:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "S3BucketAccess",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::scloud-files-bucket-<your-unique-id>",
        "arn:aws:s3:::scloud-files-bucket-<your-unique-id>/*"
      ]
    },
    {
      "Sid": "DynamoDBAccess",
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem",
        "dynamodb:Query",
        "dynamodb:Scan"
      ],
      "Resource": [
        "arn:aws:dynamodb:us-east-1:*:table/scloud-users",
        "arn:aws:dynamodb:us-east-1:*:table/scloud-files",
        "arn:aws:dynamodb:us-east-1:*:table/scloud-files/index/*"
      ]
    }
  ]
}
```

3. Name it: `SCloudBackendPolicy`
4. Attach this policy to your IAM user instead of the full access policies

---

## Step 6: Launch EC2 Instance

### 6.1 Launch Instance

1. Go to **EC2 Console**: https://console.aws.amazon.com/ec2/
2. Click **"Launch Instance"**
3. Configure:

**Step 1: Name and Tags**
- Name: `scloud-server`

**Step 2: Choose AMI (Amazon Machine Image)**
- Select: **Ubuntu Server 22.04 LTS (Free tier eligible)**

**Step 3: Choose Instance Type**
- Select: **t2.medium** (recommended) or **t2.small** (minimum)
- Note: t2.micro might be too small for running both frontend and backend

**Step 4: Key Pair**
- Click **"Create new key pair"**
- Name: `scloud-key`
- Type: RSA
- Format: `.pem` (for Mac/Linux) or `.ppk` (for PuTTY on Windows)
- Download and save securely!

**Step 5: Network Settings**
- Create security group: `scloud-sg`
- Allow SSH (port 22) from your IP
- Allow HTTP (port 80) from anywhere (0.0.0.0/0)
- Allow HTTPS (port 443) from anywhere (0.0.0.0/0)
- Allow Custom TCP (port 3001) for backend API from anywhere (0.0.0.0/0)

**Step 6: Configure Storage**
- Size: **20 GB** (recommended)
- Volume Type: General Purpose SSD (gp3)

4. Click **"Launch Instance"**

### 6.2 Allocate Elastic IP (Recommended)

1. In EC2 Console, go to **"Elastic IPs"**
2. Click **"Allocate Elastic IP address"**
3. Click **"Allocate"**
4. Select the new IP → Actions → **"Associate Elastic IP address"**
5. Select your `scloud-server` instance
6. Click **"Associate"**

This gives your server a permanent IP address.

### 6.3 Connect to EC2 Instance

**For Mac/Linux:**
```bash
chmod 400 ~/Downloads/scloud-key.pem
ssh -i ~/Downloads/scloud-key.pem ubuntu@<your-elastic-ip>
```

**For Windows (using PuTTY):**
1. Open PuTTY
2. Host: `ubuntu@<your-elastic-ip>`
3. Connection → SSH → Auth → Browse for your `.ppk` file
4. Click Open

---

## Step 7: Deploy Backend to EC2

### 7.1 Install Node.js on EC2

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version
```

### 7.2 Install Additional Tools

```bash
# Install Git
sudo apt install -y git

# Install PM2 (process manager)
sudo npm install -g pm2

# Install Nginx (web server)
sudo apt install -y nginx
```

### 7.3 Clone Your Repository

```bash
cd ~
git clone https://github.com/<your-username>/scloud-app.git
cd scloud-app
```

### 7.4 Set Up Backend

The backend code is already created in the `backend/` directory (we'll create it next).

```bash
cd backend
npm install
```

### 7.5 Configure Environment Variables

```bash
nano .env
```

Add the following (replace with your actual values):

```env
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_id_here
AWS_SECRET_ACCESS_KEY=your_secret_access_key_here

# S3 Configuration
S3_BUCKET_NAME=scloud-files-bucket-<your-unique-id>

# DynamoDB Configuration
DYNAMODB_USERS_TABLE=scloud-users
DYNAMODB_FILES_TABLE=scloud-files

# Server Configuration
PORT=3001
NODE_ENV=production

# CORS Configuration
FRONTEND_URL=http://<your-elastic-ip>
```

Save: `Ctrl+O`, Enter, `Ctrl+X`

### 7.6 Start Backend with PM2

```bash
# Start the backend
pm2 start server.js --name scloud-backend

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup

# Follow the command it gives you (usually starts with 'sudo')
```

### 7.7 Verify Backend is Running

```bash
pm2 status
pm2 logs scloud-backend

# Test the API
curl http://localhost:3001/health
```

---

## Step 8: Deploy Frontend to EC2

### 8.1 Build Frontend

```bash
cd ~/scloud-app
npm install
npm run build
```

This creates a `build/` directory with optimized production files.

### 8.2 Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/scloud
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name <your-elastic-ip>;

    # Frontend
    location / {
        root /home/ubuntu/scloud-app/build;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Save and exit.

### 8.3 Enable Site and Restart Nginx

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/scloud /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Enable Nginx to start on boot
sudo systemctl enable nginx
```

### 8.4 Test the Application

Open your browser and go to:
```
http://<your-elastic-ip>
```

You should see the SCloud landing page!

---

## Step 9: Configure Domain (Optional)

### 9.1 Register a Domain

Register a domain from:
- Namecheap (https://www.namecheap.com/)
- GoDaddy (https://www.godaddy.com/)
- AWS Route 53 (https://aws.amazon.com/route53/)

### 9.2 Point Domain to EC2

Add these DNS records:

**A Record:**
- Type: A
- Name: @ (or leave blank)
- Value: `<your-elastic-ip>`
- TTL: 3600

**CNAME Record (for www):**
- Type: CNAME
- Name: www
- Value: yourdomain.com
- TTL: 3600

### 9.3 Update Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/scloud
```

Change:
```nginx
server_name <your-elastic-ip>;
```

To:
```nginx
server_name yourdomain.com www.yourdomain.com;
```

Restart Nginx:
```bash
sudo nginx -t
sudo systemctl restart nginx
```

### 9.4 Update Backend .env

```bash
cd ~/scloud-app/backend
nano .env
```

Change:
```env
FRONTEND_URL=https://yourdomain.com
```

Restart backend:
```bash
pm2 restart scloud-backend
```

---

## Step 10: Setup SSL Certificate (HTTPS)

### 10.1 Install Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 10.2 Obtain SSL Certificate

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Follow the prompts:
- Enter your email
- Agree to terms
- Choose whether to redirect HTTP to HTTPS (choose Yes)

### 10.3 Auto-Renewal Setup

Certbot automatically sets up renewal. Test it:

```bash
sudo certbot renew --dry-run
```

---

## Maintenance Commands

### Update Application

```bash
cd ~/scloud-app
git pull origin main

# Rebuild frontend
npm install
npm run build

# Restart backend
cd backend
npm install
pm2 restart scloud-backend

# Reload Nginx
sudo systemctl reload nginx
```

### View Logs

```bash
# Backend logs
pm2 logs scloud-backend

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Monitor Server

```bash
# Server resources
htop

# PM2 monitoring
pm2 monit

# Disk usage
df -h

# Memory usage
free -h
```

---

## Troubleshooting

### Backend Not Starting

```bash
pm2 logs scloud-backend --lines 100
```

Check for:
- Missing environment variables
- AWS credentials issues
- Port conflicts

### Frontend Shows 502 Bad Gateway

```bash
# Check if backend is running
pm2 status

# Check Nginx configuration
sudo nginx -t

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

### AWS Permissions Issues

- Verify IAM user has correct policies
- Check AWS credentials in `.env` file
- Verify region matches in all configurations

### Files Not Uploading

- Check S3 bucket CORS configuration
- Verify S3 bucket name in `.env`
- Check backend logs for AWS SDK errors

### Database Errors

- Verify DynamoDB table names are correct
- Check if tables exist in the correct region
- Verify IAM permissions for DynamoDB

---

## Security Checklist

- ✅ Enable MFA on AWS root account
- ✅ Use IAM user (not root) for programmatic access
- ✅ Restrict security group rules to necessary ports
- ✅ Use HTTPS (SSL certificate)
- ✅ Store credentials in `.env` files (never commit to Git)
- ✅ Use strong passwords for user accounts
- ✅ Enable S3 bucket versioning
- ✅ Enable CloudWatch logging
- ✅ Regular security audits with AWS Trusted Advisor
- ✅ Keep system and dependencies updated

---

## Cost Optimization

1. **Use AWS Free Tier** (first 12 months):
   - 750 hours/month of t2.micro EC2
   - 25 GB DynamoDB storage
   - 5 GB S3 storage

2. **Stop EC2 when not in use** (development):
   ```bash
   # From AWS Console or CLI
   aws ec2 stop-instances --instance-ids <instance-id>
   ```

3. **Use S3 Lifecycle Policies**:
   - Move old files to Glacier after 90 days

4. **Monitor costs**:
   - Set up billing alerts in AWS
   - Use AWS Cost Explorer

---

## Next Steps

1. ✅ Set up automated backups (AWS Backup)
2. ✅ Configure CloudWatch alarms
3. ✅ Implement user authentication with JWT tokens
4. ✅ Add file sharing features
5. ✅ Implement file previews
6. ✅ Add user storage limits
7. ✅ Set up CI/CD pipeline (GitHub Actions)

---

## Support Resources

- AWS Documentation: https://docs.aws.amazon.com/
- AWS Support: https://console.aws.amazon.com/support/
- AWS Forums: https://forums.aws.amazon.com/
- Stack Overflow: https://stackoverflow.com/questions/tagged/amazon-web-services

---

**Congratulations!** 🎉 Your SCloud application is now deployed to AWS with real S3 and DynamoDB integration!
