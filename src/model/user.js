const AWS = require('aws-sdk');
const bcrypt = require('bcryptjs');
const uuid = require('uuid/v4');
const docClient = new AWS.DynamoDB.DocumentClient();
const { PASSWORD_SALT_ROUNDS, REFRESH_TOKEN_BYTES } = require('src/service/config');
const { createRandomBytes } = require('src/service/auth');

const getCredentialsByUsername = async (username) => {
  try {
    const result = await docClient.query({
      TableName: 'users',
      IndexName: 'username-index',
      KeyConditionExpression: '#username = :username',
      ExpressionAttributeNames: { '#username': 'username' },
      ExpressionAttributeValues: { ':username': username },
      ProjectionExpression: 'password, id, refreshToken',
    }).promise();
    return result.Items;
  } catch (err) {
    return Promise.reject(err);
  }
};

const getCredentialsByRefreshToken = async (refreshToken) => {
  try {
    const result = await docClient.query({
      TableName: 'users',
      IndexName: 'refreshToken_index',
      KeyConditionExpression: '#refreshToken = :refreshToken',
      ExpressionAttributeNames: { '#refreshToken': 'refreshToken' },
      ExpressionAttributeValues: { ':refreshToken': refreshToken },
      ProjectionExpression: 'password, id',
    }).promise();
    return result.Items;
  } catch (err) {
    return Promise.reject(err);
  }
};

const create = async (username, unhashed) => {
  try {
    const refreshToken = await createRandomBytes(REFRESH_TOKEN_BYTES);
    const password = await bcrypt.hash(unhashed, PASSWORD_SALT_ROUNDS);
    const params = {
      TableName: 'users',
      Item: {
        id: uuid().replace(/-/g, ''),
        username,
        password,
        refreshToken,
      },
    };
    await docClient.put(params).promise();
    return { success: true };
  } catch (err) {
    return Promise.reject(err);
  }
};

module.exports = {
  getCredentialsByUsername,
  getCredentialsByRefreshToken,
  create,
};
