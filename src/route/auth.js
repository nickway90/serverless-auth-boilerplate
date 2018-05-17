const {
	loginValidator,
	registerValidator,
	resetPasswordValidator,
	forgotPasswordValidator,
	validateValidator,
	resendValidateValidator,
} = require('src/validator/auth');
const {
	loginByPassword,
	loginByRefreshToken,
	register,
	validate,
	resendValidate,
	forgotPassword,
	resetPasswordByUsername,
	resetPasswordByToken,
} = require('src/controller/auth');
const routeToController = require('src/util/routeToController');

exports.login = (event, context, callback) => {
	routeToController(event, callback, loginValidator, (params, callback) => {
		if (params.grantType === 'password') {
			loginByPassword(params, callback);
		} else {
			loginByRefreshToken(params, callback);
		}
	});
};

exports.register = (event, context, callback) => {
	routeToController(event, callback, registerValidator, register);
};

exports.validate = (event, context, callback) => {
	routeToController(event, callback, validateValidator, validate);
};

exports.resendValidate = (event, context, callback) => {
	routeToController(event, callback, resendValidateValidator, resendValidate);
};

exports.forgotPassword = (event, context, callback) => {
	routeToController(event, callback, forgotPasswordValidator, forgotPassword);
};

exports.resetPassword = (event, context, callback) => {
	routeToController(
		event,
		callback,
		resetPasswordValidator,
		(params, callback) => {
			if (params.username) {
				resetPasswordByUsername(params, callback);
			} else {
				resetPasswordByToken(params, callback);
			}
		}
	);
};
