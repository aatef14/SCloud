
  # ☁️ SCloud - Cloud Storage Application

A full-stack cloud storage application (similar to Dropbox/Google Drive) built with React, Node.js, and AWS services.

![Status](https://img.shields.io/badge/status-production--ready-green)
![AWS](https://img.shields.io/badge/AWS-S3%20%7C%20DynamoDB%20%7C%20EC2-orange)
![License](https://img.shields.io/badge/license-MIT-blue)

## 🌟 Features

- 📤 **File Upload & Storage** - Upload files to AWS S3
- 📥 **File Download** - Secure presigned URLs for downloads
- 🗑️ **File Management** - Delete and manage your files
- 🔗 **File Sharing** - Generate shareable links (valid for 24 hours)
- 🔐 **User Authentication** - JWT-based authentication
- 👤 **User Profiles** - Manage user information
- 📱 **Responsive Design** - Works on desktop and mobile
- 🎨 **Modern UI** - Built with shadcn/ui and Tailwind CSS

## 🏗️ Architecture

**Frontend:**
- React 18 + TypeScript
- Vite for build tooling
- React Router for navigation
- Radix UI + Tailwind CSS for UI components
- JWT token-based authentication

**Backend:**
- Node.js + Express
- AWS SDK v3 (S3, DynamoDB)
- JWT authentication
- Bcrypt password hashing
- RESTful API design

**AWS Services:**
- **S3** - File storage
- **DynamoDB** - User data and file metadata
- **EC2** - Application hosting

## 🚀 Quick Start

### Option 1: Demo Mode (Local)

Run the application locally with mock AWS services:

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Visit http://localhost:3000

### Option 2: Full Deployment (Production)

Deploy to AWS with real S3 and DynamoDB:

**📖 See [QUICKSTART.md](./QUICKSTART.md) for 5-step deployment guide**

**📖 See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for complete instructions**

## 📋 Prerequisites

For production deployment:
- AWS Account
- GitHub account
- Basic terminal/command line knowledge
- 30-45 minutes for initial setup

## 🛠️ Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- React Router
- Radix UI
- Tailwind CSS
- shadcn/ui components

### Backend
- Node.js
- Express.js
- AWS SDK v3
- JWT (jsonwebtoken)
- Bcrypt
- Multer (file uploads)

### Infrastructure
- AWS S3 (storage)
- AWS DynamoDB (database)
- AWS EC2 (hosting)
- Nginx (web server)
- PM2 (process manager)

## 📁 Project Structure

```
├── backend/              # Backend API server
│   ├── config/          # AWS configuration
│   ├── middleware/      # Authentication
│   ├── routes/          # API routes
│   ├── services/        # S3 and DynamoDB services
│   └── server.js        # Main server
├── src/                 # Frontend source
│   ├── components/      # React components
│   ├── lib/            # Services and utilities
│   └── App.tsx         # Main app component
├── scripts/            # Deployment scripts
│   ├── deploy.sh       # Full deployment
│   ├── update.sh       # Quick update
│   └── setup-ssl.sh    # SSL setup
└── docs/               # Documentation
```

## 🔧 Local Development

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your AWS credentials
npm run dev
```

Backend runs at: http://localhost:3001

### Frontend

```bash
npm install
cp .env.example .env
# Edit .env
npm run dev
```

Frontend runs at: http://localhost:3000

## 📚 Documentation

- **[QUICKSTART.md](./QUICKSTART.md)** - Fast 5-step deployment
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Complete deployment guide
- **[DEPLOYMENT_SUMMARY.md](./DEPLOYMENT_SUMMARY.md)** - Checklist and summary
- **[backend/README.md](./backend/README.md)** - Backend API documentation
- **[AWS_SETUP_GUIDE.md](./src/AWS_SETUP_GUIDE.md)** - AWS resources setup

## 🔐 Security

- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ Presigned URLs for secure file access
- ✅ CORS protection
- ✅ Environment variable management
- ✅ AWS IAM user permissions

## 💰 Cost Estimate

**Free Tier (First 12 months):** $0/month

**After Free Tier:** ~$20-30/month
- EC2 t2.small: ~$15/month
- S3 storage: ~$0.23/GB/month
- DynamoDB: ~$2.50/month
- Data transfer: ~$2/month

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- Check [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for troubleshooting
- Open an issue on GitHub
- AWS Documentation: https://docs.aws.amazon.com/

## 🎯 Roadmap

- [ ] File previews (images, PDFs)
- [ ] Folder organization
- [ ] Storage quotas per user
- [ ] Advanced file search
- [ ] File version history
- [ ] Collaborative features
- [ ] Mobile app

## ⭐ Original Design

This project is based on a Figma design:
https://www.figma.com/design/OHeViJ7IE6FvSDeAhLTSAO/SCloud-Next.js-Application

---

**Ready to deploy?** Start with [QUICKSTART.md](./QUICKSTART.md)!
  