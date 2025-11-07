# AWS S3 and DynamoDB Setup Guide for SCloud

## ⚠️ IMPORTANT: Current Demo Mode

**This application is currently running in DEMO MODE with mock AWS services.**

### Why Mock Services?

AWS SDK client libraries (like `@aws-sdk/client-s3` and `@aws-sdk/client-dynamodb`) **CANNOT run directly in web browsers** because they:
- Require Node.js filesystem access to load credentials
- Need server-side environment variables
- Would expose your secret AWS credentials if embedded in frontend code (MAJOR SECURITY RISK!)

### Current Functionality

In demo mode, the app stores data in browser memory:
- User accounts exist only in your current browser session
- Files are stored as Blob URLs in memory
- All data is lost when you refresh the page or close the browser
- This demonstrates the UI/UX, not real AWS integration

---

## To Use Real AWS S3 and DynamoDB

You **MUST** create a backend server. This guide explains how.

## Prerequisites

- An AWS account
- A backend server (Node.js, Python, Go, etc.)
- Basic understanding of AWS services
- AWS CLI installed (optional, but recommended)

## Step 1: Create an S3 Bucket

1. Go to the [AWS S3 Console](https://console.aws.amazon.com/s3/)
2. Click "Create bucket"
3. Enter a unique bucket name (e.g., `scloud-files-bucket-yourname`)
4. Choose your preferred AWS region
5. **Important**: Configure CORS for the bucket:
   - After creating the bucket, go to the "Permissions" tab
   - Scroll to "Cross-origin resource sharing (CORS)"
   - Add the following CORS configuration:

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

## Step 2: Create DynamoDB Tables

### Users Table

1. Go to the [AWS DynamoDB Console](https://console.aws.amazon.com/dynamodb/)
2. Click "Create table"
3. Configure the table:
   - **Table name**: `scloud-users`
   - **Partition key**: `email` (String)
4. Leave other settings as default or customize as needed
5. Click "Create table"

### Files Table

1. Click "Create table" again
2. Configure the table:
   - **Table name**: `scloud-files`
   - **Partition key**: `userId` (String)
   - **Sort key**: `fileId` (String)
3. Click "Create table"

**Optional**: Create a Global Secondary Index (GSI) for faster file lookups:
- Index name: `fileId-index`
- Partition key: `fileId` (String)

## Step 3: Create IAM User with Programmatic Access

⚠️ **IMPORTANT SECURITY NOTE**: For production applications, you should use:
- AWS Cognito Identity Pools for secure credential management
- IAM roles with temporary credentials
- API Gateway + Lambda functions as a backend
- Never expose credentials in frontend code

For development/testing purposes only:

1. Go to the [AWS IAM Console](https://console.aws.amazon.com/iam/)
2. Click "Users" → "Add users"
3. Enter a username (e.g., `scloud-dev-user`)
4. Select "Access key - Programmatic access"
5. Click "Next: Permissions"
6. Choose "Attach existing policies directly"
7. Search for and select:
   - `AmazonS3FullAccess`
   - `AmazonDynamoDBFullAccess`
   
   **Note**: For production, create custom policies with minimal required permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::your-bucket-name",
        "arn:aws:s3:::your-bucket-name/*"
      ]
    },
    {
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
        "arn:aws:dynamodb:region:account-id:table/scloud-users",
        "arn:aws:dynamodb:region:account-id:table/scloud-files"
      ]
    }
  ]
}
```

8. Click through and create the user
9. **IMPORTANT**: Save the Access Key ID and Secret Access Key - you won't be able to see the secret again!

## Step 4: Configure the Application

1. Open `/lib/aws-config.ts` in your code editor
2. Update the configuration with your values:

```typescript
export const AWS_CONFIG = {
  region: 'us-east-1', // Change to your AWS region
  credentials: {
    accessKeyId: 'YOUR_ACCESS_KEY_ID', // Replace with your actual key
    secretAccessKey: 'YOUR_SECRET_ACCESS_KEY', // Replace with your actual secret
  },
  s3: {
    bucketName: 'scloud-files-bucket-yourname', // Your S3 bucket name
  },
  dynamodb: {
    usersTableName: 'scloud-users',
    filesTableName: 'scloud-files',
  },
};
```

## Step 5: Create a Backend Server

You MUST create a backend to use real AWS services. Here's a simple Node.js/Express example:

### Backend Example (Node.js + Express)

```javascript
// server.js
const express = require('express');
const multer = require('multer');
const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// Initialize AWS clients
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
}));

// Upload file endpoint
app.post('/api/files/upload', upload.single('file'), async (req, res) => {
  try {
    const { file } = req;
    const { userId, fileId } = req.body;
    
    const key = `users/${userId}/${fileId}-${file.originalname}`;
    
    // Upload to S3
    await s3Client.send(new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    }));
    
    // Save metadata to DynamoDB
    await dynamoClient.send(new PutCommand({
      TableName: 'scloud-files',
      Item: {
        userId,
        fileId,
        fileName: file.originalname,
        fileSize: file.size,
        fileType: file.mimetype,
        s3Key: key,
        uploadDate: new Date().toISOString(),
      },
    }));
    
    res.json({ success: true, key });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Get download URL endpoint
app.get('/api/files/download', async (req, res) => {
  try {
    const { key } = req.query;
    
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
    });
    
    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    res.json({ url });
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Download failed' });
  }
});

// Get user files endpoint
app.get('/api/files', async (req, res) => {
  try {
    const { userId } = req.query;
    
    const result = await dynamoClient.send(new QueryCommand({
      TableName: 'scloud-files',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: { ':userId': userId },
    }));
    
    res.json({ files: result.Items });
  } catch (error) {
    console.error('List files error:', error);
    res.status(500).json({ error: 'Failed to list files' });
  }
});

app.listen(3001, () => {
  console.log('Backend server running on port 3001');
});
```

### Update Frontend to Use Backend

Replace the mock service calls with real API calls:

```typescript
// lib/s3-service.ts (updated)
export async function uploadFileToS3({ file, userId, fileId }: UploadFileParams): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('userId', userId);
  formData.append('fileId', fileId);
  
  const response = await fetch('http://localhost:3001/api/files/upload', {
    method: 'POST',
    body: formData,
  });
  
  const { key } = await response.json();
  return key;
}

export async function getDownloadUrl(key: string): Promise<string> {
  const response = await fetch(`http://localhost:3001/api/files/download?key=${encodeURIComponent(key)}`);
  const { url } = await response.json();
  return url;
}
```

## Step 6: Test the Application

1. Start your backend server: `node server.js`
2. Start your frontend application
3. Go to `/login` and create a new account
4. Upload a test file
5. Verify the file appears in your S3 bucket
6. Check DynamoDB tables to see the stored metadata

## Production Deployment Options

### Option 1: AWS Cognito + Identity Pools

1. Create a Cognito User Pool for authentication
2. Create a Cognito Identity Pool
3. Configure IAM roles with limited S3/DynamoDB permissions
4. Use AWS Amplify or the AWS SDK to get temporary credentials
5. Users authenticate through Cognito and receive temporary AWS credentials

### Option 2: Backend API (Recommended - shown above)

1. Create a backend server (Node.js, Python, Go, etc.)
2. Store AWS credentials securely on the server (use environment variables)
3. Create API endpoints for file operations
4. Frontend makes requests to your API, not directly to AWS
5. API validates user authentication and proxies requests to AWS
6. Deploy backend to AWS EC2, Elastic Beanstalk, or containerized service

### Option 3: AWS Lambda + API Gateway

1. Create Lambda functions for file operations
2. Use API Gateway to expose HTTP endpoints
3. Lambda functions use IAM roles (no credentials needed)
4. Add API Gateway authentication (API keys, Cognito, etc.)
5. Frontend calls API Gateway endpoints

## Additional Security Recommendations

1. **Enable S3 Bucket Versioning**: Protect against accidental deletions
2. **Enable S3 Server-Side Encryption**: Encrypt data at rest
3. **Use S3 Bucket Policies**: Restrict access to your bucket
4. **Enable DynamoDB Point-in-Time Recovery**: Protect against data loss
5. **Hash User Passwords**: Use bcrypt or similar (not base64 encoding!)
6. **Implement Rate Limiting**: Prevent abuse
7. **Use HTTPS Only**: Never send credentials over HTTP
8. **Regular Security Audits**: Review IAM policies and access logs

## Troubleshooting

### CORS Errors
- Verify CORS configuration in S3 bucket
- Check that AllowedOrigins includes your application's domain

### Access Denied Errors
- Verify IAM user has correct permissions
- Check S3 bucket policies
- Verify DynamoDB table exists in the correct region

### File Upload Failures
- Check file size limits
- Verify S3 bucket name is correct
- Check network connectivity

### DynamoDB Errors
- Verify table names are correct
- Check partition key and sort key names match your schema
- Ensure region is correct

## Cost Optimization

- **S3**: Use lifecycle policies to move old files to cheaper storage classes
- **DynamoDB**: Use on-demand pricing for development, provisioned capacity for production
- **CloudWatch**: Monitor usage to optimize costs
- **S3 Intelligent-Tiering**: Automatically moves objects to cost-effective tiers

## Support

For AWS-specific issues:
- [AWS Documentation](https://docs.aws.amazon.com/)
- [AWS Support](https://console.aws.amazon.com/support/)
- [AWS Forums](https://forums.aws.amazon.com/)

For SCloud application issues:
- Check the browser console for error messages
- Verify AWS credentials are configured correctly
- Ensure all required tables and buckets are created
