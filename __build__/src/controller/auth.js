const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const cert = fs.readFileSync(path.join(__dirname, '../../sec/jwt.key'));
const user = require('../model/user');
const response = require('../service/response');
const { signCert } = require('../service/auth');
const SIGN_OPTIONS = { algorithm: 'RS256', expiresIn: 3600 };

const loginByPassword = (params, callback) => __async(function*(){
  try {
    const { Items } = yield user.getCredentialsByUsername(params.username);
    if (Items.length === 0) {
      callback(null, response({ err: 'User does\'t exist.' }, 400));
    } else {
      const match = yield bcrypt.compare(params.password, Items[0].password);
      if (!match) {
        callback(null, response({ err: 'Incorrect password.' }, 400));
      } else {
        const res = yield signCert(Items[0].id);
        res.refresh_token = Items[0].refresh_token;
        callback(null, response(res));
      }
    }
  } catch(err) {
    callback(null, response({ err }, 400));
  }
}())

const loginByRefreshToken = (params, callback) => __async(function*(){
  try {
    const { Items } = yield user.getCredentialsByRefreshToken(params.refresh_token);
    if (Items.length === 0) {
      callback(response({ err: 'User does\'t exist.' }, 400));
    } else {
      const res = yield signCert(Items[0].id);
      res.refresh_token = params.refresh_token;
      callback(null, response(res));
    }
  } catch(err) {
    console.log(err);
    callback(null, response({ err }, 400));
  }
}())

module.exports = {
  loginByPassword,
  loginByRefreshToken,
}

function __async(g){return new Promise(function(s,j){function c(a,x){try{var r=g[x?"throw":"next"](a)}catch(e){j(e);return}r.done?s(r.value):Promise.resolve(r.value).then(c,d)}function d(e){c(e,1)}c()})}
