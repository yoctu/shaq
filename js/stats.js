const randomColorGenerator = function() {
  let c = (Math.min(Math.random() * (256), 240) | 0).toString(16)
  return '#' + ((1 << 24) * (Math.random() + 1) | 0).toString(16).substr(1)
}
var datefrom = new Date().toISOString().substring(0, 10)
var dateto = new Date().toISOString().substring(0, 10)

$(document).ready(function() {
  $("#datefrom").val(datefrom)
  $("#dateto").val(dateto)
  const shaqStatus = document.getElementById('shaqStatStatus').getContext('2d');
  const bidStatus = document.getElementById('bidStatStatus').getContext('2d');
  const shaqCompleted = document.getElementById('shaqCompleted').getContext('2d');
  var shaqStatusChart, bidStatusChart, shaqCompletedChart;

  $("#well_stats_created").html(0)
  $("#well_stats_completed").html(0)
  $("#well_stats_invited").html(0)
  $("#well_stats_won").html(0)
  $("#well_stats_spent").html(0 + localSettings.currency.substring(0, 1).replace('E', '€').replace('D', '$'))
  $("#well_stats_revenue").html(0 + localSettings.currency.substring(0, 1).replace('E', '€').replace('D', '$'))

  function init() {
    if (shaqStatusChart instanceof Chart) shaqStatusChart.destroy()
    if (bidStatusChart instanceof Chart) bidStatusChart.destroy()
    $.ajax({
      "url": encodeURI('https://' + auth.auth.usercode + '.shaq' + auth.auth.env + '.yoctu.solutions/api/shaq-archive/' + auth.auth.usercode + '?q=archived_at:[' + datefrom + 'T00:00:00Z TO ' + dateto + 'T23:59:50Z]&rows=1000&fl=status,key,source,target,reported_at,archived_at'),
      "dataType": "json",
      "json": "json.wrf",
      "headers": {
        "redspher-auth": "yes",
        "Authorization": "Basic " + auth.auth.authbasic
      },
      "statusCode": {
        "429": function(xhr) {
          status429();
        }
      },
      "success": function(shaqs) {
        let result = []
        result['expired'] = result['completed'] = result['failed'] = result['cancelled'] = 0;
        let created = invited = revenue = spent = 0;
        for (const j in shaqs.docs) {
          result[shaqs.docs[j].status]++;
          if (shaqs.docs[j].source.includes(auth.auth.usercode)) created++;
          if (shaqs.docs[j].target.includes(auth.auth.usercode)) invited++;
        }
        $("#well_stats_created").html(created)
        $("#well_stats_invited").html(invited)
        $("#well_stats_completed").html(result['completed'])
        $.ajax({
          "url": encodeURI('https://' + auth.auth.usercode + '.shaq' + auth.auth.env + '.yoctu.solutions/api/bid-archive/' + auth.auth.usercode + '?q=status:accepted AND archived_at:[' + datefrom + 'T00:00:00Z TO ' + dateto + 'T23:59:50Z]&rows=1000&fl=status,key,source,target,reported_at,archived_at,price'),
          "dataType": "json",
          "json": "json.wrf",
          "headers": {
            "redspher-auth": "yes",
            "Authorization": "Basic " + auth.auth.authbasic
          },
          "statusCode": {
            "429": function(xhr) {
              status429();
            }
          },
          "success": function(bids) {
            for (const j in bids.docs) {
              if (bids.docs[j].source.includes(auth.auth.usercode)) revenue += parseInt(bids.docs[j].price);
              if (bids.docs[j].target.includes(auth.auth.usercode)) spent += parseInt(bids.docs[j].price);
            }
            $("#well_stats_spent").html(spent + localSettings.currency.substring(0, 1).replace('E', '€').replace('D', '$'))
            $("#well_stats_revenue").html(revenue + localSettings.currency.substring(0, 1).replace('E', '€').replace('D', '$'))
            $("#well_stats_won").html(bids.numFound)
            shaqStatusChart = new Chart(shaqStatus, {
              type: 'pie',
              data: {
                labels: ['completed', 'expired', 'failed', 'cancelled'],
                datasets: [{
                  label: 'Shaq Status',
                  backgroundColor: ['#4FD844', '#FFC266', '#FF5C16', '#5bc0de'],
                  data: [result['completed'], result['expired'], result['failed'], result['cancelled']]
                }]
              },
              options: {
                legend: {
                  display: false
                }
              }
            })
            bidStatusChart = new Chart(bidStatus, {
              type: 'pie',
              data: {
                labels: ['won', 'lost'],
                datasets: [{
                  label: 'Bid Status',
                  backgroundColor: ['#4FD844', '#FF5C16'],
                  data: [bids.numFound, shaqs.numFound]
                }]
              }
            })
          }
        })
      }
    })
  }
  shaqCompletedChart = new Chart(shaqCompleted, {
    type: 'bar',
    data: {
      labels: ['Renault', 'Peugeot', 'Audi', 'Volvo', 'Porsche', 'Faurecia'],
      datasets: [{
        label: 'Shaq Completed',
        backgroundColor: randomColorGenerator,
        data: [1, 2, 3, 4, 3, 2]
      }]
    },
    options: {
      legend: {
        display: false
      }
    }
  });

  $("#statRefresh").on('click', function() {
    let df = new Date($("#datefrom").val())
    let dt = new Date($("#dateto").val())
    if (df < dt) {
      datefrom = $("#datefrom").val();
      dateto = $("#dateto").val();
      init();
    } else {
      datefrom = new Date().toISOString().substring(0, 10)
      dateto = new Date().toISOString().substring(0, 10)
      $("#datefrom").val(datefrom)
      $("#dateto").val(dateto)
    }
  })

  init();

})
