module.exports = (event, callback, validator, controller) => {
  if (event.source === 'serverless-plugin-warmup') {
    console.log('WarmUP - Lambda is warm!')
    return callback(null, 'Lambda is warm!')
  }
  const { err, params } = validator(event);
  if (!err) {
    controller(params, callback);
  } else {
    callback(null, response(err, 400))
  }
}
