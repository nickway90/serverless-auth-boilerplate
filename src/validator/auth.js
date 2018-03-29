const { authErrors } = require('src/service/errorTypes');

const loginValidator = event => {
  const body = JSON.parse(event.body);
  const params = { grant_type: body.grant_type };
  let err;
  if (body.grant_type === 'password') {
    if (!body.username) {
      err = authErrors.NO_USERNAME;
    } else if (!body.password) {
      err = authErrors.NO_PASSWORD;
    } else {
      params.username = body.username;
      params.password = body.password;
    }
  } else if (body.grant_type === 'refresh_token') {
    if (!body.refresh_token) {
      err = authErrors.NO_REFRESH_TOKEN;
    } else {
      params.refresh_token = body.refresh_token;
    }
  } else {
    err = authErrors.INVALID_GRANT_TYPE;
  }
  return { err, params }
}

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
  return { err, params }
}

module.exports = {
  loginValidator,
  registerValidator,
}
