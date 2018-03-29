const { postValidator, getValidator, getCrewValidator } = require('../validator/roster');
const { postController, getController, getCrewController } = require('../controller/roster');
const response = require('../service/response');
const warmup = require('../service/warmup');

exports.post = (event, context, callback) => __async(function*(){
  warmup(event, callback);
  const { err, params } = yield postValidator(event);
  if (!err) {
    postController(params, callback);
  } else {
    callback(null, response({ err }, 400))
  }
}())

exports.getCrew = (event, context, callback) => __async(function*(){
  warmup(event, callback);
  const { err, params } = yield getCrewValidator(event);
  if (!err) {
    getCrewController(params, callback);
  } else {
    callback(null, response({ err }, 400))
  }
}())

exports.get = (event, context, callback) => __async(function*(){
  warmup(event, callback);
  const { err, params } = yield getValidator(event);
  if (!err) {
    getController(params, callback);
  } else {
    callback(null, response({ err }, 400))
  }
}())

function __async(g){return new Promise(function(s,j){function c(a,x){try{var r=g[x?"throw":"next"](a)}catch(e){j(e);return}r.done?s(r.value):Promise.resolve(r.value).then(c,d)}function d(e){c(e,1)}c()})}
