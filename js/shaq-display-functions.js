const Raters = ["UGO", "GOSHIPPO", "SHIPENGINE", "SKYQUOTE", "BOXTAL"];

function pad(n) {
  return (n < 10 ? "0" + n : n);
}

function compareValues(key, order = 'asc') {
  return function(a, b) {
    let comparison = 0;
    if (a[key] > b[key]) {
      comparison = 1;
    } else if (a[key] < b[key]) {
      comparison = -1;
    }
    return (
      (order == 'desc') ? (comparison * -1) : comparison
    );
  };
}

function estimateSaving(shaq, bids, price) {
  let localbids = [];
  let Bids = [];
  for (let Bid in window.bids) {
    Bids.push(window.bids[Bid]);
  }
  Bids.sort(compareValues("reported_at", "desc"));
  for (let bid in Bids) {
    if (Raters.includes(Bids[bid].source[0])) continue;
    if ((Bids[bid].puDate.substring(0,16) !== shaq.puDate.substring(0,16)) || (Bids[bid].deDate.substring(0,16) !== shaq.deDate.substring(0,16))) continue;
    if (!localbids[Bids[bid].source[0]]) {
      localbids[Bids[bid].source[0]] = Bids[bid].price;
    }
  }
  let min = 100000;
  for(let cpt in localbids) {
    min = Math.min(localbids[cpt])
  }
  return (min - price);
}

function TransitCalc(pu, de, pucountry, decountry) {
  let pudateCet = moment.tz(pu, tzSettings.countries[pucountry].timezones[0]).tz("UTC");
  let dedateCet = moment.tz(de, tzSettings.countries[decountry].timezones[0]).tz("UTC");
  let transitTime = moment.duration(dedateCet.diff(pudateCet));
  let transitTimeDays = parseInt(transitTime.asDays());
  let transitTimeHours = parseInt(transitTime.asHours() - parseInt(transitTime.asDays()) * 24);
  let transitTimeMinutes = transitTime.asMinutes() - transitTimeDays * 24 * 60 - transitTimeHours * 60;
  return transitTimeDays + 'd ' + transitTimeHours + 'h ' + transitTimeMinutes + 'm';
}
