const bcrypt = require('bcryptjs');
const user = require('src/model/user');
const response = require('src/util/response');
const { authErrors } = require('src/util/errorTypes');
const { signCert } = require('src/util/auth');

const loginByPassword = async (params, callback) => {
	try {
		const users = await user.getCredentialsByUsername(params.username);
		if (users.length === 0) {
			callback(null, response(authErrors.USER_DOESNT_EXIST, 400));
		} else {
			const match = await bcrypt.compare(params.password, users[0].password);
			if (!match) {
				callback(null, response(authErrors.INCORRECT_PASSWORD, 400));
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
			await user.create(username, password);
			loginByPassword(params, callback);
		} else {
			callback(null, response(authErrors.USER_ALREADY_EXISTED, 400));
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
			const token = await user.setResetPasswordToken(users[0].id)
			await sendEmail('domain.com Password Reset', 'forgot-password', username, { TOKEN: token })
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
		const { resetPasswordToken, new_password } = params;
		const users = await user.getIdByResetPasswordToken(resetPasswordToken)
		if (users.length > 0) {
			const result = await user.resetPassword(users[0].id, new_password);
			callback(null, response(result));
		} else {
			callback(null, response(authErrors.RESET_PASSWORD_TOKEN_EXPIRED, 400));
		}
	} catch (err) {
		callback(null, response(err, 400));
	}
};

const resetPasswordByUsername = async (params, callback) => {
	try {
		const { username, password, new_password } = params;
		const users = await user.getCredentialsByUsername(username);
		if (users.length >= 0) {
			const match = await bcrypt.compare(password, users[0].password);
			if (match) {
				const result = await user.resetPassword(users[0].id, new_password);
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
	forgotPassword,
	resetPasswordByToken,
	resetPasswordByUsername,
};
