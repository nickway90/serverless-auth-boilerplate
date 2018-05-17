const authErrors = {
	NO_USERNAME: {
		code: 1,
		message: 'Please enter username',
	},
	NO_PASSWORD: {
		code: 2,
		message: 'Please enter password',
	},
	NO_REFRESH_TOKEN: {
		code: 3,
		message: 'Refresh token is missing',
	},
	INVALID_GRANT_TYPE: {
		code: 4,
		message: 'Invalid grant type',
	},
	USER_DOESNT_EXIST: {
		code: 5,
		message: "User does't exist",
	},
	INCORRECT_PASSWORD: {
		code: 6,
		message: 'Incorrect password',
	},
	USER_ALREADY_EXISTED: {
		code: 7,
		message: 'User already existed',
	},
	NO_USERNAME_OR_TOKEN: {
		code: 8,
		message: 'Please enter username or token',
	},
	NO_NEW_PASSWORD: {
		code: 9,
		message: 'Please enter new password',
	},
	RESET_PASSWORD_TOKEN_EXPIRED: {
		code: 10,
		message: 'Token is not valid or expired',
	},
	EMAIL_NOT_VALIDATED: {
		code: 11,
		message: 'Email not validated',
	},
};

module.exports = {
	authErrors,
};
