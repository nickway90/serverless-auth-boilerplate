const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const pubCert = fs.readFileSync(path.join(__dirname, '../../sec/jwt.key.pub'));
const cert = fs.readFileSync(path.join(__dirname, '../../sec/jwt.key'));
const SIGN_OPTIONS = { algorithm: 'RS256', expiresIn: 3600 };
const VERIFY_OPTIONS = { algorithms: ['RS256'] };

const signCert = (user_id) => {
  console.log('signing cert', user_id);
  return new Promise((resolve, reject) => {
    jwt.sign({ sub: user_id }, cert, SIGN_OPTIONS, (err, access_token) => {
      console.log(err);
      if (err) {
        reject(err);
      } else {
        console.log(access_token);
        resolve({
          user_id,
          access_token,
          expires_in: SIGN_OPTIONS.expiresIn
        });
      }
    });
  })
}

const verifyToken = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, pubCert, VERIFY_OPTIONS, (err, decoded) => {
      console.log(err, decoded);
      if (err) {
        reject(err);
      } else {
        resolve(decoded.sub);
      }
    });
  })
}

module.exports = {
  signCert,
  verifyToken,
}
