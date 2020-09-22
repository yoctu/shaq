$('#contactHelpBtn').on('click', function() {
  let data = {
    target: [auth.auth.usercode],
    username: auth.auth.username,
    usercode: auth.auth.usercode,
    email: auth.auth.email,
    lang: auth.auth.lang,
    firstname: auth.auth.firstname,
    lastname: auth.auth.lastname,
    subject: $("#subjectHelp").val(),
    description: $("#descriptionHelp").val(),
    type: "notification",
    action: "mailsupport"
  };

  var mail = {
    "subject": "shaq website",
    "sender": "hello@yoctu.com",
    "recipients": "lav@yoctu.com",
    "text_body": JSON.stringify(data)
  }
  const params = new URLSearchParams();
  params.append('mail', JSON.stringify(mail));
  fetch("https://mailer.test.flash.global/api/mails", {
      method: 'POST',
      body: params,
    })
    .then(function(res) {

    });
  $("#subjectHelp").val("");
  $("#descriptionHelp").val("");
  $("#infoEmail").html("Message has been sent !").addClass("text-success");
  setTimeout(function() {
    $("#infoEmail").html("<br>");
  }, 3000);
});
