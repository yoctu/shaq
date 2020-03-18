const Raters = ["UGO", "GOSHIPPO", "SHIPENGINE", "SKYQUOTE", "BOXTAL"];
window.config = {};

function gtag() {
  dataLayer.push(arguments);
}
gtag('js', new Date());
gtag('config', 'UA-135283327-2');

var localSettings = localStorage.getItem('shaqSettings');
var socket;
$.ajaxSetup({
  cache: true
});

$(document).ready(function() {
  $.ajax({
    "url": window.location.protocol + "//" + window.location.host + "/api/config/" + auth.auth.usercode,
    "dataType": "json",
    "beforeSend": function(xhr) {
      xhr.setRequestHeader("Authorization", "Basic " + auth.auth.authbasic);
    },
    "statusCode": {
      "429": function(xhr) {
        status429();
      },
      "401": function(xhr) {
        status401();
      },
      "403": function(xhr) {
        status403();
      },
      "500": function(xhr) {
        status500();
      }
    },
    "success": function(configapi) {
      window.config = configapi;
      $.extend(true, auth, auth, configapi);
      $("#load-navbar").load("/" + auth.auth.usercode + "/html/navbar.html");
      $("#load-footer").load("/" + auth.auth.usercode + "/html/footer.html");
      socket = io('/shaq', {
        transportOptions: {
          polling: {
            extraHeaders: {
              'Authorization': 'Basic ' + auth.auth.authbasic
            }
          }
        },
        path: '/' + auth.auth.usercode + '/socket.io'
      });
      $.getScript("/" + auth.auth.usercode + "/js/translate.js");
      $.getScript("/" + auth.auth.usercode + "/js/motd.js");
      $.getScript("/" + auth.auth.usercode + "/js/app.js");
      switch (window.location.pathname.split("/")[2]) {
        case "settings":
          $.getScript("/" + auth.auth.usercode + "/js/settings.js");
          break;
        case "display":
          $.getScript('https://maps.googleapis.com/maps/api/js?key=' + auth.app.gmapkey + '&callback=initMap');
          $.getScript("/" + auth.auth.usercode + "/js/shaq-display-functions.js");
          $.getScript("/" + auth.auth.usercode + "/js/shaq-display.js");
          $.getScript("/" + auth.auth.usercode + "/js/swiper.js");
          break;
        case "maxbidauthorizations":
          $.getScript("/" + auth.auth.usercode + "/js/mba.js");
          break;
        case "bidauthorizations":
          $.getScript("/" + auth.auth.usercode + "/js/ba.js");
          break;
        case "help":
          $.getScript("/" + auth.auth.usercode + "/js/help.js");
          break;
        default:
          $.getScript("/" + auth.auth.usercode + "/js/shaq-center.js");
          break;
      }
    }
  });

});
