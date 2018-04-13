const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const { JWT_SIGN_OPTIONS, JWT_VERIFY_OPTIONS, JWT_PUB_CERT, JWT_CERT } = require('src/service/config');

const signCert = user_id => {
  return new Promise((resolve, reject) => {
    jwt.sign({ sub: user_id }, JWT_CERT, JWT_SIGN_OPTIONS, (err, access_token) => {
      if (err) {
        reject(err);
      } else {
        resolve({ user_id, access_token, expires_in: JWT_SIGN_OPTIONS.expiresIn });
      }
    });
  })
}

const verifyToken = token => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, JWT_PUB_CERT, JWT_VERIFY_OPTIONS, (err, decoded) => {
      if (err) {
        reject(err);
      } else {
        resolve(decoded.sub);
      }
    });
  })
}

const createRandomBytes = bytes => {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(bytes, (err, buf) => {
      if (err) return reject(err);
      resolve(buf.toString('hex'))
    })
  })
}

module.exports = {
  signCert,
  verifyToken,
  createRandomBytes,
}
