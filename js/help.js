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
  $.ajax({
    "url": '/' + auth.auth.usercode + '/help',
    "method": "POST",
    "dataType": "json",
    "contentType": "application/json",
    "data": JSON.stringify(data),
    "complete": function(json) {
      $("#subjectHelp").val(""),
        $("#descriptionHelp").val(""),
        $("#infoEmail").html("Message has been sent !").addClass("text-success");
      setTimeout(function() {
        $("#infoEmail").html("");
      }, 3000);
      shaqGTAG('Shaq', 'ShaqHelpMail', JSON.stringify(data));
    }
  });
});
