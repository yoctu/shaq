var o = {};
var rows = 10;
var start = 0;
var order = [
  [0, 'asc']
];
var sort = ["reported_at", "desc"];
var query = ["*", "*"];
var solrTarget = "";
var solrBidTarget = "";

window.shaqs = [];
window.bids = [];

localStorage.setItem(auth.auth.usercode + "-shaqCenterID", window.id)
window.addEventListener('storage', storageChanged);

function storageChanged(event) {
  if (window.id !== localStorage.getItem(auth.auth.usercode + "-shaqCenterID")) window.location.href = "/close.html";
}

function searchShaqID(shaqId) {
  for (shaq in window.shaqs) {
    if (window.shaqs[shaq].id === shaqId) return window.shaqs[shaq];
  }
  return false;
}

function searchShaqWinning(bidId) {
  for (shaq in window.shaqs) {
    if (window.shaqs[shaq].bestbid === bidId) return window.shaqs[shaq];
  }
  return false;
}

function updateShaq(newshaq) {
  for (shaq in window.shaqs) {
    if (window.shaqs[shaq].id === newshaq.id) {
      window.shaqs[shaq] = newshaq;
      return;
    }
  }
  window.shaqs.push(newshaq);
}

function showmore(showmore) {
  if ($(showmore).hasClass("tohide")) {
    let bidderlst = $(showmore).closest("tr").find("div.bidderslist");
    $(showmore).html('<i><h6>show more (' + bidderlst.length + ')<h6></i></a>');
    $(showmore).removeClass("tohide");
    for (let i = 0; i < bidderlst.length; i++) {
      if (i > 3) $(bidderlst[i]).addClass("hide");
    }
  } else {
    $(showmore).closest("tr").find(".bidderslist").removeClass("hide");
    $(showmore).html("<i><h6>show less<h6></i></a>");
    $(showmore).addClass("tohide");
  }
}

function closeShaq(shaq) {
  $.ajax({
    "url": 'https://' + auth.auth.usercode + '.shaq' + auth.auth.env + '.yoctu.solutions/api/shaq/' + auth.auth.usercode + "/cancel/" + shaq,
    "type": "POST",
    "dataType": "json",
    "contentType": "application/json",
    "headers": {
      "redspher-auth": "yes",
      "Authorization": "Basic " + auth.auth.authbasic
    },
    "success": function(msgs) {}
  });
}

function removebidder(remove) {
  let key = "";
  for (var i = 0; i < window.shaqs.length; i++) {
    if (window.shaqs[i].id === $(remove).closest("tr").attr('class').split(" ")[0]) {
      key = window.shaqs[i].key;
      break;
    }
  }
  informShow('   <div class="loader"></div>&nbsp;&nbsp;&nbsp;<span>Applying Action...</span>');
  let target = $(remove).attr('id');
  let action = "remove";
  if ($(remove).closest("div").hasClass("text-warning")) action = "readd";
  let data = {
    target: target,
    type: "notification",
    action: action
  };
  $.ajax({
    "url": 'https://' + auth.auth.usercode + '.shaq' + auth.auth.env + '.yoctu.solutions/api/shaq' + solrTarget + '/' + auth.auth.usercode + '/' + action + '/' + key,
    "method": "POST",
    "dataType": "json",
    "contentType": "application/json",
    "data": JSON.stringify(data),
    "headers": {
      "redspher-auth": "yes",
      "Authorization": "Basic " + auth.auth.authbasic
    },
    "statusCode": {
      "200": function(xhr) {
        setTimeout(function() {
          $("#InformationModal").modal('hide');
        }, 1000);
      },
      "429": function(xhr) {
        $("#InformationModal").modal('hide');
        status429();
      }
    }
  });
}

function subscribe(button) {
  let id = $(button).attr("id").split("_")[1];
  let data = {
    usercode: auth.auth.usercode,
    usercodename: auth.auth.usercodename,
    type: "notification",
    action: "subscribe"
  };
  $.ajax({
    "url": 'https://' + auth.auth.usercode + '.shaq' + auth.auth.env + '.yoctu.solutions/api/shaq-public/' + auth.auth.usercode + '/subscribe/' + id,
    "method": "POST",
    "dataType": "json",
    "contentType": "application/json",
    "data": JSON.stringify(data),
    "headers": {
      "redspher-auth": "yes",
      "Authorization": "Basic " + auth.auth.authbasic
    },
    "success": function(json) {}
  });
}

function addBid(msg) {
  $('span[data-id=' + msg.key + ']').text(parseInt($('span[data-id=' + msg.key + ']').text()) + 1);
  $('span[data-bids-number=' + msg.key + '_' + msg.source[0] + ']').text(parseInt($('span[data-bids-number=' + msg.key + '_' + msg.source[0] + ']').text()) + 1).addClass(msg.id);
}

function renderFunc(row, data) {
  if (!row.visible) row.visible = "private";
  let labelColor = "danger";
  let btnStatus = "disabled"
  if (row.visible === "public") {
    labelColor = "success";
    if ((row.target && row.target.includes(auth.auth.usercode)) || row.source.includes(auth.auth.usercode)) {
      labelText = row.visible;
    } else {
      labelText = "subscribe";
      btnStatus = "";
    }
  }
  let returnData = '<div><button onclick="subscribe(this);" id="subscribeBtn_' + row.key + '" class="btn btn-' + labelColor + ' pull-right subscribe ' + row.key + '" style="font-size: 12px; padding: 0px 4px;" ' + btnStatus + '>' + row.visible + '</button></div>';
  for (var d in data) {
    returnData += '<img width="16" src="' + auth.app.logourl + row.source[0] + '.png" /> ' + data[d] + '<br>';
  }
  return returnData.replace(',', '<br>');
}

var renderFunction = function(data, type, row, meta) {
  return renderFunc(row, data);
};

function renderFuncBidders(row, data) {
  let returnData = '';
  let invisible = "";
  for (var d in data) {
    if (d > 3) invisible = "hide";
    if (row.target[d] && row.target[d] !== "") {
      let color = "";
      if (row.targetStatus && row.targetStatus[d] === "NoSolution") color = "danger";
      if (row.targetStatus && row.targetStatus[d] === "Searching") color = "success";
      let bidderglyphicon = "remove";
      if (row.targetStatus && row.targetStatus[d] === "Removed") {
        color = "warning";
        bidderglyphicon = "ok";
      }
      returnData += '<div id="bidderList_' + row.key + '_' + row.target[d] + '" class="bidderslist ' + invisible + ' text-' + color + '"><img width="16" src="' + auth.app.logourl + row.target[d] + '.png" /> ' + data[d] + '&nbsp';
      if ((solrTarget !== "-archive") && (auth.auth.usercode === row.source[0])) returnData += ' <a onclick="removebidder(this);" class="remove-bidder" id="' + row.target[d] + '"><span class="glyphicon glyphicon-' + bidderglyphicon + '"> </span></a>';
      returnData += '<span class="label label-primary pull-right" data-bids-number="' + row.key + '_' + row.target[d] + '">0</span></div>';
    }
  }
  if (invisible !== "") returnData += '<div class="pull-right"><a onclick="showmore(this);"><i><h6>show more (' + row.target.length + ')<h6></i></a></div>';
  return returnData.replace(',', '<br>');
}

var renderFunctionBidders = function(data, type, row, meta) {
  return '<div id="bidderListCell_' + row.id + '">' + renderFuncBidders(row, data) + '<div>';
};

function renderFuncPlace(row, data, type) {
  let displayDate = moment(row.deDate).tz('UTC').format('YYYY-MM-DD H:mm');
  if (type === "pu") displayDate = moment(row.puDate).tz('UTC').format('YYYY-MM-DD H:mm');
  let returnData = '<b>' + displayDate + '</b><br>';
  returnData += data[0] + '<br>';
  returnData += data[1] + ' ' + data[2] + '<br>';
  returnData += data[3];
  if (data[4]) {
    returnData += ' <img class="pull-right" width="24px" title="' + data[4] + '" src="https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.2.1/flags/4x3/' + data[4].toLowerCase() + '.svg" /><br>';
  }
  return returnData;
}

var renderFunctionPUPlace = function(data, type, row, meta) {
  return renderFuncPlace(row, data, "pu");
};

var renderFunctionDEPlace = function(data, type, row, meta) {
  return renderFuncPlace(row, data, "de");
};

function renderFuncId(row, data) {
  let IdData = JSON.stringify(data).replace(/\"|\[|\]/g, '');
  let IdDataRender = "";
  if ((solrTarget !== "-archive") && (auth.auth.usercode === row.source[0])) IdDataRender += ' <a onclick="closeShaq(\'' + row.key + '\');" class="close-shaq"><span class="glyphicon glyphicon-trash"> </span></a>';
  IdDataRender += '&nbsp;<a href="/display.html?key=' + row.key + '&type=' + solrTarget + '&' + window.location.search.substr(1) + '" target="_blank">' + IdData + '</a>&nbsp;<span class="label label-primary" data-id="' + row.key + '">0</span>&nbsp;';
  let bestbidprice = 0;
  if (row.bestbidprice) bestbidprice = row.bestbidprice;
  IdDataRender += '<span data-toggle="tooltip" title="best Bid" class="label label-success pull-right bestbid_' + row.key + '" style="padding: 4px 4px;">' + bestbidprice + '</span></span><span class="pull-right">&nbsp;</span>';
  let getitnowClass = "";
  if (!row.getitnow) getitnowClass = " hide";
  IdDataRender += '<span data-toggle="tooltip" title="target price" class="label label-danger pull-right getitnow_' + row.key + ' ' + getitnowClass + '" style="padding: 4px 4px;">' + parseFloat(row.getitnow).toFixed(2) + '</span>';
  switch (row.status) {
    case "completed":
      IdDataRender += '<span class="label label-success"><span class="glyphicon glyphicon-ok"></span></span><br>';
      break;
    case "cancelled":
      IdDataRender += '<span class="label label-warning"><span class="glyphicon glyphicon-ok"></span></span><br>';
      break;
    case "expired":
      IdDataRender += '<span class="label label-danger"><span class="glyphicon glyphicon-remove"></span></span><br>';
      break;
    default:
      break;
  }
  IdDataRender += '<br><br><div class="pull-right"><img width="32px;" src="' + auth.app.logourl + row.creator + '.png" title="TMS : ' + row.creator + '"/></div>';
  IdDataRender += '<div style="padding-bottom: 5px;"></div>';
  IdDataRender += '<div class="shaqlabel"><span id="shaq-created-on">created on<span>: <span id="shaq-date">' + moment(row.reported_at).format('YYYY-MM-DD H:mm') + '</span></div>';
  IdDataRender += '<div class="shaqlabel"><span id="shaq-valid-from">valid from<span>: <span id="shaq-valid-from_' + row.id + '">' + moment(row.valid_from).format('YYYY-MM-DD H:mm') + '</span></div>';
  IdDataRender += '<div class="shaqlabel"><span id="shaq-valid-till">valid till<span>: <span id="shaq-valid-date_' + row.id + '">' + moment(row.valid_until).format('YYYY-MM-DD H:mm') + '</span></div>';
  return IdDataRender;
}

var renderFunctionId = function(data, type, row, meta) {
  return renderFuncId(row, data);
};

window.cols = [{
    data: 'name',
    filterable: true,
    sortable: true,
    render: renderFunctionId
  },
  {
    data: 'sourceName',
    filterable: true,
    sortable: true,
    render: renderFunction
  },
  {
    data: 'targetName',
    filterable: true,
    sortable: true,
    render: renderFunctionBidders
  },
  {
    data: 'puPlace',
    filterable: true,
    sortable: true,
    render: renderFunctionPUPlace
  },
  {
    data: 'dePlace',
    filterable: true,
    sortable: true,
    render: renderFunctionDEPlace
  }
];

$("#shaq-navbar-url").attr("href", auth.orderingurl);
if (qs.has('typecode') && ['bidder', 'auctioneer'].includes(qs.get('typecode'))) localSettings.typeCode = qs.get('typecode')
if (localSettings.typeCode === 'all') query = ["*", "*"]
if (localSettings.typeCode === 'bidder') query = ["target", auth.auth.usercode]
if (localSettings.typeCode === 'auctioneer') query = ["source", auth.auth.usercode]

$('#shaqList').DataTable({
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
  "createdRow": function(createdRow, data, dataIndex) {
    $(createdRow).addClass(data.id);
    if (data.status === "failed") $(createdRow).find("td:first-child").css("border-left-color", "red");
  },
  "initComplete": function(settings, json) {
    getLastVisibleColumn();
  },
  "ajax": function(data, callback, settings) {
    $.ajax({
      "url": 'https://' + auth.auth.usercode + '.shaq' + auth.auth.env + '.yoctu.solutions/api/shaq' + solrTarget + '/' + auth.auth.usercode + '?rows=' + rows + '&start=' + start + '&sort={"' + sort[0] + '":"' + sort[1] + '"}&fq={"' + query[0] + '":"' + query[1] + '"}',
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
        window.shaqs = json.docs;
        o = {
          recordsTotal: json.numFound,
          recordsFiltered: json.numFound,
          data: window.shaqs
        };
        $("#CenterPage").removeClass("hide");
        callback(o);
        $("#well_center_shaqs").html(json.numFound);
        $("#well_center_bids").html(0);
        if (json.numFound > 0) {
          let cost = 0;
          for (const s in window.shaqs) {
            if (window.shaqs[s].bestbidprice && window.shaqs[s].source.includes(auth.auth.usercode)) cost += window.shaqs[s].bestbidprice
          }
          $("#center_cost").html(cost);
          if (cost > 0) $("#well_center_cost").removeClass('hide')
          $.ajax({
            "url": 'https://' + auth.auth.usercode + '.shaq' + auth.auth.env + '.yoctu.solutions/api/bid' + solrBidTarget + '/' + auth.auth.usercode + '?rows=500&fl=id,key',
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
            "success": function(json) {
              window.bids = json.docs;
              $("#well_center_bids").html(window.bids.length);
              let key, source;
              let revenue = 0;
              for (let docs in json.docs) {
                key = json.docs[docs].key;
                source = json.docs[docs].source[0];
                if (source === auth.auth.usercode) revenue += json.docs[docs].price;
                $('span[data-id=' + key + ']').text(parseInt($('span[data-id=' + key + ']').first().text()) + 1);
                $('span[data-bids-number=' + key + '_' + source + ']').text(parseInt($('span[data-bids-number=' + key + '_' + source + ']').first().text()) + 1).addClass(json.docs[docs].id);
                if (searchShaqWinning(json.docs[docs].id)) $('span[data-bids-number=' + key + '_' + source + ']').removeClass('label-primary').addClass("label-success");
              }
              $("#center_revenue").html(revenue);
              if (revenue > 0) $("#well_center_revenue").removeClass('hide')
            }
          });
        } else $("#shaqList").find("tr td:first-child").css("border-left-width", "0px");
      }
    });
  }
});

$('#shaqList thead tr th').each(function(i) {
  var title = $(this).text();
  if (window.cols[$(this)[0].cellIndex].filterable) {
    $(this).append('<br><input class="dtInputFilter" type="text" --data-column="' + i + '" placeholder="Search ' + title + '" id="search_' + window.cols[i].data + '" />');
    $(this).off()
    $(this).on('keyup', function(k) {
      if (k.keyCode == 13) {
        start = 0
        query[0] = window.cols[i].data;
        if ($('#search_' + window.cols[i].data).val()) {
          query[1] = "*" + $('#search_' + window.cols[i].data).val() + "*";
        } else {
          query[1] = "*";
        }
        $('#shaqList').DataTable().draw();
      }
    });
  }
});

$('#shaqList_length').css("width", "50%");
$("#shaqList_wrapper #shaqList_length").before('<div class="pull-left"><a href="#" id="locateAuction"><span class="glyphicon glyphicon-screenshot"></span></a>&nbsp;</div>')
$("#shaqList_wrapper #shaqList_length").after('<div class="pull-right"><select id="typeCode" class="form-control">' +
  '<option value="all">All</option><option value="bidder">Bidder</option><option value="auctioneer">Auctioneer</option>' +
  '</select></div>');
$("#shaqList_wrapper #shaqList_length").after('<div class="pull-right" style="margin-left:10px;"><select id="solrtarget" class="form-control">' +
  '<option value="open">Open</option><option value="public">Public</option><option value="close">Close</option>' +
  '</select></div>');
$("#shaqList_wrapper #shaqList_length").after('<div class="pull-right" style="margin-left:10px;"><select id="shaqstatus" class="form-control">' +
  '<option value="all">All</option><option value="completed">Completed</option><option value="running">running</option><option value="expired">Expired</option><option value="cancelled">Cancelled</option><option value="failed">Failed</option>' +
  '</select></div>');
$("#shaqList_wrapper #shaqList_length").after('<div class="pull-right" title="refresh"><span style="padding-left:20px;"></span><span id="solrRefresh" class="glyphicon glyphicon-refresh"></span>');
$("#shaqList_wrapper #shaqList_length").after('<div class="pull-right" title="clear filters"><span style="padding-left:20px;"></span><span id="solrReload" class="glyphicon glyphicon-repeat"></span>');

$('#locateAuction').on("click", function() {
  questionShow('<div><label>Address : <button id="LocateMe" class="btn btn-default" disabled> Me </button></label><input id="LocateAddress" type="text" class="form-control" autofocus /></div><br>\
            <div><label>Type : </label><select class="form-control" id="LocateType"><option>pu</option><option>de</option></select><br>\
            <div><label>Distance : </label><input id="LocateDistance" type="number" class="form-control" value="60" /></div></div>', 'Locate');
  if (navigator.geolocation) $("#LocateMe").prop('disabled', false)
  $("#LocateMe").on("click", function() {
    navigator.geolocation.getCurrentPosition(function(pos) {
      $('#LocateAddress').val(pos.coords.latitude + "," + pos.coords.longitude)
    }, function(error) {
    }, {});
  });
  $("#QuestionModalYesBtn").on("click", function() {
    if ($('#LocateAddress').val()) {
      $.ajax({
        "url": 'https://' + auth.auth.usercode + '.shaq' + auth.auth.env + '.yoctu.solutions/api/shaq' + solrTarget + '/' + auth.auth.usercode + '/locate/' + $('#LocateType').val() + '?lat=' + $('#LocateAddress').val().split(',')[0] + '&lon=' + $('#LocateAddress').val().split(',')[1] + '&distance=' + $('#LocateDistance').val(),
        "method": "GET",
        "dataType": "json",
        "contentType": "application/json",
        "headers": {
          "redspher-auth": "yes",
          "Authorization": "Basic " + auth.auth.authbasic
        },
        "statusCode": {
          "429": function(error) {
            status429();
          },
          "200": function(response) {
            let html = '<div>Result</div>'
            for (const r of response.docs) html += '<div class="text-center"><a href="#">' + r.key + '</a></div>'
            informShow(html, false)
          }
        }
      });
    }
  });
})

$("#solrRefresh").on("click", function() {
  $('#shaqList').DataTable().draw();
});

$("#solrReload").on("click", function() {
  $(".dtInputFilter").val("");
  $("#shaqstatus").val('all')
  start = 0
  query = ["*", "*"];
  $('#shaqList').DataTable().draw();
});

$("#typeCode").change(function() {
  typeCode = $("#typeCode").val();
  if (typeCode === 'all') query = ["*", "*"]
  if (typeCode === 'bidder') query = ["target", auth.auth.usercode]
  if (typeCode === 'auctioneer') query = ["source", auth.auth.usercode]
  $('#shaqList').DataTable().draw();
});

$("#shaqstatus").change(function() {
  solrStatus = $("#shaqstatus").val();
  if (solrStatus === 'all') query = ["*", "*"]
  else query = ['status', solrStatus]
  $('#shaqList').DataTable().draw();
})

$("#solrtarget").change(function() {
  for (var p in window.cols) {
    if (window.cols[p].data === "targetName") break;
  }
  switch ($(this).find(":selected").val()) {
    case "open":
      solrTarget = "";
      solrBidTarget = "";
      $('#shaqList').DataTable().column(p).visible(true);
      break;
    case "close":
      solrTarget = "-archive";
      solrBidTarget = "-archive";
      $('#shaqList').DataTable().column(p).visible(true);
      break;
    case "public":
      solrTarget = "-public";
      solrBidTarget = "";
      $('#shaqList').DataTable().column(p).visible(false);
      break;
  }
  $('#shaqList').DataTable().draw();
});

$('input').on('click', function(e) {
  e.preventDefault();
  e.stopPropagation();
});

$('#shaqList').on('page.dt', function() {
  start = rows * $('#shaqList').DataTable().page.info().page;
});

$('#shaqList').on('length.dt', function(e, settings, len) {
  rows = len;
  localSettings.pageLenght = rows;
  localStorage.setItem('shaqSettings', JSON.stringify(localSettings));
});
socket.on(auth.auth.usercode, function(data) {
  let msg = JSON.parse(data.value);
  let statusMessage = "Unkown";
  switch (msg.type) {
    case "notification":
      if (msg.action === "archive") {
        $("." + msg.id).addClass('warning');
        setTimeout(function() {
          $("." + msg.id).removeClass('warning');
          $('.' + msg.id).remove();
        }, 5000);
      }
      break;
    case "bid":
      switch (msg.status) {
        case "created":
          addBid(msg);
          break;
        case "running":
          if (Raters.includes(msg.source[0])) addBid(msg);
          break;
        case "cancelled":
          break;
        case "declined":
          break;
        case "accepted":
          break;
        default:
          break;
      }
      break;
    case "auction":
      if ((solrTarget === "-public") && (msg.visible !== "public")) break;
      if ((solrTarget === "-archive") && (["created", "running", "selected", "validated", "failed"].includes(msg.status))) break;
      if ((solrTarget === "") && (["completed", "cancelled"].includes(msg.status))) break;
      if (!msg.source.includes(auth.auth.usercode) && (solrTarget !== "-public") && !msg.target) break;
      if (!msg.source.includes(auth.auth.usercode) && (solrTarget !== "-public") && !msg.target.includes(auth.auth.usercode)) break;
      updateShaq(msg);
      $(".dataTables_info").text("Showing 1 to 10 of " + $("#shaqList_length").val() + " entries (filtered from " + window.shaqs.length + " total entries)");
      $("#center_shaqs").html(window.shaqs.length);
      $("#shaqList").find("tr td:first-child").css("border-left-width", "5px");
      if (searchShaqID(msg.id)) {
        if (msg.bestbidprice) $('.bestbid_' + msg.key).text(parseFloat(msg.bestbidprice).toFixed(2));
        if (msg.status === "failed") $("#shaqList").find("tr." + msg.id + " td:first-child").css("border-left-color", "red");
        if (msg.getitnow && parseFloat(msg.getitnow) > 0) $('.getitnow_' + msg.key).removeClass("hide").text(parseFloat(msg.getitnow).toFixed(2));
        $('span[data-bids-number=' + msg.key + '_' + msg.source[0] + ']').removeClass('label-primary').addClass("label-success");
        $("#shaq-valid-from_" + msg.id).text(msg.valid_from.substring(0, 16).replace('T', ' '));
        if ($("#shaq-valid-date_" + msg.id).text() !== moment(msg.valid_until).format('YYYY-MM-DD H:mm')) {
          $("#shaq-valid-date_" + msg.id).text(moment(msg.valid_until).format('YYYY-MM-DD H:mm'));
          $("#shaq-valid-date_" + msg.id).addClass("text-success");
          setTimeout(function() {
            $("#shaq-valid-date_" + msg.id).removeClass("text-success");
          }, 3000);
        }
        for (let targetStatus in msg.targetStatus) {
          if (!$("#bidderList_" + msg.key + '_' + msg.target[targetStatus]).length) {
            $("#bidderListCell_" + msg.id).html(renderFuncBidders(msg, msg.targetName));
          }
          switch (msg.targetStatus[targetStatus]) {
            case "Removed":
              $("#bidderList_" + msg.key + '_' + msg.target[targetStatus]).addClass("text-warning");
              $("#bidderList_" + msg.key + '_' + msg.target[targetStatus]).find('span').first().removeClass('glyphicon-remove').addClass('glyphicon-ok');
              break;
            case "NoSolution":
              $("#bidderList_" + msg.key + '_' + msg.target[targetStatus]).addClass("text-danger");
              break;
            case "Searching":
              $("#bidderList_" + msg.key + '_' + msg.target[targetStatus]).addClass("text-success");
              break;
            default:
              $("#bidderList_" + msg.key + '_' + msg.target[targetStatus]).removeClass("text-warning").removeClass("text-success");
              $("#bidderList_" + msg.key + '_' + msg.target[targetStatus]).find('span').first().addClass('glyphicon-remove').removeClass('glyphicon-ok');
              break;
          }
        }
        $('.' + msg.bestbid).removeClass('label-success').addClass("label-primary");
        if (msg.bestbid) $('.' + msg.bestbid).removeClass('label-primary').addClass("label-success");
      }
      if ((solrTarget === "-public") && msg.target && msg.target.includes(usercode)) {
        $("." + msg.id).remove();
        break;
      }
      if ($("." + msg.id).length > 0) break;
      $('.dataTables_empty').hide();
      labelColor = "danger";
      let btnStatus = "disabled";
      if (msg.visible === "public") {
        labelColor = "success";
      }
      if (solrTarget === "-public") {
        btnStatus = ""
      }
      let tbodyadd = '<tr class="' + msg.id + ' odd" role="row">';
      tbodyadd += '<td class="sorting_1" tabindex="0">' + renderFuncId(msg, msg.name) + '</td>';
      tbodyadd += '<td>' + renderFunc(msg, msg.sourceName) + '</td>';
      tbodyadd += '<td><div id="bidderListCell_' + msg.id + '">' + renderFuncBidders(msg, msg.targetName) + '</td><div>';
      tbodyadd += '<td>' + renderFuncPlace(msg, msg.puPlace, "pu") + '</td>';
      tbodyadd += '<td>' + renderFuncPlace(msg, msg.dePlace, "de") + '</td></tr>';
      $('tbody').prepend(tbodyadd);
      if (msg.status === "failed") $("#shaqList").find("tr." + msg.id + " td:first-child").css("border-left-color", "red");
      let lastVisibleCell = $(".lastVisibleChild").first().prop("cellIndex");
      $("." + msg.id + " td").eq(lastVisibleCell).addClass("lastVisibleChild");
      for (let lvc = lastVisibleCell + 1; lvc < $("." + msg.id + " td").length; lvc++) {
        $("." + msg.id + " td").eq(lvc).css("display", "none");
      }
      $("." + msg.id).addClass('success');
      setTimeout(function() {
        $("." + msg.id).removeClass('success');
      }, 5000);
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

if (localSettings.pageLenght) rows = localSettings.pageLenght;
if (localSettings.typeCode) {
  $('#typeCode').val(localSettings.typeCode.toLowerCase())
}

$(window).resize(function() {
  getLastVisibleColumn();
});
