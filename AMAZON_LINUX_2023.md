# Amazon Linux 2023 - Deployment Notes

## Key Differences from Ubuntu

Amazon Linux 2023 uses different package manager and some commands:

### Package Manager
- **Ubuntu:** `apt` / `apt-get`
- **Amazon Linux 2023:** `dnf` (replacement for `yum`)

### Install Commands

**Node.js 20.x:**
```bash
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo dnf install -y nodejs
```

**Git and Nginx:**
```bash
sudo dnf install -y git nginx
```

**PM2:**
```bash
sudo npm install -g pm2
```

**Certbot (SSL):**
```bash
sudo dnf install -y certbot python3-certbot-nginx
```

### Nginx Configuration

Same as Ubuntu, but service commands:
```bash
sudo systemctl start nginx
sudo systemctl enable nginx
sudo systemctl restart nginx
sudo systemctl status nginx
```

### Firewall (Amazon Linux 2023)

Amazon Linux 2023 doesn't use UFW, but you can use firewalld:

```bash
# If you need to configure local firewall
sudo systemctl start firewalld
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

**Note:** EC2 Security Groups handle most firewall rules, so this is usually not needed.

### User Differences

- **Ubuntu EC2:** Default user is `ubuntu`
- **Amazon Linux 2023:** Default user is `ec2-user` (but you're using root)

### File Paths

If you're using root user, home directory is `/root` instead of `/home/ec2-user` or `/home/ubuntu`.

Update the scripts to use:
```bash
APP_DIR="/root/scloud-app"
```

Instead of:
```bash
APP_DIR="/home/ubuntu/scloud-app"
```

### AWS CLI

**Good news:** AWS CLI v2 is pre-installed on Amazon Linux 2023! ✅

No need to install it separately.

### System Updates

```bash
# Amazon Linux 2023
sudo dnf update -y

# Ubuntu
sudo apt update && sudo apt upgrade -y
```

---

## Updated Deployment Commands for Amazon Linux 2023 (Root User)

### Connect to EC2:
```bash
ssh -i scloud-key.pem ec2-user@YOUR_EC2_IP
sudo su -  # Switch to root
```

Or directly as root (if configured):
```bash
ssh -i scloud-key.pem root@YOUR_EC2_IP
```

### Deploy:
```bash
# Update system
dnf update -y

# Install Node.js
curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
dnf install -y nodejs

# Install tools
dnf install -y git nginx

# Install PM2
npm install -g pm2

# Clone repository
cd /root
git clone https://github.com/aatef14/SCloud.git scloud-app
cd scloud-app

# Make scripts executable
chmod +x scripts/*.sh

# Install backend dependencies
cd backend
npm install
cp .env.example .env
nano .env  # Add AWS credentials

# Install frontend dependencies and build
cd ..
npm install
npm run build

# Start backend with PM2
cd backend
pm2 start server.js --name scloud-backend
pm2 save
pm2 startup
# Run the command it outputs

# Configure Nginx
sudo bash -c 'cat > /etc/nginx/conf.d/scloud.conf << EOF
server {
    listen 80;
    server_name _;

    # Frontend
    location / {
        root /root/scloud-app/build;
        index index.html;
        try_files \$uri \$uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF'

# Test and start Nginx
sudo nginx -t
sudo systemctl start nginx
sudo systemctl enable nginx
```

---

## Scripts Updated for Amazon Linux 2023

The following scripts have been updated:
- ✅ `scripts/deploy.sh` - Uses `dnf` instead of `apt`
- ✅ `scripts/setup-ssl.sh` - Uses `dnf` for Certbot
- ✅ `scripts/backup.sh` - References correct AWS CLI install command

**All scripts now support Amazon Linux 2023!**

---

## Important: Update App Directory

Since you're using root user, update the directory in deploy script:

Change from:
```bash
APP_DIR="/home/ubuntu/scloud-app"
```

To:
```bash
APP_DIR="/root/scloud-app"
```

This is already handled in the scripts, but keep it in mind for manual commands.

---

**You're all set for Amazon Linux 2023!** 🚀
