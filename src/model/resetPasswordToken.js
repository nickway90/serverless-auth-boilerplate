// const AWS = require('aws-sdk');
// const crypto = require('crypto');
// const moment = require('moment');
// const docClient = new AWS.DynamoDB.DocumentClient();
//
// const getCredentialsByUsername = async (username) => {
//   try {
//     const result = await docClient.query({
//       TableName: 'users',
//       IndexName: 'username-index',
//       KeyConditionExpression: '#username = :username',
//       ExpressionAttributeNames:{ '#username': 'username' },
//       ExpressionAttributeValues: { ':username': username },
//       ProjectionExpression: 'password, id, refreshToken'
//     }).promise();
//     return result.Items;
//   } catch(err) {
//     return Promise.reject(err);
//   }
// }
//
// const getCredentialsByRefreshToken = async (refreshToken) => {
//   try {
//     const result = await docClient.query({
//       TableName : 'users',
//       IndexName: 'refreshToken-index',
//       KeyConditionExpression: '#refreshToken = :refreshToken',
//       ExpressionAttributeNames:{ '#refreshToken': 'refreshToken' },
//       ExpressionAttributeValues: { ':refreshToken': refreshToken },
//       ProjectionExpression: 'password, id'
//     }).promise();
//     return result.Items;
//   } catch(err) {
//     return Promise.reject(err);
//   }
// }
//
// const create = async (username, unhashed) => {
//   try {
//     crypto.randomBytes(128, async (err, buf) => {
//       if (err) throw err;
//       const password = await bcrypt.hash(unhashed, SALT_ROUNDS);
//       const params = {
//         TableName: 'users',
//         Item: {
//           id: uuid().replace(/-/g, ''),
//           username,
//           password,
//           refreshToken: buf.toString('hex'),
//         }
//       };
//       await docClient.put(params).promise();
//       return { success: true }
//     })
//   } catch(err) {
//     return Promise.reject(err);
//   }
// }
//
// module.exports = {
//   getCredentialsByUsername,
//   getCredentialsByRefreshToken,
//   create,
// }
