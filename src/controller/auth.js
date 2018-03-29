const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const user = require('src/model/user');
const response = require('src/service/response');
const { authErrors } = require('src/service/errorTypes');
const { signCert } = require('src/service/auth');
const cert = fs.readFileSync(path.join(__dirname, 'sec/jwt.key'));
const SIGN_OPTIONS = { algorithm: 'RS256', expiresIn: 3600 };

const loginByPassword = async (params, callback) => {
  try {
    const users = await user.getCredentialsByUsername(params.username);
    if (users.length === 0) {
      callback(null, response(authErrors.USER_DOESNT_EXIST, 400));
    } else {
      const match = await bcrypt.compare(params.password, users[0].password);
      if (!match) {
        callback(null, response(authErrors.INCORRECT_PASSWORD, 400));
      } else {
        const cert = await signCert(users[0].id);
        cert.refresh_token = users[0].refresh_token;
        callback(null, response(cert));
      }
    }
  } catch(err) {
    callback(null, response(err, 400));
  }
}

const loginByRefreshToken = async (params, callback) => {
  try {
    const users = await user.getCredentialsByRefreshToken(params.refresh_token);
    if (users.length === 0) {
      callback(response(authErrors.USER_DOESNT_EXIST, 400));
    } else {
      const cert = await signCert(users[0].id);
      cert.refresh_token = params.refresh_token;
      callback(null, response(cert));
    }
  } catch(err) {
    callback(null, response(err, 400));
  }
}

const register = async (params, callback) => {
  try {
    const { username, password } = params
    const users = await user.getCredentialsByUsername(username);
    if (users.length === 0) {
      await user.register(username, password);
      loginByPassword(params, callback);
    } else {
      callback(null, response(authErrors.USER_ALREADY_EXISTED, 400));
    }
  } catch(err) {
    callback(null, response(err, 400));
  }
}

module.exports = {
  loginByPassword,
  loginByRefreshToken,
}
