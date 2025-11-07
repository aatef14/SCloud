# SCloud - Cloud Storage Platform

> by Atif, Cloud Engineer

A modern, comprehensive cloud storage platform built with React, TypeScript, and Tailwind CSS, showcasing AWS S3 and DynamoDB integration patterns.

![SCloud Demo](https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=400&fit=crop)

## 🌟 Features

- **Modern UI/UX**: Clean, responsive design with orange/red gradient color scheme
- **Dark Mode**: Full dark mode support with theme persistence
- **Authentication**: Secure login and signup with AWS Cognito integration pattern
- **File Management**: Upload, download, delete, and organize files with AWS S3
- **Metadata Storage**: Track file metadata using DynamoDB
- **User Profile**: Editable user profiles with avatar support
- **Settings**: Account management and preferences
- **Demo Mode**: Fully functional demo with mock data

## 🛠️ Tech Stack

- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS v4.0
- **UI Components**: ShadCN UI
- **Icons**: Lucide React
- **State Management**: React Context API
- **Cloud Services**: AWS S3 & DynamoDB (mock implementation)
- **Font**: Inter

## 📦 Project Structure

```
scloud/
├── components/
│   ├── dashboard/        # Dashboard-specific components
│   ├── layout/          # Layout components (header, nav)
│   ├── pages/           # Page components
│   ├── ui/              # ShadCN UI components
│   ├── demo-banner.tsx  # Demo mode indicator
│   └── theme-provider.tsx
├── lib/
│   ├── auth-context.tsx      # Authentication context
│   ├── aws-config.ts         # AWS configuration
│   ├── dynamodb-service.ts   # DynamoDB mock service
│   └── s3-service.ts         # S3 mock service
├── styles/
│   └── globals.css      # Global styles and Tailwind config
└── App.tsx              # Main application entry point
```

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ installed
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/scloud.git
cd scloud
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

## 🔐 AWS Integration

This project includes mock implementations of AWS services for demo purposes. For production deployment with real AWS integration:

1. Review the `AWS_SETUP_GUIDE.md` for detailed setup instructions
2. Configure AWS credentials in `.env.local`:
```env
VITE_AWS_REGION=us-east-1
VITE_AWS_ACCESS_KEY_ID=your_access_key
VITE_AWS_SECRET_ACCESS_KEY=your_secret_key
VITE_S3_BUCKET_NAME=your_bucket_name
VITE_DYNAMODB_TABLE_NAME=your_table_name
```

3. Set up a backend server for AWS operations (see `AWS_SETUP_GUIDE.md`)

## 📄 Pages

- **Landing Page** (`/`): Marketing page with features and call-to-action
- **Login/Signup** (`/login`): Authentication with tabbed interface
- **Dashboard** (`/dashboard`): File management interface
- **Profile** (`/profile`): User profile with editable fields
- **Settings** (`/settings`): Account settings and preferences

## 🎨 Design System

- **Primary Color**: Orange/Red gradient (`#FF6B35` to `#FF4500`)
- **Font**: Inter
- **Theme**: Light and Dark modes supported
- **Components**: Built with ShadCN UI and Tailwind CSS

## 🔒 Security Note

**Important**: This demo application is not meant for collecting PII (Personally Identifiable Information) or securing sensitive data. For production use:

- Implement proper AWS Cognito authentication
- Use AWS IAM roles and policies
- Enable S3 bucket encryption
- Set up proper CORS and security headers
- Use environment variables for sensitive data
- Implement rate limiting and input validation

## 📝 License

This project is for educational and demonstration purposes.

## 👤 Author

**Atif** - Cloud Engineer

---

Built with ❤️ using React, Tailwind CSS, and AWS
