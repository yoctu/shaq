$('#contactHelpBtn').on('click', function() {
  let data = {
    target: [auth.usercode],
    username: auth.username,
    usercode: auth.usercode,
    email: auth.email,
    lang: auth.lang,
    firstname: auth.firstname,
    lastname: auth.lastname,
    subject: $("#subjectHelp").val(),
    description: $("#descriptionHelp").val(),
    type: "notification",
    action: "mailsupport"
  };
  $.ajax({
    "url": '/' + auth.usercode + '/help',
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
