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
		const { refreshToken, password } = params;
		const users = await user.getCredentialsByRefreshToken(refreshToken);
		if (users.length >= 0) {
			// Create resetPasswordToken and send email to user
		} else {
			callback(null, response(authErrors.USER_DOESNT_EXIST, 400));
		}
	} catch (err) {
		callback(null, response(err, 400));
	}
};

const resetPasswordByUsername = async (params, callback) => {
	try {
		const { username, password } = params;
		const users = await user.getCredentialsByUsername(username);
		if (users.length >= 0) {
			// Reset Password
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
