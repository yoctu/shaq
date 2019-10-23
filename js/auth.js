window.dataLayer = window.dataLayer || [];

var auth = {};
auth.auth = {};
auth.webversion = "1.1.2";

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

if (getCookie("ConnectUser") !== "") {
  let ConnectUser = JSON.parse(getCookie("ConnectUser"));
  auth.auth.usercode = window.location.pathname.split("/")[1];;
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
  auth.auth.usercode = window.location.pathname.split("/")[1];;
  auth.auth.provider = "auth0";
}

auth.auth.authbasic = btoa(auth.auth.username + ":" + auth.auth.userkey)
if (!auth.auth.lang || (auth.auth.lang == "(null)")) auth.auth.lang = "en";
