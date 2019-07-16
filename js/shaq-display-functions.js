function pad(n) {
  return (n < 10 ? "0" + n : n);
}

function status429() {
  if ($("#InformationModal").is(':visible')) $("#InformationModal").modal('hide');
  $('#CenterPage').hide();
  $('#not-found-message-text').html('You have reached your limit... <br>Upgrade your plan or Wait a minute...<br>');
  $('#not-found-message').removeClass('hide');
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
  let dataSendMessage = {
    "id": uuidv4(),
    "date": "NOW",
    "subject": $('#chat-msg-text').val(),
    "message": $('#chat-msg-text').val(),
    "from": username,
    "channel": usercode,
    "key": window.shaq.key,
    "source": [usercode],
    "target": [window.chatCurrent],
    "type": "message",
    "status": "sent"
  };
  if (data) dataSendMessage = data;
  $.ajax({
    "url": "/api/chat/" + usercode + "/" + window.shaq.key,
    "type": "POST",
    "dataType": "json",
    "contentType": "application/json",
    "json": "json.wrf",
    "data": JSON.stringify([dataSendMessage]),
    "beforeSend": function(xhr) {
      xhr.setRequestHeader("Authorization", "Basic " + authbasic);
    },
    "success": function(msgs) {
      gtag('event', 'Chat', {
        'event_category': 'ChatSend',
        'event_label': usercode,
        'value': JSON.stringify(dataSendMessage)
      });
    }
  });
}

function readdallbidders() {
  $("#InformationModalText").html('   <div class="loader"></div>&nbsp;&nbsp;&nbsp;<span>Applying Action...</span>');
  $("#InformationModalCloseBtn").attr("disabled", true);
  $("#InformationModal").modal('show');
  let data = {
    type: "notification",
    action: "readdall"
  };
  $.ajax({
    "url": '/api/shaq/' + usercode + '/readdall/' + window.shaq.key,
    "method": "POST",
    "dataType": "json",
    "contentType": "application/json",
    "data": JSON.stringify(data),
    "beforeSend": function(xhr) {
      xhr.setRequestHeader("Authorization", "Basic " + authbasic);
    },
    "complete": function(json) {
      for (let t in window.shaq.target) {
        if ((window.shaq.target[t] === "UGO") || (window.shaq.target[t] === "GOSHIPPO")) continue;
        sendMessage({
          "id": uuidv4(),
          "date": "NOW",
          "subject": "You have been enabled!",
          "message": "You have been enabled!",
          "from": username,
          "channel": "readdall",
          "key": window.shaq.key,
          "source": [usercode],
          "target": [window.shaq.target[t]],
          "type": "message",
          "status": "sent"
        });
      }
      setTimeout(function() {
        $("#InformationModal").modal('hide');
      }, 1000);
      gtag('event', 'Shaq', {
        'event_category': 'ShaqRemove',
        'event_label': usercode,
        'value': JSON.stringify(data)
      });
    }
  });
}

function removeallbidders() {
  $("#InformationModalText").html('   <div class="loader"></div>&nbsp;&nbsp;&nbsp;<span>Applying Action...</span>');
  $("#InformationModalCloseBtn").attr("disabled", true);
  $("#InformationModal").modal('show');
  let data = {
    type: "notification",
    action: "removeall"
  };
  $.ajax({
    "url": '/api/shaq/' + usercode + '/removeall/' + window.shaq.key,
    "method": "POST",
    "dataType": "json",
    "contentType": "application/json",
    "data": JSON.stringify(data),
    "beforeSend": function(xhr) {
      xhr.setRequestHeader("Authorization", "Basic " + authbasic);
    },
    "complete": function(json) {
      for (let t in window.shaq.target) {
        if ((window.shaq.target[t] === "UGO") || (window.shaq.target[t] === "GOSHIPPO")) continue;
        sendMessage({
          "id": uuidv4(),
          "date": "NOW",
          "subject": "You have been disabled!",
          "message": "You have been disabled!",
          "from": username,
          "channel": "removeall",
          "key": window.shaq.key,
          "source": [usercode],
          "target": [window.shaq.target[t]],
          "type": "message",
          "status": "sent"
        });
      }
      setTimeout(function() {
        $("#InformationModal").modal('hide');
      }, 1000);
      gtag('event', 'Shaq', {
        'event_category': 'ShaqRemove',
        'event_label': usercode,
        'value': JSON.stringify(data)
      });
    }
  });
}

function removebidder(remove) {
  $("#InformationModalText").html('   <div class="loader"></div>&nbsp;&nbsp;&nbsp;<span>Applying Action...</span>');
  $("#InformationModalCloseBtn").attr("disabled", true);
  $("#InformationModal").modal('show');
  let target = $(remove).attr('id');
  let action = "remove";
  if ($(remove).closest("div").find('span').hasClass('glyphicon-ok')) action = "readd";
  let data = {
    target: target,
    type: "notification",
    action: action
  };
  $.ajax({
    "url": '/api/shaq/' + usercode + '/' + action + '/' + window.shaq.key,
    "method": "POST",
    "dataType": "json",
    "contentType": "application/json",
    "data": JSON.stringify(data),
    "beforeSend": function(xhr) {
      xhr.setRequestHeader("Authorization", "Basic " + authbasic);
    },
    "complete": function(json) {
      let actionText = "You have been enabled!";
      if (action === "remove") actionText = "You have been disabled!";
      sendMessage({
        "id": uuidv4(),
        "date": "NOW",
        "subject": actionText,
        "message": actionText,
        "from": username,
        "channel": action,
        "key": window.shaq.key,
        "source": [usercode],
        "target": [target],
        "type": "message",
        "status": "sent"
      });
      setTimeout(function() {
        $("#InformationModal").modal('hide');
      }, 1000);
      gtag('event', 'Shaq', {
        'event_category': 'ShaqRemove',
        'event_label': usercode,
        'value': JSON.stringify(data)
      });
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
    "url": '/api/shaq/' + usercode + '/extenddecision/' + window.shaq.key,
    "method": "POST",
    "dataType": "json",
    "contentType": "application/json",
    "data": JSON.stringify(data),
    "beforeSend": function(xhr) {
      xhr.setRequestHeader("Authorization", "Basic " + authbasic);
    },
    "complete": function(json) {
      gtag('event', 'Shaq', {
        'event_category': 'ShaqExtendDecision',
        'event_label': usercode,
        'value': JSON.stringify(data)
      });
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
    "url": '/api/shaq/' + usercode + '/extendvalidity/' + window.shaq.key,
    "method": "POST",
    "dataType": "json",
    "contentType": "application/json",
    "data": JSON.stringify(data),
    "beforeSend": function(xhr) {
      xhr.setRequestHeader("Authorization", "Basic " + authbasic);
    },
    "complete": function(json) {
      let colorClass = "text-success";
      if (json.status === 405) colorClass = "text-danger";
      $("#shaq-valid").addClass(colorClass);
      setTimeout(function() {
        $("#shaq-valid").removeClass(colorClass);
      }, 3000);
      gtag('event', 'Shaq', {
        'event_category': 'ShaqExtendValidity',
        'event_label': usercode,
        'value': JSON.stringify(data)
      });
    }
  });
}

function uploadFile(bid) {
  let fileBid = $("#file" + bid.id.substring(1, 8)).get(0).files;
  $("#filetoUpload" + bid.id.substring(1, 8)).html('<span class="glyphicon glyphicon-cloud-upload text-danger"></span>  ' + fileBid[0].name.slice(fileBid[0].name.indexOf("_") + 1));
  let formData = new FormData();
  formData.append('file', fileBid[0], fileBid[0].name);
  $.ajax({
    "url": '/api/file/' + usercode + '/bid/uploadbidfile/' + window.shaq.key + "/" + bid.id,
    "method": "POST",
    "processData": false,
    "contentType": false,
    "data": formData,
    "beforeSend": function(xhr) {
      xhr.setRequestHeader("Authorization", "Basic " + authbasic);
    },
    "complete": function(json) {
      let file = 0;
      if (bid.files) file = bid.files.length;
      $("#filetoUpload" + bid.id.substring(1, 8)).html('<div><a href="' + window.location.protocol + '//' + username + ':' + userkey + '@' + window.location.host + '/api/file/' + usercode + '/bid/downloadbidfile/' + bid.key + '/' + bid.id + '/' + file + '"><span class="glyphicon glyphicon-cloud-upload text-success"></span>  ' + fileBid[0].name.slice(fileBid[0].name.indexOf("_") + 1) + '</a></div>');
      gtag('event', 'Bid', {
        'event_category': 'BidUploadFile',
        'event_label': usercode,
        'value': fileBid[0].name
      });
    }
  });
}
