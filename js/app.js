"use strict";

var notificationCenterId = [];
var notificationCenterTitle = [];
var notificationCenterType = [];
var notificationCenterMessage = [];

var localSettings = localStorage.getItem('shaqSettings');

if (!localSettings) {
  localSettings = {
    date: 'YYYY-MM-dd HH:mm',
    currency: 'Euros',
    distance: 'Kilometers',
    unit: 'Metric',
    weight: 'Kgs',
    chathistory: 100,
    shaqvalidtimer: "Enable",
    themeSettings: "Default",
    pageLenght: 10
  };
  localStorage.setItem('shaqSettings', JSON.stringify(localSettings));
} else {
  localSettings = JSON.parse(localSettings);
}

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0,
      v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function notificationDown (socket) {
  if (socket.status === "down") return;
  $('#navbar-badge-notification').removeClass('text-success').addClass('text-danger');
  $('#navbar-badge-notification').text(parseInt($('#navbar-badge-notification').text()) + 1);
  notificationCenterTitle.push('System: ');
  notificationCenterMessage.push("Lost Connection to Server ");
  notificationCenterType.push('danger');
  socket.status = "down";
}

$(document).ready(function() {
  // User Theme setting
  if (localSettings.themeSettings !== "Default") {
    $('#theme-css').attr('href', usercss.substr(0, usercss.lastIndexOf("/")) + '/' + localSettings.themeSettings + '.css');
  } else {
    $('#theme-css').attr('href', usercss);
  }

  $("#dateTimePicker").DateTimePicker({
    isPopup: false,
    buttonsToDisplay: ['HeaderCloseButton'],
    titleContentDateTime: 'shaq.set-datetime-datepicker-title',
    titleContentDate: 'shaq.set-date-datepicker-title',
    titleContentTime: 'shaq.set-time-datepicker-title',
    setValueInTextboxOnEveryClick: true,
    animationDuration: 200,
    dateTimeFormat: "yyyy-MM-dd HH:mm",
    dateFormat: "yyyy-MM-dd",
    beforeHide: triggerInput
  });

  $('input[data-field="datetime"], input[data-field="date"], input[data-field="time"]').on('focus', function() {
    $('#dateTimePicker input:first').focus();
  });

  $('#alert-target').on('click', function() {
    for (var notification in notificationCenterMessage) {
      $.notify({
        icon: 'glyphicon glyphicon-' + notificationCenterType[notification] + '-sign',
        title: notificationCenterTitle[notification],
        message: notificationCenterMessage[notification]
      }, {
        delay: 3000,
        timer: 1000,
        offset: {
          y: 50,
          x: 20
        },
        animate: {
          enter: 'animated fadeInDown',
          exit: 'animated fadeOutUp'
        },
        type: notificationCenterType[notification],
        placement: {
          from: 'top',
          align: 'left'
        }
      });
    }
    notificationCenterTitle = [];
    notificationCenterType = [];
    notificationCenterMessage = [];
    $('#navbar-badge-notification').text("0");
    $("#navbar-badge-notification").removeClass("text-warning");
    $('.label').removeClass("text-success");
    socket.emit('notification', {
      "type": "notification",
      "user": username,
      "action": "clear"
    });
  });

  socket.on('connect', function(msg) {
    socket.status = "up";
    $('#navbar-badge-notification').removeClass('text-danger').addClass('text-success');
    notificationCenterTitle.push('System: ');
    notificationCenterMessage.push("Connection to Server is Ok");
    notificationCenterType.push('success');
    $('#navbar-badge-notification').text(parseInt($('#navbar-badge-notification').text()) + 1);
  });

  socket.on('disconnected', function() {
    notificationDown (socket);
  });

  socket.on('connect_error', function() {
    notificationDown (socket);
  });

  socket.on(usercode, function(data) {
    let msg = JSON.parse(data.value);
    let statusMessage = "Unkown";
    console.log(msg);
    switch (msg.type) {
      case "notification":
        switch (msg.action) {
          case "clear":
            if (msg.user === username) {
              notificationCenterId = [];
              notificationCenterTitle = [];
              notificationCenterType = [];
              notificationCenterMessage = [];
              $('#navbar-badge-notification').text("0");
              $("#navbar-badge-notification").removeClass("text-warning");
              $('.badge').removeClass("badge-success");
            }
            break;
          case "archive":
            break;
          default:
            if (notificationCenterId.includes(msg.id)) break;
            notificationCenterId.push(msg.id)
            notificationCenterMessage.push(msg.message);
            notificationCenterTitle.push('Notification for <a href="/' + usercode + '/display/' + msg.key + '" target="_blank"> : ' + msg.key + ' </a>: ');
            notificationCenterType.push('info');
            $('#navbar-badge-notification').text(parseInt($('#navbar-badge-notification').text()) + 1);
            $('#navbar-badge-notification').addClass('info');
            break;
        }
        break;
      case "message":
        if (notificationCenterId.includes(msg.id)) break;
        notificationCenterId.push(msg.id)
        notificationCenterMessage.push(msg.message);
        notificationCenterTitle.push('Message for <a href="/' + usercode + '/display/' + msg.key + '" target="_blank"> : ' + msg.key + ' </a>: ');
        notificationCenterType.push('info');
        $('#navbar-badge-notification').text(parseInt($('#navbar-badge-notification').text()) + 1);
        $('#navbar-badge-notification').addClass('info');
        break;
      case "bid":
        switch (msg.status) {
          case "running":
            statusMessage = 'Bid created for <a href="/' + usercode + '/display/' + msg.key + '" target="_blank">' + msg.key + '</a>';
            break;
          case "cancelled":
            statusMessage = 'Bid cancelled for <a href="/' + usercode + '/display/' + msg.key + '" target="_blank">' + msg.key + '</a>';
            break;
          case "declined":
            statusMessage = 'Bid declined for <a href="/' + usercode + '/display/' + msg.key + '" target="_blank">' + msg.key + '</a>';
            break;
          case "accepted":
            statusMessage = 'Bid accepted for <a href="/' + usercode + '/display/' + msg.key + '" target="_blank">' + msg.key + '</a>';
            break;
          case "expired":
            statusMessage = 'Bid expired for <a href="/' + usercode + '/display/' + msg.key + '" target="_blank">' + msg.key + '</a>';
            break;
          default:
            break;
        }
        notificationCenterMessage.push(statusMessage);
        notificationCenterTitle.push('Bid: ');
        notificationCenterType.push('info');
        $('#navbar-badge-notification').text(parseInt($('#navbar-badge-notification').text()) + 1);
        $('#navbar-badge-notification').addClass('text-warning');
        $('span[data-id=' + msg.key + ']').addClass('label-success');
        break;
      case "auction":
        statusMessage = "";
        switch (msg.status) {
          case "running":
            if (!msg.bestbid || msg.bestbid == "") statusMessage = 'Shaq created for <a href="/' + usercode + '/display/' + msg.key + '" target="_blank">' + msg.name + '</a>';
            break;
          case "expired":
            statusMessage = "Shaq expired for " + msg.name;
            break;
          case "completed":
            statusMessage = "Shaq completed for " + msg.name;
            break;
          default:
            break;
        }
        if (statusMessage !== "") {
          notificationCenterMessage.push(statusMessage);
          notificationCenterTitle.push('Shaq: ');
          notificationCenterType.push('success');
          $('#navbar-badge-notification').text(parseInt($('#navbar-badge-notification').text()) + 1);
          $('#navbar-badge-notification').addClass('text-warning');
        }
        break;
      default:
        console.log(msg);
        break;
    }
  });
});

function triggerInput(InputElement) {
  $(InputElement).trigger('keyup');
}
