// AWS Configuration
// WARNING: AWS SDK clients CANNOT run directly in the browser!
// This is a MOCK/DEMO implementation to show the integration pattern.

// For production, you MUST use one of these approaches:
// 1. Backend API (Node.js/Python/etc) that proxies requests to AWS
// 2. AWS API Gateway + Lambda functions
// 3. AWS Amplify with Cognito Identity Pools

export const AWS_CONFIG = {
  region: 'us-east-1',
  credentials: {
    accessKeyId: 'DEMO_ACCESS_KEY_ID',
    secretAccessKey: 'DEMO_SECRET_ACCESS_KEY',
  },
  s3: {
    bucketName: 'scloud-files-bucket',
  },
  dynamodb: {
    usersTableName: 'scloud-users',
    filesTableName: 'scloud-files',
  },
};

// This is a mock mode for demonstration
export const USE_MOCK_MODE = true;

// Helper to check if AWS is configured (always false in browser)
export function isAWSConfigured(): boolean {
  return false; // AWS SDK cannot run in browser
}

// Instructions for setting up AWS resources:
/*
1. Create an S3 bucket:
   - Go to AWS S3 Console
   - Create a new bucket (e.g., 'scloud-files-bucket')
   - Enable versioning (optional)
   - Configure CORS to allow your frontend domain

2. Create DynamoDB tables:
   
   Users Table (scloud-users):
   - Partition Key: email (String)
   - Attributes: password (hashed), username, gender, dateOfBirth, createdAt
   
   Files Table (scloud-files):
   - Partition Key: userId (String)
   - Sort Key: fileId (String)
   - Attributes: fileName, fileSize, fileType, s3Key, uploadDate
   - GSI (optional): fileId-index for quick lookups

3. Create an IAM user with programmatic access:
   - Attach policies: AmazonS3FullAccess, AmazonDynamoDBFullAccess
   - Save the Access Key ID and Secret Access Key
   - IMPORTANT: In production, use more restrictive policies

4. Configure CORS for your S3 bucket:
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
       "AllowedOrigins": ["*"],
       "ExposeHeaders": []
     }
   ]
*/
