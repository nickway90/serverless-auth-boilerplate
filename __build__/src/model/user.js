const AWS = require('aws-sdk');
const bcrypt = require('bcryptjs');
const uuid = require('uuid/v4');
const crypto = require('crypto');
const moment = require('moment');
const docClient = new AWS.DynamoDB.DocumentClient();
const SALT_ROUNDS = 10;

const getCredentialsByUsername = (username) => __async(function*(){
  try {
    const result = yield docClient.query({
      TableName: 'users',
      IndexName: 'username-index',
      KeyConditionExpression: '#username = :username',
      ExpressionAttributeNames:{
          '#username': 'username'
      },
      ExpressionAttributeValues: {
          ':username': username
      },
      ProjectionExpression: 'password, id, refresh_token, last_sync'
    }).promise();
    return result;
  } catch(err) {
    return Promise.reject(err);
  }
}())

const getCredentialsByRefreshToken = (refresh_token) => __async(function*(){
  try {
    const result = yield docClient.query({
      TableName : 'users',
      IndexName: 'refresh_token-index',
      KeyConditionExpression: '#refresh_token = :refresh_token',
      ExpressionAttributeNames:{
          '#refresh_token': 'refresh_token'
      },
      ExpressionAttributeValues: {
          ':refresh_token': refresh_token
      },
      ProjectionExpression: 'password, id, last_sync'
    }).promise();
    return result;
  } catch(err) {
    return Promise.reject(err);
  }
}())

const register = (username, unhashed, rosters) => __async(function*(){
  try {
    crypto.randomBytes(128, (err, buf) => __async(function*(){
      if (err) throw err;
      const password = yield bcrypt.hash(unhashed, SALT_ROUNDS);
      const params = {
        TableName: 'users',
        Item: {
          id: uuid().replace(/-/g, ''),
          username,
          refresh_token: buf.toString('hex'),
          password,
          rosters,
          last_sync: moment().valueOf()
        }
      };
      console.log(params);
      yield docClient.put(params).promise();
      return { success: true }
    }()))
  } catch(err) {
    return Promise.reject(err);
  }
}())

const updateRosters = (id, rosters) => __async(function*(){
  try {
    const params = {
      TableName: 'users',
      Key: { 'id': id },
      UpdateExpression: 'set rosters = :r, last_sync = :t',
      ExpressionAttributeValues: {
          ':r': rosters,
          ':t': moment().valueOf()
      },
    };
    yield docClient.update(params).promise();
    return { success: true }
  } catch(err) {
    return Promise.reject(err);
  }
}())

const getRosters = (id) => __async(function*(){
  try {
    const result = yield docClient.query({
      TableName : 'users',
      KeyConditionExpression: '#id = :id',
      ExpressionAttributeNames:{
          '#id': 'id'
      },
      ExpressionAttributeValues: {
          ':id': id
      },
      ProjectionExpression: 'rosters'
    }).promise();
    return result;
  } catch(err) {
    return Promise.reject(err);
  }
}())

module.exports = {
  getCredentialsByUsername,
  getCredentialsByRefreshToken,
  register,
  updateRosters,
  getRosters
}

function __async(g){return new Promise(function(s,j){function c(a,x){try{var r=g[x?"throw":"next"](a)}catch(e){j(e);return}r.done?s(r.value):Promise.resolve(r.value).then(c,d)}function d(e){c(e,1)}c()})}
