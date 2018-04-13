const AWS = require('aws-sdk');
const bcrypt = require('bcryptjs');
const uuid = require('uuid/v4');
const crypto = require('crypto');
const moment = require('moment');
const docClient = new AWS.DynamoDB.DocumentClient();
const { PASSWORD_SALT_ROUNDS, REFRESH_TOKEN_BYTES } = require('src/service/config');
const { createRandomBytes } = require('src/service/auth');

const getCredentialsByUsername = async (username) => {
  try {
    const result = await docClient.query({
      TableName: 'users',
      IndexName: 'username-index',
      KeyConditionExpression: '#username = :username',
      ExpressionAttributeNames:{ '#username': 'username' },
      ExpressionAttributeValues: { ':username': username },
      ProjectionExpression: 'password, id, refresh_token'
    }).promise();
    return result.Items;
  } catch(err) {
    return Promise.reject(err);
  }
}

const getCredentialsByRefreshToken = async (refresh_token) => {
  try {
    const result = await docClient.query({
      TableName : 'users',
      IndexName: 'refresh_token-index',
      KeyConditionExpression: '#refresh_token = :refresh_token',
      ExpressionAttributeNames:{ '#refresh_token': 'refresh_token' },
      ExpressionAttributeValues: { ':refresh_token': refresh_token },
      ProjectionExpression: 'password, id'
    }).promise();
    return result.Items;
  } catch(err) {
    return Promise.reject(err);
  }
}

const create = async (username, unhashed) => {
  try {
    const refresh_token = await createRandomBytes(REFRESH_TOKEN_BYTES);
    const password = await bcrypt.hash(unhashed, PASSWORD_SALT_ROUNDS);
    const params = {
      TableName: 'users',
      Item: {
        id: uuid().replace(/-/g, ''),
        username,
        password,
        refresh_token,
      }
    };
    await docClient.put(params).promise();
    return { success: true }
  } catch(err) {
    return Promise.reject(err);
  }
}

module.exports = {
  getCredentialsByUsername,
  getCredentialsByRefreshToken,
  create,
}
