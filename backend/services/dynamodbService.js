const { PutCommand, GetCommand, UpdateCommand, DeleteCommand, QueryCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');
const { docClient, USERS_TABLE, FILES_TABLE } = require('../config/aws');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

/**
 * Create a new user
 */
async function createUser(userData) {
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(userData.password, SALT_ROUNDS);

    const user = {
      email: userData.email,
      username: userData.username,
      password: hashedPassword,
      gender: userData.gender || '',
      dateOfBirth: userData.dateOfBirth || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const command = new PutCommand({
      TableName: USERS_TABLE,
      Item: user,
      ConditionExpression: 'attribute_not_exists(email)', // Prevent overwriting
    });

    await docClient.send(command);
    
    // Return user without password
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    if (error.name === 'ConditionalCheckFailedException') {
      throw new Error('User with this email already exists');
    }
    console.error('DynamoDB Create User Error:', error);
    throw new Error(`Failed to create user: ${error.message}`);
  }
}

/**
 * Get user by email
 */
async function getUserByEmail(email) {
  try {
    const command = new GetCommand({
      TableName: USERS_TABLE,
      Key: { email },
    });

    const response = await docClient.send(command);
    return response.Item || null;
  } catch (error) {
    console.error('DynamoDB Get User Error:', error);
    throw new Error(`Failed to get user: ${error.message}`);
  }
}

/**
 * Verify user password
 */
async function verifyPassword(plainPassword, hashedPassword) {
  return bcrypt.compare(plainPassword, hashedPassword);
}

/**
 * Update user profile
 */
async function updateUser(email, updates) {
  try {
    const updateExpressions = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};

    // Build update expression dynamically
    Object.keys(updates).forEach((key, index) => {
      if (key !== 'email' && key !== 'password') { // Don't allow email or password updates
        updateExpressions.push(`#attr${index} = :val${index}`);
        expressionAttributeNames[`#attr${index}`] = key;
        expressionAttributeValues[`:val${index}`] = updates[key];
      }
    });

    if (updateExpressions.length === 0) {
      throw new Error('No valid fields to update');
    }

    // Add updatedAt
    updateExpressions.push('#updatedAt = :updatedAt');
    expressionAttributeNames['#updatedAt'] = 'updatedAt';
    expressionAttributeValues[':updatedAt'] = new Date().toISOString();

    const command = new UpdateCommand({
      TableName: USERS_TABLE,
      Key: { email },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    });

    const response = await docClient.send(command);
    
    // Return user without password
    const { password, ...userWithoutPassword } = response.Attributes;
    return userWithoutPassword;
  } catch (error) {
    console.error('DynamoDB Update User Error:', error);
    throw new Error(`Failed to update user: ${error.message}`);
  }
}

/**
 * Save file metadata
 */
async function saveFileMetadata(fileData) {
  try {
    const command = new PutCommand({
      TableName: FILES_TABLE,
      Item: {
        userId: fileData.userId,
        fileId: fileData.fileId,
        fileName: fileData.fileName,
        fileSize: fileData.fileSize,
        fileType: fileData.fileType,
        s3Key: fileData.s3Key,
        uploadDate: fileData.uploadDate || new Date().toISOString(),
      },
    });

    await docClient.send(command);
    return fileData;
  } catch (error) {
    console.error('DynamoDB Save File Error:', error);
    throw new Error(`Failed to save file metadata: ${error.message}`);
  }
}

/**
 * Get user's files
 */
async function getUserFiles(userId) {
  try {
    const command = new QueryCommand({
      TableName: FILES_TABLE,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
      ScanIndexForward: false, // Sort by fileId descending (newest first)
    });

    const response = await docClient.send(command);
    return response.Items || [];
  } catch (error) {
    console.error('DynamoDB Get Files Error:', error);
    throw new Error(`Failed to get user files: ${error.message}`);
  }
}

/**
 * Get file by fileId
 */
async function getFileById(userId, fileId) {
  try {
    const command = new GetCommand({
      TableName: FILES_TABLE,
      Key: {
        userId,
        fileId,
      },
    });

    const response = await docClient.send(command);
    return response.Item || null;
  } catch (error) {
    console.error('DynamoDB Get File Error:', error);
    throw new Error(`Failed to get file: ${error.message}`);
  }
}

/**
 * Delete file metadata
 */
async function deleteFileMetadata(userId, fileId) {
  try {
    const command = new DeleteCommand({
      TableName: FILES_TABLE,
      Key: {
        userId,
        fileId,
      },
    });

    await docClient.send(command);
    return true;
  } catch (error) {
    console.error('DynamoDB Delete File Error:', error);
    throw new Error(`Failed to delete file metadata: ${error.message}`);
  }
}

module.exports = {
  createUser,
  getUserByEmail,
  verifyPassword,
  updateUser,
  saveFileMetadata,
  getUserFiles,
  getFileById,
  deleteFileMetadata,
};
