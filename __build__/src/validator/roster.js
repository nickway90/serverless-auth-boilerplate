const moment = require('moment');
const user = require('../model/user');
const { verifyToken } = require('../service/auth');

const postValidator = (event) => __async(function*(){
  const body = JSON.parse(event.body);
  let err;
  let res = [];
  if (typeof body.username !== 'string') {
    err = 'Please enter username';
  } else if (typeof body.password !== 'string') {
    err = 'Please enter password';
  } else {
    try {
      res = yield user.getCredentialsByUsername(body.username);
      if (res.Items.length > 0 && moment().diff(moment(res.Items[0].last_sync), 'minutes') < 5) {
        err = 'You can only sync roster every 5 minutes';
      }
    } catch(error) {
      err = error;
    }
  }
  const params = {
    username: body.username,
    password: body.password,
  };
  if (res.Items.length > 0) {
    params.user_id = res.Items[0].id;
  }
  return { err, params }
}())

const getCrewValidator = (event) => __async(function*(){
  const body = JSON.parse(event.body);
  let err;
  let res = [];
  if (typeof body.username !== 'string') {
    err = 'Please enter username';
  } else if (typeof body.password !== 'string') {
    err = 'Please enter password';
  } else if (!body.stdate) {
    err = 'Please enter stdate';
  } else if (!body.fltno) {
    err = 'Please enter fltno';
  } else if (!body.sectorfr) {
    err = 'Please enter sectorfr';
  } else if (!body.sectorto) {
    err = 'Please enter sectorto';
  }
  const params = {
    username: body.username,
    password: body.password,
    stdate: body.stdate,
    fltno: body.fltno,
    sectorfr: body.sectorfr,
    sectorto: body.sectorto,
  };
  return { err, params }
}())

const getValidator = (event) => __async(function*(){
  let err;
  const params = {}
  try {
    const id = yield verifyToken(event.headers.Authorization);
    params.user_id = id;
  } catch(error) {
    err = error
  }

  return { err, params }
}())

module.exports = {
  postValidator,
  getValidator,
  getCrewValidator
}

function __async(g){return new Promise(function(s,j){function c(a,x){try{var r=g[x?"throw":"next"](a)}catch(e){j(e);return}r.done?s(r.value):Promise.resolve(r.value).then(c,d)}function d(e){c(e,1)}c()})}
