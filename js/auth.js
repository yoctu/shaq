window.dataLayer = window.dataLayer || [];
const qs = new URLSearchParams(window.location.search)
var auth = {};
auth.auth = {};

auth.webversion = "1.5.1-0";

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
  auth.auth.usercode = qs.get('usercode');
  auth.auth.username = ConnectUser.user_name;
  auth.auth.firstname = ConnectUser.first_name;
  auth.auth.lastname = ConnectUser.last_name;
  auth.auth.email = ConnectUser.email;
  auth.auth.lang = ConnectUser.lang;
  auth.auth.userkey = ConnectUser.api_token;
  auth.auth.provider = "connect";
  auth.auth.authbasic = btoa(auth.auth.email + ":" + auth.auth.userkey)
}

if (!auth.auth.email) {
  if (qs.has('usercode')) auth.auth.usercode = qs.get('usercode')
  if (qs.has('email')) auth.auth.email = qs.get('email') || 'ftaggart@yoctu.com'
  if (qs.has('apikey')) auth.auth.userkey = qs.get('apikey')
  auth.auth.provider = "local"
  auth.auth.authbasic = btoa(auth.auth.email + ":" + auth.auth.userkey)
}

if ([null,undefined].includes(auth.auth.usercode)) window.location.replace("error403.html")

auth.auth.env = ".eu";
if (qs.has('env')) auth.auth.env = qs.get('env')
if (qs.has('theme')) auth.auth.theme = qs.get('theme')
if (qs.has('ajaxnocache')) auth.auth.ajaxcache = false
if (!auth.auth.lang || (auth.auth.lang == "(null)")) auth.auth.lang = "en";
