const { loginValidator, registerValidator } = require('src/validator/auth');
const { loginByPassword, loginByRefreshToken, register } = require('src/controller/auth');
const response = require('src/service/response');
const warmup = require('src/service/warmup');

exports.login = (event, context, callback) => {
  warmup(event, callback);
  const { err, params } = loginValidator(event);
  if (!err) {
    if (params.grant_type === 'password') {
      loginByPassword(params, callback);
    } else {
      loginByRefreshToken(params, callback);
    }
  } else {
    callback(null, response(err, 400))
  }
}

exports.register = (event, context, callback) => {
  warmup(event, callback);
  const { err, params } = registerValidator(event);
  if (!err) {
    register(params, callback);
  } else {
    callback(null, response(err, 400))
  }
}
