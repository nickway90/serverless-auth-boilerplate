const { authErrors } = require('src/util/errorTypes');

const loginValidator = event => {
	const body = JSON.parse(event.body);
	const params = { grantType: body.grantType };
	let err;
	if (body.grantType === 'password') {
		if (!body.username) {
			err = authErrors.NO_USERNAME;
		} else if (!body.password) {
			err = authErrors.NO_PASSWORD;
		} else {
			params.username = body.username;
			params.password = body.password;
		}
	} else if (body.grantType === 'refresh_token') {
		if (!body.refreshToken) {
			err = authErrors.NO_REFRESH_TOKEN;
		} else {
			params.refreshToken = body.refreshToken;
		}
	} else {
		err = authErrors.INVALID_GRANT_TYPE;
	}
	return { err, params };
};

const registerValidator = event => {
	const body = JSON.parse(event.body);
	const params = {};
	let err;
	if (!body.username) {
		err = authErrors.NO_USERNAME;
	} else if (!body.password) {
		err = authErrors.NO_PASSWORD;
	} else {
		params.username = body.username;
		params.password = body.password;
	}
	return { err, params };
};

const validateValidator = event => {
	const body = JSON.parse(event.body);
	const params = {};
	let err;
	if (!body.token) {
		err = authErrors.RESET_PASSWORD_TOKEN_EXPIRED;
	} else {
		params.token = body.token;
	}
	return { err, params };
};

const resendValidateValidator = event => {
	const body = JSON.parse(event.body);
	const params = {};
	let err;
	if (!body.username) {
		err = authErrors.NO_USERNAME;
	} else {
		params.username = body.username;
	}
	return { err, params };
};

const forgotPasswordValidator = event => {
	const body = JSON.parse(event.body);
	const params = {};
	let err;
	if (!body.username) {
		err = authErrors.NO_USERNAME;
	} else {
		params.username = body.username;
	}
	return { err, params };
};

const resetPasswordValidator = event => {
	const body = JSON.parse(event.body);
	const params = {};
	let err;
	if (!body.username && !body.token) {
		err = authErrors.NO_USERNAME_OR_TOKEN;
	} else if (body.username && !body.password) {
		err = authErrors.NO_PASSWORD;
	} else if (!body.newPassword) {
		err = authErrors.NO_NEW_PASSWORD;
	} else {
		params.username = body.username;
		params.token = body.token;
		params.password = body.password;
		params.newPassword = body.newPassword;
	}
	return { err, params };
};

module.exports = {
	loginValidator,
	registerValidator,
	validateValidator,
	resendValidateValidator,
	forgotPasswordValidator,
	resetPasswordValidator,
};
