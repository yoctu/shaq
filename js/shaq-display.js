var ShaqID = window.location.pathname.split("/")[3];
var timerFrom = 0;
var shaqValiditytimer = 0;
var showAllbids = 0;
var solrTarget = new URLSearchParams(location.search).has('type') ? new URLSearchParams(location.search).get('type') : "";
window.shaq = '';
window.timerBid = [];
window.bids = [];
window.bidsInfo = [];
window.chatsInfo = [];

localStorage.setItem(auth.usercode + "-" + ShaqID, window.id);
window.addEventListener('storage', storageChanged);

function storageChanged(event) {
  if (window.id !== localStorage.getItem(auth.usercode + "-" + ShaqID)) window.location.href = "https://shaq.yoctu.com/shaqcenter.html";
}

$('#bid-add').find('.bidBidderName').text(auth.username);
if (auth.maxbids > 0) $('#bidMaxBidder').text(" / " + auth.maxbids);
if ((auth.notifications & 1) || (localSettings.chatShow === "Show")) $('#chat-box').removeClass("hide");

$("#dateTimePicker").DateTimePicker({
  isPopup: true,
  buttonsToDisplay: ['HeaderCloseButton'],
  titleContentDateTime: 'shaq.set-datetime-datepicker-title',
  dateTimeFormat: "yyyy-MM-dd HH:mm",
  dateFormat: "yyyy-MM-dd"
});

$('input[data-field="datetime"], input[data-field="date"], input[data-field="time"]').on('focus', function() {
  $('#dateTimePicker input:first').focus();
});


function closeShaq() {
  informShow('   <div class="loader"></div>&nbsp;&nbsp;&nbsp;<span>Closing Shaq</span>');
  $.ajax({
    "url": "/api/shaq/" + auth.usercode + "/cancel/" + window.shaq.key,
    "type": "POST",
    "dataType": "json",
    "contentType": "application/json",
    "beforeSend": function(xhr) {
      xhr.setRequestHeader("Authorization", "Basic " + auth.authbasic);
    },
    "success": function(msgs) {
      shaqGTAG('Shaq', 'ShaqCancelled', JSON.stringify(data));
    }
  });
}

function noSolution() {
  $('.btn-create-bid').hide();
  $('.btn-no-solution-bid').attr("disabled", true);
  $('.btn-getitnow-bid').attr("disabled", true);
  $('.btn-no-solution-bid').attr('title', 'No Solution !');
  $('.btn-getitnow-bid').attr('title', 'Get It Now !');
  $('#bid-add .well').find("input").prop("disabled", true);
  $('#bid-add .well').find("select").prop("disabled", true);
  if ($("#InformationModal").is(':visible')) $("#InformationModal").modal('hide');
}

function showmore(showmore) {
  if ($(showmore).hasClass("tohide")) {
    let showcpt = 0;
    let bidderlst = $("#shaq-bidder").find(".bidderslist");
    $(showmore).html('<i><h6>show more (' + bidderlst.length + ')<h6></i></a>');
    $(showmore).removeClass("tohide");
    for (let i = 0; i < bidderlst.length; i++) {
      if (i > 4) $(bidderlst[i]).addClass("hide");
    }
  } else {
    $("#shaq-bidder").find(".bidderslist").removeClass("hide");
    $(showmore).html("<i><h6>show less<h6></i></a>");
    $(showmore).addClass("tohide");
  }
}

function sendMessage(data) {
  data.id = uuidv4();
  data.date = new Date().toISOString();
  data.from = username;
  data.key = window.shaq.key;
  data.target = [window.chatCurrent];
  data.type = "message";
  data.status = "sent";
  $.ajax({
    "url": "/api/chat/" + auth.usercode + "/" + window.shaq.key,
    "type": "POST",
    "dataType": "json",
    "contentType": "application/json",
    "json": "json.wrf",
    "data": JSON.stringify([data]),
    "beforeSend": function(xhr) {
      xhr.setRequestHeader("Authorization", "Basic " + auth.authbasic);
    },
    "success": function(msgs) {
      shaqGTAG('Chat', 'ChatSend', JSON.stringify(data));
    }
  });
}

function rate(rater) {
  let service = "shaq";
  informShow('   <div class="loader"></div>&nbsp;&nbsp;&nbsp;<span>Launching Rating...</span>');
  $("#" + rater + "LoadingOffer").removeClass("hide");
  $("#bidderList_" + rater).addClass("text-success");
  $("#" + rater + "_RefreshBtn").addClass("hide");
  if (window.shaq.visible === "public") service = "shaq-public";
  $.ajax({
    "url": '/api/' + service + '/' + auth.usercode + '/' + rater + '/' + window.shaq.key,
    "method": "GET",
    "dataType": "json",
    "contentType": "application/json",
    "beforeSend": function(xhr) {
      xhr.setRequestHeader("Authorization", "Basic " + auth.authbasic);
    },
    "complete": function(json) {
      setTimeout(function() {
        $("#InformationModal").modal('hide');
      }, 1000);
    }
  });
}

function readdallbidders() {
  informShow('   <div class="loader"></div>&nbsp;&nbsp;&nbsp;<span>Applying Action...</span>');
  let data = {
    type: "notification",
    action: "readdall"
  };
  $.ajax({
    "url": '/api/shaq/' + auth.usercode + '/readdall/' + window.shaq.key,
    "method": "POST",
    "dataType": "json",
    "contentType": "application/json",
    "data": JSON.stringify(data),
    "beforeSend": function(xhr) {
      xhr.setRequestHeader("Authorization", "Basic " + auth.authbasic);
    },
    "complete": function(json) {
      for (let t in window.shaq.target) {
        if (Raters.includes(window.shaq.target[t])) continue;
        sendMessage({
          "subject": "You have been enabled!",
          "message": "You have been enabled!",
          "channel": "readdall",
          "target": [window.shaq.target[t]]
        });
      }
      setTimeout(function() {
        $("#InformationModal").modal('hide');
      }, 1000);
      shaqGTAG('Shaq', 'ShaqRemove', JSON.stringify(data));
    }
  });
}

function removeallbidders() {
  informShow('   <div class="loader"></div>&nbsp;&nbsp;&nbsp;<span>Applying Action...</span>');
  let data = {
    type: "notification",
    action: "removeall"
  };
  $.ajax({
    "url": '/api/shaq/' + auth.usercode + '/removeall/' + window.shaq.key,
    "method": "POST",
    "dataType": "json",
    "contentType": "application/json",
    "data": JSON.stringify(data),
    "beforeSend": function(xhr) {
      xhr.setRequestHeader("Authorization", "Basic " + auth.authbasic);
    },
    "complete": function(json) {
      for (let t in window.shaq.target) {
        if (Raters.includes(window.shaq.target[t])) continue;
        sendMessage({
          "subject": "You have been disabled!",
          "message": "You have been disabled!",
          "channel": "removeall",
          "target": [window.shaq.target[t]]
        });
      }
      setTimeout(function() {
        $("#InformationModal").modal('hide');
      }, 1000);
      shaqGTAG('Shaq', 'ShaqRemoveAll', JSON.stringify(data));
    }
  });
}

function removebidder(remove) {
  informShow('   <div class="loader"></div>&nbsp;&nbsp;&nbsp;<span>Applying Action...</span>');
  let target = $(remove).attr('id');
  let action = "remove";
  if ($(remove).closest("div").find('span').hasClass('glyphicon-ok')) action = "readd";
  let data = {
    target: target,
    type: "notification",
    action: action
  };
  $.ajax({
    "url": '/api/shaq/' + auth.usercode + '/' + action + '/' + window.shaq.key,
    "method": "POST",
    "dataType": "json",
    "contentType": "application/json",
    "data": JSON.stringify(data),
    "beforeSend": function(xhr) {
      xhr.setRequestHeader("Authorization", "Basic " + auth.authbasic);
    },
    "complete": function(json) {
      let actionText = "You have been enabled!";
      if (action === "remove") actionText = "You have been disabled!";
      sendMessage({
        "subject": actionText,
        "message": actionText,
        "channel": action,
        "target": [target]
      });
      setTimeout(function() {
        $("#InformationModal").modal('hide');
      }, 1000);
      shaqGTAG('Shaq', 'ShaqRemove', JSON.stringify(data));
    }
  });
}

function extendShaqDecision(xHour) {
  let newHour = new Date(window.shaq.valid_from);
  let now = new Date();
  if (newHour < now) newHour = now;
  newHour.setHours(newHour.getHours() + xHour);
  let data = {
    valid_from: newHour.toISOString(),
    type: "notification",
    action: "extenddecision"
  }
  $.ajax({
    "url": '/api/shaq/' + auth.usercode + '/extenddecision/' + window.shaq.key,
    "method": "POST",
    "dataType": "json",
    "contentType": "application/json",
    "data": JSON.stringify(data),
    "beforeSend": function(xhr) {
      xhr.setRequestHeader("Authorization", "Basic " + auth.authbasic);
    },
    "complete": function(json) {
      shaqGTAG('Shaq', 'ShaqExtendDecision', JSON.stringify(data));
      if (json.status === 404) return;
      let colorClass = "text-success";
      if (json.status === 405) colorClass = "text-danger";
      $("#shaq-from").addClass(colorClass);
      setTimeout(function() {
        $("#shaq-from").removeClass(colorClass);
      }, 3000);
    }
  });
}

function extendShaqValidity(xHour) {
  let newHour = new Date(window.shaq.valid_until);
  newHour.setHours(newHour.getHours() + xHour);
  let data = {
    valid_until: newHour.toISOString(),
    type: "notification",
    action: "extendvalidity"
  }
  $.ajax({
    "url": '/api/shaq/' + auth.usercode + '/extendvalidity/' + window.shaq.key,
    "method": "POST",
    "dataType": "json",
    "contentType": "application/json",
    "data": JSON.stringify(data),
    "beforeSend": function(xhr) {
      xhr.setRequestHeader("Authorization", "Basic " + auth.authbasic);
    },
    "complete": function(json) {
      let colorClass = "text-success";
      if (json.status === 405) colorClass = "text-danger";
      $("#shaq-valid").addClass(colorClass);
      setTimeout(function() {
        $("#shaq-valid").removeClass(colorClass);
      }, 3000);
      shaqGTAG('Shaq', 'ShaqExtendValidity', JSON.stringify(data));
    }
  });
}

function bidderDisplay() {
  let bidderDisplay = '<b>';
  let tohide = "";
  $('#bid-filtering-field').empty();
  $('#bid-filtering-field').append('<option value="">All</option>');
  for (let bidders in window.shaq.targetName) {
    let color = "";
    if (bidders >= 4) tohide = "hide"
    if (window.shaq.targetStatus && window.shaq.targetStatus[bidders] === "NoSolution") color = "text-danger";
    if (window.shaq.targetStatus && window.shaq.targetStatus[bidders] === "Removed") color = "text-warning";
    if (window.shaq.targetStatus && window.shaq.targetStatus[bidders] === "Searching") color = "text-success";
    $('#bid-filtering-field').append('<option value="' + window.shaq.target[bidders] + '">' + window.shaq.targetName[bidders] + '</option>');
    bidderDisplay += '<div id="bidderList_' + window.shaq.target[bidders] + '" class="bidderslist ' + tohide + ' ' + color + '"><img width="16" src="' + auth.logourl + window.shaq.target[bidders] + '.png" /> ' + window.shaq.targetName[bidders] + '</font>';
    if (auth.usercode === window.shaq.source[0]) {
      let glyphiconbidder = "remove";
      if (window.shaq.targetStatus && (window.shaq.targetStatus[bidders] === "Removed")) glyphiconbidder = "ok";
      bidderDisplay += ' <a onclick="removebidder(this);" class="remove-bidder" id="' + window.shaq.target[bidders] + '"><span class="glyphicon glyphicon-' + glyphiconbidder + '"> </span></a> ';
      if (Raters.includes(window.shaq.target[bidders])) {
        if (window.shaq.targetStatus && (window.shaq.targetStatus[bidders] === "")) {
          bidderDisplay += ' <a onclick="rate(\'' + window.shaq.target[bidders] + '\');" class="rate-bidder" id="' + window.shaq.target[bidders] + '_RefreshBtn"><span class="glyphicon glyphicon-refresh"> </span></a>';
        }
        if (window.shaq.targetStatus && (window.shaq.targetStatus[bidders] === "Searching")) {
          $("#bidderList_" + window.shaq.target[bidders]).addClass("text-success");
          $("#" + window.shaq.target[bidders] + "LoadingOffer").removeClass("hide");
          $("#" + window.shaq.target[bidders] + "_RefreshBtn").addClass("hide");
        }
      }
    }
    bidderDisplay += '</div>';
  }
  bidderDisplay += '</b>';
  if (window.shaq.targetName.length > 4) bidderDisplay += '<div class="pull-right"><a onclick="showmore(this);"><i><h6>show more (' + window.shaq.target.length + ')<h6></i></a></div>';
  $("#shaq-bidder").html(bidderDisplay);
}

function uploadFile(bid) {
  let fileBid = $("#file" + bid.id.substring(1, 8)).get(0).files;
  $("#filetoUpload" + bid.id.substring(1, 8)).html('<span class="glyphicon glyphicon-cloud-upload text-danger"></span>  ' + fileBid[0].name.slice(fileBid[0].name.indexOf("_") + 1));
  let formData = new FormData();
  formData.append('file', fileBid[0], fileBid[0].name);
  $.ajax({
    "url": '/api/bid/' + auth.usercode + '/uploadbidfile/' + window.shaq.key + "?id=" + bid.id,
    "method": "POST",
    "processData": false,
    "contentType": false,
    "data": formData,
    "beforeSend": function(xhr) {
      xhr.setRequestHeader("Authorization", "Basic " + auth.authbasic);
    },
    "complete": function(json) {
      let file = 0;
      if (bid.files) file = bid.files.length;
      $("#filetoUpload" + bid.id.substring(1, 8)).html('<div><a href="' + window.location.protocol + '//' + auth.username + ':' + auth.userkey + '@' + window.location.host + '/api/bid/' + usercode + '/downloadbidfile/' + bid.key + '?id=' + bid.id + '&pos=' + file + '"><span class="glyphicon glyphicon-cloud-upload text-success"></span>  ' + fileBid[0].name.slice(fileBid[0].name.indexOf("_") + 1) + '</a></div>');
      shaqGTAG('Bid', 'BidUploadFile', fileBid[0].name);
    }
  });
}

function uploadshaqFile() {
  let fileShaq = $("#fileshaq").get(0).files;
  $("#filetoUploadShaq").append('<div><span class="glyphicon glyphicon-cloud-upload text-danger"></span>  ' + fileShaq[0].name.slice(fileShaq[0].name.indexOf("_") + 1) + '</div>');
  let formData = new FormData();
  formData.append('file', fileShaq[0], fileShaq[0].name);
  $.ajax({
    "url": '/api/shaq/' + auth.usercode + '/uploadshaqfile/' + window.shaq.key + "?id=" + shaq.id,
    "method": "POST",
    "processData": false,
    "contentType": false,
    "data": formData,
    "beforeSend": function(xhr) {
      xhr.setRequestHeader("Authorization", "Basic " + auth.authbasic);
    },
    "complete": function(json) {
      $("#filetoUploadShaq").html("");
      let file = 0;
      if (shaq.files) file = shaq.files.length;
      for (file in shaq.files) {
        //$("#filetoUploadShaq").append('<div><a href="' + window.location.protocol + '//' + username + ':' + userkey + '@' + window.location.host + '/api/shaq/' + usercode + '/downloadshaqfile/' + window.shaq.key + '?id=' + window.shaq.id + '&pos=' + file + '"><span class="glyphicon glyphicon-cloud-upload text-success"></span>  ' + window.shaq.files[file].slice(window.shaq.files[file].indexOf("_") + 1) + '</a></div>');
        $("#filetoUploadShaq").append('<div><a href="' + window.location.protocol + '//' + username + ':' + userkey + '@' + window.location.host + '/api/shaq/' + usercode + '/downloadshaqfile/' + shaq.key + '?id=' + shaq.id + '&pos=' + file + '"><span class="glyphicon glyphicon-cloud-upload text-success"></span>  ' + shaq.files[file].slice(shaq.files[file].indexOf("_") + 1) + '</a></div>');
      }
      shaqGTAG('Shaq', 'ShaqUploadFile', fileShaq[0].name);
    }
  });
}


function ShaqCompleted(winbid) {
  $('#shaq-status').html('<span class="glyphicon glyphicon-stop"></span>').prop("disabled", true);
  $('#shaq-status').attr("title", window.shaq.status);
  $('.btn-send-message').prop("disabled", true);
  $('.notifyAllBidders').prop("disabled", true);
  $("#set-it-now-btn").prop("disabled", true);
  $("#decline-all-btn").prop("disabled", true);
  $("#winningbidcalc").prop("disabled", true);
  $(".bidflags").addClass("hide");
  $('.btn-bid').prop("disabled", true);
  $(".btnbidderAction").addClass("hide");
  $(".rate-bidder").addClass("hide");
  $("#bid-add").addClass("hide");
  $('#shaq-valid').prop("disabled", true);
  $('#shaq-valid').html("00:00");
  $('#shaq-from').html("00:00");
  $('#shaq-from-title').html("00:00");
  $('#shaq-name').prop("disabled", true);
  $(".get-it-now-text").prop("disabled", true);
  $(".set-it-now").addClass("hide");
  $(".fileuploadQueue-handler").hide();
  $('.bidValidDate').prop("disabled", true);
  $('#shaq-valid-btn').prop("disabled", true);
  $('#shaq-valid-from-btn').prop("disabled", true);
  $(".remove-bidder").hide();
  if (!$('#message-body').hasClass('hide')) $(".hideMessage").click();
  $('.bid-info-list').find('.well').addClass("well-danger");
  switch (window.shaq.status) {
    case "completed":
      $("#closedStatusGlyphicon").html('<span class="label label-success"><span class="glyphicon glyphicon-ok"></span></span><br>');
      break;
    case "cancelled":
      $("#closedStatusGlyphicon").html('<span class="label label-warning"><span class="glyphicon glyphicon-ok"></span></span><br>');
      break;
    case "expired":
      $("#closedStatusGlyphicon").html('<span class="label label-danger"><span class="glyphicon glyphicon-remove"></span></span><br>');
      break;
  }
  $("#closedStatusGlyphiconSymbol").removeClass("glyphicon-remove").addClass();
  $("#closedStatusGlyphicon").removeClass("hide");
  if (winbid) {
    $('.bid-info-list').addClass("hide");
    $('#bid-add').addClass("hide");
    $('.bid-info-list').find('.well').removeClass("well-success").removeClass("well-warning").addClass("well-danger");
    if (window.bidsInfo[winbid]) {
      window.bidsInfo[winbid].removeClass("hide");
      window.bidsInfo[winbid].find('.well').removeClass("well-danger").removeClass("well-warning").addClass("well-success");
      $('#accept-label').text('Accepted');
    }
  }
}

function bidHideAllBtn(bidInfo) {
  bidInfo.find('.btn-accept-bid').addClass('hide');
  bidInfo.find('.tn-forward-bid').addClass('hide');
  bidInfo.find('.btn-decline-bid').addClass('hide');
  bidInfo.find('.btn-cancel-bid').addClass('hide');
  bidInfo.find('.btn-bid').addClass('hide');
}

function bidRefresh(bidInfo, bid) {
  bidInfo.find('.bidPrice').val(parseFloat(bid.price).toFixed(2));
  for (key in window.shaq.target) {
    if (window.shaq.target[key] === bid.source[0]) {
      bidInfo.find('.bidBidderCode').html(window.shaq.targetName[key]);
      bidInfo.find('.bidBidderId').html(bid.id);
      if (((bid.source[0]) === auth.usercode) && auth.fileUpload) {
        let fileData = '<input multiple="" class="form-control fileupload" style="display: none !important;" id="file' + bid.id.substring(1, 8) + '" name="file[]" type="file" onchange=\'uploadFile(' + JSON.stringify(bid) + ');\'/><div class="table-responsive fileuploadQueue-handler">';
        fileData += '<a id="href' + bid.id.substring(1, 8) + '" class="btn btn-xs btn-primary upload_add_files" onclick="$(\'#file' + bid.id.substring(1, 8) + '\').trigger(\'click\');">Add files...</a></div>';
        fileData += '<div id="filetoUpload' + bid.id.substring(1, 8) + '"></div>';
        for (file in bid.files) {
          fileData += '<div><a href="' + window.location.protocol + '//' + username + ':' + userkey + '@' + window.location.host + '/api/bid/' + auth.usercode + '/downloadbidfile/' + bid.key + '?id=' + bid.id + '&pos=' + file + '"><span class="glyphicon glyphicon-cloud-upload text-success"></span>  ' + bid.files[file].slice(bid.files[file].indexOf("_") + 1) + "</a></div>";
        }
        bidInfo.find('.bidBidderFile').html(fileData);
      }
    } else {
      if ((bid.target[0] === auth.usercode) && auth.fileUpload) {
        let fileData = "";
        for (file in bid.files) {
          fileData += '<div><a href="' + window.location.protocol + '//' + username + ':' + userkey + '@' + window.location.host + '/api/bid/' + auth.usercode + '/downloadbidfile/' + bid.key + '?id=' + bid.id + '&pos=' + file + '"><span class="glyphicon glyphicon-cloud-upload text-success"></span>  ' + bid.files[file].slice(bid.files[file].indexOf("_") + 1) + "</a></div>";
        }
        bidInfo.find('.bidBidderFile').html(fileData);
      }
    }
  }
  bidInfo.find(".bidBidderRatingScore").html("");
  for (var ratingCpt = 0; ratingCpt < bid.targetRating; ratingCpt++) {
    bidInfo.find(".bidBidderRatingScore").append('<img width="32" src="https://yoctu.github.io/yoctu-website/img/logo/rating1.png" />');
  }
  for (ratingCpt; ratingCpt < 5; ratingCpt++) {
    bidInfo.find(".bidBidderRatingScore").append('<img width="32" src="https://yoctu.github.io/yoctu-website/img/logo/rating0.png" />');
  }
  bidInfo.find('.bidBidderName').html('<label>' + bid.from + '</label>');
  bidInfo.find('.bidCurrency').attr('disabled', 'disabled');
  bidInfo.find('.bidVehicle').val(bid.vehicule);
  bidInfo.find('.bidVehicle').attr('disabled', 'disabled');
  bidInfo.find('.bidDeDate').val(moment(bid.deDate).tz('UTC').format('YYYY-MM-DD HH:mm').replace(' 00:00', ''));
  bidInfo.find('.bidDeDate').removeAttr("data-field");
  if (window.shaq.source.includes(auth.usercode)) bidInfo.find('.hollowData').removeClass("hide");
  if (bid.score) {
    bidInfo.find(".scoreinvitedspan").text(bid.score[0]);
    bidInfo.find(".scoreavgbidspan").text(bid.score[1]);
    bidInfo.find(".scorewinningspan").text(bid.score[2]);
    if (parseInt(bid.score[0]) < 1) bidInfo.find(".hollowinvited").addClass("danger");
    if (parseInt(bid.score[0]) > 10) bidInfo.find(".hollowinvited").addClass("success");
    if (parseInt(bid.score[1]) < 1) bidInfo.find(".hollowavgbid").addClass("danger");
    if (parseInt(bid.score[1]) > 2) bidInfo.find(".hollowavgbid").addClass("success");
    if (parseInt(bid.score[2]) < 1) bidInfo.find(".hollowwinning").addClass("danger");
    if (parseInt(bid.score[2]) > 2) bidInfo.find(".hollowwinning").addClass("success");
  }
  if (bid.deDate.substring(0, 16) !== window.shaq.deDate.substring(0, 16)) {
    bidInfo.find('.bidDeDate').css("color", "#d9534f");
  }
  bidInfo.find('.bidPuDate').val(moment(bid.puDate).tz('UTC').format('YYYY-MM-DD HH:mm').replace(' 00:00', ''));
  bidInfo.find('.bidPuDate').removeAttr("data-field");
  if (bid.puDate.substring(0, 16) !== window.shaq.puDate.substring(0, 16)) {
    bidInfo.find('.bidPuDate').css("color", "#d9534f");
  }
  bidInfo.find('.bidValidDate').val(moment(bid.valid_until).format('YYYY-MM-DD HH:mm').replace(' 00:00', ''));
  bidInfo.find('.bidLang').val(bid.lang);
  bidInfo.find('.bidLang').attr('disabled', 'disabled');
  bidInfo.find('.btn-bid-extend-glyphicon').data("bid-id-to-extend", bid.id);
  bidInfo.find('.btn-bid-extend-detail').addClass('hide');
  if (["running"].includes(window.shaq.status)) {
    if (["created", "running", "forwarded", "authorized"].includes(bid.status)) bidInfo.find('.well').addClass('well-warning');
    else {
      bidInfo.find('.well').addClass('well-danger');
      if (!showAllbids) {
        bidInfo.addClass('hide');
      }
    }
  }
  if (window.shaq.bestbid === bid.id) {
    bidInfo.find('.well').removeClass("well-warning").removeClass('.well-danger').addClass("well-success");
  }
  bidInfo.find('input, select').attr("readonly", "readonly");
  bidInfo.find('input[type="checkbox"]').click(function(e) {
    e.preventDefault();
    e.stopPropagation();
  });
  bidInfo.find('.bidTransitTime').text(TransitCalc(bidInfo.find('.bidPuDate').val(), bidInfo.find('.bidDeDate').val(), window.shaq.puPlace[4], window.shaq.dePlace[4]));
  if (bid.loaded === "Yes") bidInfo.find('.bidLoaded').addClass("btn-info");
  if (bid.driver == "2") bidInfo.find('.bidDriver').addClass("btn-info");
  bidInfo.find('.img-bidder-logo').attr("src", auth.logourl + bid.source[0] + ".png");
  if (bid.logo && Raters.includes(bid.source[0])) {
    bidInfo.find('.img-rating-logo').attr("src", bid.logo);
    bidInfo.find('.img-rating-logo').removeClass("hide");
  }
  switch (bid.status) {
    case "forwarded":
      bidInfo.find('.btn-status-bid').removeClass('hide').html('<span class="glyphicon glyphicon-share"></span> Fowarded').addClass('btn-primary').attr("disabled", "disabled");
      bidHideAllBtn(bidInfo);
      break;
    case "authorized":
      bidInfo.find('.btn-accept-bid').html('<span class="glyphicon glyphicon-ok"></span> Authorized');
      bidInfo.data("bid-id", bid.id);
      bidInfo.find('.btn-create-bid').addClass('hide').data("btn-bid-id", bid.id);
      bidInfo.find('.btn-no-solution-bid').addClass('hide').data("btn-bid-id", bid.id);
      bidInfo.find('.btn-getitnow-bid').addClass('hide').data("btn-bid-id", bid.id);
      bidInfo.find('.btn-accept-bid').removeClass('hide').data("btn-bid-id", bid.id);
      bidInfo.find('.btn-decline-bid').removeClass('hide').data("btn-bid-id", bid.id);
      bidInfo.find('.btn-cancel-bid').removeClass('hide').data("btn-bid-id", bid.id);
      bidInfo.find('.btn-status-bid').addClass('hide').data("btn-bid-id", bid.id);
      break;
    case "created":
    case "selected":
    case "validated":
    case "failed":
    case "running":
      bidInfo.data("bid-id", bid.id);
      bidInfo.find('.btn-create-bid').addClass('hide').data("btn-bid-id", bid.id);
      bidInfo.find('.btn-no-solution-bid').addClass('hide').data("btn-bid-id", bid.id);
      bidInfo.find('.btn-getitnow-bid').addClass('hide').data("btn-bid-id", bid.id);
      if ((auth.bidvaluemax !== 0) && (bid.price > auth.bidvaluemax)) bidInfo.find('.btn-forward-bid').removeClass('hide').data("btn-bid-id", bid.id);
      else bidInfo.find('.btn-accept-bid').removeClass('hide').data("btn-bid-id", bid.id);
      bidInfo.find('.btn-decline-bid').removeClass('hide').data("btn-bid-id", bid.id);
      bidInfo.find('.btn-cancel-bid').removeClass('hide').data("btn-bid-id", bid.id);
      bidInfo.find('.btn-status-bid').addClass('hide').data("btn-bid-id", bid.id);
      break;
    case "expired":
      bidInfo.find('.btn-status-bid').removeClass('hide').html('<span class="glyphicon glyphicon-remove"></span> Expired').addClass('btn-danger').attr("disabled", "disabled");
      bidInfo.find('.bid-validity-count').removeClass('hide');
      bidInfo.find('.bidValidUntil').html("expired");
      bidHideAllBtn(bidInfo);
      break;
    case "accepted":
      bidInfo.find('.btn-status-bid').removeClass('hide').html('<span class="glyphicon glyphicon-ok"></span> Accepted').addClass('btn-success').attr("disabled", "disabled");
      bidHideAllBtn(bidInfo);
      break;
    case "declined":
      bidInfo.find('.btn-status-bid').removeClass('hide').html('<span class="glyphicon glyphicon-remove"></span> Declined').addClass('btn-danger').attr("disabled", "disabled");
      bidHideAllBtn(bidInfo);
      break;
    case "cancelled":
      bidInfo.find('.btn-status-bid').removeClass('hide').html('<span class="glyphicon glyphicon-remove"></span> Cancelled').addClass('btn-warning').attr("disabled", "disabled");
      bidHideAllBtn(bidInfo);
      break;
  }

  let validDate = bid.valid_until.substring(0, 16).replace('T', ' ');
  let tzDate = new Date();
  let CurrentDate = new Date().valueOf();
  validDate = new Date(validDate).valueOf();
  CurrentDate = CurrentDate + (tzDate.getTimezoneOffset() * 60000);
  let timer = 0;
  if ((validDate > CurrentDate) && (["created", "running", "forwarded", "authorized"].includes(bid.status)) && (["created", "running"].includes(window.shaq.status))) {
    bidInfo.find('.bid-validity-count').removeClass('hide');
    timer = Math.floor((validDate - CurrentDate) / 1000);
    window.timerBid[bid.id] = setInterval(function() {
      var hoursLeft = Math.floor(timer);
      var hours = Math.floor(hoursLeft / 3600);
      var minutesLeft = Math.floor((hoursLeft) - (hours * 3600));
      var minutes = Math.floor(minutesLeft / 60);
      var remainingSeconds = timer % 60;
      if (timer > 0) {
        bidInfo.find('.bidValidUntil').html(pad(hours) + ":" + pad(minutes) + ":" + pad(remainingSeconds));
        timer--;
      } else {
        bidHideAllBtn(bidInfo);
        bidInfo.find('.bidValidUntil').html("expired");
        bidInfo.find('.btn-status-bid').text(' Expired');
        clearInterval(window.timerBid[bid.id]);
      }
    }, 1000);
  } else {
    bidInfo.find('.btn-accept-bid').addClass('hide');
    bidInfo.find('.btn-forward-bid').addClass('hide');
    bidInfo.find('.btn-decline-bid').addClass('hide');
  }
  if (Object.values(window.bids).length >= auth.maxbids) {
    $('.btn-create-bid').attr("disabled", true);
    $('.btn-create-bid').attr('title', 'Maximum Bids reached !');
    $('.btn-no-solution-bid').attr("disabled", true);
    $('.btn-no-solution-bid').attr('title', 'Maximum Bids reached !');
    $('.btn-getitnow-bid').attr("disabled", true);
    $('.btn-getitnow-bid').attr('title', 'Maximum Bids reached !');
  }
  bidInfo.find('.btn-bid-extend').removeClass('hide');
}

function shaqRefresh() {
  $('#shaq-status').attr("title", window.shaq.status);
  $("#tmslogo").attr('src', auth.logourl + window.shaq.creator + ".png");
  auth.usercodeName = window.shaq.sourceName[0];
  $('#ChatList').html('<p><button id="Notifications-Chat" class="btn btn-default btn-room"><img class="bidder-image" src="https://yoctu.github.io/yoctu-website/img/logo-svg/notification.svg" /> Notifications <span id="chatBadge-notification" class="badge"></span></button></p>');
  $('#ChatList').append('<p><button id="' + window.shaq.source[0] + '" class="btn btn-default btn-room"><img class="bidder-image" src="' + auth.logourl + window.shaq.source[0] + '.png" />  ' + window.shaq.sourceName[0] + ' <span id="chatBadge-' + window.shaq.source[0] + '" class="badge">0</span></button></p>');
  if (window.shaq.target && window.shaq.target.includes(auth.usercode)) {
    auth.usercodeName = window.shaq.targetName[window.shaq.target.indexOf(auth.usercode)];
    $('#ChatList').append('<p><button id="' + auth.usercode + '" class="btn btn-default btn-room"><img class="bidder-image" src="' + auth.logourl + auth.usercode + '.png" />  ' + auth.usercodeName + ' <span id="chatBadge-' + auth.usercode + '" class="badge">0</span></button></p>');
    window.chatsInfo[auth.usercode] = [];
  }
  if (window.shaq.target && window.shaq.target.includes(auth.usercode)) {
    $('.btn-bidder').removeClass("hide");
    $('#bid-add').removeClass("hide");
    $('#bid-add').find('.btn-bid-extend-detail').removeClass("hide");
    $("#bid-add").find('.btn-create-bid').removeClass('hide');
    $("#bid-add").find('.btn-no-solution-bid').removeClass('hide');
    $("#bid-add").find('.btn-getitnow-bid').removeClass('hide');
    for (var ratingCpt = 1; ratingCpt < auth.rating; ratingCpt++) {
      $("#bid-add").find(".bidBidderRatingScore").append('<img width="32" src="https://yoctu.github.io/yoctu-website/img/logo/rating1.png" />');
    }
    for (ratingCpt; ratingCpt < 5; ratingCpt++) {
      $("#bid-add").find(".bidBidderRatingScore").append('<img width="32" src="https://yoctu.github.io/yoctu-website/img/logo/rating0.png" />');
    }
  }
  if (window.shaq.source.includes(auth.usercode)) {
    if (["running", "selected", "validated", "failed"].includes(window.shaq.status)) $('.btnbidderAction').removeClass("hide");
    $('#bid-filtering-field-grp').removeClass("hide");
    $('#bid-sorting-field-grp').removeClass("hide");
    $('.notifyAllBidders').prop("disabled", false);
    $('.btn-auctioneer').removeClass("hide");
    $("#set-it-now").removeClass("hide");
    for (var rooms in window.shaq.target) {
      if (Raters.includes(window.shaq.target[rooms])) continue;
      $('#ChatList').append('<p><button id="' + window.shaq.target[rooms] + '" class="btn btn-default btn-room"><img class="bidder-image" src="' + auth.logourl + window.shaq.target[rooms] + '.png" />  ' + window.shaq.targetName[rooms] + ' <span id="chatBadge-' + window.shaq.target[rooms] + '" class="badge">0</span></button></p>');
    }
    $("#shaq-valid-from-btn").prop("disabled", false);
    $("#shaq-valid-btn").prop("disabled", false);
    $("#shaq-status").prop("disabled", false);
    $("#shaq-from-title-btn").prop("disabled", false);
    if ((new Date().toUTCString()) < (new Date(window.shaq.valid_from).toUTCString())) $("#shaq-files").removeClass("hide");
  }
  $("#shaq-name").html('<div class="shaqlabel text-left">Order</div><div style="line-height: 20px; font-weight: bold; padding-bottom: 5px;">' + window.shaq.name + '</div>');
  if (window.shaq.targetName) $('#bid-add .bidBidderCode').text(window.shaq.targetName[0]);
  if (window.shaq.getitnow && parseFloat(window.shaq.getitnow) > 0) {
    if (window.shaq.source.includes(auth.usercode)) {
      $(".get-it-now-text").attr("disabled", true);
    }
    $(".get-it-now-text").html('<span class="glyphicon glyphicon-screenshot"></span> ' + parseFloat(window.shaq.getitnow).toFixed(2) + ' ' + window.shaq.currency);
    $("#get-it-now").removeClass("hide");
  } else $(".btn-getitnow-bid").addClass("hide");
  $('#bid-add .bidCurrency').val(window.shaq.currency);
  $("#shaq-date").html(moment(window.shaq.reported_at).format('YYYY-MM-DD HH:mm'));
  $("#shaq-puplace").html(window.shaq.puPlace[0] + '<br>');
  $("#shaq-puplace").append(window.shaq.puPlace[1] + ' ' + window.shaq.puPlace[2] + '<br>');
  $("#shaq-puplace").append(window.shaq.puPlace[3] + '   <img width="24px" title="' + window.shaq.puPlace[4] + '" src="https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.2.1/flags/4x3/' + window.shaq.puPlace[4].toLowerCase() + '.svg" class="pull-right" /><br>');
  $("#shaq-deplace").html(window.shaq.dePlace[0] + '<br>');
  $("#shaq-deplace").append(window.shaq.dePlace[1] + ' ' + window.shaq.dePlace[2] + '<br>');
  $("#shaq-deplace").append(window.shaq.dePlace[3] + '   <img width="24px" title="' + window.shaq.puPlace[4] + '" src="https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.2.1/flags/4x3/' + window.shaq.dePlace[4].toLowerCase() + '.svg" class="pull-right" /><br>');
  $("#shaq-pudate").text(moment(window.shaq.puDate).tz('UTC').format('YYYY-MM-DD HH:mm'));
  let pudateCet = moment.tz(window.shaq.puDate.replace("T", " ").substring(0, 16), tzSettings.countries[window.shaq.puPlace[4]].timezones[0]).tz("UTC");
  let dedateCet = moment.tz(window.shaq.deDate.replace("T", " ").substring(0, 16), tzSettings.countries[window.shaq.dePlace[4]].timezones[0]).tz("UTC");
  $("#shaq-pudate-cet").attr("title", "UTC time : " + pudateCet.format("YYYY-MM-DD HH:mm"));
  $("#shaq-dedate").text(moment(window.shaq.deDate).tz('UTC').format('YYYY-MM-DD HH:mm'));
  $("#shaq-dedate-cet").attr("title", "UTC time : " + dedateCet.format("YYYY-MM-DD HH:mm"));
  $("#shaq-transit-time").text(TransitCalc(pudateCet, dedateCet, window.shaq.puPlace[4], window.shaq.dePlace[4]));
  $('#bid-add .bidTransitTime').text(TransitCalc(pudateCet, dedateCet, window.shaq.puPlace[4], window.shaq.dePlace[4]));
  let distance = parseInt(window.shaq.distance);
  if (localSettings.distance === "Miles") {
    distance = (Math.ceil(distance * 62.14) / 100);
  }
  $("#shaq-distance").text(distance + ' ' + localSettings.distance);
  if (window.shaq.puContact) {
    $("#shaq-puContactCompany").html(window.shaq.puContact[0]);
    $("#shaq-puContactName").html(window.shaq.puContact[1]);
    $("#shaq-puContactPhone").html(window.shaq.puContact[3]);
    $("#shaq-puContactEmail").html(window.shaq.puContact[2]);
    $("#shaq-well-puContact").removeClass("hide");
  }
  if (window.shaq.deContact) {
    $("#shaq-deContactCompany").html(window.shaq.deContact[0]);
    $("#shaq-deContactName").html(window.shaq.deContact[1]);
    $("#shaq-deContactPhone").html(window.shaq.deContact[3]);
    $("#shaq-deContactEmail").html(window.shaq.deContact[2]);
    $("#shaq-well-deContact").removeClass("hide");
  }
  $("#shaq-vehicle").text(window.shaq.transport);
  $("#shaq-stackable").text(window.shaq.stackable);
  $(".shaq-pkg-notes").text(window.shaq.notes);
  $("#shaq-notes").text(window.shaq.notes);
  $("#shaq-auctioneer").html('<img width="24" src="' + auth.logourl + window.shaq.source[0] + '.png" />  <b>' + window.shaq.sourceName[0] + '</b>');
  bidderDisplay();
  $('#pickupdate').val(moment(window.shaq.puDate).tz('UTC').format('YYYY-MM-DD HH:mm'));
  $('#deliverydate').val(moment(window.shaq.deDate).tz('UTC').format('YYYY-MM-DD HH:mm'));
  let validDate = window.shaq.valid_until.substring(0, 16).replace('T', ' ');
  $('#validitydate').val(validDate);
  $("#shaq-valid-date").html(moment(window.shaq.valid_until).format('YYYY-MM-DD HH:mm'));
  $('#shaq-decision-date').html(moment(window.shaq.valid_from).format('YYYY-MM-DD HH:mm'));

  let dim = window.shaq.dimension;
  let totaldim = [0, 0, 0];
  for (let pkg = 0; pkg <= dim.length - 6; pkg = pkg + 6) {
    let dimUnit = dim[pkg + 1] + ' cm x ' + dim[pkg + 2] + ' cm x ' + dim[pkg + 3] + ' cm';
    let dimWeight = '<br>' + dim[pkg + 4] + ' kgs';
    totaldim[0] += parseInt(dim[pkg]);
    totaldim[1] += parseFloat(dim[pkg + 4]);
    totaldim[2] += parseInt(dim[pkg]) * (parseFloat(dim[pkg + 1]) * parseFloat(dim[pkg + 2]) * parseFloat(dim[pkg + 3]));
    if (localSettings.unit === "Imperial") {
      dimUnit = (Math.ceil(dim[pkg + 1] * 39.37) / 100) + ' inches x ' + (Math.ceil(dim[pkg + 2] * 39.37) / 100) + ' inches x ' + (Math.ceil(dim[pkg + 3] * 39.37) / 100) + ' inches';
    }
    if (localSettings.weight === "Pounds") {
      dimWeight = '<br>' + (Math.ceil(dim[pkg + 4] * 220.46) / 100) + ' pounds';
    }
    if (pkg === 0) {
      $('.shaq-pkg-number').html(dim[pkg]);
      $('.shaq-pkg-dimension').html(dimUnit + dimWeight);
      $('.shaq-pkg-stackable').html(dim[pkg + 5]);
      $('.shaq-pkg-notes').html();
    } else {
      let pkgInfo = $('#packages-well').clone();
      pkgInfo.find('.shaq-pkg-number').html(dim[pkg]);
      pkgInfo.find('.shaq-pkg-dimension').html(dimUnit + dimWeight);
      pkgInfo.find('.shaq-pkg-stackable').html(dim[pkg + 5]);
      pkgInfo.find('.shaq-pkg-notes').html();
      $('#packageList').append(pkgInfo);
    }
  }
  totalUnitCubed = "m3";
  totalUnitWeight = "kgs"
  if (localSettings.unit === "Imperial") {
    totaldim[2] = Math.ceil(totaldim[2] * 39.37) / 100;
    totalUnitCubed = " cubic inches";
  } else {
    totaldim[2] = (totaldim[2] / 1000000);
  }
  if (localSettings.weight === "Pounds") {
    totaldim[1] = Math.ceil(totaldim[1] * 220.46) / 100;
    totalUnitWeight = "pounds"
  }
  $("#shaq-total-package").html(totaldim[0]);
  $("#shaq-total-weight").html(totaldim[1] + " " + totalUnitWeight);
  $("#shaq-total-volume").html(totaldim[2].toFixed(2) + " " + totalUnitCubed);
  let now = new Date();
  let CurrentDate = now.getTime() + now.getTimezoneOffset() * 60000;
  validDate = new Date(validDate).getTime();
  $('#shaq-valid').html("00:00");
  if (window.shaqValid) clearInterval(window.shaqValid);
  if ((validDate > CurrentDate) && (window.shaq.status === "running")) {
    shaqValiditytimer = Math.floor((validDate - CurrentDate) / 1000);
    window.shaqValid = setInterval(function() {
      var hoursLeft = Math.floor(shaqValiditytimer);
      var hours = Math.floor(hoursLeft / 3600);
      var minutesLeft = Math.floor((hoursLeft) - (hours * 3600));
      var minutes = Math.floor(minutesLeft / 60);
      var remainingSeconds = shaqValiditytimer % 60;
      if (shaqValiditytimer > 0) {
        $('#shaq-valid').html(pad(hours) + ":" + pad(minutes) + ":" + pad(remainingSeconds));
        shaqValiditytimer--;
      } else {
        clearInterval(window.shaqValid);
      }
    }, 1000);
  }
  if (localSettings.shaqvalidtimer === "Disable") $('#shaq-valid').addClass('hide');
  if (localSettings.chatShow === "Hide") $(".hideMessage").click();
  if (localSettings.shipmentShow === "Hide") $(".hideShipment").click();
  $('#shaq-from').html("00:00");
  $('#shaq-from-title').html("00:00");
  let validDateFrom = window.shaq.valid_from.substring(0, 16).replace('T', ' ');
  let CurrentDateFrom = new Date(validDateFrom).getTime();
  if ((CurrentDateFrom > CurrentDate) && (window.shaq.status === "running")) {
    timerFrom = Math.floor((CurrentDateFrom - CurrentDate) / 1000);
    $(".btn-accept-bid").prop("disabled", true);
    $(".btn-forward-bid").prop("disabled", true);
    $(".btn-decline-bid").prop("disabled", true);
    $('.btn-accept-bid').attr('title', 'Decision time is Running !');
    $('.btn-forward-bid').attr('title', 'Decision time is Running !');
    $('.btn-decline-bid').attr('title', 'Decision time is Running !');
    window.shaqFromValid = setInterval(function() {
      var hoursFromLeft = Math.floor(timerFrom);
      var hoursFrom = Math.floor(hoursFromLeft / 3600);
      var minutesFromLeft = Math.floor((hoursFromLeft) - (hoursFrom * 3600));
      var minutesFrom = Math.floor(minutesFromLeft / 60);
      var remainingFromSeconds = timerFrom % 60;
      if (timerFrom >= 0) {
        $('#shaq-from').html(pad(hoursFrom) + ":" + pad(minutesFrom) + ":" + pad(remainingFromSeconds));
        $('#shaq-from-title').html(pad(hoursFrom) + ":" + pad(minutesFrom) + ":" + pad(remainingFromSeconds));
        timerFrom--;
      } else {
        $(".btn-accept-bid").prop("disabled", false);
        $(".btn-decline-bid").prop("disabled", false);
        $(".btn-forward-bid").prop("disabled", false);
        $('.btn-accept-bid').attr('title', 'Accept Bid !');
        $('.btn-forward-bid').attr('title', 'Forward Bid !');
        $('.btn-decline-bid').attr('title', 'Decline Bid !');
        clearInterval(window.shaqFromValid);
      }
    }, 1000);
  }
  for (file in window.shaq.files) {
    $("#filetoUploadShaq").append('<div><a href="' + window.location.protocol + '//' + username + ':' + userkey + '@' + window.location.host + '/api/shaq/' + auth.usercode + '/downloadshaqfile/' + window.shaq.key + '?id=' + window.shaq.id + '&pos=' + file + '"><span class="glyphicon glyphicon-cloud-upload text-success"></span>  ' + window.shaq.files[file].slice(window.shaq.files[file].indexOf("_") + 1) + '</a></div>');
  }

  for (let chat in window.shaq.source) {
    window.chatsInfo[window.shaq.source[chat]] = [];
  }
  for (let chat in window.shaq.target) {
    if (Raters.includes(window.shaq.target[chat])) continue;
    window.chatsInfo[window.shaq.target[chat]] = [];
  }
  for (let targetStatus in window.shaq.targetStatus) {
    switch (window.shaq.targetStatus[targetStatus]) {
      case "Removed":
        $("#bidderList_" + window.shaq.target[targetStatus]).addClass("text-warning");
        $("#bidderList_" + window.shaq.target[targetStatus]).find('span').removeClass('glyphicon-remove').addClass('glyphicon-ok');
        if (Raters.includes(window.shaq.target[targetStatus])) {
          $("#bidderList_" + window.shaq.target[targetStatus]).find('.rate-bidder').addClass("hide");
          $("#bidderList_" + window.shaq.target[targetStatus]).removeClass("text-success");
          $("#" + window.shaq.target[targetStatus] + "_RefreshBtn").addClass("hide");
        }
        break;
      case "NoSolution":
        noSolution();
        $("#bidderList_" + window.shaq.target[targetStatus]).addClass("text-danger");
        if (Raters.includes(window.shaq.target[targetStatus])) {
          $("#" + window.shaq.target[targetStatus] + "_RefreshBtn").addClass("hide");
          setTimeout(function() {
            $("#" + window.shaq.target[targetStatus] + "LoadingOffer").addClass('hide');
          }, 3000);
        }
        break;
      case "Searching":
        $("#" + window.shaq.target[targetStatus] + "LoadingOffer").removeClass("hide");
        $("#bidderList_" + window.shaq.target[targetStatus]).addClass("text-success");
        $("#" + window.shaq.target[targetStatus] + "_RefreshBtn").addClass("hide");
        break;
      default:
        $("#bidderList_" + window.shaq.target[targetStatus]).removeClass("text-warning");
        $("#bidderList_" + window.shaq.target[targetStatus]).find('span').addClass('glyphicon-remove').removeClass('glyphicon-ok');
        if (Raters.includes(window.shaq.target[targetStatus])) {
          $("#bidderList_" + window.shaq.target[targetStatus]).find('.rate-bidder').removeClass("hide");
          $("#bidderList_" + window.shaq.target[targetStatus]).removeClass("text-success");
          setTimeout(function() {
            $("#" + window.shaq.target[targetStatus] + "LoadingOffer").addClass('hide');
          }, 3000);
        }
        break;
    }
  }
}

$.ajax({
  "url": "/api/shaq" + solrTarget + "/" + auth.usercode + "/" + ShaqID + "?rows=1",
  "dataType": "json",
  "json": "json.wrf",
  "beforeSend": function(xhr) {
    xhr.setRequestHeader("Authorization", "Basic " + auth.authbasic);
  },
  "statusCode": {
    "200": function(xhr) {
      shaqGTAG('Shaq', 'ShaqDisplayFetch', JSON.stringify(shaq));
    },
    "429": function(xhr) {
      status429();
    }
  },
  "success": function(shaq) {
    console.log(shaq);
    $("#DisplayPage").removeClass("hide");
    if ((shaq.numFound) === 0) {
      $('.header-content').hide();
      $('#not-found-message-text').html('<a href="#">Shaq not found</a><br><br>try <a href="' + window.location.href.replace("#", "").replace("?type=", "") + '?type=-archive">archived</a> may be.');
      $('#not-found-message').removeClass('hide');
      return;
    }
    window.shaq = shaq.docs[0];
    shaqRefresh();

    const sort = new Object();
    sort[$('#bid-sorting-field').val()] = $('#bid-sorting-dir').val();
    getBids(sort);

    getChatMsgs();
    getNotifMsgs();
    calcRoute(window.shaq.puPlace[2] + ", " + window.shaq.puPlace[3], window.shaq.dePlace[2] + ", " + window.shaq.dePlace[3]);

  }
});

function BidRender(bids) {
  $('#bidCount').text(bids.docs.length);
  if (bids.docs.length > 0) {
    if (window.shaq.source.includes(auth.usercode)) $("#decline-all").removeClass("hide");
    if (window.shaq.target.includes(auth.usercode)) $("#cancel-all").removeClass("hide");
  }
  for (let bid in bids.docs) {
    window.bids[bids.docs[bid].id] = bids.docs[bid];
    var bidInfo = $("#bid-info").clone();
    bidRefresh(bidInfo, bids.docs[bid]);
    bidInfo.find("#pickup_date").val(bid.puDate);
    bidInfo.appendTo("#bid-list");
    if ((window.shaq.status === "running") && (bids.docs[bid].id === window.shaq.winningbid) && (["created", "running", "forwarded", "authorized"].includes(bids.docs[bid].status))) {
      bidInfo.find('.well').removeClass('well-warning').addClass('well-success');
    }
    window.bidsInfo[bids.docs[bid].id] = bidInfo;
    if ((window.shaq.winningbid === bids.docs[bid].id) && (["created", "running", "forwarded", "authorized"].includes(bids.docs[bid].status))) {
      $('.bid-info-list').find('.well').removeClass("well-success")
      window.bidsInfo[window.shaq.winningbid].find('.well').removeClass('well-warning').addClass('well-success');
    }
  }
}

function getBids(orderBy = {
  "price": "asc"
}) {
  const sort = {
    "status": "desc"
  };

  Object.keys(orderBy).forEach(key => sort[key] = orderBy[key]);

  $.ajax({
    "url": '/api/bid' + solrTarget + '/' + auth.usercode + '/' + ShaqID + '?rows=100&sort=' + JSON.stringify(sort),
    "dataType": "json",
    "json": "json.wrf",
    "beforeSend": function(xhr) {
      xhr.setRequestHeader("Authorization", "Basic " + auth.authbasic);
    },
    "statusCode": {
      "429": function(xhr) {
        status429();
      }
    },
    "success": function(bids) {
      BidRender(bids);
      if (window.shaq.status !== "running") ShaqCompleted(window.shaq.winningbid);
    }
  });
}

function AddChatNotification(chat) {
  let d = new Date();
  date = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate() + " " + d.getHours() + ":" + d.getMinutes();
  let pre = '<p><div id="' + chat.id + '" class="chat-container-notification alert alert-danger" align="center"><div class="message"><strong>' + chat.message + '</strong></div><div>' + date + ' - ' + window.shaq.sourceName[window.shaq.source.indexOf(chat.source[0])] + ' (' + chat.from + ') </div></div><p>';
  $('#chat-notifications-container').append(pre);
}

function updateChat(chat) {
  let pos = "left";
  let alertclass = "alert-success";
  if (chat.source.includes(auth.usercode)) {
    pos = "right";
    alertclass = "alert-info";
  }
  if (["giveup", "remove", "readd", "readdall", "removeall"].indexOf(chat.channel) >= 0) {
    alertclass = "alert-warning";
    pos = "center";
  }
  let date = moment(new Date()).format("YYYY-MM-DD HH:mm");;
  if (chat.date !== "NOW") date = moment(chat.date).format("YYYY-MM-DD HH:mm");
  let chatName = "";
  if (window.shaq.source.includes(chat.source[0])) chatName = window.shaq.sourceName[window.shaq.source.indexOf(chat.source[0])];
  else chatName = window.shaq.targetName[window.shaq.target.indexOf(chat.source[0])];
  let pre = '<p><div id="' + chat.id + '" class="chat-container alert ' + alertclass + '" align="' + pos + '"><div class="message"><strong>' + chat.subject + '</strong></div><div>' + date + ' - ' + chatName + ' (' + chat.from + ') </div></div><p>';
  for (let target in chat.target) {
    if (Raters.includes(chat.target[target])) continue;
    if (chat.target[target] != auth.usercode) {
      window.chatsInfo[chat.target[target]].push(pre);
      $('#chatBadge-' + chat.target[target]).text(parseInt($('#chatBadge-' + chat.target[target]).text()) + 1);
    } else if (chat.source[0] == auth.usercode) {
      window.chatsInfo[auth.usercode].push(pre);
      $('#chatBadge-' + auth.usercode).text(parseInt($('#chatBadge-' + auth.usercode).text()) + 1);
    }
  }
  for (let source in chat.source) {
    if (chat.source[source] != auth.usercode) {
      window.chatsInfo[chat.source[source]].push(pre);
      $('#chatBadge-' + chat.source[source]).text(parseInt($('#chatBadge-' + chat.source[source]).text()) + 1);
    }
  }
  $('#chatCount').text(parseInt($('#chatCount').text()) + 1);
}

function getChatMsgs() {
  $.ajax({
    "url": '/api/chat' + solrTarget + '/' + auth.usercode + '/' + ShaqID + '?rows=' + localSettings.chathistory + '&sort={"date": "desc"}',
    "dataType": "json",
    "json": "json.wrf",
    "beforeSend": function(xhr) {
      xhr.setRequestHeader("Authorization", "Basic " + auth.authbasic);
    },
    "statusCode": {
      "429": function(xhr) {
        status429();
      }
    },
    "success": function(chats) {
      $('#chatCount').text('0');
      let output = "";
      for (let chat in chats.docs.reverse()) {
        updateChat(chats.docs[chat])
      }
      window.chatCurrent = auth.usercode;
      $('#' + auth.usercode).addClass('btn-danger').find('.badge').addClass('badge-danger');
      switchRoom();
    }
  });
}

function getNotifMsgs() {
  $.ajax({
    "url": '/api/notif' + solrTarget + '/' + auth.usercode + '/' + ShaqID + '?rows=100&sort={"date": "desc"}',
    "dataType": "json",
    "json": "json.wrf",
    "beforeSend": function(xhr) {
      xhr.setRequestHeader("Authorization", "Basic " + auth.authbasic);
    },
    "statusCode": {
      "429": function(xhr) {
        status429();
      }
    },
    "success": function(notifs) {
      $('#notifCount').text(notifs.docs.length);
      $('#chatBadge-notification').text(notifs.docs.length);
      for (let notif in notifs.docs) {
        let pre = '<p><div id="' + notifs.docs[notif].id + '" class="chat-container-notification alert alert-danger" align="center"><div class="message"><strong>' + notifs.docs[notif].message + '</strong></div><div>' + notifs.docs[notif].date.substring(0, 16).replace('T', ' ') + ' - ' + window.shaq.sourceName[window.shaq.source.indexOf(notifs.docs[notif].source[0])] + ' (' + notifs.docs[notif].from + ') </div></div><p>';
        $('#chat-notifications-container').append(pre);
      }
    }
  });
}

socket.on(auth.usercode, function(data) {
  let msg = JSON.parse(data.value);
  let statusMessage = "Unkown";
  switch (msg.type) {
    case "auction":
      if (msg.id === window.shaq.id) {
        window.shaq = msg;
        shaqRefresh();
      }
      break;
    case "bid":
      if (msg.key !== window.shaq.key) break;
      if (window.bids[msg.id]) {
        bidRefresh(window.bidsInfo[msg.id], msg);
      } else {
        let bidInfo = $("#bid-info").clone();
        window.bidsInfo[msg.id] = bidInfo;
        bidRefresh(bidInfo, msg);
        $('#bidCount').text(parseInt($('#bidCount').text()) + 1);
        bidInfo.appendTo("#bid-list");
      }
      if ($("#InformationModal").is(':visible')) setTimeout(function() {
        $("#InformationModal").modal('hide')
      }, 1000);
      window.bids[msg.id] = msg;
      if (msg.status === "accepted") {
        ShaqCompleted(msg.id);
      } else {
        $('.bid-info-list').find('.well').removeClass("well-success").not('.well-danger').addClass("well-warning");
        $('#bid-add').find('.well').removeClass("well-warning");
        if (window.shaq.bestbid && window.bidsInfo[window.shaq.bestbid]) {
          window.bidsInfo[window.shaq.bestbid].find('.well').removeClass("well-warning").addClass("well-success");
        }
      }
      if (Raters.includes(msg.source[0])) {
        $("#" + msg.source[0] + "LoadingOfferText").html("Getting offers...");
      }
      break;
    case "message":
      if (msg.key !== window.shaq.key) break;
      if ($('#' + msg.id).length) break;
      $(".btn-send-message").attr("disabled", false);
      updateChat(msg);
      switchRoom();
      break;
    case "notification":
      if (msg.action === "clear") break;
      if ((msg.action === "archive") && (msg.id === window.shaq.id)) {
        setTimeout(function() {
          $('.header-content').hide();
          $('#not-found-message-text').html('<a href="' + window.location.href.replace("#", "").replace("?type=", "") + '?type=-archive">Shaq has been closed</a>');
          $('#not-found-message').removeClass('hide');
          $("#InformationModal").modal('hide');
        }, 1000);
        break;
      }
      if (msg.key !== window.shaq.key) break;
      if ($('#' + msg.id).length) break;
      AddChatNotification(msg);
      $('#notifCount').text(parseInt($('#notifCount').text()) + 1);
      $('#chatBadge-notification').text(parseInt($('#chatBadge-notification').text()) + 1);
      $('#chatBadge-notification').addClass("badge-danger");
      switchRoom();
  }
});

function updateBid(bidData) {
  $.ajax({
    "url": "/api/bid/" + auth.usercode + "/" + ShaqID,
    "type": "POST",
    "dataType": "json",
    "contentType": "application/json",
    "json": "json.wrf",
    "data": bidData,
    "beforeSend": function(xhr) {
      xhr.setRequestHeader("Authorization", "Basic " + auth.authbasic);
    },
    "statusCode": {
      "429": function(xhr) {
        status429();
      }
    },
    "success": function(msgs) {
      shaqGTAG('Bid', 'BidUpdate', JSON.stringify(shaq));
    }
  });
}

function sendMessageAll() {
  let dataSendMessageAll = {
    "id": uuidv4(),
    "date": "NOW",
    "subject": window.shaq.name,
    "message": $('#chatNotifyModal-message').val(),
    "from": username,
    "category": "shaq",
    "key": window.shaq.key,
    "source": [auth.usercode],
    "target": [auth.usercode],
    "type": "notification",
    "status": "sent",
    "channel": ["message", "mail"],
    "flags": ""
  };
  $.ajax({
    "url": "/api/notif/" + auth.usercode + "/" + ShaqID,
    "type": "POST",
    "dataType": "json",
    "contentType": "application/json",
    "json": "json.wrf",
    "data": JSON.stringify([dataSendMessageAll]),
    "beforeSend": function(xhr) {
      xhr.setRequestHeader("Authorization", "Basic " + auth.authbasic);
    },
    "statusCode": {
      "429": function(xhr) {
        status429();
      }
    },
    "success": function(msg) {
      shaqGTAG('Notification', 'NotificationSend', JSON.stringify(shaq));
    }
  });
}

function sendBid() {
  let loaded = "No";
  if ($('#bid-add').find('.bidLoaded input').is(":checked")) loaded = "Yes";
  let driver = "1";
  if ($('#bid-add').find('.bidDriver input').is(":checked")) driver = "2";
  let bidstatus = "created";
  let dataSendBid = {
    "id": uuidv4(),
    "reported_at": "NOW",
    "key": window.shaq.key,
    "from": auth.username,
    "source": [auth.usercode],
    "target": window.shaq.source,
    "type": "bid",
    "logo": auth.logourl + auth.usercode + ".png",
    "status": bidstatus,
    "auction": window.shaq.source[0],
    "valid_until": moment($('#validitydate').val()).tz('UTC'),
    "vehicule": $('#vehicle_type').val(),
    "loaded": loaded,
    "validatorEmails": [auth.validatoremail],
    "price": parseFloat($('#amount').val()).toFixed(2),
    "puDate": $('#pickupdate').val().replace(' ', 'T') + ":00.000Z",
    "deDate": $('#deliverydate').val().replace(' ', 'T') + ":00.000Z",
    "lang": $('#driver-language').val(),
    "currency": $('#currency').val(),
    "driver": driver
  };
  $.ajax({
    "url": "/api/bid/" + auth.usercode + "/" + ShaqID,
    "type": "POST",
    "dataType": "json",
    "contentType": "application/json",
    "json": "json.wrf",
    "data": JSON.stringify([dataSendBid]),
    "beforeSend": function(xhr) {
      xhr.setRequestHeader("Authorization", "Basic " + auth.authbasic);
    },
    "statusCode": {
      429: function(xhr) {
        status429();
      },
      406: function() {
        informShow('   <span>Max bid reached !!!</span>');
      },
      201: function(msgs) {
        shaqGTAG('Bid', 'BidCreate', JSON.stringify(shaq));
        $("#amount").attr("disabled", false);
      }
    }
  });
}

function switchRoom() {
  while (window.chatsInfo[window.chatCurrent].length > localSettings.chathistory) {
    window.chatsInfo[window.chatCurrent].shift();
  }
  $('#chat-messages-room').html(window.chatsInfo[window.chatCurrent]);
  $('#chat-msg-text').val('');
  $("#chat-all-messages-container").animate({
    scrollTop: $(document).height()
  }, "fast");
}

$("#chat-msg-text").keypress(function(event) {
  if (event.keyCode == 13) {
    $('.btn-send-message').click();
  }
});

$("#amount").keypress(function(event) {
  if (event.keyCode === 13) {
    $("#amount").attr("disabled", true);
    informShow('   <div class="loader"></div>&nbsp;&nbsp;&nbsp;<span>Sending Offer...</span>');
    sendBid();
  }
});

function invitesearch() {
  $('#InviteModalCode').html('');
  $('#InviteModalName').html('');
  $('#InviteModalInviteBtn').prop('disabled', true);
  if ($('#InviteModalSearchInput').val() !== "") {
    $.ajax({
      "url": '/public/' + $('#InviteModalSearchInput').val() + "/",
      "method": "GET",
      "dataType": "json",
      "contentType": "application/json",
      "beforeSend": function(xhr) {
        xhr.setRequestHeader("Authorization", "Basic " + auth.authbasic);
      },
      "statusCode": {
        "200": function(xhr) {
          $('#InviteModalCode').html(json.code);
          $('#InviteModalName').html(json.name);
          $("#QuestionModalYesBtn").on("click", function() {
            invite();
          });
        },
        "404": function(xhr) {
          $('#InviteModalCode').html("not found");
          $('#InviteModalName').html("not found");
        }
      }
    });
  }
}

function SetItNow() {
  let NewSetItNow = parseFloat($('#newsetitnow').val()).toFixed(2);
  if (NewSetItNow < window.shaq.bestbidprice) {
    $.ajax({
      "url": '/api/shaq' + solrTarget + '/' + auth.usercode + '/setitnow/' + window.shaq.key,
      "method": "POST",
      "dataType": "json",
      "contentType": "application/json",
      "data": JSON.stringify({
        setitnow: NewSetItNow
      }),
      "beforeSend": function(xhr) {
        xhr.setRequestHeader("Authorization", "Basic " + auth.authbasic);
      },
      "statusCode": {
        "500": function(xhr) {
          status500();
        }
      },
      "success": function(json) {}
    });
  } else {
    informShow('   <div class="text-danger">Value is not valid !</div>', false);
  }
}

function invite() {
  if (!window.shaq.target.includes($('#InviteModalCode').text().toUpperCase()) &&
    !window.shaq.source.includes($('#InviteModalCode').text().toUpperCase())) {
    $.ajax({
      "url": '/api/shaq' + solrTarget + '/' + auth.usercode + '/invite/' + '/' + window.shaq.key,
      "method": "POST",
      "dataType": "json",
      "contentType": "application/json",
      "data": JSON.stringify({
        usercode: $('#InviteModalCode').text(),
        usercodename: $('#InviteModalName').text()
      }),
      "beforeSend": function(xhr) {
        xhr.setRequestHeader("Authorization", "Basic " + auth.authbasic);
      },
      "statusCode": {
        "403": function(xhr) {
          informShow('   <div class="text-danger">Already In!</div>');
        }
      },
      "success": function(json) {
        $("#InviteModal").modal('hide');
      }
    });
  } else {
    informShow('   <div class="text-danger">Already In!</div>');
  }
}

$("#hrefshaq").on('click', function() {
  $("#fileshaq").click();
});

$('#set-it-now-btn').on('click', function() {
  questionShow('<div><p>Current Target: <span class="pull-right" id="currentsetitnow"></span></p></div>\
    <div><p>Current best bid : <span class="pull-right" id="bestbidpricesetitnow"></span></p></div>\
    <div><p>New : <input class="pull-right" id="newsetitnow"></input></p></div>', 'Set It');
  $('#currentsetitnow').html(window.shaq.getitnow);
  $('#bestbidpricesetitnow').html(parseFloat(window.shaq.bestbidprice).toFixed(2));
  $("#QuestionModalYesBtn").on("click", function() {
    SetItNow();
  });
  $("#newsetitnow").focus();
});

$('#invite').on('click', function() {
  questionShow('<div class="form-inline"><label>Bidder Code : </label><button id="InviteModalSearchBtn" class="btn btn-default pull-right"><span class="glyphicon glyphicon-search"></span></button>\
              <input id="InviteModalSearchInput" type="text" class="form-control pull-right" autofocus></input></div>\
            <div id="inviteDescription"><hr><div><p>Code : <span class="pull-right" id="InviteModalCode"></span></p></div>\
              <div><p>Name : <span class="pull-right" id="InviteModalName"></span></p></div></div>', 'Invite');
  $("#InviteModalSearchBtn").on("click", function() {
    invitesearch();
  });
});

$('#readdall').on('click', function() {
  readdallbidders();
});

$('#removeall').on('click', function() {
  removeallbidders();
});

$("#shaq-print").on('click', function() {
  window.print();
});

$('#winningbidcalc').on('click', function() {
  $('#bid-list').empty();
  getBids();
  informShow('   <div class="loader"></div>&nbsp;&nbsp;&nbsp;<span>Calculating Offers...</span>');
  $.ajax({
    "url": '/api/shaq' + solrTarget + '/' + auth.usercode + '/winningbidcalc/' + window.shaq.key,
    "method": "POST",
    "dataType": "json",
    "contentType": "application/json",
    "beforeSend": function(xhr) {
      xhr.setRequestHeader("Authorization", "Basic " + auth.authbasic);
    },
    "complete": function(json) {
      setTimeout(function() {
        $("#InformationModal").modal('hide');
      }, 1000)
    }
  });
});

$('#bid-add').find('.bidDriver input').on('change', function() {
  $('#bid-add').find('.bidDriver').toggleClass('btn-info');
});

$('#bid-add').find('.bidLoaded input').on('change', function() {
  $('#bid-add').find('.bidLoaded').toggleClass('btn-info');
});

$('#shaq-status').on('click', function() {
  questionShow('Are you sure to close shaq ?', 'Yes');
  $("#QuestionModalYesBtn").on("click", function() {
    closeShaq();
  });
});

$(document).on('click', '.btn-decline-bid, .btn-cancel-bid, .btn-accept-bid, .btn-forward-bid, .btn-no-solution-bid', function() {
  if ($(this).hasClass('btn-decline-bid')) window.bids[$(this).data("btn-bid-id")].status = "declined";
  if ($(this).hasClass('btn-cancel-bid')) window.bids[$(this).data("btn-bid-id")].status = "cancelled";
  if ($(this).hasClass('btn-accept-bid')) window.bids[$(this).data("btn-bid-id")].status = "accepted";
  if ($(this).hasClass('btn-forward-bid')) window.bids[$(this).data("btn-bid-id")].status = "forwarded";
  updateBid(JSON.stringify([window.bids[$(this).data("btn-bid-id")]]));
});

$(document).on('click', '.btn-no-solution-bid', function() {
  informShow('   <div class="loader"></div>&nbsp;&nbsp;&nbsp;<span>Giving Up...</span>');
  let data = {
    target: auth.usercode,
    type: "notification",
    action: "giveup"
  };
  $.ajax({
    "url": '/api/shaq' + solrTarget + '/' + auth.usercode + '/giveup/' + window.shaq.key,
    "method": "POST",
    "dataType": "json",
    "contentType": "application/json",
    "data": JSON.stringify(data),
    "beforeSend": function(xhr) {
      xhr.setRequestHeader("Authorization", "Basic " + auth.authbasic);
    },
    "statusCode": {
      "429": function(xhr) {
        status429();
      }
    },
    "success": function(json) {
      sendMessage({
        "subject": "No Solution !",
        "message": "No Solution !",
        "channel": "giveup",
        "target": [target]
      });
      shaqGTAG('Bid', 'BidGiveUp', JSON.stringify(shaq));
    }
  });
});

$('.get-it-now-text, .btn-getitnow-bid').on('click', function() {
  if (window.shaq.getitnow) {
    $('#amount').val(parseFloat(window.shaq.getitnow).toFixed(2));
    informShow('   <div class="loader"></div>&nbsp;&nbsp;&nbsp;<span>Sending Offer...</span>');
    sendBid();
  }
});

$('.btn-create-bid').on('click', function() {
  if ($('#amount').val()) {
    informShow('   <div class="loader"></div>&nbsp;&nbsp;&nbsp;<span>Sending Offer...</span>');
    sendBid();
    $('#amount').removeClass("has-error");
  } else {
    $('#amount').addClass("has-error");
    setTimeout(function() {
      $('#amount').removeClass("has-error");
    }, 2000)
  }
});

$('.showPackage').on('click', function() {
  $(this).find('.btn-message-extend-glyphicon').toggleClass('glyphicon-triangle-bottom').toggleClass('glyphicon-triangle-top');
  $('#packageList').toggleClass('hide');
});

$('.hideMessage').on('click', function() {
  $(this).find('.btn-message-extend-glyphicon').toggleClass('glyphicon-triangle-bottom').toggleClass('glyphicon-triangle-top');
  $('#message-body').toggleClass('hide');
});

$('.hideShipment').on('click', function() {
  $(this).find('.btn-shipment-extend-glyphicon').toggleClass('glyphicon-triangle-bottom').toggleClass('glyphicon-triangle-top');
  $('.panel-shipment-background').toggleClass('hide');
  $("#total-packages-well").toggleClass('hide');
});

$('.btn-bid-extend').on('click', function() {
  $(this).find('.btn-bid-extend-glyphicon').toggleClass('glyphicon-triangle-bottom').toggleClass('glyphicon-triangle-top');
  let bidIdDetail = $(this).find('.btn-bid-extend-glyphicon').data('bid-id-to-extend');
  $(window.bidsInfo[bidIdDetail]).find('.btn-bid-extend-detail').toggleClass('hide');
});

$('.showAllBids').on('click', function() {
  showAllbids = !showAllbids;
  $(this).toggleClass("enable");
  if (!showAllbids) $('.bid-info-list .well.well-danger').parent('.bid-info-list').addClass('hide');
  else $('.bid-info-list .well.well-danger').parent('.bid-info-list').removeClass('hide');
});

$('.notifyAllBidders').on('click', function() {
  questionShow('<label for="message">Message:</label>\
      <textarea class="form-control" type="textarea" name="message" id="chatNotifyModal-message" maxlength="500" rows="3"></textarea>', 'Send');
  $("#QuestionModalYesBtn").on("click", function() {
    sendMessageAll();
  });
});

$('.btn-send-message').on('click', function() {
  if (window.chatCurrent && ($('#chat-msg-text').val() !== "")) {
    $(".btn-send-message").attr("disabled", true);
    sendMessage({
      "channel": auth.usercode,
      "subject": $('#chat-msg-text').val(),
      "message": $('#chat-msg-text').val(),
      "target": [window.chatCurrent]
    });
  }
});

$('.btn-room').on('click', function() {
  $('.btn-room').removeClass('btn-danger');
  $(this).addClass('btn-danger');
  if ($(this).attr('id') === "Notifications-Chat") {
    $('#chat-notifications-container').removeClass('hide');
    $('#chat-messages-container').addClass('hide');
    $(".btn-room .badge").removeClass("badge-danger");
    $(this).find(".badge").addClass("badge-danger");
    $('.chat-container').addClass("hide");
    $('.chat-container-notification').removeClass("hide");
  } else {
    $('#chat-notifications-container').addClass('hide');
    $('#chat-messages-container').removeClass('hide');
    $(".btn-room .badge").removeClass("badge-danger");
    $('.chat-container').removeClass("hide");
    $('.chat-container-notification').addClass("hide");
    $(this).find(".badge").addClass("badge-danger");
    window.chatCurrent = $(this).attr('id');
    switchRoom();
  }
});

$('#bid-add #pickupdate').on('change', function(event) {
  $('#bid-add .bidTransitTime').text(TransitCalc($('#bid-add #pickupdate').val(), $('#bid-add #deliverydate').val(), window.shaq.puPlace[4], window.shaq.dePlace[4]));
});
$('#bid-add #deliverydate').on('change', function(event) {
  $('#bid-add .bidTransitTime').text(TransitCalc($('#bid-add #pickupdate').val(), $('#bid-add #deliverydate').val(), window.shaq.puPlace[4], window.shaq.dePlace[4]));
});
$('#bid-sorting-field').on('change', function(event) {
  $('#bid-list').empty();
  const sort = new Object();
  sort[event.target.value] = $('#bid-sorting-dir').val();
  let Bids = [];
  for (let Bid in window.bids) {
    Bids.push(window.bids[Bid]);
  }
  Bids.sort(compareValues(event.target.value, sort[event.target.value]));
  let RenderBid = {};
  RenderBid.docs = [];
  for (let Bid in Bids) {
    RenderBid.docs.push(Bids[Bid]);
  }
  BidRender(RenderBid);
});

$("#decline-all-btn").on('click', function(event) {
  for (let bidNum in window.bids) {
    if (["created", "running"].includes(window.bids[bidNum].status)) {
      window.bids[bidNum].status = "declined";
      updateBid(JSON.stringify([window.bids[bidNum]]));
    }
  }
});

$("#cancel-all-btn").on('click', function(event) {
  for (let bidNum in window.bids) {
    if (["created", "running"].includes(window.bids[bidNum].status)) {
      window.bids[bidNum].status = "cancelled";
      updateBid(JSON.stringify([window.bids[bidNum]]));
    }
  }
});

$('#bid-filtering-field').on('change', function(event) {
  $('#bid-list').empty();
  let Bids = [];
  let RenderBid = {};
  RenderBid.docs = [];
  for (let Bid in window.bids) {
    if (window.bids[Bid].source.includes($('#bid-filtering-field').val()) || $('#bid-filtering-field').val() === "")
      RenderBid.docs.push(window.bids[Bid]);
  }
  BidRender(RenderBid);
});

$('#bid-filtering-dir').on('click', function(event) {
  $('#bid-list').empty();
  let Bids = [];
  let RenderBid = {};
  RenderBid.docs = [];
  for (let Bid in window.bids) {
    RenderBid.docs.push(window.bids[Bid]);
  }
  BidRender(RenderBid);
});

$('#bid-sorting-dir').on('click', function() {
  const button = $(this);

  if (button.val() == 'asc') {
    button.children().removeClass('glyphicon-sort-by-attributes').addClass('glyphicon-sort-by-attributes-alt');
    button.val('desc');
  } else {
    button.children().removeClass('glyphicon-sort-by-attributes-alt').addClass('glyphicon-sort-by-attributes');
    button.val('asc');
  }

  $('#bid-sorting-field').change();
});
