const bcrypt = require('bcryptjs');
const user = require('src/model/user');
const response = require('src/util/response');
const { authErrors } = require('src/util/errorTypes');
const { signCert } = require('src/util/auth');
const sendEmail = require('src/util/sendEmail');

const loginByPassword = async (params, callback) => {
	try {
		const users = await user.getCredentialsByUsername(params.username);
		if (users.length === 0) {
			callback(null, response(authErrors.USER_DOESNT_EXIST, 400));
		} else {
			const match = await bcrypt.compare(params.password, users[0].password);
			if (!match) {
				callback(null, response(authErrors.INCORRECT_PASSWORD, 400));
			} else if (!users[0].validated) {
				callback(null, response(authErrors.EMAIL_NOT_VALIDATED, 400));
			} else {
				const cert = await signCert(users[0].id);
				cert.refreshToken = users[0].refreshToken;
				callback(null, response(cert));
			}
		}
	} catch (err) {
		callback(null, response(err, 400));
	}
};

const loginByRefreshToken = async (params, callback) => {
	try {
		const users = await user.getCredentialsByRefreshToken(params.refreshToken);
		if (users.length === 0) {
			callback(null, response(authErrors.USER_DOESNT_EXIST, 400));
		} else if (!users[0].validated) {
			callback(null, response(authErrors.EMAIL_NOT_VALIDATED, 400));
		} else {
			const cert = await signCert(users[0].id);
			cert.refreshToken = params.refreshToken;
			callback(null, response(cert));
		}
	} catch (err) {
		callback(null, response(err, 400));
	}
};

const register = async (params, callback) => {
	try {
		const { username, password } = params;
		const users = await user.getCredentialsByUsername(username);
		if (users.length === 0) {
			const id = await user.create(username, password);
			const token = await user.setResetPasswordToken(id);
			await sendEmail(username, 'Validate Email', token);
			callback(null, response({ success: true }));
		} else {
			callback(null, response(authErrors.USER_ALREADY_EXISTED, 400));
		}
	} catch (err) {
		callback(null, response(err, 400));
	}
};

const validate = async (params, callback) => {
	try {
		const { token } = params;
		const users = await user.getIdByResetPasswordToken(token);
		if (users.length > 0) {
			const refreshToken = await user.validate(users[0].id);
			const cert = await signCert(users[0].id);
			cert.refreshToken = refreshToken;
			callback(null, response(cert));
		} else {
			callback(null, response(authErrors.RESET_PASSWORD_TOKEN_EXPIRED, 400));
		}
	} catch (err) {
		console.log(err);
		callback(null, response(err, 400));
	}
};

const resendValidate = async (params, callback) => {
	try {
		const { username } = params;
		const users = await user.getCredentialsByUsername(username);
		if (users.length > 0) {
			const token = await user.setResetPasswordToken(users[0].id);
			await sendEmail(username, 'Validate Email', token);
			callback(null, response({ success: true }));
		} else {
			callback(null, response(authErrors.USER_DOESNT_EXIST, 400));
		}
	} catch (err) {
		callback(null, response(err, 400));
	}
};

const forgotPassword = async (params, callback) => {
	try {
		const { username } = params;
		const users = await user.getCredentialsByUsername(username);
		if (users.length >= 0) {
			const token = await user.setResetPasswordToken(users[0].id);
			await sendEmail(username, 'Reset Password', token);
			callback(null, response({ success: true }));
		} else {
			callback(null, response(authErrors.USER_DOESNT_EXIST, 400));
		}
	} catch (err) {
		callback(null, response(err, 400));
	}
};

const resetPasswordByToken = async (params, callback) => {
	try {
		const { token, newPassword } = params;
		const users = await user.getIdByResetPasswordToken(token);
		if (users.length > 0) {
			await user.resetPassword(users[0].id, newPassword);
			callback(null, response({ success: true }));
		} else {
			callback(null, response(authErrors.RESET_PASSWORD_TOKEN_EXPIRED, 400));
		}
	} catch (err) {
		callback(null, response(err, 400));
	}
};

const resetPasswordByUsername = async (params, callback) => {
	try {
		const { username, password, newPassword } = params;
		const users = await user.getCredentialsByUsername(username);
		if (users.length >= 0) {
			const match = await bcrypt.compare(password, users[0].password);
			if (match) {
				await user.resetPassword(users[0].id, newPassword);
				callback(null, response({ success: true }));
			} else {
				callback(null, response(authErrors.INCORRECT_PASSWORD, 400));
			}
		} else {
			callback(null, response(authErrors.USER_DOESNT_EXIST, 400));
		}
	} catch (err) {
		callback(null, response(err, 400));
	}
};

module.exports = {
	loginByPassword,
	loginByRefreshToken,
	register,
	validate,
	resendValidate,
	forgotPassword,
	resetPasswordByToken,
	resetPasswordByUsername,
};
