const randomColorGenerator = function() {
  let c = (Math.min(Math.random() * (256), 240) | 0).toString(16)
  return '#'+((1<<24)*(Math.random()+1)|0).toString(16).substr(1)
  //return '#' + c + c + c
}
var date = new Date().toISOString().substring(0, 10)

$(document).ready(function() {
  $("#date").val(date)
  const shaqStatus = document.getElementById('shaqStatus').getContext('2d');
  const bidStatus = document.getElementById('bidStatus').getContext('2d');
  const shaqCompleted = document.getElementById('shaqCompleted').getContext('2d');
  var shaqStatusChart, bidStatusChart, shaqCompletedChart;
  if (shaqStatusChart instanceof Chart) shaqStatusChart.destroy()
  if (bidStatusChart instanceof Chart) bidStatusChart.destroy()

  $("#well_stats_created").html(10)
  $("#well_stats_spent").html(10)
  $("#well_stats_completed").html(10)
  $("#well_stats_invited").html(10)
  $("#well_stats_won").html(10)
  $("#well_stats_revenue").html(10)

  shaqStatusChart = new Chart(shaqStatus, {
    type: 'pie',
    data: {
      labels: ['completed', 'expired', 'failed', 'cancelled'],
      datasets: [{
        label: 'Shaq Status',
        backgroundColor: ['#4FD844', '#FFC266', '#FF5C16', '#5bc0de'],
        data: ['25', '70', '1', '4']
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
        data: ['25', '75']
      }]
    }
  })

  shaqCompletedChart = new Chart(shaqCompleted, {
    type: 'bar',
    data: {
      labels: ['Renault', 'Peugeot', 'Audi', 'Volvo', 'Porsche', 'Faurecia'],
      datasets: [{
        label: 'Shaq Completed',
        backgroundColor: randomColorGenerator,
        data: [1, 2, 3, 4, 3 , 2]
      }]
    },
    options: {
      legend: {
        display: false
      }
    }
  });

})
