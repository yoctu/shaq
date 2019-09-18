$.ajax({
  "url": "/api/shaq/" + auth.usercode + "/maxbidaccept/" + window.location.search.slice(1).split("=")[1] + "=" +
  window.location.search.slice(1).split("=")[2] + "="+window.location.search.slice(1).split("=")[3] +
  "="+window.location.search.slice(1).split("=")[4],
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
