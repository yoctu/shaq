if (auth.auth.lang === "en") auth.auth.lang = "gb";
$('#imgLang').attr('src', 'https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.2.1/flags/4x3/' + auth.auth.lang.toLowerCase() + '.svg');
$('#unitSettings').val(localSettings.unit);
$('#shaqTypeCodeFilter').val(localSettings.typeCode);
$('#currencySettings').val(localSettings.currency);
$('#dateSettings').val(localSettings.date);
$('#distanceSettings').val(localSettings.distance);
$('#weightSettings').val(localSettings.weight);
$('#chatHistorySettings').val(localSettings.chathistory);
$('#shaqValidTimerSettings').val(localSettings.shaqvalidtimer);
$('#themeSettings').val(localSettings.themeSettings);
$('#shaqChatVisibilitySettings').val(localSettings.chatShow);
$('#shaqShipmentVisibilitySettings').val(localSettings.shipmentShow);
$('#notifPopup').val(localSettings.autoNotify || 1);

if (auth.auth.usercode) $("#shaq-settings-company-profile").text(auth.auth.usercode);
if (auth.auth.username) {
  $("#shaq-settings-username").text(auth.auth.username);
  $("#settings-username").removeClass("hide");
}
if (auth.auth.firstname) {
  $("#shaq-settings-firstname").text(auth.auth.firstname);
  $("#settings-firstname").removeClass("hide");
}
if (auth.auth.lastname) {
  $("#shaq-settings-lastname").text(auth.auth.lastname);
  $("#settings-lastname").removeClass("hide");
}
if (auth.auth.email) {
  $("#shaq-settings-email").text(auth.auth.email);
  $("#settings-email").removeClass("hide");
}
if (auth.auth.phone) {
  $("#shaq-settings-phone").text(auth.auth.phone);
  $("#settings-phone").removeClass("hide");
}
if (auth.app.apikey) {
  $("#apikeySettings").val(auth.app.apikey);
}
if (auth.auth.lang) {
  $("#shaq-settings-lang").text(auth.auth.lang);
  $("#settings-lang").removeClass("hide");
}
if (auth.auth.provider) {
  $("#shaq-settings-auth-image").attr("src", auth.app.logourl + auth.auth.provider + ".png");
}
if (auth.app.logourl) {
  $("#shaq-settings-rating-ugo-image").attr("src", auth.app.logourl + "UGO.png");
  $("#shaq-settings-rating-boxtal-image").attr("src", auth.app.logourl + "BOXTAL.png");
  $("#shaq-settings-rating-shipengine-image").attr("src", auth.app.logourl + "SHIPENGINE.png");
  $("#shaq-settings-rating-goshippo-image").attr("src", auth.app.logourl + "GOSHIPPO.png");
  $("#shaq-settings-rating-skyquote-image").attr("src", auth.app.logourl + "SKYQUOTE.png");
  $("#shaq-settings-rating-skoreway-image").attr("src", auth.app.logourl + "SKOREWAY.png");
  $("#shaq-settings-rating-easy4pro-image").attr("src", auth.app.logourl + "EASY4PRO.png");
  $("#shaq-settings-company-profile-image").attr("src", auth.app.logourl + window.config.usercode + ".png");
}

function setConfigValue(data) {
  if (data.usercode) $("#usercodeSettings").val(data.usercode);
  if (data.app) {
    $("#maxbidsSettings").val(data.shaq.maxbids || 3);
    $("#shaq-settings-auctionmax").text(data.shaq.shaqmax);
    $("#shaq-settings-transportmax").text(data.shaq.sfumax);
    $("#shaq-settings-relsmax").text(data.shaq.relsmax);
    $("#shaq-settings-vehiclemax").text(data.shaq.vehiclemax);
    $("#usercodenameSettings").val(data.app.usercodename);
    $("#usercodeemailSettings").val(data.app.usercodeemail);
    $("#usercodephoneSettings").val(data.app.usercodephone);
    $("#orderingurlSettings").val(data.app.orderingurl);
    $("#shaq-settings-validatoremail").text(data.app.validatoremail);
    $("#shaq-settings-bidvaluemax").text(data.app.bidvaluemax);
    $("#shaq-settings-autofillvehicle").text(data.app.autofillvehicle)
  }
  if (data.tms) {
    if (data.tms.e4p) {
      $("#settings-easy4pro-body").removeClass("hide");
      $("#easy4proUrlSettings").val(data.tms.e4p.url);
      $("#easy4proLoginSettings").val(data.tms.e4p.username);
      $("#easy4proPasswordSettings").val(data.tms.e4p.password);
    }
    if (data.tms.skoreway) {
      $("#settings-skoreway-body").removeClass("hide");
      $("#skorewayUrlSettings").val(data.tms.skoreway.url);
    }
  }
  if (data.raters) {
    if (data.raters.skyquote) {
      $("#settings-skyquote-body").removeClass("hide");
      $("#skyquoteNameSettings").val(data.raters.skyquote.name || 'SkyQuote');
      if (data.raters.skyquote.auto) $("#shaq-settings-rating-skyquote-auto").addClass("glyphicon-remove");
      else $("#shaq-settings-rating-skyquote-auto").addClass("glyphicon-ok");
    }
    if (data.raters.ugo) {
      $("#settings-ugo-body").removeClass("hide");
      $("#ugoNameSettings").val(data.raters.ugo.name || 'Ugo');
      $("#ugoUrlSettings").val(data.raters.ugo.url);
      $("#ugoLoginSettings").val(data.raters.ugo.username);
      $("#ugoPasswordSettings").val(data.raters.ugo.password);
      if (data.raters.ugo.auto) $("#shaq-settings-rating-ugo-auto").addClass("glyphicon-remove");
      else $("#shaq-settings-rating-ugo-auto").addClass("glyphicon-ok");
    }
    if (data.raters.boxtal) {
      $("#settings-boxtal-body").removeClass("hide");
      $("#boxtalUrlSettings").val(data.raters.boxtal.url);
      $("#boxtalNameSettings").val(data.raters.boxtal.name || 'Boxtal');
      $("#boxtalLoginSettings").val(data.raters.boxtal.username);
      $("#boxtalPasswordSettings").val(data.raters.boxtal.password);
      $("#boxtalKeySettings").val(data.raters.boxtal.access_key);
      if (data.raters.boxtal.auto) $("#shaq-settings-rating-boxtal-auto").addClass("glyphicon-remove");
      else $("#shaq-settings-rating-boxtal-auto").addClass("glyphicon-ok");
    }
    if (data.raters.goshippo) {
      $("#settings-goshippo-body").removeClass("hide");
      $("#goshippoNameSettings").val(data.raters.goshippo.name || 'GoShippo');
      $("#goshippoUrlSettings").val(data.raters.goshippo.url);
      $("#goshippoTokenSettings").val(data.raters.goshippo.token);
      if (data.raters.goshippo.auto) $("#shaq-settings-rating-goshippo-auto").addClass("glyphicon-remove");
      else $("#shaq-settings-rating-goshippo-auto").addClass("glyphicon-ok");
    }
    if (data.raters.shipengine) {
      $("#settings-shipengine-body").removeClass("hide");
      $("#shipengineNameSettings").val(data.raters.shipengine.name || 'ShipEngine');
      $("#shipengineUrlSettings").val(data.raters.shipengine.url);
      $("#shipengineCarrierIdsSettings").val(JSON.stringify(data.raters.shipengine.carrier_ids));
      $("#shipengineTokenSettings").val(data.raters.shipengine.token);
      if (data.raters.shipengine.auto) $("#shaq-settings-rating-shipengine-auto").addClass("glyphicon-remove");
      else $("#shaq-settings-rating-shipengine-auto").addClass("glyphicon-ok");
    }
  }
  if (data.app.notifications & 1) $("#notifChat").val("1");
  if (data.app.notifications & 2) $("#notifMail").val("2");
  if (data.app.rating > 0) {
    $("#bidBidderRatingScore").removeClass("hide");
    for (var ratingCpt = 0; ratingCpt < data.app.rating; ratingCpt++) {
      $("#bidBidderRatingScore").append('<img width="32" src="/img/rating1.png" />');
    }
    for (ratingCpt; ratingCpt < 5; ratingCpt++) {
      $("#bidBidderRatingScore").append('<img width="32" src="/img/rating0.png" />');
    }
  }
  if (data.score && (data.score.invitation + data.score.avgbid + data.score.winning > 0)) {
    $(".scoreinvitedspan").html(data.score.invitation);
    $(".scoreavgbidspan").html(data.score.avgbid);
    $(".scorewinningspan").html(data.score.winning);
    $("#bidBidderScoring").removeClass("hide");
  }

}

if (window.config) {
  setConfigValue(window.config);
  $("#settingsScreen").removeClass("hide");
}

function saveSettings() {
  localSettings = {
    date: $('#dateSettings').val(),
    currency: $('#currencySettings').val(),
    distance: $('#distanceSettings').val(),
    unit: $('#unitSettings').val(),
    weight: $('#weightSettings').val(),
    chathistory: $('#chatHistorySettings').val(),
    shaqvalidtimer: $('#shaqValidTimerSettings').val(),
    themeSettings: $('#themeSettings').val(),
    chatShow: $('#shaqChatVisibilitySettings').val(),
    autoNotify: parseInt($('#notifPopup').val()),
    shipmentShow: $('#shaqShipmentVisibilitySettings').val(),
    typeCode: $('#shaqTypeCodeFilter').val()
  };

  localStorage.setItem('shaqSettings', JSON.stringify(localSettings));
  window.config.app.usercodename = $("#usercodenameSettings").val();
  window.config.app.usercodeemail = $("#usercodeemailSettings").val();
  window.config.app.usercodephone = $("#usercodephoneSettings").val();
  window.config.app.orderingurl = $("#orderingurlSettings").val();
  window.config.app.notifications = parseInt($("#notifChat").val()) + parseInt($("#notifMail").val());
  if ($("#ugoUrlSettings").val()) {
    window.config.raters.ugo.name = $("#ugoNameSettings").val();
    window.config.raters.ugo.url = $("#ugoUrlSettings").val();
    window.config.raters.ugo.username = $("#ugoLoginSettings").val();
    window.config.raters.ugo.password = $("#ugoPasswordSettings").val();
    if ($("#shaq-settings-rating-ugo-auto").hasClass("glyphicon-remove")) window.config.raters.ugo.auto = 1;
    else window.config.raters.ugo.auto = 0;
  }
  if ($("#boxtalUrlSettings").val()) {
    window.config.raters.boxtal.name = $("#boxtalNameSettings").val();
    window.config.raters.boxtal.url = $("#boxtalUrlSettings").val();
    window.config.raters.boxtal.username = $("#boxtalLoginSettings").val();
    window.config.raters.boxtal.password = $("#boxtalPasswordSettings").val();
    window.config.raters.boxtal.access_key = $("#boxtalKeySettings").val();
    if ($("#shaq-settings-rating-boxtal-auto").hasClass("glyphicon-remove")) window.config.raters.boxtal.auto = 1;
    else window.config.raters.boxtal.auto = 0;
  }
  if ($("#goshippoUrlSettings").val()) {
    window.config.raters.goshippo.name = $("#goshippoNameSettings").val();
    window.config.raters.goshippo.url = $("#goshippoUrlSettings").val();
    window.config.raters.goshippo.token = $("#goshippoTokenSettings").val();
    if ($("#shaq-settings-rating-goshippo-auto").hasClass("glyphicon-remove")) window.config.raters.goshippo.auto = 1;
    else window.config.raters.goshippo.auto = 0;
  }
  if ($("#shipengineUrlSettings").val()) {
    window.config.raters.shipengine.name = $("#shipengineNameSettings").val();
    window.config.raters.shipengine.url = $("#shipengineUrlSettings").val();
    window.config.raters.shipengine.token = $("#shipengineTokenSettings").val();
    window.config.raters.shipengine.carrier_ids = JSON.parse($("#shipengineCarrierIdsSettings").val());
    if ($("#shaq-settings-rating-shipengine-auto").hasClass("glyphicon-remove")) window.config.raters.shipengine.auto = 1;
    else window.config.raters.shipengine.auto = 0;
  }
  if ($("#skyquoteUrlSettings").val()) {
    window.config.raters.skyquote.name = $("#skyquoteNameSettings").val();
    if ($("#shaq-settings-rating-skyquote-auto").hasClass("glyphicon-remove")) window.config.raters.skyquote.auto = 1;
    else window.config.raters.skyquote.auto = 0;
  }
  if ($("#skorewayUrlSettings").val()) {
    window.config.tms.skoreway.url = $("#skorewayUrlSettings").val();
  }
  if ($("#easy4proUrlSettings").val()) {
    window.config.tms.e4p.url = $("#easy4proUrlSettings").val();
    window.config.tms.e4p.username = $("#easy4proLoginSettings").val();
    window.config.tms.e4p.password = $("#easy4proPasswordSettings").val();
  }
  $.ajax({
    "url": 'https://' + auth.auth.usercode + '.shaq' + auth.auth.env + '.yoctu.solutions/api/config/' + window.config.usercode,
    "type": "POST",
    "dataType": "json",
    "contentType": "application/json",
    "json": "json.wrf",
    "data": JSON.stringify(window.config),
    "headers": {
      "redspher-auth": "yes",
      "app-key": auth.auth.userkey,
      "Authorization": "Basic " + auth.auth.authbasic
    },
    "statusCode": {
      201: function(data) {
        informShow('<div class="text-center" id="settings-configuration-saved">Configuration saved.</div>', false);
      },
      200: function(data) {
        informShow('<div class="text-center" id="settings-configuration-saved">Configuration unchanged.</div>', false);
      }
    }
  });
}

$("#shaq-ugo-carriers-btn").on('click', function() {
  if ($("#UgoCarriersDisplay").hasClass("hide")) {
    $("#UgoCarriersDisplay").removeClass("hide");
    $("#UgoCarriersDisplay").html('<br><br><p><div class="loader text-center" style="width:40px;height:40px;border-top:8px solid #3498db;"></div></p>');
    $.ajax({
      "url": $("#ugoUrlSettings").val() + "/api/login_check",
      "method": "POST",
      "dataType": "json",
      "contentType": "application/json",
      "data": JSON.stringify({
        username: $("#ugoLoginSettings").val(),
        password: $("#ugoPasswordSettings").val()
      }),
      "success": function(login) {
        $.ajax({
          "url": $("#ugoUrlSettings").val() + "/api/dictionary/list/service/logo",
          "method": "GET",
          "dataType": "json",
          "beforeSend": function(xhr) {
            xhr.setRequestHeader("Authorization", "Bearer " + login.token);
          },
          "success": function(rows) {
            let output = '<br><br><div><table width="100%" class="responsive"><th>Code Name</th><th>Name</th><th>Logo</th>';
            for (let row in rows) {
              let logo = "";
              if (rows[row].logo != null) logo = rows[row].logo;
              output += '<tr><td>' + rows[row].carrierName + '</td><td>' + rows[row].name + '</td><td><img width="64" src="' + logo + '" /></td></tr>';
            }
            output += '</table></div>';
            $("#UgoCarriersDisplay").html(output);
          }
        });
      }
    });
  } else {
    $("#UgoCarriersDisplay").addClass("hide");
  }
});

$("#shaq-settings-rating-goshippo-auto,#shaq-settings-rating-ugo-auto,#shaq-settings-rating-skyquote-auto,#shaq-settings-rating-shipengine-auto").on('click', function() {
  $(this).toggleClass("glyphicon-remove").toggleClass("glyphicon-ok");
  window.config.raters[$(this).prop("id").split("-")[3]].auto = 0;
  if ($(this).hasClass("glyphicon-remove")) window.config.raters[$(this).prop("id").split("-")[3]].auto = 1;
});

function bidvaluemaxmodif() {
  $.ajax({
    "url": "/api/shaq/" + usercode + "/maxbidaccept/" + $("#newbidmax").val(),
    "method": "POST",
    "dataType": "json",
    "contentType": "application/json",
    "headers": {
      "redspher-auth": "yes",
      "app-key": auth.auth.userkey,
      "Authorization": "Basic " + auth.auth.authbasic
    },
    "success": function(data) {
      informShow('<div class="text-center" id="settings-configuration-saved">Request Sent !</div>');
    }
  });
}

$("#shaq-settings-autofillvehicle").on('click', function() {
    window.config.app.autofillvehicle = !window.config.app.autofillvehicle
    $("#shaq-settings-autofillvehicle").text(window.config.app.autofillvehicle)
})

$('#bidvaluemaxmodif').on('click', function() {
  questionShow('<p>Current Bid Max : <span class="pull-right" id="currentbidmax"></span></p><br>\
              <p>New Bid Max : <input class="pull-right" id="newbidmax"></input></p><br>\
              <p>Validation Email : <span class="pull-right" id="validatorbidmax"></span></p>', 'Request');
  $("#currentbidmax").text($("#shaq-settings-bidvaluemax").text());
  $("#validatorbidmax").text($("#shaq-settings-validatoremail").text());
  $("#newbidmax").val($("#shaq-settings-bidvaluemax").text());
  $("#QuestionModalYesBtn").on("click", function() {
    bidvaluemaxmodif();
  });
});

$('#refresh-score').on('click', function() {
  $.ajax({
    "url": 'https://' + auth.auth.usercode + '.shaq' + auth.auth.env + '.yoctu.solutions/api/shaq/' + auth.auth.usercode + "/score/now",
    "method": "POST",
    "dataType": "json",
    "contentType": "application/json",
    "headers": {
      "redspher-auth": "yes",
      "app-key": auth.auth.userkey,
      "Authorization": "Basic " + auth.auth.authbasic
    },
    "success": function(data) {
      $(".scoreinvitedspan").html(data.invitation);
      $(".scoreavgbidspan").html(data.avgbid);
      $(".scorewinningspan").html(data.winning);
      informShow('<div class="text-center" id="settings-configuration-saved">Your score has been updated</div>');
    }
  });
});

$('#saveSettingsBtn').on('click', function() {
  questionShow('<div>Are you sure to save configuration ?</div>', 'Save');
  $("#QuestionModalYesBtn").on("click", function() {
    saveSettings();
  });
});

$('#themeSettings').on('change', function(e) {
  let css = $('#theme-css').attr('href')
  $('#theme-css').attr('href', css.substr(0, css.lastIndexOf("/")) + '/' + $(this).val() + '.css');
});

socket.on(auth.auth.usercode, function(data) {
  let msg = JSON.parse(data.value);
  if (msg.type !== "config") return;
  window.config = msg.config;
  setConfigValue(window.config);
});
