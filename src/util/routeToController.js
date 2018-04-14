const response = require('src/util/response');

module.exports = (event, callback, validator, controller) => {
	// When the call is to warm the function, ignore it
	if (event.source === 'serverless-plugin-warmup') {
		return callback(null, 'Lambda is warm!');
	}
	const { err, params } = validator(event);
	if (!err) {
		controller(params, callback);
	} else {
		callback(null, response(err, 400));
	}
};
