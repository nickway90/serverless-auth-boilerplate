const Chromeless = require('chromeless').default;
const moment = require('moment');
const qs = require('query-string');
const response = require('../service/response');
const { CHROMELESS_CONFIG, CX_PORTAL_ROOT_URL, CX_PORTAL_ROSTER_URL, CX_PORTAL_CREW_URL } = require('../config');
const { parseTable, navRoster, getRoster, returnRosterDom, returnCrewDom, parseCrew, getCrew } = require('../service/roster');
const user = require('../model/user');

const postController = (params, callback) => __async(function*(){
  const { username, password } = params;
  const chromeless = new Chromeless(CHROMELESS_CONFIG);
  let this_month, prev_month;
  // Detection of Pop Up, Scrape published roster on 15, 16, 17
  chromeless.goto(CX_PORTAL_ROOT_URL)
    .type(username, 'input[name="username"]')
    .type(password, 'input[name="password"]')
    .click('.credentials_input_submit')
    .wait('#credentials_table_postheader :first-child :first-child,.favorite')
    .evaluate(navRoster, CX_PORTAL_ROSTER_URL())
    .then(err => {
      console.log(err);
      if (err) throw err;
      return chromeless.wait('table:nth-child(5),.header:nth-child(4)').evaluate(returnRosterDom)
    })
    .then((html) => {
      this_month = parseTable(html);
      const PREV_MONTH = moment().months(this_month.month).subtract(1, 'months').format('YYYYMM')
      return chromeless.evaluate(getRoster, CX_PORTAL_ROSTER_URL(PREV_MONTH))
    })
    .then(() => chromeless.wait('table:nth-child(5),.header:nth-child(4)').evaluate(returnRosterDom))
    .then((html) => __async(function*(){
      prev_month = html ? parseTable(html) : null;
      chromeless.end();
      const rosters = { this_month, prev_month };
      if (!params.user_id) {
        yield user.register(username, password, rosters);
      } else {
        yield user.updateRosters(params.user_id, rosters);
      }

      callback(null, response({ success: true }));
    }()))
    .catch((err) => {
      console.log('RETURN', err);
      chromeless.end();
      callback(null, response({ err }, 400));
    })
}())

const getCrewController = (params, callback) => __async(function*(){
  const { username, password } = params;
  const query = qs.stringify({
    stdate: params.stdate,
    fltno: params.fltno,
    sectorfr: params.sectorfr,
    sectorto: params.sectorto,
  });
  const chromeless = new Chromeless(CHROMELESS_CONFIG);
    chromeless.goto(CX_PORTAL_ROOT_URL)
      .type(username, 'input[name="username"]')
      .type(password, 'input[name="password"]')
      .click('.credentials_input_submit')
      .wait('#credentials_table_postheader :first-child :first-child,.favorite')
      .evaluate(navRoster, CX_PORTAL_CREW_URL())
      .then(err => {
        console.log(err);
        if (err) throw err;
        return chromeless
          .wait('table')
          .evaluate(getRoster, CX_PORTAL_CREW_URL(query))
      })
      .then(() => {
        return chromeless
          .wait('table.outer_frame table')
          .evaluate(returnCrewDom)
      })
      .then(html => {
        const crew = html ? parseCrew(html) : null
        chromeless.end();
        callback(null, response(crew));
      })
      .catch((err) => {
        console.log('RETURN', err);
        chromeless.end();
        callback(null, response({ err }, 400));
      })
}())

const getController = (params, callback) => __async(function*(){
  try {
    const { Items } = yield user.getRosters(params.user_id);
    callback(null, response(Items[0].rosters));
  } catch(err) {
    console.log(err);
    callback(null, response({ err }, 400));
  }
}())

module.exports = {
  postController,
  getController,
  getCrewController,
}

function __async(g){return new Promise(function(s,j){function c(a,x){try{var r=g[x?"throw":"next"](a)}catch(e){j(e);return}r.done?s(r.value):Promise.resolve(r.value).then(c,d)}function d(e){c(e,1)}c()})}
