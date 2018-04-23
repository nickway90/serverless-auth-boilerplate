const AWS = require('aws-sdk');
const bcrypt = require('bcryptjs');
const uuid = require('uuid/v4');
const docClient = new AWS.DynamoDB.DocumentClient();
const {
	PASSWORD_SALT_ROUNDS,
	REFRESH_TOKEN_BYTES,
	RESET_PASSWORD_TOKEN_BYTES,
} = require('src/util/config');
const { createRandomBytes } = require('src/util/auth');

const getCredentialsByUsername = async username => {
	try {
		const result = await docClient
			.query({
				TableName: 'users',
				IndexName: 'username-index',
				KeyConditionExpression: '#username = :username',
				ExpressionAttributeNames: { '#username': 'username' },
				ExpressionAttributeValues: { ':username': username },
				ProjectionExpression: 'password, id, refreshToken',
			})
			.promise();
		return result.Items;
	} catch (err) {
		return Promise.reject(err);
	}
};

const getCredentialsByRefreshToken = async refreshToken => {
	try {
		const result = await docClient
			.query({
				TableName: 'users',
				IndexName: 'refreshToken_index',
				KeyConditionExpression: '#refreshToken = :refreshToken',
				ExpressionAttributeNames: { '#refreshToken': 'refreshToken' },
				ExpressionAttributeValues: { ':refreshToken': refreshToken },
				ProjectionExpression: 'password, id',
			})
			.promise();
		return result.Items;
	} catch (err) {
		return Promise.reject(err);
	}
};

const create = async (username, unhashed) => {
	try {
		const refreshToken = await createRandomBytes(REFRESH_TOKEN_BYTES);
		const password = await bcrypt.hash(unhashed, PASSWORD_SALT_ROUNDS);
		await docClient.put({
			TableName: 'users',
			Item: {
				id: uuid().replace(/-/g, ''),
				username,
				password,
				refreshToken,
			},
		}).promise();
		return { success: true };
	} catch (err) {
		return Promise.reject(err);
	}
};

const setResetPasswordToken = async id => {
	try {
		const resetPasswordToken = await createRandomBytes(REFRESH_TOKEN_BYTES);
		await docClient.update({
			TableName: 'users',
			Key: { id },
			UpdateExpression: 'set resetPasswordToken = :token, resetPasswordTokenExpire = :expire',
			ExpressionAttributeValues: {
				':token': resetPasswordToken,
				':expire': moment().add(1, 'hour').valueOf(),
			}
		}).promise();
		return resetPasswordToken;
	} catch(err) {
		return Promise.reject(err);
	}
}

module.exports = {
	getCredentialsByUsername,
	getCredentialsByRefreshToken,
	create,
	setResetPasswordToken,
};
