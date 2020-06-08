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
  url = 'https://' + auth.auth.usercode + '.shaq' + auth.auth.env +  '.yoctu.solutions/api/config/' + auth.auth.usercode
  $.ajax({
    "url": url,
    "dataType": "json",
    "headers": {
      "redspher-auth": "yes",
      "Authorization": "Basic " + auth.auth.authbasic
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
      auth.app.logourl = '/img/'
      auth.app.css = '/css/'
      $("#load-navbar").load("/html/navbar.html");
      $("#load-footer").load("/html/footer.html");
      socket = io('https://' + auth.auth.usercode + '.shaq' + auth.auth.env +  '.yoctu.solutions/shaq', {
        query: {
          email: auth.auth.email,
          key: auth.auth.userkey
        }
      });
      $.getScript("/js/translate.js");
      $.getScript("/js/motd.js");
      $.getScript("/js/app.js");
      switch (window.location.pathname.split("/")[1]) {
        case "settings.html":
          $.getScript("/js/settings.js");
          break;
        case "display.html":
          $.getScript('https://maps.googleapis.com/maps/api/js?key=' + auth.app.gmapkey + '&callback=initMap');
          $.getScript("/js/shaq-display-functions.js");
          $.getScript("/js/shaq-display.js");
          $.getScript("/js/swiper.js");
          break;
        case "maxbidauthorizations.html":
          $.getScript("/js/mba.js");
          break;
        case "bidauthorizations.html":
          $.getScript("/js/ba.js");
          break;
        case "help.html":
          $.getScript("/js/help.js");
          break;
        default:
          $.getScript("/js/shaq-center.js");
          break;
      }
    }
  });

});
