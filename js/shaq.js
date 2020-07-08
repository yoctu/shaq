const Raters = ["UGO", "GOSHIPPO", "SHIPENGINE", "SKYQUOTE", "BOXTAL"];
window.config = {};

var localSettings = localStorage.getItem('shaqSettings');
var socket;

$(document).ready(function() {
  $.ajaxSetup({
    cache: auth.auth.ajaxcache || true
  });

  (function(e,r,n,t,s){var a=[];e[s]=function(){a.push(arguments)};e[s].queue=a;  var o=[];var i=[];var c=true;var p=void 0;if(window.PerformanceObserver&&  window.PerformanceObserver.supportedEntryTypes&&(  PerformanceObserver.supportedEntryTypes.indexOf("longtask")>=0||  PerformanceObserver.supportedEntryTypes.indexOf("element")>=0)){  p=new PerformanceObserver(function(e){e.getEntries().forEach(function(e){  switch(e.entryType){case"element":i.push(e);break;case"longtask":o.push(e);break;  default:break}})});p.observe({entryTypes:["longtask","element"]})}e[s+"lt"]={  longTasks:o,timingElements:i,inPageLoad:c,observer:p};if(t){var u=r.createElement(n);  u.async=1;u.src=t;var f=r.getElementsByTagName(n)[0];f.parentNode.insertBefore(u,f)}})
  (window,document,"script","//cdn.sematext.com/rum.js","strum");
  strum('identify', { name: auth.auth.email, identifier: auth.auth.userkey });
  strum('config', { token: '59021558-8bba-4e3b-8df5-6d0263999cd4', 'receiverUrl': 'https://rum-receiver.sematext.com' });

  url = 'https://' + auth.auth.usercode + '.shaq' + auth.auth.env + '.yoctu.solutions/api/config/' + auth.auth.usercode
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
    "error": function() {
      status404();
    },
    "success": function(configapi) {
      window.config = configapi;
      $.extend(true, auth, auth, configapi);
      auth.app.logourl = '/img/'
      auth.app.css = '/css/'
      $("#load-navbar").load("/html/navbar.html");
      $("#load-footer").load("/html/footer.html");
      socket = io('https://' + auth.auth.usercode + '.shaq' + auth.auth.env + '.yoctu.solutions/shaq', {
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
        case "stats.html":
          $.getScript("/js/stats.js");
          break;
        default:
          $.getScript("/js/shaq-center.js");
          break;
      }
    }
  });

});
