const AWS = require('aws-sdk');
const crypto = require('crypto');
const moment = require('moment');
const docClient = new AWS.DynamoDB.DocumentClient();

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
    crypto.randomBytes(128, async (err, buf) => {
      if (err) throw err;
      const password = await bcrypt.hash(unhashed, SALT_ROUNDS);
      const params = {
        TableName: 'users',
        Item: {
          id: uuid().replace(/-/g, ''),
          username,
          password,
          refresh_token: buf.toString('hex'),
        }
      };
      await docClient.put(params).promise();
      return { success: true }
    })
  } catch(err) {
    return Promise.reject(err);
  }
}

module.exports = {
  getCredentialsByUsername,
  getCredentialsByRefreshToken,
  create,
}
