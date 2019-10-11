window.dataLayer = window.dataLayer || [];

function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for(var i = 0; i <ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function gtag() {
  dataLayer.push(arguments);
}
gtag('js', new Date());
gtag('config', 'UA-135283327-2');
$.getScript("/" + userCodePath + "/js/apiStatus.js");

var localSettings = localStorage.getItem('shaqSettings');

var auth = {}; auth.auth = {};
if (getCookie("ConnectUser") !== "") {
  let ConnectUser = JSON.parse(getCookie("ConnectUser"));
  auth.auth.usercode = userCodePath;
  auth.auth.username = ConnectUser.user_name;
  auth.auth.firstname = ConnectUser.first_name;
  auth.auth.lastname = ConnectUser.last_name;
  auth.auth.email = ConnectUser.email;
  auth.auth.lang = ConnectUser.lang;
  auth.auth.userkey = ConnectUser.api_token;
  auth.auth.provider = "connect";
}
if (getCookie("Auth0User") !== "") {
  auth.auth = JSON.parse(getCookie("Auth0User"));
  auth.auth.usercode = userCodePath;
  auth.auth.provider = "auth0";
}

auth.auth.authbasic = btoa(auth.auth.username + ":" + auth.auth.userkey)
if (!auth.auth.lang) auth.auth.lang = "en";

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
