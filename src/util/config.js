const path = require('path');
const fs = require('fs');

// JWT Configs
const JWT_SIGN_OPTIONS = { algorithm: 'RS256', expiresIn: 3600 };
const JWT_VERIFY_OPTIONS = { algorithms: ['RS256'] };
const JWT_PUB_CERT = fs.readFileSync(
	path.join(__dirname, '../../sec/jwt.key.pub')
);
const JWT_CERT = fs.readFileSync(path.join(__dirname, '../../sec/jwt.key'));

const PASSWORD_SALT_ROUNDS = 10;
const REFRESH_TOKEN_BYTES = 128;
// Misc
const FORGOT_PASSWORD_EMAIL_TEMPLATE = '';

module.exports = {
	JWT_SIGN_OPTIONS,
	JWT_VERIFY_OPTIONS,
	JWT_PUB_CERT,
	JWT_CERT,
	PASSWORD_SALT_ROUNDS,
	REFRESH_TOKEN_BYTES,
	FORGOT_PASSWORD_EMAIL_TEMPLATE,
};
