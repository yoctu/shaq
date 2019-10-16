$.ajax({
  "url": "/api/bid/" + auth.auth.usercode + "/authorizebid/" + window.location.search.slice(1).split("=")[1] + "?key=" + window.location.search.slice(1).split("=")[2] + "&username=" + auth.auth.username,
  "type": "GET",
  "beforeSend": function(xhr) {
    xhr.setRequestHeader("Authorization", "Basic " + auth.auth.authbasic);
  },
  "success": function(msgs) {
    $("#authsuccess").removeClass("hide");
  },
  "error": function(msgs) {
    $("#authfailed").removeClass("hide");
  }
});
