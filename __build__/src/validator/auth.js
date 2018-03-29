const loginValidator = (event) => {
  const body = JSON.parse(event.body);
  const params = { grant_type: body.grant_type };
  let err;
  if (body.grant_type === 'password') {
    if (!body.username) {
      err = 'Please enter username';
    } else if (!body.password) {
      err = 'Please enter password';
    } else {
      params.username = body.username;
      params.password = body.password;
    }
  } else if (body.grant_type === 'refresh_token') {
    if (!body.refresh_token) {
      err = 'Refresh token is missing';
    } else {
      params.refresh_token = body.refresh_token;
    }
  } else {
    err = 'Invalid grant type';
  }

  return { err, params }
}

module.exports = {
  loginValidator,
}
