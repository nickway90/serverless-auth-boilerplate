const { loginValidator } = require('../validator/auth');
const { loginByPassword, loginByRefreshToken } = require('../controller/auth');
const response = require('../service/response');
const warmup = require('../service/warmup');

exports.post = (event, context, callback) => {
  warmup(event, callback);
  const { err, params } = loginValidator(event);
  if (!err) {
    if (params.grant_type === 'password') {
      loginByPassword(params, callback);
    } else {
      loginByRefreshToken(params, callback);
    }
  } else {
    callback(null, response({ err }, 400))
  }
}
