var ShaqID = window.location.pathname.split("/")[3];
var timerFrom = 0;
var shaqValiditytimer = 0;
var showAllbids = 0;
var solrTarget = new URLSearchParams(location.search).has('type') ? new URLSearchParams(location.search).get('type') : "";
window.shaq = '';
window.timerBid = [];
window.bids = [];
window.chats = [];
window.bidsInfo = [];
window.chatsInfo = [];

localStorage.setItem(auth.auth.usercode + "-" + ShaqID, window.id);
window.addEventListener('storage', storageChanged);

function storageChanged(event) {
  if (window.id !== localStorage.getItem(auth.auth.usercode + "-" + ShaqID)) window.location.href = "https://shaq.yoctu.com/shaqcenter.html";
}

$('#bid-add').find('.bidBidderName').text(auth.auth.username);
if (auth.auth.maxbids > 0) $('#bidMaxBidder').text(" / " + auth.auth.maxbids);
if ((auth.notifications & 1) || (localSettings.chatShow === "Show")) $('#chat-box').removeClass("hide");

$("#dateTimePicker").DateTimePicker({
  isPopup: false,
  buttonsToDisplay: ['HeaderCloseButton', 'SetButton'],
  setValueInTextboxOnEveryClick: true,
  animationDuration: 200,
  dateTimeFormat: "yyyy-MM-dd HH:mm",
  dateFormat: "yyyy-MM-dd"
});

$('input[data-field="datetime"], input[data-field="date"], input[data-field="time"]').on('focus', function() {
  $('#dateTimePicker input:first').focus();
});

function deleteShaq() {
  informShow('   <div class="loader"></div>&nbsp;&nbsp;&nbsp;<span>Deleting Shaq</span>');
  $.ajax({
    "url": "/api/shaq/" + auth.auth.usercode + "/delete/" + window.shaq.key,
    "type": "POST",
    "dataType": "json",
    "contentType": "application/json",
    "beforeSend": function(xhr) {
      xhr.setRequestHeader("Authorization", "Basic " + auth.auth.authbasic);
    },
    "success": function(msgs) {
      shaqGTAG('Shaq', 'ShaqDeleted', window.shaq.key);
      $('.header-content').hide();
      $('#not-found-message-text').html('<a href="/' + auth.auth.usercode + '">Shaq ' + window.shaq.key + ' has been deleted</a><br><br>');
      $('#not-found-message').removeClass('hide');
    }
  });
}

function archiveShaq() {
  informShow('   <div class="loader"></div>&nbsp;&nbsp;&nbsp;<span>Archiving Shaq</span>');
  $.ajax({
    "url": "/api/shaq/" + auth.auth.usercode + "/archive/" + window.shaq.key,
    "type": "POST",
    "dataType": "json",
    "contentType": "application/json",
    "beforeSend": function(xhr) {
      xhr.setRequestHeader("Authorization", "Basic " + auth.auth.authbasic);
    },
    "success": function(msgs) {
      shaqGTAG('Shaq', 'ShaqArchived', window.shaq.key);
    }
  });
}

function closeShaq() {
  informShow('   <div class="loader"></div>&nbsp;&nbsp;&nbsp;<span>Closing Shaq</span>');
  $.ajax({
    "url": "/api/shaq/" + auth.auth.usercode + "/cancel/" + window.shaq.key,
    "type": "POST",
    "dataType": "json",
    "contentType": "application/json",
    "beforeSend": function(xhr) {
      xhr.setRequestHeader("Authorization", "Basic " + auth.auth.authbasic);
    },
    "success": function(msgs) {
      shaqGTAG('Shaq', 'ShaqCancelled', window.shaq.key);
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
}

function showmore(showmore) {
  if ($(showmore).hasClass("tohide")) {
    let showcpt = 0;
    let bidderlst = $("#shaq-bidder").find(".bidderslist");
    $(showmore).html('<i><h6>show more (' + bidderlst.length + ')<h6></i></a>');
    $(showmore).removeClass("tohide");
    for (let i = 0; i < bidderlst.length; i++) {
      if (i > 3) $(bidderlst[i]).addClass("hide");
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
  data.from = auth.auth.username;
  data.key = window.shaq.key;
  if (!data.target) data.target = [window.chatCurrent];
  data.type = "message";
  data.status = "sent";
  $.ajax({
    "url": "/api/chat/" + auth.auth.usercode + "/" + window.shaq.key,
    "type": "POST",
    "dataType": "json",
    "contentType": "application/json",
    "json": "json.wrf",
    "data": JSON.stringify([data]),
    "beforeSend": function(xhr) {
      xhr.setRequestHeader("Authorization", "Basic " + auth.auth.authbasic);
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
    "url": '/api/' + service + '/' + auth.auth.usercode + '/' + rater + '/' + window.shaq.key,
    "method": "GET",
    "dataType": "json",
    "contentType": "application/json",
    "beforeSend": function(xhr) {
      xhr.setRequestHeader("Authorization", "Basic " + auth.auth.authbasic);
    },
    "complete": function(json) {
      sendMessage({
        "subject": rater + " has been launched",
        "message": rater + " has been launched",
        "channel": rater,
        "target": [auth.auth.usercode]
      });
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
    "url": '/api/shaq/' + auth.auth.usercode + '/readdall/' + window.shaq.key,
    "method": "POST",
    "dataType": "json",
    "contentType": "application/json",
    "data": JSON.stringify(data),
    "beforeSend": function(xhr) {
      xhr.setRequestHeader("Authorization", "Basic " + auth.auth.authbasic);
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
    "url": '/api/shaq/' + auth.auth.usercode + '/removeall/' + window.shaq.key,
    "method": "POST",
    "dataType": "json",
    "contentType": "application/json",
    "data": JSON.stringify(data),
    "beforeSend": function(xhr) {
      xhr.setRequestHeader("Authorization", "Basic " + auth.auth.authbasic);
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
    "url": '/api/shaq/' + auth.auth.usercode + '/' + action + '/' + window.shaq.key,
    "method": "POST",
    "dataType": "json",
    "contentType": "application/json",
    "data": JSON.stringify(data),
    "beforeSend": function(xhr) {
      xhr.setRequestHeader("Authorization", "Basic " + auth.auth.authbasic);
    },
    "complete": function(json) {
      let actionText = target + " has been enabled!";
      if (action === "remove") actionText = target + " has been disabled!";
      sendMessage({
        "subject": actionText,
        "message": actionText,
        "channel": action,
        "target": [auth.auth.usercode]
      });
      if (!Raters.includes(target)) {
        actionText = "You have been enabled!";
        if (action === "remove") actionText = "You have been disabled!";
        sendMessage({
          "subject": actionText,
          "message": actionText,
          "channel": action,
          "target": [target]
        });
      }
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
    "url": '/api/shaq/' + auth.auth.usercode + '/extenddecision/' + window.shaq.key,
    "method": "POST",
    "dataType": "json",
    "contentType": "application/json",
    "data": JSON.stringify(data),
    "beforeSend": function(xhr) {
      xhr.setRequestHeader("Authorization", "Basic " + auth.auth.authbasic);
    },
    "success": function(json) {
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
    "url": '/api/shaq/' + auth.auth.usercode + '/extendvalidity/' + window.shaq.key,
    "method": "POST",
    "dataType": "json",
    "contentType": "application/json",
    "data": JSON.stringify(data),
    "beforeSend": function(xhr) {
      xhr.setRequestHeader("Authorization", "Basic " + auth.auth.authbasic);
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
    bidderDisplay += '<div id="bidderList_' + window.shaq.target[bidders] + '" class="bidderslist ' + tohide + ' ' + color + '"><img width="16" src="' + auth.app.logourl + window.shaq.target[bidders] + '.png" /> ' + window.shaq.targetName[bidders] + '</font>';
    if (auth.auth.usercode === window.shaq.source[0]) {
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
    "url": '/api/bid/' + auth.auth.usercode + '/uploadbidfile/' + window.shaq.key + "?id=" + bid.id,
    "method": "POST",
    "processData": false,
    "contentType": false,
    "data": formData,
    "beforeSend": function(xhr) {
      xhr.setRequestHeader("Authorization", "Basic " + auth.auth.authbasic);
    },
    "complete": function(json) {
      let file = 0;
      if (bid.files) file = bid.files.length;
      $("#filetoUpload" + bid.id.substring(1, 8)).html('<div><a href="' + window.location.protocol + '//' + auth.auth.username + ':' + auth.auth.userkey + '@' + window.location.host + '/api/bid/' + auth.auth.usercode + '/downloadbidfile/' + bid.key + '?id=' + bid.id + '&pos=' + file + '"><span class="glyphicon glyphicon-cloud-upload text-success"></span>  ' + fileBid[0].name.slice(fileBid[0].name.indexOf("_") + 1) + '</a></div>');
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
    "url": '/api/shaq/' + auth.auth.usercode + '/uploadshaqfile/' + window.shaq.key + "?id=" + shaq.id,
    "method": "POST",
    "processData": false,
    "contentType": false,
    "data": formData,
    "beforeSend": function(xhr) {
      xhr.setRequestHeader("Authorization", "Basic " + auth.auth.authbasic);
    },
    "complete": function(json) {
      $("#filetoUploadShaq").html("");
      let file = 0;
      if (shaq.files) file = shaq.files.length;
      for (file in shaq.files) {
        //$("#filetoUploadShaq").append('<div><a href="' + window.location.protocol + '//' + auth.auth.username + ':' + auth.auth.userkey + '@' + window.location.host + '/api/shaq/' + usercode + '/downloadshaqfile/' + window.shaq.key + '?id=' + window.shaq.id + '&pos=' + file + '"><span class="glyphicon glyphicon-cloud-upload text-success"></span>  ' + window.shaq.files[file].slice(window.shaq.files[file].indexOf("_") + 1) + '</a></div>');
        $("#filetoUploadShaq").append('<div><a href="' + window.location.protocol + '//' + auth.auth.username + ':' + auth.auth.userkey + '@' + window.location.host + '/api/shaq/' + usercode + '/downloadshaqfile/' + shaq.key + '?id=' + shaq.id + '&pos=' + file + '"><span class="glyphicon glyphicon-cloud-upload text-success"></span>  ' + shaq.files[file].slice(shaq.files[file].indexOf("_") + 1) + '</a></div>');
      }
      shaqGTAG('Shaq', 'ShaqUploadFile', fileShaq[0].name);
    }
  });
}


function ShaqCompleted(winbid) {
  if (["created", "searching", "searched", "running", "selected", "validated"].includes(window.shaq.status)) return;
  $('.btn-send-message').prop("disabled", true);
  $('.notifyAllBidders').prop("disabled", true);
  $("#set-it-now-btn").prop("disabled", true);
  $("#decline-all-btn").prop("disabled", true);
  $("#cancel-all-btn").prop("disabled", true);
  $("#winningbidcalc").prop("disabled", true);
  $(".bidflags").addClass("hide");
  $('.btn-bid').prop("disabled", true);
  $(".btnbidderAction").addClass("hide");
  $(".rate-bidder").addClass("hide");
  $("#bid-add").addClass("hide");
  $('#shaq-valid').prop("disabled", true);
  $('#shaq-valid').html("00:00");
  $('#shaq-from').html("00:00");
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
  bidInfo.find('.btn-forward-bid').addClass('hide');
  bidInfo.find('.btn-decline-bid').addClass('hide');
  bidInfo.find('.btn-create-bid').addClass('hide');
  bidInfo.find('.btn-cancel-bid').addClass('hide');
  bidInfo.find('.btn-no-solution-bid').addClass('hide');
  bidInfo.find('.btn-bid').addClass('hide');
}

function bidRefresh(bidInfo, bid) {
  bidInfo.find('.bidPrice').val(parseFloat(bid.price).toFixed(2));
  bidInfo.attr("id", "bid_id_" + bid.id);
  for (key in window.shaq.target) {
    if (window.shaq.target[key] === bid.source[0]) {
      bidInfo.find('.bidBidderCode').html(window.shaq.targetName[key]);
      bidInfo.find('.bidBidderId').html(bid.id);
      if ((bid.source.includes(auth.auth.usercode)) && window.shaq.options && window.shaq.options.includes("bidupload")) {
        let fileData = '<input multiple="" class="form-control fileupload" style="display: none !important;" id="file' + bid.id.substring(1, 8) + '" name="file[]" type="file" onchange=\'uploadFile(' + JSON.stringify(bid) + ');\'/><div class="table-responsive fileuploadQueue-handler">';
        fileData += '<a id="href' + bid.id.substring(1, 8) + '" class="btn btn-xs btn-primary upload_add_files" onclick="$(\'#file' + bid.id.substring(1, 8) + '\').trigger(\'click\');">Add files...</a></div>';
        fileData += '<div id="filetoUpload' + bid.id.substring(1, 8) + '"></div>';
        for (file in bid.files) {
          fileData += '<div><a href="' + window.location.protocol + '//' + auth.auth.username + ':' + auth.auth.userkey + '@' + window.location.host + '/api/bid/' + auth.auth.usercode + '/downloadbidfile/' + bid.key + '?id=' + bid.id + '&pos=' + file + '"><span class="glyphicon glyphicon-cloud-upload text-success"></span>  ' + bid.files[file].slice(bid.files[file].indexOf("_") + 1) + "</a></div>";
        }
        bidInfo.find('.bidBidderFile').html(fileData);
      }
    } else {
      if (bid.target.includes(auth.auth.usercode) && window.shaq.options && window.shaq.options.includes("bidupload")) {
        let fileData = "";
        for (file in bid.files) {
          fileData += '<div><a href="' + window.location.protocol + '//' + auth.auth.username + ':' + auth.auth.userkey + '@' + window.location.host + '/api/bid/' + auth.auth.usercode + '/downloadbidfile/' + bid.key + '?id=' + bid.id + '&pos=' + file + '"><span class="glyphicon glyphicon-cloud-upload text-success"></span>  ' + bid.files[file].slice(bid.files[file].indexOf("_") + 1) + "</a></div>";
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
  if (bid.sourceComment && (bid.sourceComment.length > 0)) {
    bidInfo.find(".bflag1").css("color", bid.sourceComment[0]);
    bidInfo.find(".bflag1").removeClass("hide");
    bidInfo.find(".bflag1").attr('title', bid.sourceComment[1]);
  }
  if (bid.sourceComment && (bid.sourceComment.length > 4)) {
    bidInfo.find(".bflag2").css("color", bid.sourceComment[4]);
    bidInfo.find(".bflag2").removeClass("hide");
    bidInfo.find(".bidflags").addClass("hide");
    bidInfo.find(".bflag2").attr('title', bid.sourceComment[5]);
  }
  if (bid.targetComment && (bid.targetComment.length > 0)) {
    bidInfo.find(".aflag1").css("color", bid.targetComment[0]);
    bidInfo.find(".aflag1").removeClass("hide");
    bidInfo.find(".aflag1").attr('title', bid.targetComment[1]);
  }
  if (bid.targetComment && (bid.targetComment.length > 4)) {
    bidInfo.find(".aflag2").css("color", bid.targetComment[4]);
    bidInfo.find(".aflag2").removeClass("hide");
    bidInfo.find(".bidflags").addClass("hide");
    bidInfo.find(".aflag2").attr('title', bid.targetComment[5]);
  }
  bidInfo.find('.bidflags').bind("click", function() {
    bidInfo.find('.bidflags').data("id", bid.id);
    bidsFlag(bidInfo.find('.bidflags'))
  });
  if (window.shaq.source.includes(auth.auth.usercode)) bidInfo.find('.hollowData').removeClass("hide");
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
  if (bid.dePlace && bid.dePlace[4] !== "") bidInfo.find('.biddeplace').removeClass("glyphicon-home").addClass("glyphicon-map-marker");

  bidInfo.find('.bidPuDate').val(moment(bid.puDate).tz('UTC').format('YYYY-MM-DD HH:mm').replace(' 00:00', ''));
  bidInfo.find('.bidPuDate').removeAttr("data-field");
  if (bid.puDate.substring(0, 16) !== window.shaq.puDate.substring(0, 16)) {
    bidInfo.find('.bidPuDate').css("color", "#d9534f");
  }
  if (bid.puPlace && bid.puPlace[4] !== "") bidInfo.find('.bidpuplace').removeClass("glyphicon-home").addClass("glyphicon-map-marker");
  bidInfo.find('.bidValidDate').val(moment(bid.valid_until).format('YYYY-MM-DD HH:mm').replace(' 00:00', ''));
  bidInfo.find('.bidLang').val(bid.lang);
  bidInfo.find('.bidLang').attr('disabled', 'disabled');
  bidInfo.find('.btn-bid-extend-glyphicon').data("bid-id-to-extend", bid.id);
  bidInfo.find('.btn-bid-extend-glyphicon').bind("click", function() {
    bidsextendsDetail(bidInfo.find('.btn-bid-extend-glyphicon'))
  });
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
  bidInfo.find('.img-bidder-logo').attr("src", auth.app.logourl + bid.source[0] + ".png");
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
      if ((auth.app.bidvaluemax !== 0) && (bid.price > auth.app.bidvaluemax)) bidInfo.find('.btn-forward-bid').removeClass('hide').data("btn-bid-id", bid.id);
      else bidInfo.find('.btn-accept-bid').removeClass('hide').data("btn-bid-id", bid.id);
      bidInfo.find('.btn-decline-bid').removeClass('hide').data("btn-bid-id", bid.id);
      bidInfo.find('.btn-cancel-bid').removeClass('hide').data("btn-bid-id", bid.id);
      bidInfo.find('.btn-status-bid').addClass('hide').data("btn-bid-id", bid.id);
      break;
    case "expired":
      bidInfo.find('.btn-status-bid').removeClass('hide').html('<span class="glyphicon glyphicon-remove"></span> Expired').addClass('btn-primary').attr("disabled", "disabled");
      bidInfo.find('.bid-validity-count').removeClass('hide');
      bidInfo.find('.bidValidUntil').html("expired");
      bidHideAllBtn(bidInfo);
      break;
    case "accepted":
      bidInfo.find('.btn-status-bid').removeClass('hide').html('<span class="glyphicon glyphicon-ok"></span> Accepted').addClass('btn-success').attr("disabled", "disabled");
      $(".action-container").addClass('hide');
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
  if (Object.values(window.bids).length >= auth.auth.maxbids) {
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
  if (solrTarget !== "-archive") {
    if (["created", "searching", "searched", "running", "selected", "validated", "failed"].includes(window.shaq.status)) $('#shaq-status').html('<span class="glyphicon glyphicon-stop"></span>');
    else $('#shaq-status').html('<span class="glyphicon glyphicon-glyphicon-floppy-disk"></span>');
  } else {
    $('#shaq-status').html('<span class="glyphicon glyphicon-trash"></span>');
  }

  $("#tmslogo").attr('src', auth.app.logourl + window.shaq.creator + ".png");
  auth.auth.usercodeName = window.shaq.sourceName[0];
  if (window.shaq.target && window.shaq.target.includes(auth.auth.usercode)) {
    if (window.shaq.targetStatus[window.shaq.target.indexOf(auth.auth.usercode)] === "Removed") {
      window.shaq = {};
      $('.header-content').hide();
      $('#not-found-message-text').html('<a href="#">You have been Removed</a><br><br>try <a href="' + window.location.href.replace("#", "").replace("?type=", "") + '?type=-archive">archived</a> may be.');
      $('#not-found-message').removeClass('hide');
      return;
    } else {
      $('#not-found-message').addClass('hide');
      $('.header-content').show();
    }
    $('.btn-bidder').removeClass("hide");
    $('#bid-add').removeClass("hide");
    $('#bid-add').find('.btn-bid-extend-detail').removeClass("hide");
    $("#bid-add").find('.btn-create-bid').removeClass('hide');
    $("#bid-add").find('.btn-no-solution-bid').removeClass('hide');
    $("#bid-add").find('.btn-getitnow-bid').removeClass('hide');
    $("#bid-add").find(".bidBidderRatingScore").html("");
    for (var ratingCpt = 1; ratingCpt < auth.rating; ratingCpt++) {
      $("#bid-add").find(".bidBidderRatingScore").append('<img width="32" src="https://yoctu.github.io/yoctu-website/img/logo/rating1.png" />');
    }
    for (ratingCpt; ratingCpt < 5; ratingCpt++) {
      $("#bid-add").find(".bidBidderRatingScore").append('<img width="32" src="https://yoctu.github.io/yoctu-website/img/logo/rating0.png" />');
    }
  }
  $('#ChatList').html('<p><button id="Notifications-Chat" class="btn btn-default btn-room"><img class="bidder-image" src="https://yoctu.github.io/yoctu-website/img/logo-svg/notification.svg" /> Notifications <span id="chatBadge-notification" class="badge"></span></button></p>');
  $('#ChatList').append('<p><button id="' + window.shaq.source[0] + '" class="btn btn-default btn-room"><img class="bidder-image" src="' + auth.app.logourl + window.shaq.source[0] + '.png" />  ' + window.shaq.sourceName[0] + ' <span id="chatBadge-' + window.shaq.source[0] + '" class="badge">0</span></button></p>');
  if (window.shaq.target && window.shaq.target.includes(auth.auth.usercode)) {
    auth.auth.usercodeName = window.shaq.targetName[window.shaq.target.indexOf(auth.auth.usercode)];
    $('#ChatList').append('<p><button id="' + auth.auth.usercode + '" class="btn btn-default btn-room"><img class="bidder-image" src="' + auth.app.logourl + auth.auth.usercode + '.png" />  ' + auth.auth.usercodeName + ' <span id="chatBadge-' + auth.auth.usercode + '" class="badge">0</span></button></p>');
    window.chatsInfo[auth.auth.usercode] = [];
  }
  for (let chat in window.shaq.source) {
    window.chatsInfo[window.shaq.source[chat]] = [];
  }
  for (let chat in window.shaq.target) {
    if (Raters.includes(window.shaq.target[chat])) continue;
    window.chatsInfo[window.shaq.target[chat]] = [];
  }
  for (let chat in window.chats.sort()) {
    updateChat(window.chats[chat])
  }
  if (window.chats.length > 0) switchRoom();
  if (window.shaq.source.includes(auth.auth.usercode)) {
    if (["running", "selected", "validated", "failed"].includes(window.shaq.status)) $('.btnbidderAction').removeClass("hide");
    $('#bid-filtering-field-grp').removeClass("hide");
    $('#bid-sorting-field-grp').removeClass("hide");
    $('.notifyAllBidders').prop("disabled", false);
    $('.btn-auctioneer').removeClass("hide");
    $("#set-it-now").removeClass("hide");
    for (var rooms in window.shaq.target) {
      if (Raters.includes(window.shaq.target[rooms])) continue;
      $('#ChatList').append('<p><button id="' + window.shaq.target[rooms] + '" class="btn btn-default btn-room"><img class="bidder-image" src="' + auth.app.logourl + window.shaq.target[rooms] + '.png" />  ' + window.shaq.targetName[rooms] + ' <span id="chatBadge-' + window.shaq.target[rooms] + '" class="badge">0</span></button></p>');
    }
    $("#shaq-valid-from-btn").prop("disabled", false);
    $("#shaq-valid-btn").prop("disabled", false);
    $("#shaq-status").prop("disabled", false);
    if ((new Date().toUTCString()) < (new Date(window.shaq.valid_from).toUTCString()) && window.shaq.options && window.shaq.options.includes("shaqupload")) $("#shaq-files").removeClass("hide");
  }
  $("#shaq-name").html('<div class="shaqlabel text-left">Order</div><div style="line-height: 20px; font-weight: bold; padding-bottom: 5px;">' + window.shaq.name + '</div>');
  if (window.shaq.status === "failed") $("#shaq-name").removeClass("btn-primary").addClass("btn-danger");
  if (window.shaq.targetName) $('#bid-add .bidBidderCode').text(window.shaq.targetName[0]);
  if (window.shaq.getitnow && parseFloat(window.shaq.getitnow) > 0) {
    if (window.shaq.source.includes(auth.auth.usercode)) {
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
  if (window.shaq.distance) {
    let distance = parseInt(window.shaq.distance);
    if (localSettings.distance === "Miles") {
      distance = (Math.ceil(distance * 62.14) / 100);
    }
    $("#shaq-distance-label").removeClass("hide");
    $("#shaq-distance").text(distance + ' ' + localSettings.distance);
  }
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
  $("#shaq-auctioneer").html('<img width="24" src="' + auth.app.logourl + window.shaq.source[0] + '.png" />  <b>' + window.shaq.sourceName[0] + '</b>');
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
    let dimUnit = [];
    dimUnit[0] = "<b>Lenght</b> : " + dim[pkg + 1] + ' cm';
    dimUnit[1] = "<b>Width</b> : " + dim[pkg + 2] + ' cm';
    dimUnit[2] = "<b>Height</b> : " + dim[pkg + 3] + ' cm';
    let dimWeight = "<b>Weight</b> : " + dim[pkg + 4] + ' kgs';
    totaldim[0] += parseInt(dim[pkg]);
    totaldim[1] += parseFloat(dim[pkg + 4]);
    totaldim[2] += parseInt(dim[pkg]) * (parseFloat(dim[pkg + 1]) * parseFloat(dim[pkg + 2]) * parseFloat(dim[pkg + 3]));
    if (localSettings.unit === "Imperial") {
      dimUnit[0] = "<b>Lenght</b> : " + (Math.ceil(dim[pkg + 1] * 39.37) / 100) + ' inches'
      dimUnit[1] = "<b>Width</b> : " + (Math.ceil(dim[pkg + 2] * 39.37) / 100) + ' inches'
      dimUnit[2] = "<b>Height</b> : " + (Math.ceil(dim[pkg + 3] * 39.37) / 100) + ' inches';
    }
    if (localSettings.weight === "Pounds") {
      dimWeight = "<b>Weight</b> : " + (Math.ceil(dim[pkg + 4] * 220.46) / 100) + ' pounds';
    }
    if (pkg === 0) {
      $('.shaq-pkg-number').html(dim[pkg]);
      $('.shaq-pkg-dimension-lenght').html(dimUnit[0]);
      $('.shaq-pkg-dimension-width').html(dimUnit[1]);
      $('.shaq-pkg-dimension-height').html(dimUnit[2]);
      $('.shaq-pkg-dimension-weight').html(dimWeight);
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
  $("#shaq-total-volume").html(totaldim[2].toFixed(3) + " " + totalUnitCubed);
  let now = new Date();
  let CurrentDate = now.getTime() + now.getTimezoneOffset() * 60000;
  validDate = new Date(validDate).getTime();
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
    if (window.shaqFromValid) clearInterval(window.shaqFromValid);
    window.shaqFromValid = setInterval(function() {
      var hoursFromLeft = Math.floor(timerFrom);
      var hoursFrom = Math.floor(hoursFromLeft / 3600);
      var minutesFromLeft = Math.floor((hoursFromLeft) - (hoursFrom * 3600));
      var minutesFrom = Math.floor(minutesFromLeft / 60);
      var remainingFromSeconds = timerFrom % 60;
      if (timerFrom >= 0) {
        $('#shaq-from').html(pad(hoursFrom) + ":" + pad(minutesFrom) + ":" + pad(remainingFromSeconds));
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
  $("#filetoUploadShaq").html("");
  for (file in window.shaq.files) {
    $("#filetoUploadShaq").append('<div><a href="' + window.location.protocol + '//' + auth.auth.username + ':' + auth.auth.userkey + '@' + window.location.host + '/api/shaq/' + auth.auth.usercode + '/downloadshaqfile/' + window.shaq.key + '?id=' + window.shaq.id + '&pos=' + file + '"><span class="glyphicon glyphicon-cloud-upload text-success"></span>  ' + window.shaq.files[file].slice(window.shaq.files[file].indexOf("_") + 1) + '</a></div>');
  }
  $('#ChatList').find(".btn-room").each(function() {
    $(this).bind("click", function() {
      btnroomclick($(this))
    });
  });
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
  if (window.shaq.bestbid) {
    $("#bid-list").find('.well').removeClass("well-warning").removeClass('.well-danger').removeClass("well-success");
    $("#bid-list").find('.well').addClass("well-warning");
    $("#bid_id_" + window.shaq.bestbid).find('.well').removeClass("well-warning").addClass("well-success");
  }
}

$.ajax({
  "url": "/api/shaq" + solrTarget + "/" + auth.auth.usercode + "/" + ShaqID + "?rows=1",
  "dataType": "json",
  "json": "json.wrf",
  "beforeSend": function(xhr) {
    xhr.setRequestHeader("Authorization", "Basic " + auth.auth.authbasic);
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
    $("#DisplayPage").removeClass("hide");
    if ((shaq.numFound) === 0) {
      $('.header-content').hide();
      let msg = '<a href="/' + auth.auth.usercode + '">Shaq not found</a><br><br>';
      if (solrTarget !== "-archive") msg += 'try <a href="' + window.location.href.replace("#", "").replace("?type=", "") + '?type=-archive">archived</a> may be.';
      $('#not-found-message-text').html(msg);
      $('#not-found-message').removeClass('hide');
      return;
    }
    window.shaq = shaq.docs[0];
    shaqRefresh();
    ShaqCompleted(window.shaq.winningbid);

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
  $('#bid-list').empty();
  if (bids.docs.length > 0) {
    if (window.shaq.source.includes(auth.auth.usercode)) $("#decline-all").removeClass("hide");
    if (window.shaq.target.includes(auth.auth.usercode)) $("#cancel-all").removeClass("hide");
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
    "url": '/api/bid' + solrTarget + '/' + auth.auth.usercode + '/' + ShaqID + '?rows=100&sort=' + JSON.stringify(sort),
    "dataType": "json",
    "json": "json.wrf",
    "beforeSend": function(xhr) {
      xhr.setRequestHeader("Authorization", "Basic " + auth.auth.authbasic);
    },
    "statusCode": {
      "429": function(xhr) {
        status429();
      }
    },
    "success": function(bids) {
      BidRender(bids);
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
  if (chat.source.includes(auth.auth.usercode)) {
    pos = "right";
    alertclass = "alert-info";
  }
  if (["giveup", "remove", "readd", "readdall", "removeall"].indexOf(chat.channel) >= 0) {
    alertclass = "alert-warning";
    pos = "center";
  }
  if (["biddingscore"].indexOf(chat.channel) >= 0) {
    alertclass = "alert-success";
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
    if (chat.target[target] != auth.auth.usercode) {
      window.chatsInfo[chat.target[target]].push(pre);
      $('#chatBadge-' + chat.target[target]).text(parseInt($('#chatBadge-' + chat.target[target]).text()) + 1);
    } else if (chat.source[0] == auth.auth.usercode) {
      window.chatsInfo[auth.auth.usercode].push(pre);
      $('#chatBadge-' + auth.auth.usercode).text(parseInt($('#chatBadge-' + auth.auth.usercode).text()) + 1);
    }
  }
  for (let source in chat.source) {
    if (chat.source[source] != auth.auth.usercode) {
      window.chatsInfo[chat.source[source]].push(pre);
      $('#chatBadge-' + chat.source[source]).text(parseInt($('#chatBadge-' + chat.source[source]).text()) + 1);
    }
  }
  $('#chatCount').text(window.chats.length);
}

function getChatMsgs() {
  $.ajax({
    "url": '/api/chat' + solrTarget + '/' + auth.auth.usercode + '/' + ShaqID + '?rows=' + localSettings.chathistory + '&sort=date%20desc',
    "dataType": "json",
    "json": "json.wrf",
    "beforeSend": function(xhr) {
      xhr.setRequestHeader("Authorization", "Basic " + auth.auth.authbasic);
    },
    "statusCode": {
      "429": function(xhr) {
        status429();
      }
    },
    "success": function(chats) {
      $('#chatCount').text('0');
      window.chats = chats.docs;
      for (let chat in window.chats.reverse()) {
        updateChat(window.chats[chat])
      }
      window.chatCurrent = auth.auth.usercode;
      $('#' + auth.auth.usercode).addClass('btn-danger').find('.badge').addClass('badge-danger');
      switchRoom();
    }
  });
}

function getNotifMsgs() {
  $.ajax({
    "url": '/api/notif' + solrTarget + '/' + auth.auth.usercode + '/' + ShaqID + '?rows=100&sort={"date": "desc"}',
    "dataType": "json",
    "json": "json.wrf",
    "beforeSend": function(xhr) {
      xhr.setRequestHeader("Authorization", "Basic " + auth.auth.authbasic);
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

socket.on(auth.auth.usercode, function(data) {
  let msg = JSON.parse(data.value);
  if (!msg.key || (!jQuery.isEmptyObject(window.shaq) && msg.key !== window.shaq.key)) return;
  let statusMessage = "Unkown";
  switch (msg.type) {
    case "auction":
      if (jQuery.isEmptyObject(window.shaq) || (msg.id === window.shaq.id)) {
        window.shaq = msg;
        shaqRefresh();
        ShaqCompleted(window.shaq.winningbid);
      }
      break;
    case "bid":
      window.bids[msg.id] = msg;
      let Bids = {
        docs: []
      };
      for (let Bid in window.bids) {
        Bids["docs"].push(window.bids[Bid]);
      }
      BidRender(Bids);
      break;
    case "message":
      if ($('#' + msg.id).length) break;
      window.chats.push(msg);
      $(".btn-send-message").attr("disabled", false);
      updateChat(msg);
      switchRoom();
      break;
    case "notification":
      if (msg.action === "archive") {
        setTimeout(function() {
          $('.header-content').hide();
          $('#not-found-message-text').html('<a href="' + window.location.href.replace("#", "").replace("?type=", "") + '?type=-archive">Shaq has been closed</a>');
          $('#not-found-message').removeClass('hide');
          $("#InformationModal").modal('hide');
        }, 1000);
        break;
      }
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
    "url": "/api/bid/" + auth.auth.usercode + "/" + ShaqID,
    "type": "POST",
    "dataType": "json",
    "contentType": "application/json",
    "json": "json.wrf",
    "data": bidData,
    "beforeSend": function(xhr) {
      xhr.setRequestHeader("Authorization", "Basic " + auth.auth.authbasic);
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
    "from": auth.auth.username,
    "category": "shaq",
    "key": window.shaq.key,
    "source": [auth.auth.usercode],
    "target": [auth.auth.usercode],
    "type": "notification",
    "status": "sent",
    "channel": ["message", "mail"],
    "flags": ""
  };
  $.ajax({
    "url": "/api/notif/" + auth.auth.usercode + "/" + ShaqID,
    "type": "POST",
    "dataType": "json",
    "contentType": "application/json",
    "json": "json.wrf",
    "data": JSON.stringify([dataSendMessageAll]),
    "beforeSend": function(xhr) {
      xhr.setRequestHeader("Authorization", "Basic " + auth.auth.authbasic);
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
    "from": auth.auth.username,
    "source": [auth.auth.usercode],
    "target": window.shaq.source,
    "type": "bid",
    "logo": auth.app.logourl + auth.auth.usercode + ".png",
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
    "url": "/api/bid/" + auth.auth.usercode + "/" + ShaqID,
    "type": "POST",
    "dataType": "json",
    "contentType": "application/json",
    "json": "json.wrf",
    "data": JSON.stringify([dataSendBid]),
    "beforeSend": function(xhr) {
      xhr.setRequestHeader("Authorization", "Basic " + auth.auth.authbasic);
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
        xhr.setRequestHeader("Authorization", "Basic " + auth.auth.authbasic);
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
      "url": '/api/shaq' + solrTarget + '/' + auth.auth.usercode + '/setitnow/' + window.shaq.key,
      "method": "POST",
      "dataType": "json",
      "contentType": "application/json",
      "data": JSON.stringify({
        setitnow: NewSetItNow
      }),
      "beforeSend": function(xhr) {
        xhr.setRequestHeader("Authorization", "Basic " + auth.auth.authbasic);
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
      "url": '/api/shaq' + solrTarget + '/' + auth.auth.usercode + '/invite/' + '/' + window.shaq.key,
      "method": "POST",
      "dataType": "json",
      "contentType": "application/json",
      "data": JSON.stringify({
        usercode: $('#InviteModalCode').text(),
        usercodename: $('#InviteModalName').text()
      }),
      "beforeSend": function(xhr) {
        xhr.setRequestHeader("Authorization", "Basic " + auth.auth.authbasic);
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
  getBids();
  informShow('   <div class="loader"></div>&nbsp;&nbsp;&nbsp;<span>Calculating Offers...</span>', true);
  $.ajax({
    "url": '/api/shaq' + solrTarget + '/' + auth.auth.usercode + '/winningbidcalc/' + window.shaq.key,
    "method": "POST",
    "dataType": "json",
    "contentType": "application/json",
    "beforeSend": function(xhr) {
      xhr.setRequestHeader("Authorization", "Basic " + auth.auth.authbasic);
    },
    "success": function(json) {
      if (json.scoremin && json.scoremax) {
        sendMessage({
          "subject": "Your offer is between <b>" + json.scoremin + "%</b> and <b>" + json.scoremax + "%</b> more expensive than the leading one!",
          "message": "Your offer is between <b>" + json.scoremin + "%</b> and <b>" + json.scoremax + "%</b> more expensive than the leading one!",
          "channel": "biddingscore",
          "source": [auth.auth.usercode],
          "target": [auth.auth.usercode]
        });
      }
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
  if ($("#shaq-status").find(".glyphicon-stop").length > 0) {
    questionShow('Are you sure to close shaq ?', 'Yes');
    $("#QuestionModalYesBtn").on("click", function() {
      closeShaq();
    });
  }
  if ($("#shaq-status").find(".glyphicon-floppy-disk").length > 0) {
    archiveShaq();
  }
  if ($("#shaq-status").find(".glyphicon-trash").length > 0) {
    questionShow('Are you sure to delete shaq ?', 'Yes');
    $("#QuestionModalYesBtn").on("click", function() {
      deleteShaq();
    });
  }
});

$(document).on('click', '.btn-decline-bid, .btn-cancel-bid, .btn-accept-bid, .btn-forward-bid', function() {
  if ($(this).hasClass('btn-decline-bid')) window.bids[$(this).data("btn-bid-id")].status = "declined";
  if ($(this).hasClass('btn-cancel-bid')) window.bids[$(this).data("btn-bid-id")].status = "cancelled";
  if ($(this).hasClass('btn-accept-bid')) {
    window.bids[$(this).data("btn-bid-id")].status = "accepted";
    $(".action-container").addClass('hide');
  }
  if ($(this).hasClass('btn-forward-bid')) {
    window.bids[$(this).data("btn-bid-id")].status = "forwarded";
    window.bids[$(this).data("btn-bid-id")].forwarder = auth.auth.username;
  }
  window.bids[$(this).data("btn-bid-id")].decision_maker = auth.auth.username;
  updateBid(JSON.stringify([window.bids[$(this).data("btn-bid-id")]]));
});

$(document).on('click', '.btn-no-solution-bid', function() {
  informShow('   <div class="loader"></div>&nbsp;&nbsp;&nbsp;<span>Giving Up...</span>');
  let data = {
    target: auth.auth.usercode,
    type: "notification",
    action: "giveup"
  };
  $.ajax({
    "url": '/api/shaq' + solrTarget + '/' + auth.auth.usercode + '/giveup/' + window.shaq.key,
    "method": "POST",
    "dataType": "json",
    "contentType": "application/json",
    "data": JSON.stringify(data),
    "beforeSend": function(xhr) {
      xhr.setRequestHeader("Authorization", "Basic " + auth.auth.authbasic);
    },
    "statusCode": {
      "429": function(error) {
        status429();
      },
      "200": function(response) {
        sendMessage({
          "subject": "No Solution !",
          "message": "No Solution !",
          "channel": "giveup",
          "source": [auth.auth.usercode],
          "target": [window.shaq.source[0]]
        });
        shaqGTAG('Bid', 'BidGiveUp', JSON.stringify(shaq));
      }
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

function bidsextendsDetail(bed) {
  bed.toggleClass('glyphicon-triangle-bottom').toggleClass('glyphicon-triangle-top');
  let bidIdDetail = bed.data('bid-id-to-extend');
  $(window.bidsInfo[bidIdDetail]).find('.btn-bid-extend-detail').toggleClass('hide');
}

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
      "channel": auth.auth.usercode,
      "subject": $('#chat-msg-text').val(),
      "message": $('#chat-msg-text').val(),
      "target": [window.chatCurrent]
    });
  }
});

function btnroomclick(elt) {
  $('.btn-room').removeClass('btn-danger');
  elt.addClass('btn-danger');
  if (elt.attr('id') === "Notifications-Chat") {
    $('#chat-notifications-container').removeClass('hide');
    $('#chat-messages-container').addClass('hide');
    $(".btn-room .badge").removeClass("badge-danger");
    elt.find(".badge").addClass("badge-danger");
    $('.chat-container').addClass("hide");
    $('.chat-container-notification').removeClass("hide");
  } else {
    $('#chat-notifications-container').addClass('hide');
    $('#chat-messages-container').removeClass('hide');
    $(".btn-room .badge").removeClass("badge-danger");
    $('.chat-container').removeClass("hide");
    $('.chat-container-notification').addClass("hide");
    elt.find(".badge").addClass("badge-danger");
    window.chatCurrent = elt.attr('id');
    switchRoom();
  }
}

$('#bid-add #pickupdate').on('change', function(event) {
  $('#bid-add .bidTransitTime').text(TransitCalc($('#bid-add #pickupdate').val(), $('#bid-add #deliverydate').val(), window.shaq.puPlace[4], window.shaq.dePlace[4]));
});
$('#bid-add #deliverydate').on('change', function(event) {
  $('#bid-add .bidTransitTime').text(TransitCalc($('#bid-add #pickupdate').val(), $('#bid-add #deliverydate').val(), window.shaq.puPlace[4], window.shaq.dePlace[4]));
});
$('#bid-sorting-field').on('change', function(event) {
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

$("#shaq-name").on('click', function(event) {
  $.ajax({
    "url": '/api/shaq' + solrTarget + '/' + auth.auth.usercode + "/auditstatus/" + window.shaq.key,
    "method": "GET",
    "dataType": "json",
    "contentType": "application/json",
    "beforeSend": function(xhr) {
      xhr.setRequestHeader("Authorization", "Basic " + auth.auth.authbasic);
    },
    "statusCode": {
      "200": function(auditStatus) {
        let audits = '<div class="row">';
        for (a in auditStatus[0]) {
          if (auditStatus[0][a].status) audits += '<div class="col-sm-6 text-center">' + auditStatus[0][a].status + '</div><div><div class="col-sm-6 text-center">' + auditStatus[0][a].date.substring(0, 19).replace("T", " ") + '</div>';
        }
        audits += '</div>';
        informShow(audits, false);
      }
    }
  });
});

$('#bid-filtering-field').on('change', function(event) {
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

function bidsFlag(bf) {
  questionShow('<div class="form-group"><label>Comment : </label>\
              <input id="FlagComment" type="text" class="form-control pull-right" autofocus></input></div><br><br>\
              <div class="form-group"><label>Comment : </label>\
              <select id="FlagType" class="form-control pull-right"><option>public</option><option selected>private</option></select></div><br><br>\
              <div class="form-group"><label>Color : </label>\
              <input id="FlagColor" type="color" value="#ff0000" class="pull-right" style="padding: 0 0;"></input></div>');
  $("#QuestionModalYesBtn").on("click", function() {
    $.ajax({
      "url": '/api/bid/' + auth.auth.usercode + '/comment/' + bf.data("id"),
      "method": "POST",
      "dataType": "json",
      "contentType": "application/json",
      "data": JSON.stringify({
        comment: [$("#FlagColor").val(), $("#FlagComment").val(), $("#FlagType").val(), new Date().toISOString()]
      }),
      "beforeSend": function(xhr) {
        xhr.setRequestHeader("Authorization", "Basic " + auth.auth.authbasic);
      },
      "statusCode": {
        "429": function(xhr) {
          status429();
        }
      },
      "statusCode": {
        "406": function(xhr) {
          status406();
        }
      },
      "success": function(json) {
        shaqGTAG('Bid', 'BidComment', JSON.stringify(bid));
      }
    });
  });
}
