const { loginValidator, registerValidator, resetPasswordValidator, forgotPasswordValidator } = require('src/validator/auth');
const { loginByPassword, loginByRefreshToken, register, forgotPassword, resetPasswordByUsername, resetPasswordByToken } = require('src/controller/auth');
const routeToController = require('src/service/routeToController');

exports.login = (event, context, callback) => {
  routeToController(event, callback, loginValidator, (params, callback) => {
    if (params.grant_type === 'password') {
      loginByPassword(params, callback);
    } else {
      loginByRefreshToken(params, callback);
    }
  });
};

exports.register = (event, context, callback) => {
  routeToController(event, callback, registerValidator, register);
};

exports.forgotPassword = (event, context, callback) => {
  routeToController(event, callback, forgotPasswordValidator, forgotPassword);
};

exports.resetPassword = (event, context, callback) => {
  routeToController(event, callback, resetPasswordValidator, (params, callback) => {
    if (params.username) {
      resetPasswordByUsername(params, callback);
    } else {
      resetPasswordByToken(params, callback);
    }
  });
};
