function gtag() {
  dataLayer.push(arguments);
}
gtag('js', new Date());
gtag('config', 'UA-135283327-2');
$.getScript("/" + userCodePath + "/js/apiStatus.js");

var localSettings = localStorage.getItem('shaqSettings');

var socket;
$(document).ready(function() {
  $.ajax({
    "url": "/api/config/" + auth.auth.usercode,
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
      $.extend(true, auth, auth, configapi);
      $("#load-navbar").load("/" + userCodePath + "/html/navbar.html");
      $("#load-footer").load("/" + userCodePath + "/html/footer.html");
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
      $.getScript("/" + userCodePath + "/js/translate.js");
      $.getScript("/" + userCodePath + "/js/motd.js");
      $.getScript("/" + userCodePath + "/js/app.js");
      switch (window.location.pathname.split("/")[2]) {
        case "settings":
          $.getScript("/" + userCodePath + "/js/settings.js");
          break;
        case "display":
          $.getScript('https://maps.googleapis.com/maps/api/js?key=' + auth.app.gmapkey +'&callback=initMap');
          $.getScript("/" + userCodePath + "/js/shaq-display-functions.js");
          $.getScript("/" + userCodePath + "/js/shaq-display.js");
          $.getScript("/" + userCodePath + "/js/swiper.js");
          break;
        case "maxbidauthorizations":
          $.getScript("/" + userCodePath + "/js/mba.js");
          break;
        case "bidauthorizations":
          $.getScript("/" + userCodePath + "/js/ba.js");
          break;
        case "help":
          $.getScript("/" + userCodePath + "/js/help.js");
          break;
        default:
          $.getScript("/" + userCodePath + "/js/shaq-center.js");
          break;
      }
    }
  });

});
