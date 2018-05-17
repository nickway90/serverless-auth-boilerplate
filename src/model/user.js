const AWS = require('aws-sdk');
const bcrypt = require('bcryptjs');
const uuid = require('uuid/v4');
const moment = require('moment');
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
				ProjectionExpression: 'password, id, refreshToken, validated',
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
				IndexName: 'refreshToken-index',
				KeyConditionExpression: '#refreshToken = :refreshToken',
				ExpressionAttributeNames: { '#refreshToken': 'refreshToken' },
				ExpressionAttributeValues: { ':refreshToken': refreshToken },
				ProjectionExpression: 'password, id, validated',
			})
			.promise();
		return result.Items;
	} catch (err) {
		return Promise.reject(err);
	}
};

const getIdByResetPasswordToken = async resetPasswordToken => {
	try {
		const result = await docClient
			.query({
				TableName: 'users',
				IndexName: 'resetPasswordToken-index',
				KeyConditionExpression: '#resetPasswordToken = :resetPasswordToken',
				ExpressionAttributeNames: { '#resetPasswordToken': 'resetPasswordToken' },
				ExpressionAttributeValues: { ':resetPasswordToken': resetPasswordToken },
				ProjectionExpression: 'id, resetPasswordTokenExpire',
			})
			.promise();
		return result.Items.filter(item => item.resetPasswordTokenExpire > moment().valueOf());
	} catch (err) {
		return Promise.reject(err);
	}
};

const create = async (username, unhashed) => {
	try {
		const refreshToken = await createRandomBytes(REFRESH_TOKEN_BYTES);
		const password = await bcrypt.hash(unhashed, PASSWORD_SALT_ROUNDS);
		const id = uuid().replace(/-/g, '');
		await docClient.put({
			TableName: 'users',
			Item: {
				id,
				username,
				password,
				validated: false,
				refreshToken,
			},
		}).promise();
		return id;
	} catch (err) {
		return Promise.reject(err);
	}
};

const setResetPasswordToken = async id => {
	try {
		const resetPasswordToken = await createRandomBytes(RESET_PASSWORD_TOKEN_BYTES);
		await docClient.update({
			TableName: 'users',
			Key: { id },
			UpdateExpression: 'set resetPasswordToken = :token, resetPasswordTokenExpire = :expire',
			ExpressionAttributeValues: {
				':token': resetPasswordToken,
				':expire': moment().add(1, 'hour').valueOf(),
			},
		}).promise();
		return resetPasswordToken;
	} catch (err) {
		return Promise.reject(err);
	}
};

const resetPassword = async (id, unhashed) => {
	try {
		const password = await bcrypt.hash(unhashed, PASSWORD_SALT_ROUNDS);
		await docClient.update({
			TableName: 'users',
			Key: { id },
			UpdateExpression: 'set password = :password, resetPasswordTokenExpire = :expire',
			ExpressionAttributeValues: {
				':password': password,
				':expire': moment().valueOf(),
			},
		}).promise();
		return { success: true };
	} catch (err) {
		return Promise.reject(err);
	}
};

const validate = async id => {
	try {
		const user = await docClient.update({
			TableName: 'users',
			Key: { id },
			UpdateExpression: 'set validated = :validated, resetPasswordTokenExpire = :expire',
			ExpressionAttributeValues: {
				':validated': true,
				':expire': moment().valueOf(),
			},
			ReturnValues: 'ALL_NEW',
		}).promise();
		return user.Attributes.refreshToken;
	} catch (err) {
		return Promise.reject(err);
	}
};

module.exports = {
	getCredentialsByUsername,
	getCredentialsByRefreshToken,
	getIdByResetPasswordToken,
	create,
	setResetPasswordToken,
	resetPassword,
	validate,
};
