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

function TransitCalc(pu, de, pucountry, decountry) {
  let pudateCet = moment.tz(pu, tzSettings.countries[pucountry].timezones[0]).tz("UTC");
  let dedateCet = moment.tz(de, tzSettings.countries[decountry].timezones[0]).tz("UTC");
  let transitTime = moment.duration(dedateCet.diff(pudateCet));
  let transitTimeDays = parseInt(transitTime.asDays());
  let transitTimeHours = parseInt(transitTime.asHours() - parseInt(transitTime.asDays()) * 24);
  let transitTimeMinutes = transitTime.asMinutes() - transitTimeDays * 24 * 60 - transitTimeHours * 60;
  return transitTimeDays + 'd ' + transitTimeHours + 'h ' + transitTimeMinutes + 'm';
}
