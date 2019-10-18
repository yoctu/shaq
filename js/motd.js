var MOTD = 5;

var MOTDMessage = '<br><hr><br>\
<div class="col-sm-12">\
  <div class="text-center"><b><font color="#4981F1">New Rater !!!</font></b></div><br>\
  <p><div class="text-center">Boxtal is now available for rating !<br>\
  You can create your account on <a href="https://www.boxtal.com">https://www.boxtal.com</a><br>\
  Update your settings and test it !<br></p>\
  </div>\
</div>\
<div class="col-sm-12 text-center"><br><b><font color="#4981F1">Happy Shaqing !</font></b></div>\
<div class="col-sm-12 text-right"><br><br>\
  <a href="https://shaq.yoctu.com" target="_blank">\
  <img style="width:64px;" src="https://shaq.yoctu.com/img/shaqlogo.png" /></a>\
</div>';

var NotifyTemplate = '<div data-notify="container" class="col-xs-11 col-sm-6 alert alert-{0}" style="background-color: white;" role="alert">' +
  '<button type="button" aria-hidden="true" class="close" data-notify="dismiss">×</button>' +
  '<span data-notify="icon"></span> ' +
  '<span data-notify="title">{1}</span> ' +
  '<span data-notify="message">{2}</span>' +
  '<a href="{3}" target="{4}" data-notify="url"></a>' +
  '</div>';

var MOTDJSONH = {
  title: "<h2>Latest News</h2>",
  message: MOTDMessage
};

var MOTDJSONB = {
  placement: {
    from: 'top',
    align: 'center'
  },
  type: "info",
  delay: 10000,
  template: NotifyTemplate
};

if (!localStorage.getItem('shaqMOTD') || parseInt(localStorage.getItem('shaqMOTD')) < MOTD) {
  $.notify(MOTDJSONH, MOTDJSONB);
  localStorage.setItem('shaqMOTD', MOTD);
}
