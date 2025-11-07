const { S3Client } = require('@aws-sdk/client-s3');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');

// AWS S3 Client Configuration
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// AWS DynamoDB Client Configuration
const dynamoDBClient = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// DynamoDB Document Client (simplifies working with DynamoDB)
const docClient = DynamoDBDocumentClient.from(dynamoDBClient, {
  marshallOptions: {
    removeUndefinedValues: true,
    convertClassInstanceToMap: true,
  },
});

// Table names
const USERS_TABLE = process.env.DYNAMODB_USERS_TABLE || 'scloud-users';
const FILES_TABLE = process.env.DYNAMODB_FILES_TABLE || 'scloud-files';

// S3 bucket name
const S3_BUCKET = process.env.S3_BUCKET_NAME || 'scloud-files-bucket';

module.exports = {
  s3Client,
  dynamoDBClient,
  docClient,
  USERS_TABLE,
  FILES_TABLE,
  S3_BUCKET,
};
