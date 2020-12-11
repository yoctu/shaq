var MOTD = 13;

var MOTDMessage = '<br><hr><br>\
<div class="col-sm-12">\
  <div class="text-center"><b><font color="#4981F1">Minor Upgrade</font></b></div><br>\
  <p><div class="text-center">Ugo Validity</b><br><br>\
  Define your own ugo bid validity time<br></p>\
  </div>\
</div>\
<div class="col-sm-12 text-center"><br><b><font color="#4981F1">Happy Shaqing !</font></b></div>\
<div class="col-sm-12 text-right"><br><br>\
  <a href="https://shaq.yoctu.com" target="_blank">\
  <img style="width:64px;" src="/img/shaqlogo.png" /></a>\
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
