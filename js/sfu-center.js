var o = {};
var rows = 10;
var start = 0;
var order = [
  [0, 'asc']
];
var sort = ["reported_at", "desc"];
var query = ["*", "*"];
var solrTarget = "";

const VehiclePlace = new URLSearchParams(location.search).has('plate') ? new URLSearchParams(location.search).get('plate') : "";

localStorage.setItem(auth.auth.usercode + "-shaqCenterID", window.id)
window.addEventListener('storage', storageChanged);

function storageChanged(event) {
  if (window.id !== localStorage.getItem(auth.auth.usercode + "-shaqCenterID")) window.location.href = "/close.html";
}

function cancelSfu(shaq) {
  $.ajax({
    "url": 'https://' + auth.auth.usercode + '.shaq' + auth.auth.env +  '.yoctu.solutions/api/shaq/' + auth.auth.usercode + "/cancel/" + shaq,
    "type": "POST",
    "dataType": "json",
    "contentType": "application/json",
    "headers": {
      "redspher-auth": "yes",
      "Authorization": "Basic " + auth.auth.authbasic
    },
    "success": function(msgs) {
    }
  });
}

function addBid(msg) {
  $('span[data-id=' + msg.key + ']').text(parseInt($('span[data-id=' + msg.key + ']').text()) + 1);
  $('span[data-bids-number=' + msg.key + '_' + msg.source[0] + ']').text(parseInt($('span[data-bids-number=' + msg.key + '_' + msg.source[0] + ']').text()) + 1).addClass(msg.id);
}

var renderFunctionShipper = function(data, type, row, meta) {
  return data[0]
};

function renderFuncPlace(row, data, type) {
  let displayDate = moment(row.destination_point.departure_at).tz('UTC').format('YYYY-MM-DD H:mm');
  if (type === "pu") displayDate = moment(row.starting_point.departure_at).tz('UTC').format('YYYY-MM-DD H:mm');
  let returnData = '<b>' + displayDate + '</b><br>';
  returnData += data.address_street + '<br>';
  returnData += data.address_zip_code + ' ' + data.address_city + '<br>';
  returnData += ' <img class="pull-right" width="24px" title="' + data.address_country + '" src="https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.2.1/flags/4x3/' + data.address_country.toLowerCase() + '.svg" /><br>';
  return returnData;
}

var renderFunctionPUPlace = function(data, type, row, meta) {
  return renderFuncPlace(row, data, "pu");
};

var renderFunctionDEPlace = function(data, type, row, meta) {
  return renderFuncPlace(row, data, "de");
};

var renderFuncKey = function(data, type, row, meta) {
  let IdData = JSON.stringify(data).replace(/\"|\[|\]/g, '');
  let IdDataRender = "";
  let from = "carrier"
  if (row.shippers[0] === auth.auth.usercode) from = 'shipper'
  if ((solrTarget !== "-archive") && (auth.auth.usercode === row.shippers[0])) IdDataRender += ' <a onclick="cancelSfu(\'' + row.key + '\');" class="close-shaq"><span class="glyphicon glyphicon-trash"> </span></a>';
  IdDataRender += '&nbsp;<a href="/track.html?from=' + from + '&key=' + row.key + '&type=' + solrTarget + '&' + window.location.search.substr(1) + '" target="_blank">' + IdData + '</a>&nbsp;<span class="label label-primary" data-id="' + row.key + '">0</span>&nbsp;';
  IdDataRender += '<br><br><div class="pull-right"><img width="32px;" src="' + auth.app.logourl + row.creator + '.png" title="TMS : ' + row.creator + '"/></div>';
  return IdDataRender;
}

window.cols = [{
    data: 'key',
    filterable: true,
    sortable: true,
    render: renderFuncKey
  },
  {
    data: 'state',
    filterable: true,
    sortable: true
  },
  {
    data: 'shippers',
    filterable: true,
    sortable: true,
    render: renderFunctionShipper
  },
  {
    data: 'vehicle_owner',
    filterable: true,
    sortable: true
  },
  {
    data: 'starting_point',
    filterable: true,
    sortable: true,
    render: renderFunctionPUPlace
  },
  {
    data: 'destination_point',
    filterable: true,
    sortable: true,
    render: renderFunctionDEPlace
  }
];

$("#shaq-navbar-url").attr("href", auth.orderingurl);
if (localSettings && localSettings.pageLenght) {
  rows = localSettings.pageLenght;
}

$('#sfuCarrierList').DataTable({
  "columns": window.cols,
  "order": order,
  "pageLength": rows,
  "searching": false,
  "lengthChange": true,
  "autoWidth": false,
  "responsive": true,
  "processing": true,
  "serverSide": true,
  "pagingType": "numbers",
  "ajax": function(data, callback, settings) {
    $.ajax({
      "url": 'https://' + auth.auth.usercode + '.shaq' + auth.auth.env +  '.yoctu.solutions/api/transports' + solrTarget + '/' + auth.auth.usercode + '?rows=' + rows + '&start=' + start,
      "dataType": "json",
      "json": "json.wrf",
      "headers": {
        "redspher-auth": "yes",
        "Authorization": "Basic " + auth.auth.authbasic
      },
      "statusCode": {
        "429": function(xhr) {
          var o = {
            recordsTotal: 0,
            recordsFiltered: 0,
            data: {}
          };
          callback(o);
          status429();
        }
      },
      "success": function(json) {
        window.transports = []
        for (const t in json.docs) {
          if (VehiclePlace !== '') {
              if (VehiclePlace.toUpperCase() === json.docs[t].vehicle.toUpperCase()) window.transports.push(json.docs[t])
          } else window.transports.push(json.docs[t])
        }
        o = {
          recordsTotal: json.numFound,
          recordsFiltered: rows,
          data: window.transports
        };
        $("#CenterPage").removeClass("hide");
        callback(o);
        if (json.numFound > 0) {
        } else $("#sfuCarrierList").find("tr td:first-child").css("border-left-width","0px");
      }
    });
  }
});

$('#sfuShipperList').DataTable({
  "columns": window.cols,
  "order": order,
  "pageLength": rows,
  "searching": false,
  "lengthChange": true,
  "autoWidth": false,
  "responsive": true,
  "processing": true,
  "serverSide": true,
  "pagingType": "numbers",
  "ajax": function(data, callback, settings) {
    $.ajax({
      "url": 'https://' + auth.auth.usercode + '.shaq' + auth.auth.env +  '.yoctu.solutions/api/tracks' + solrTarget + '/' + auth.auth.usercode + '?rows=' + rows + '&start=' + start,
      "dataType": "json",
      "json": "json.wrf",
      "headers": {
        "redspher-auth": "yes",
        "Authorization": "Basic " + auth.auth.authbasic
      },
      "statusCode": {
        "429": function(xhr) {
          var o = {
            recordsTotal: 0,
            recordsFiltered: 0,
            data: {}
          };
          callback(o);
          status429();
        }
      },
      "success": function(json) {
        window.transports = json.docs;
        o = {
          recordsTotal: json.numFound,
          recordsFiltered: rows,
          data: window.transports
        };
        $("#CenterPage").removeClass("hide");
        callback(o);
        if (json.numFound > 0) {
        } else $("#sfuShipperList").find("tr td:first-child").css("border-left-width","0px");
      }
    });
  }
});

$('#sfuCarrierList').on('length.dt', function(e, settings, len) {
  rows = len;
});

$('#sfuShipperList').on('length.dt', function(e, settings, len) {
  rows = len;
});

$('#sfuCarrierList thead tr th').each(function(i) {
  var title = $(this).text();
  if (window.cols[$(this)[0].cellIndex].filterable) {
    $(this).append('<br><input class="dtInputFilter" type="text" --data-column="' + i + '" placeholder="Search ' + title + '" />');
    $('input', this).on('keyup', function(k) {
      if (k.keyCode == 13) {
        let value = this.value;
        query[0] = window.cols[i].data;
        if (value) {
          query[1] = "*" + value + "*";
        } else {
          query[1] = "*";
        }
        $('#sfuCarrierList').DataTable().draw();
      }
    });
  }
});

$('#sfuShipperList thead tr th').each(function(i) {
  var title = $(this).text();
  if (window.cols[$(this)[0].cellIndex].filterable) {
    $(this).append('<br><input class="dtInputFilter" type="text" --data-column="' + i + '" placeholder="Search ' + title + '" />');
    $('input', this).on('keyup', function(k) {
      if (k.keyCode == 13) {
        let value = this.value;
        query[0] = window.cols[i].data;
        if (value) {
          query[1] = "*" + value + "*";
        } else {
          query[1] = "*";
        }
        $('#sfuShipperList').DataTable().draw();
      }
    });
  }
});

$('#sfuCarrierList_length').css("width", "50%");
$("#sfuCarrierList_wrapper #sfuCarrierList_length").after('<div class="pull-right"><select id="solrCarrierTarget" class="form-control">' +
  '<option value="open">Open</option><option value="close">Close</option>' +
  '</select></div>');
  $("#sfuCarrierList_wrapper #sfuCarrierList_length").after('<div class="pull-right" style="margin-left:10px;"><select id="sfuCarrierStatus" class="form-control">' +
    '<option value="all">All</option><option value="PLANNED">PLANNED</option><option value="RUNNING">RUNNING</option><option value="WAITING FOR PICKUP>WAITING FOR PICKUP</option><option value="WAITING FOR DELIVERY">WAITING FOR DELIVERY</option><option value="DELIVERED">DELIVERED</option><option value="LATE">LATE</option>' +
    '</select></div>');
$("#sfuCarrierList_wrapper #sfuCarrierList_length").after('<div class="pull-right" title="refresh"><span style="padding-left:20px;"></span><span id="solrCarrierRefresh" class="glyphicon glyphicon-refresh"></span>');
$("#sfuCarrierList_wrapper #sfuCarrierList_length").after('<div class="pull-right" title="clear filters"><span style="padding-left:20px;"></span><span id="solrCarrierReload" class="glyphicon glyphicon-repeat"></span>');

$("#solrCarrierRefresh").on("click", function() {
  $('#sfuCarrierList').DataTable().draw();
});

$("#solrCarrierReload").on("click", function() {
  $(".dtInputFilter").val("");
  $("#sfuCarrierStatus").val('all')
  query = ["*", "*"];
  $('#sfuCarrierList').DataTable().draw();
});

$("#sfuCarrierStatus").change(function() {
  solrStatus = $("#sfuCarrierStatus").val();
  if (solrStatus === 'all') query = ["*", "*"]
  else query = ['status', solrStatus]
  $('#sfuCarrierList').DataTable().draw();
})



$('#sfuShipperList_length').css("width", "50%");
$("#sfuShipperList_wrapper #sfuShipperList_length").after('<div class="pull-right"><select id="solrShipperTarget" class="form-control">' +
  '<option value="open">Open</option><option value="close">Close</option>' +
  '</select></div>');
  $("#sfuShipperList_wrapper #sfuShipperList_length").after('<div class="pull-right" style="margin-left:10px;"><select id="sfuShipperStatus" class="form-control">' +
    '<option value="all">All</option><option value="PLANNED">PLANNED</option><option value="RUNNING">RUNNING</option><option value="WAITING FOR PICKUP>WAITING FOR PICKUP</option><option value="WAITING FOR DELIVERY">WAITING FOR DELIVERY</option><option value="DELIVERED">DELIVERED</option><option value="LATE">LATE</option>' +
    '</select></div>');
$("#sfuShipperList_wrapper #sfuShipperList_length").after('<div class="pull-right" title="refresh"><span style="padding-left:20px;"></span><span id="solrShipperRefresh" class="glyphicon glyphicon-refresh"></span>');
$("#sfuShipperList_wrapper #sfuShipperList_length").after('<div class="pull-right" title="clear filters"><span style="padding-left:20px;"></span><span id="solrShipperReload" class="glyphicon glyphicon-repeat"></span>');

$("#solrCarrierRefresh").on("click", function() {
  $('#sfuCarrierList').DataTable().draw();
});

$("#solrCarrierReload").on("click", function() {
  $(".dtInputFilter").val("");
  $("#sfuCarrierStatus").val('all')
  query = ["*", "*"];
  $('#sfuCarrierList').DataTable().draw();
});

$("#sfuCarrierStatus").change(function() {
  solrStatus = $("#sfuCarrierStatus").val();
  if (solrStatus === 'all') query = ["*", "*"]
  else query = ['status', solrStatus]
  $('#sfuCarrierList').DataTable().draw();
})

$("#solrCarrierTarget").change(function() {
  for (var p in window.cols) {
    if (window.cols[p].data === "targetName") break;
  }
  switch ($(this).find(":selected").val()) {
    case "open":
      solrTarget = "";
      $('#sfuCarrierList').DataTable().column(p).visible(true);
      break;
    case "close":
      solrTarget = "-archive";
      $('#sfuCarrierList').DataTable().column(p).visible(true);
      break;
    case "public":
      solrTarget = "-public";
      $('#sfuCarrierList').DataTable().column(p).visible(false);
      break;
  }
  $('#sfuCarrierList').DataTable().draw();
});

$("#solrShipperTarget").change(function() {
  for (var p in window.cols) {
    if (window.cols[p].data === "targetName") break;
  }
  switch ($(this).find(":selected").val()) {
    case "open":
      solrTarget = "";
      $('#sfuShipperList').DataTable().column(p).visible(true);
      break;
    case "close":
      solrTarget = "-archive";
      $('#sfuShipperList').DataTable().column(p).visible(true);
      break;
    case "public":
      solrTarget = "-public";
      $('#sfuShipperList').DataTable().column(p).visible(false);
      break;
  }
  $('#sfuShipperList').DataTable().draw();
});

$('input').on('click', function(e) {
  e.preventDefault();
  e.stopPropagation();
});

$('#sfuCarrierList').on('page.dt', function() {
  start = rows * $('#sfuCarrierList').DataTable().page.info().page;
});

$('#sfuShipperList').on('page.dt', function() {
  start = rows * $('#sfuShipperList').DataTable().page.info().page;
});

socket.on(auth.auth.usercode, function(data) {
  let msg = JSON.parse(data.value);
  let statusMessage = "Unkown";
  switch (msg.type) {
    case "transports":
      break;
  }
});

function getLastVisibleColumn() {
  $('.table tr td').removeClass('lastVisibleChild');
  $('.table tr').each(function() {
    let td = $(this).find('td:visible:last');
    td.addClass('lastVisibleChild');
  });
}

$(window).resize(function() {
  getLastVisibleColumn();
});
