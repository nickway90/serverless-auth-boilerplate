const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { JWT_SIGN_OPTIONS, JWT_VERIFY_OPTIONS, JWT_PUB_CERT, JWT_CERT } = require('src/service/config');

const signCert = userId => {
  return new Promise((resolve, reject) => {
    jwt.sign({ sub: userId }, JWT_CERT, JWT_SIGN_OPTIONS, (err, token) => {
      if (err) {
        reject(err);
      } else {
        resolve({ user_id: userId, access_token: token, expires_in: JWT_SIGN_OPTIONS.expiresIn });
      }
    });
  });
};

const verifyToken = token => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, JWT_PUB_CERT, JWT_VERIFY_OPTIONS, (err, decoded) => {
      if (err) {
        reject(err);
      } else {
        resolve(decoded.sub);
      }
    });
  });
};

const createRandomBytes = bytes => {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(bytes, (err, buf) => {
      if (err) return reject(err);
      resolve(buf.toString('hex'));
    });
  });
};

module.exports = {
  signCert,
  verifyToken,
  createRandomBytes,
};
