$(document).ready(function() {
  if (lang === "en") lang = "gb";
  $('#imgLang').attr('src', 'https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.2.1/flags/4x3/' + lang.toLowerCase() + '.svg');
  $('#unitSettings').val(localSettings.unit);
  $('#currencySettings').val(localSettings.currency);
  $('#dateSettings').val(localSettings.date);
  $('#distanceSettings').val(localSettings.distance);
  $('#weightSettings').val(localSettings.weight);
  $('#chatHistorySettings').val(localSettings.chathistory);
  $('#shaqValidTimerSettings').val(localSettings.shaqvalidtimer);
  $('#themeSettings').val(localSettings.themeSettings);

  $.ajax({
    "url": "/api/config/" + usercode + "/default",
    "dataType": "json",
    "json": "json.wrf",
    "beforeSend": function(xhr) {
      xhr.setRequestHeader("Authorization", "Basic " + authbasic);
    },
    "success": function(data) {
      $("#configId").val(data.id);
      if (data.ugo && (data.ugo.length === 3)) {
        $("#ugoUrlSettings").val(data.ugo[0]);
        $("#ugoLoginSettings").val(data.ugo[1]);
        $("#ugoPasswordSettings").val(data.ugo[2]);
      }
      if (data.goshippo && (data.goshippo.length === 2)) {
        $("#goshippoUrlSettings").val(data.goshippo[0]);
        $("#goshippoTokenSettings").val(data.goshippo[1]);
      }
      if (data.app[11] & 1) $("#notifChat").val("1");
      if (data.app[11] & 2) $("#notifMail").val("2");
      if (data.app[12] > 0) {
        $("#bidBidderRatingScore").removeClass("hide");
        for (var ratingCpt = 0; ratingCpt < data.app[12]; ratingCpt++) {
          $("#bidBidderRatingScore").append('<img width="32" src="https://yoctu.github.io/yoctu-website/img/logo/rating1.png" />');
        }
        for (ratingCpt; ratingCpt < 5; ratingCpt++) {
          $("#bidBidderRatingScore").append('<img width="32" src="https://yoctu.github.io/yoctu-website/img/logo/rating0.png" />');
        }
      }
    }
  });

  $('#saveSettingsBtn').on('click', function() {
    localSettings = {
      date: $('#dateSettings').val(),
      currency: $('#currencySettings').val(),
      distance: $('#distanceSettings').val(),
      unit: $('#unitSettings').val(),
      weight: $('#weightSettings').val(),
      chathistory: $('#chatHistorySettings').val(),
      shaqvalidtimer: $('#shaqValidTimerSettings').val(),
      themeSettings: $('#themeSettings').val()
    };
    gtag('event', 'Settings', {
      'event_category': 'SettingsSave',
      'event_label': usercode,
      'value': JSON.stringify(localSettings)
    });
    localStorage.setItem('shaqSettings', JSON.stringify(localSettings));
    let data = {};
    data.usercodename = $("#usercodenameSettings").val();
    data.usercodeemail= $("#usercodeemailSettings").val();
    if (($("#ugoUrlSettings").val().length > 0) && ($("#ugoLoginSettings").val().length > 0) && ($("#ugoPasswordSettings").val().length > 0)) {
      data.ugo = [$("#ugoUrlSettings").val(), $("#ugoLoginSettings").val(), $("#ugoPasswordSettings").val()];
    }
    if (($("#goshippoUrlSettings").val().length > 0) && ($("#goshippoTokenSettings").val().length > 0)) {
      data.goshippo = [$("#goshippoUrlSettings").val(), $("#goshippoTokenSettings").val()];
    }
    if (data.ugo || data.goshippo) {
      $.ajax({
        "url": "/api/config/" + usercode + "/" + $("#configId").val(),
        "type": "POST",
        "dataType": "json",
        "contentType": "application/json",
        "json": "json.wrf",
        "data": JSON.stringify(data),
        "beforeSend": function(xhr) {
          xhr.setRequestHeader("Authorization", "Basic " + authbasic);
        },
        "statusCode": {
          201: function(data) {
            $("#InformationModalText").html('<div class="text-center" id="settings-condifuration-saved">Configuration saved.</div>');
            $("#InformationModal").modal("show");
          }
        }
      });
    }
  });

  $('#themeSettings').on('change', function(e) {
    if ($(this).val() !== "Default") {
      $('#theme-css').attr('href', usercss.substr(0, usercss.lastIndexOf("/")) + '/' + $(this).val() + '.css');
    } else {
      $('#theme-css').attr('href', usercss);
    }

  });

});
