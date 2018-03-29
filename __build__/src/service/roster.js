const cheerio = require('cheerio');
const cheerioTableparser = require('cheerio-tableparser');
const moment = require('moment');
const _ = require('lodash');
const { CX_PORTAL_CREW_URL } = require('../config');


const parseTable = (html) => {
  $ = cheerio.load(html);
  cheerioTableparser($);
  let index = -1;
  let lastDestination = '';
  let origin = ''
  const rawData = $('table').parsetable(false, false, true);
  const length = rawData[0].length;
  const duties = [];
  const year = Number(rawData[0][0].split(/\s+/)[1])
  // Loop through the table, skip the first 2 rows
  for (let i = 2; i < length; i++) {
    const dateArr = rawData[0][i].split(/\s+/);
    // If the entire row is empty, skip this row (probably the last row only)
    let shouldPush = false;
    for (let j = 0; j < 10; j++) {
      if (rawData[j][i]) {
        shouldPush = true;
        break;
      }
    }

    if (shouldPush) {
      const item = {
        duty: rawData[1][i],
        sector: rawData[2][i],
        special: rawData[3][i],
        aircraft: rawData[4][i],
        duty_start: rawData[5][i],
        departure_time: rawData[6][i],
        arrival_time: rawData[7][i],
        duty_end: rawData[8][i],
        total_duty: rawData[9][i],
      };
      // As DynamoDB doesn't allow empty string, we will remove the field if it's empty
      Object.keys(item).forEach((key) => !item[key] && delete item[key]);
      // If date is missing in row, push it to last date's items (probably multiple duties in 1 day)
      if (!rawData[0][i]) {
        duties[index].dates[duties[index].dates.length - 1].items.push(item);
        if (item.duty.match(/^\d{4}$/)) {
          lastDestination = item.sector.split(/\s+/)[1];
        } else if (item.duty.match(/^S\d{4}$/)) {
          lastDestination = item.sector;
        } else {
          lastDestination = '';
        }
        if (item.duty.match(/^\d{4}$/) || item.duty.match(/^XX\d{4}$/)) {
          item.type = 'D';
          item.duty = `CX${item.duty.substr(item.duty.length - 3)}`;
        } else if (item.duty.match(/^S\d{4}$/)) {
          item.type = 'D';
        } else {
          item.type = item.duty.match(/^R\d{1}T$/) ? 'R' : item.duty;
        }
        // If duty field is missing, update the last duty item's time record (probably same duty across 2 days)
      } else if (!rawData[1][i]) {
        const items = duties[index].dates[duties[index].dates.length - 1].items;
        if (rawData[6][i]) { items[items.length - 1].departure_time = rawData[6][i] + '(+1)'; }
        if (rawData[7][i]) { items[items.length - 1].arrival_time = rawData[7][i] + '(+1)'; }
        if (rawData[8][i]) { items[items.length - 1].duty_end = rawData[8][i] + '(+1)'; }
        if (rawData[9][i]) { items[items.length - 1].total_duty = rawData[9][i]; }
        duties[index].dates.push({
          date: moment().year(year).month(dateArr[1]).date(Number(dateArr[0])).startOf('day').valueOf(),
          items: [item],
        })
      } else {
        let type = '';
        // Normal duty
        if (item.duty.match(/^\d{4}$/) || item.duty.match(/^XX\d{4}$/)) {
          type = 'D';
          item.duty = `CX${item.duty.substr(item.duty.length - 3)}`;
          // Determine if it is the return duty of the last duty
          if (item.sector.split(/\s+/)[0] !== lastDestination && (lastDestination !== origin || !origin)) {
            origin = item.sector.split(/\s+/)[0];
            index++;
            duties.push({dates: [], type: ''});
          }
          lastDestination = item.sector.split(/\s+/)[1];
          // Simulator duty
        } else if (item.duty.match(/^S\d{4}$/)) {
          type = 'D';
          // Determine if it is the same simulator duty with the last duty
          if (item.sector !== lastDestination) {
            index++;
            duties.push({dates: [], type: ''});
          }
          lastDestination = item.sector;
          // No duty (eg, G, L, U...) or R?T
        } else {
          type = item.duty.match(/^R\d{1}T$/) ? 'R' : item.duty;
          index++;
          lastDestination = '';
          origin = '';
          duties.push({dates: [], type: ''});
        }
        duties[index].type = type;
        item.type = type;
        duties[index].dates.push({
          date: moment().year(year).month(dateArr[1]).date(Number(dateArr[0])).startOf('day').valueOf(),
          items: [item],
        })
      }
    }
  }

  return {
    year,
    month: moment().month(rawData[0][0].split(/\s+/)[0]).month(),
    duties,
  };
}

const navRoster = url => {
  // This DOM will be shown on Login ERROR
  const err1Dom = document.getElementById('credentials_table_postheader');
  const err2Dom = document.getElementById("img[name='yes']");
  // This DOM will be shown on Login SUCCESS
  const successDom = document.getElementsByClassName('favorite');
  if (err1Dom) {
    return errDom.childNodes[0].childNodes[0].innerHTML;
  } else if (err2Dom) {
    return 'You have a notification in your CX portal. Do you want to acknowledge?'
  } else if (successDom) {
    // Open Real Time Roster for this month
    F5_Invoke_open(window, [0x6f,0x70,0x65,0x6e], url, "_self", "");
    return;
  } else {
    return 'Unknown Error';
  }
}

const getRoster = url => {
  // Open Real Time Roster for next month
  F5_Invoke_open(window, [0x6f,0x70,0x65,0x6e], url, "_self", "");
  return;
}

const returnRosterDom = () => {
  const dom = document.querySelector('table:nth-child(5)');
  return dom ? dom.outerHTML : null
};

const returnCrewDom = () => {
  const dom = document.querySelectorAll('table.outer_frame table')[1];
  return dom ? dom.outerHTML : null
};

const parseCrew = html => {
  $ = cheerio.load(html);
  cheerioTableparser($);
  const rawData = $('table').parsetable(false, false, true);
  const length = rawData[0].length;
  const crew = [];
  for (let i = 1; i < length; i++) {
    crew.push({
      crew_id: rawData[0][i],
      badge_name: rawData[1][i],
      cat: rawData[2][i],
      basing: rawData[5][i],
    })
  }
  return crew
}

module.exports = {
  parseTable,
  navRoster,
  getRoster,
  returnCrewDom,
  returnRosterDom,
  parseCrew,
}
