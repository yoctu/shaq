$.ajax({
  "url": "/api/bid/" + auth.usercode + "/authorizebid/" + window.location.search.slice(1).split("=")[1] + "?key=" + window.location.search.slice(1).split("=")[2],
  "type": "GET",
  "beforeSend": function(xhr) {
    xhr.setRequestHeader("Authorization", "Basic " + auth.authbasic);
  },
  "success": function(msgs) {
    $("#authsuccess").removeClass("hide");
  },
  "error": function(msgs) {
    $("#authfailed").removeClass("hide");
  }
});
