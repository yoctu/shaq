window.id = uuidv4();
localStorage.setItem(usercode+"-"+window.location.pathname.split("/")[3], window.id)
window.addEventListener('storage', storageChanged);
function storageChanged (event) {
  if (window.id !== localStorage.getItem(usercode+"-"+window.location.pathname.split("/")[3])) window.location.href = "https://shaq.yoctu.com/shaqcenter.html";
}

$(document).ready(function() {
  var shaq = window.location.pathname.split("/")[3];
  window.shaq = '';
  window.timerBid = [];
  var timerFrom = 0;
  var shaqValiditytimer = 0;
  window.bestbid = "";
  window.bids = [];
  window.bidsInfo = [];
  window.chatsInfo = [];
  var showAllbids = 0;
  var solrTarget = "";
  if (new URLSearchParams(location.search).get('type')) {
    solrTarget = new URLSearchParams(location.search).get('type');
  }
  $('#bid-add').find('.bidBidderName').text(username);
  if (maxbids > 0) $('#bidMaxBidder').text(" / " + maxbids);

  function ShaqCompleted(winbid) {
    $('#shaq-status').html('<span class="glyphicon glyphicon-stop"></span>').prop("disabled", true);
    $('#shaq-status').attr("title", window.shaq.status);
    $('.btn-send-message').prop("disabled", true);
    $('.notifyAllBidders').prop("disabled", true);
    $('.btn-bid').prop("disabled", true);
    $("#bid-add").addClass("hide");
    $('#shaq-valid').prop("disabled", true);
    $('#shaq-valid').html("00:00");
    $('#shaq-from').html("00:00");
    $('#shaq-from-title').html("00:00");
    $('#shaq-name').prop("disabled", true);
    $(".get-it-now-text").prop("disabled", true);
    $(".fileuploadQueue-handler").hide();
    $('.bidValidDate').prop("disabled", true);
    $('#shaq-valid-btn').prop("disabled", true);
    $('#shaq-valid-from-btn').prop("disabled", true);
    $(".remove-bidder").hide();
    $(".hideMessage").click();
    $('.bid-info-list').find('.well').addClass("well-danger");
    switch (window.shaq.status) {
      case "completed":
        $("#closedStatusGlyphicon").html('<span class="label label-success"><span class="glyphicon glyphicon-ok"></span></span><br>');
        break;
      case "cancelled":
        $("#closedStatusGlyphicon").html('<span class="label label-warning"><span class="glyphicon glyphicon-ok"></span></span><br>');
        break;
      case "expired":
        $("#closedStatusGlyphicon").html('<span class="label label-danger"><span class="glyphicon glyphicon-remove"></span></span><br>');
        break;
    }
    $("#closedStatusGlyphiconSymbol").removeClass("glyphicon-remove").addClass();
    $("#closedStatusGlyphicon").removeClass("hide");
    if (winbid) {
      $('.bid-info-list').addClass("hide");
      $('#bid-add').addClass("hide");
      $('.bid-info-list').find('.well').removeClass("well-success").removeClass("well-warning").addClass("well-danger");
      if (window.bidsInfo[winbid]) {
        window.bidsInfo[winbid].removeClass("hide");
        window.bidsInfo[winbid].find('.well').removeClass("well-danger").addClass("well-success");
        $('#accept-label').text('Accepted');
      }
    }
  }

  function bidHideAllBtn(bidInfo) {
    bidInfo.find('.btn-accept-bid').addClass('hide');
    bidInfo.find('.btn-decline-bid').addClass('hide');
    bidInfo.find('.btn-cancel-bid').addClass('hide');
    bidInfo.find('.btn-bid').addClass('hide');
  }

  function bidRefresh(bidInfo, bid) {
    bidInfo.find('.bidPrice').val(parseFloat(bid.price).toFixed(2));
    for (key in window.shaq.target) {
      if (window.shaq.target[key] === bid.source[0]) {
        bidInfo.find('.bidBidderCode').html(window.shaq.targetName[key]);
        bidInfo.find('.bidBidderId').html(bid.id);
        if (((bid.source[0]) === usercode) && fileUpload) {
          let fileData = '<input multiple="" class="form-control fileupload" style="display: none !important;" id="file' + bid.id.substring(1, 8) + '" name="file[]" type="file" onchange=\'uploadFile(' + JSON.stringify(bid) + ');\'/><div class="table-responsive fileuploadQueue-handler">';
          fileData += '<a id="href' + bid.id.substring(1, 8) + '" class="btn btn-xs btn-primary upload_add_files" onclick="$(\'#file' + bid.id.substring(1, 8) + '\').trigger(\'click\');">Add files...</a></div><div id="filetoUpload' + bid.id.substring(1, 8) + '"></div>';
          for (file in bid.files) {
            fileData += '<div><a href="' + window.location.protocol + '//' + username + ':' + userkey + '@' + window.location.host + '/api/file/' + usercode + '/bid/downloadbidfile/' + bid.key + '/' + bid.id + '/' + file + '"><span class="glyphicon glyphicon-cloud-upload text-success"></span>  ' + bid.files[file].slice(bid.files[file].indexOf("_") + 1) + "</a></div>";
          }
          bidInfo.find('.bidBidderFile').html(fileData);
        }
      } else {
        if ((bid.target[0] === usercode) && fileUpload) {
          let fileData = "";
          for (file in bid.files) {
            fileData += '<a href="' + window.location.protocol + '//' + username + ':' + userkey + '@' + window.location.host + '/api/file/' + usercode + '/bid/downloadbidfile/' + bid.key + '/' + bid.id + '/' + file + '"><span class="glyphicon glyphicon-cloud-upload text-success"></span>  ' + bid.files[file].slice(bid.files[file].indexOf("_") + 1) + "</a>";
          }
          bidInfo.find('.bidBidderFile').html(fileData);
        }
      }
    }
    bidInfo.find(".bidBidderRatingScore").html("");
    for (var ratingCpt = 0; ratingCpt < bid.targetRating; ratingCpt++) {
      bidInfo.find(".bidBidderRatingScore").append('<img width="32" src="https://yoctu.github.io/yoctu-website/img/logo/rating1.png" />');
    }
    for (ratingCpt; ratingCpt < 5; ratingCpt++) {
      bidInfo.find(".bidBidderRatingScore").append('<img width="32" src="https://yoctu.github.io/yoctu-website/img/logo/rating0.png" />');
    }
    bidInfo.find('.bidBidderName').html('<label>' + bid.from + '</label>');
    bidInfo.find('.bidCurrency').attr('disabled', 'disabled');
    bidInfo.find('.bidVehicle').val(bid.vehicule);
    bidInfo.find('.bidVehicle').attr('disabled', 'disabled');
    bidInfo.find('.bidDeDate').val(moment(bid.deDate).tz('UTC').format('YYYY-MM-DD HH:mm').replace(' 00:00', ''));
    bidInfo.find('.bidDeDate').removeAttr("data-field");
    if (window.shaq.source.includes(usercode)) bidInfo.find('.hollowData').removeClass("hide");
    if (bid.score) {
      bidInfo.find(".scoreinvitedspan").text(bid.score[0]);
      bidInfo.find(".scoreavgbidspan").text(bid.score[1]);
      bidInfo.find(".scorewinningspan").text(bid.score[2]);
      if (parseInt(bid.score[0]) < 1) bidInfo.find(".hollowinvited").addClass("danger");
      if (parseInt(bid.score[0]) > 10) bidInfo.find(".hollowinvited").addClass("success");
      if (parseInt(bid.score[1]) < 1) bidInfo.find(".hollowavgbid").addClass("danger");
      if (parseInt(bid.score[1]) > 2) bidInfo.find(".hollowavgbid").addClass("success");
      if (parseInt(bid.score[2]) < 1) bidInfo.find(".hollowwinning").addClass("danger");
      if (parseInt(bid.score[2]) > 2) bidInfo.find(".hollowwinning").addClass("success");
    }
    if (bid.deDate.substring(0, 16) !== window.shaq.deDate.substring(0, 16)) {
      bidInfo.find('.bidDeDate').css("color", "#d9534f");
    }
    bidInfo.find('.bidPuDate').val(moment(bid.puDate).tz('UTC').format('YYYY-MM-DD HH:mm').replace(' 00:00', ''));
    bidInfo.find('.bidPuDate').removeAttr("data-field");
    if (bid.puDate.substring(0, 16) !== window.shaq.puDate.substring(0, 16)) {
      bidInfo.find('.bidPuDate').css("color", "#d9534f");
    }
    bidInfo.find('.bidValidDate').val(bid.valid_until.substring(0, 16).replace('T', ' '));
    bidInfo.find('.bidLang').val(bid.lang);
    bidInfo.find('.bidLang').attr('disabled', 'disabled');
    bidInfo.find('.btn-bid-extend-glyphicon').data("bid-id-to-extend", bid.id);
    bidInfo.find('.btn-bid-extend-detail').addClass('hide');
    if (window.shaq.status === "running") {
      if (bid.status == "running") bidInfo.find('.well').addClass('well-warning');
      else {
        bidInfo.find('.well').addClass('well-danger');
        if (!showAllbids) {
          bidInfo.addClass('hide');
        }
      }
    }
    if (window.shaq.bestbid === bid.id) {
      bidInfo.find('.well').removeClass("well-warning").removeClass('.well-danger').addClass("well-success");
    }
    bidInfo.find('input, select').attr("readonly", "readonly");
    bidInfo.find('input[type="checkbox"]').click(function(e) {
      e.preventDefault();
      e.stopPropagation();
    });
    bidInfo.find('.bidTransitTime').text(TransitCalc(bidInfo.find('.bidPuDate').val(), bidInfo.find('.bidDeDate').val(), window.shaq.puPlace[4], window.shaq.dePlace[4]));
    if (bid.loaded === "Yes") bidInfo.find('.bidLoaded').addClass("btn-info");
    if (bid.driver == "2") bidInfo.find('.bidDriver').addClass("btn-info");
    bidInfo.find('.img-bidder-logo').attr("src", logourl + bid.source[0] + ".png");
    if (bid.logo && bid.logo !== logourl + bid.source[0] + ".png") {
      bidInfo.find('.img-rating-logo').attr("src", bid.logo);
      bidInfo.find('.img-rating-logo').removeClass("hide");
    }

    switch (bid.status) {
      case "running":
        bidInfo.data("bid-id", bid.id);
        bidInfo.find('.btn-create-bid').addClass('hide').data("btn-bid-id", bid.id);
        bidInfo.find('.btn-no-solution-bid').addClass('hide').data("btn-bid-id", bid.id);
        bidInfo.find('.btn-getitnow-bid').addClass('hide').data("btn-bid-id", bid.id);
        bidInfo.find('.btn-accept-bid').removeClass('hide').data("btn-bid-id", bid.id);
        bidInfo.find('.btn-decline-bid').removeClass('hide').data("btn-bid-id", bid.id);
        bidInfo.find('.btn-cancel-bid').removeClass('hide').data("btn-bid-id", bid.id);
        bidInfo.find('.btn-status-bid').addClass('hide').data("btn-bid-id", bid.id);
        break;
      case "expired":
        bidInfo.find('.btn-status-bid').removeClass('hide').html('<span class="glyphicon glyphicon-remove"></span> Expired').addClass('btn-danger').attr("disabled", "disabled");
        bidInfo.find('.bid-validity-count').removeClass('hide');
        bidInfo.find('.bidValidUntil').html("expired");
        bidHideAllBtn(bidInfo);
        break;
      case "accepted":
        bidInfo.find('.btn-status-bid').removeClass('hide').html('<span class="glyphicon glyphicon-ok"></span> Accepted').addClass('btn-success').attr("disabled", "disabled");
        bidHideAllBtn(bidInfo);
        break;
      case "declined":
        bidInfo.find('.btn-status-bid').removeClass('hide').html('<span class="glyphicon glyphicon-remove"></span> Declined').addClass('btn-danger').attr("disabled", "disabled");
        bidHideAllBtn(bidInfo);
        break;
      case "cancelled":
        bidInfo.find('.btn-status-bid').removeClass('hide').html('<span class="glyphicon glyphicon-remove"></span> Cancelled').addClass('btn-warning').attr("disabled", "disabled");
        bidHideAllBtn(bidInfo);
        break;
    }

    let validDate = bid.valid_until.substring(0, 16).replace('T', ' ');
    let tzDate = new Date();
    let CurrentDate = new Date().valueOf();
    validDate = new Date(validDate).valueOf();
    CurrentDate = CurrentDate + (tzDate.getTimezoneOffset() * 60000);
    let timer = 0;
    if ((validDate > CurrentDate) && (bid.status === "running") && (window.shaq.status === "running")) {
      bidInfo.find('.bid-validity-count').removeClass('hide');
      timer = Math.floor((validDate - CurrentDate) / 1000);
      window.timerBid[bid.id] = setInterval(function() {
        var hoursLeft = Math.floor(timer);
        var hours = Math.floor(hoursLeft / 3600);
        var minutesLeft = Math.floor((hoursLeft) - (hours * 3600));
        var minutes = Math.floor(minutesLeft / 60);
        var remainingSeconds = timer % 60;
        if (timer > 0) {
          bidInfo.find('.bidValidUntil').html(pad(hours) + ":" + pad(minutes) + ":" + pad(remainingSeconds));
          timer--;
        } else {
          bidHideAllBtn(bidInfo);
          bidInfo.find('.bidValidUntil').html("expired");
          bidInfo.find('.btn-status-bid').text(' Expired');
          clearInterval(window.timerBid[bid.id]);
        }
      }, 1000);
    } else {
      bidInfo.find('.btn-accept-bid').addClass('hide');
      bidInfo.find('.btn-decline-bid').addClass('hide');
    }
    if (Object.values(window.bids).length >= maxbids) {
      $('.btn-create-bid').attr("disabled", true);
      $('.btn-create-bid').attr('title', 'Maximum Bids reached !');
      $('.btn-no-solution-bid').attr("disabled", true);
      $('.btn-no-solution-bid').attr('title', 'Maximum Bids reached !');
      $('.btn-getitnow-bid').attr("disabled", true);
      $('.btn-getitnow-bid').attr('title', 'Maximum Bids reached !');
    }
    bidInfo.find('.btn-bid-extend').removeClass('hide');
  }

  $.ajax({
    "url": "/api/shaq" + solrTarget + "/" + usercode + "/" + shaq + "?rows=1",
    "dataType": "json",
    "json": "json.wrf",
    "beforeSend": function(xhr) {
      xhr.setRequestHeader("Authorization", "Basic " + authbasic);
    },
    "statusCode": {
      "200": function(xhr) {
        gtag('event', 'Shaq', {
          'event_category': 'ShaqDisplayFetch',
          'event_label': usercode,
          'value': shaq
        });
      },
      "429": function(xhr) {
        status429();
      }
    },
    "success": function(shaq) {
      console.log(shaq);
      if ((shaq.numFound) === 0) {
        $('.header-content').hide();
        $('#not-found-message-text').html('<a href="#">Shaq not found</a>');
        $('#not-found-message').removeClass('hide');
        return;
      }
      window.shaq = shaq.docs[0];
      $('#shaq-status').attr("title", window.shaq.status);
      if (window.shaq.winningbid && (window.shaq.winningbid !== "")) window.bestbid = window.shaq.bestbid;
      usercodeName = window.shaq.sourceName[0];
      $('#ChatList').append('<p><button id="' + window.shaq.source[0] + '" class="btn btn-default btn-room"><img class="bidder-image" src="' + logourl + window.shaq.source[0] + '.png" />  ' + window.shaq.sourceName[0] + ' <span id="chatBadge-' + window.shaq.source[0] + '" class="badge">0</span></button></p>');
      if (window.shaq.target && window.shaq.target.includes(usercode)) {
        usercodeName = window.shaq.targetName[window.shaq.target.indexOf(usercode)];
        $('#ChatList').append('<p><button id="' + usercode + '" class="btn btn-default btn-room"><img class="bidder-image" src="' + logourl + usercode + '.png" />  ' + usercodeName + ' <span id="chatBadge-' + usercode + '" class="badge">0</span></button></p>');
        window.chatsInfo[usercode] = [];
      }
      if (window.shaq.target && window.shaq.target.includes(usercode)) {
        $('.btn-bidder').removeClass("hide");
        $('#bid-add').removeClass("hide");
        $('#bid-add').find('.btn-bid-extend-detail').removeClass("hide");
        $("#bid-add").find('.btn-create-bid').removeClass('hide');
        $("#bid-add").find('.btn-no-solution-bid').removeClass('hide');
        $("#bid-add").find('.btn-getitnow-bid').removeClass('hide');
        for (var ratingCpt = 1; ratingCpt < window.shaq.targetRating[window.shaq.target.indexOf(usercode)]; ratingCpt++) {
          $("#bid-add").find(".bidBidderRatingScore").append('<img width="32" src="https://yoctu.github.io/yoctu-website/img/logo/rating1.png" />');
        }
        for (ratingCpt; ratingCpt < 5; ratingCpt++) {
          $("#bid-add").find(".bidBidderRatingScore").append('<img width="32" src="https://yoctu.github.io/yoctu-website/img/logo/rating0.png" />');
        }
      }
      if (window.shaq.source.includes(usercode)) {
        $('.notifyAllBidders').prop("disabled", false);
        $('.btn-auctioneer').removeClass("hide");
        for (var rooms in window.shaq.target) {
          if ((window.shaq.target[rooms] === "UGO") || (window.shaq.target[rooms] === "GOSHIPPO")) continue;
          $('#ChatList').append('<p><button id="' + window.shaq.target[rooms] + '" class="btn btn-default btn-room"><img class="bidder-image" src="' + logourl + window.shaq.target[rooms] + '.png" />  ' + window.shaq.targetName[rooms] + ' <span id="chatBadge-' + window.shaq.target[rooms] + '" class="badge">0</span></button></p>');
        }
        $("#shaq-valid-from-btn").prop("disabled", false);
        $("#shaq-valid-btn").prop("disabled", false);
        $("#shaq-status").prop("disabled", false);
        $("#shaq-from-title-btn").prop("disabled", false);
      }
      $("#shaq-name").html('<div class="shaqlabel text-left">Order</div><div style="line-height: 20px; font-weight: bold; padding-bottom: 5px;">' + window.shaq.name + '</div>');
      if (window.shaq.targetName) $('#bid-add .bidBidderCode').text(window.shaq.targetName[0]);
      if (window.shaq.getitnow && window.shaq.getitnow > 0) {
        if (window.shaq.source.includes(usercode)) {
          $(".get-it-now-text").attr("disabled", true);
        }
        $(".get-it-now-text").html('<span class="glyphicon glyphicon-screenshot"></span> ' + window.shaq.getitnow + ' ' + window.shaq.currency);
        $("#get-it-now").removeClass("hide");
      } else $(".btn-getitnow-bid").addClass("hide");
      $('#bid-add .bidCurrency').val(window.shaq.currency);
      $("#shaq-date").html(moment(window.shaq.reported_at).format('YYYY-MM-DD HH:mm'));
      $("#shaq-puplace").append(window.shaq.puPlace[0] + '<br>');
      $("#shaq-puplace").append(window.shaq.puPlace[1] + ' ' + window.shaq.puPlace[2] + '<br>');
      $("#shaq-puplace").append(window.shaq.puPlace[3] + '   <img width="24px" title="' + window.shaq.puPlace[4] + '" src="https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.2.1/flags/4x3/' + window.shaq.puPlace[4].toLowerCase() + '.svg" class="pull-right" /><br>');
      $("#shaq-deplace").append(window.shaq.dePlace[0] + '<br>');
      $("#shaq-deplace").append(window.shaq.dePlace[1] + ' ' + window.shaq.dePlace[2] + '<br>');
      $("#shaq-deplace").append(window.shaq.dePlace[3] + '   <img width="24px" title="' + window.shaq.puPlace[4] + '" src="https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.2.1/flags/4x3/' + window.shaq.dePlace[4].toLowerCase() + '.svg" class="pull-right" /><br>');
      $("#shaq-pudate").text(moment(window.shaq.puDate).tz('UTC').format('YYYY-MM-DD HH:mm'));
      let pudateCet = moment.tz(window.shaq.puDate.replace("T", " ").substring(0, 16), tzSettings.countries[window.shaq.puPlace[4]].timezones[0]).tz("UTC");
      let dedateCet = moment.tz(window.shaq.deDate.replace("T", " ").substring(0, 16), tzSettings.countries[window.shaq.dePlace[4]].timezones[0]).tz("UTC");
      $("#shaq-pudate-cet").attr("title", "UTC time : " + pudateCet.format("YYYY-MM-DD HH:mm"));
      $("#shaq-dedate").text(moment(window.shaq.deDate).tz('UTC').format('YYYY-MM-DD HH:mm'));
      $("#shaq-dedate-cet").attr("title", "UTC time : " + dedateCet.format("YYYY-MM-DD HH:mm"));
      $("#shaq-transit-time").text(TransitCalc(pudateCet, dedateCet, window.shaq.puPlace[4], window.shaq.dePlace[4]));
      $('#bid-add .bidTransitTime').text(TransitCalc(pudateCet, dedateCet, window.shaq.puPlace[4], window.shaq.dePlace[4]));
      let distance = parseInt(window.shaq.distance);
      if (localSettings.distance === "Miles") {
        distance = (Math.ceil(distance * 62.14) / 100);
      }
      $("#shaq-distance").text(distance + ' ' + localSettings.distance);
      if (window.shaq.puContact) {
        $("#shaq-puContactCompany").html(window.shaq.puContact[0]);
        $("#shaq-puContactName").html(window.shaq.puContact[1]);
        $("#shaq-puContactPhone").html(window.shaq.puContact[3]);
        $("#shaq-puContactEmail").html(window.shaq.puContact[2]);
        $("#shaq-well-puContact").removeClass("hide");
      }
      if (window.shaq.deContact) {
        $("#shaq-deContactCompany").html(window.shaq.deContact[0]);
        $("#shaq-deContactName").html(window.shaq.deContact[1]);
        $("#shaq-deContactPhone").html(window.shaq.deContact[3]);
        $("#shaq-deContactEmail").html(window.shaq.deContact[2]);
        $("#shaq-well-deContact").removeClass("hide");
      }
      $("#shaq-vehicle").text(window.shaq.transport);
      $("#shaq-stackable").text(window.shaq.stackable);
      $(".shaq-pkg-notes").text(window.shaq.notes);
      $("#shaq-notes").text(window.shaq.notes);
      $("#shaq-auctioneer").html('<img width="24" src="' + logourl + window.shaq.source[0] + '.png" />  <b>' + window.shaq.sourceName[0] + '</b>');
      let bidderDisplay = '<b>';
      let tohide = "";
      for (let bidders in window.shaq.targetName) {
        let color = "";
        if (bidders >= 4) tohide = "hide"
        if (window.shaq.targetStatus && window.shaq.targetStatus[bidders] === "NoSolution") color = "danger";
        if (window.shaq.targetStatus && window.shaq.targetStatus[bidders] === "Removed") color = "warning";
        bidderDisplay += '<div id="bidderList_' + window.shaq.target[bidders] + '" class="bidderslist ' + tohide + ' text-' + color + '"><img width="16" src="' + logourl + window.shaq.target[bidders] + '.png" /> ' + window.shaq.targetName[bidders] + '</font>';
        if (usercode === window.shaq.source[0]) {
          let glyphiconbidder = "remove";
          if (window.shaq.targetStatus && window.shaq.targetStatus[bidders] === "Removed") glyphiconbidder = "ok";
          bidderDisplay += ' <a onclick="removebidder(this);" class="remove-bidder" id="' + window.shaq.target[bidders] + '"><span class="glyphicon glyphicon-' + glyphiconbidder + '"> </span></a>';
        }
        bidderDisplay += '</div>';
      }
      bidderDisplay += '</b>';
      if (window.shaq.targetName.length > 4) bidderDisplay += '<div class="pull-right"><a onclick="showmore(this);"><i><h6>show more (' + window.shaq.target.length + ')<h6></i></a></div>';
      $("#shaq-bidder").html(bidderDisplay);
      $('#pickupdate').val(moment(window.shaq.puDate).tz('UTC').format('YYYY-MM-DD HH:mm'));
      $('#deliverydate').val(moment(window.shaq.deDate).tz('UTC').format('YYYY-MM-DD HH:mm'));
      let validDate = window.shaq.valid_until.substring(0, 16).replace('T', ' ');
      $('#validitydate').val(validDate);
      $("#shaq-valid-date").html(moment(window.shaq.valid_until).format('YYYY-MM-DD HH:mm'));
      $('#shaq-decision-date').html(moment(window.shaq.valid_from).format('YYYY-MM-DD HH:mm'));

      let dim = window.shaq.dimension;
      let totaldim = [0, 0, 0];
      for (let pkg = 0; pkg <= dim.length - 6; pkg = pkg + 6) {
        let dimUnit = dim[pkg + 1] + ' cm x ' + dim[pkg + 2] + ' cm x ' + dim[pkg + 3] + ' cm';
        let dimWeight = '<br>' + dim[pkg + 4] + ' kgs';
        totaldim[0] += parseInt(dim[pkg]);
        totaldim[1] += parseFloat(dim[pkg + 4]);
        totaldim[2] += parseInt(dim[pkg]) * (parseFloat(dim[pkg + 1]) * parseFloat(dim[pkg + 2]) * parseFloat(dim[pkg + 3]));
        if (localSettings.unit === "Imperial") {
          dimUnit = (Math.ceil(dim[pkg + 1] * 39.37) / 100) + ' inches x ' + (Math.ceil(dim[pkg + 2] * 39.37) / 100) + ' inches x ' + (Math.ceil(dim[pkg + 3] * 39.37) / 100) + ' inches';
        }
        if (localSettings.weight === "Pounds") {
          dimWeight = '<br>' + (Math.ceil(dim[pkg + 4] * 220.46) / 100) + ' pounds';
        }
        if (pkg === 0) {
          $('.shaq-pkg-number').html(dim[pkg]);
          $('.shaq-pkg-dimension').html(dimUnit + dimWeight);
          $('.shaq-pkg-stackable').html(dim[pkg + 5]);
          $('.shaq-pkg-notes').html();
        } else {
          let pkgInfo = $('#packages-well').clone();
          pkgInfo.find('.shaq-pkg-number').html(dim[pkg]);
          pkgInfo.find('.shaq-pkg-dimension').html(dimUnit + dimWeight);
          pkgInfo.find('.shaq-pkg-stackable').html(dim[pkg + 5]);
          pkgInfo.find('.shaq-pkg-notes').html();
          $('#packageList').append(pkgInfo);
        }
      }
      totalUnitCubed = "m3";
      totalUnitWeight = "kgs"
      if (localSettings.unit === "Imperial") {
        totaldim[2] = Math.ceil(totaldim[2] * 39.37) / 100;
        totalUnitCubed = " cubic inches";
      } else {
        totaldim[2] = (totaldim[2] / 1000000);
      }
      if (localSettings.weight === "Pounds") {
        totaldim[1] = Math.ceil(totaldim[1] * 220.46) / 100;
        totalUnitWeight = "pounds"
      }
      $("#shaq-total-package").html(totaldim[0]);
      $("#shaq-total-weight").html(totaldim[1] + " " + totalUnitWeight);
      $("#shaq-total-volume").html(totaldim[2].toFixed(2) + " " + totalUnitCubed);
      let now = new Date();
      let CurrentDate = now.getTime() + now.getTimezoneOffset() * 60000;
      validDate = new Date(validDate).getTime();
      $('#shaq-valid').html("00:00");
      if ((validDate > CurrentDate) && (window.shaq.status === "running")) {
        shaqValiditytimer = Math.floor((validDate - CurrentDate) / 1000);
        window.shaqValid = setInterval(function() {
          var hoursLeft = Math.floor(shaqValiditytimer);
          var hours = Math.floor(hoursLeft / 3600);
          var minutesLeft = Math.floor((hoursLeft) - (hours * 3600));
          var minutes = Math.floor(minutesLeft / 60);
          var remainingSeconds = shaqValiditytimer % 60;
          if (shaqValiditytimer > 0) {
            $('#shaq-valid').html(pad(hours) + ":" + pad(minutes) + ":" + pad(remainingSeconds));
            shaqValiditytimer--;
          } else {
            clearInterval(window.shaqValid);
          }
        }, 1000);
      }
      if (localSettings.shaqvalidtimer === "Disable") {
        $('#shaq-valid').addClass('hide');
      }

      $('#shaq-from').html("00:00");
      $('#shaq-from-title').html("00:00");
      let validDateFrom = window.shaq.valid_from.substring(0, 16).replace('T', ' ');
      let CurrentDateFrom = new Date(validDateFrom).getTime();
      if ((CurrentDateFrom > CurrentDate) && (window.shaq.status === "running")) {
        timerFrom = Math.floor((CurrentDateFrom - CurrentDate) / 1000);
        $(".btn-accept-bid").prop("disabled", true);
        $(".btn-decline-bid").prop("disabled", true);
        $('.btn-accept-bid').attr('title', 'Decision time is Running !');
        $('.btn-decline-bid').attr('title', 'Decision time is Running !');
        window.shaqFromValid = setInterval(function() {
          var hoursFromLeft = Math.floor(timerFrom);
          var hoursFrom = Math.floor(hoursFromLeft / 3600);
          var minutesFromLeft = Math.floor((hoursFromLeft) - (hoursFrom * 3600));
          var minutesFrom = Math.floor(minutesFromLeft / 60);
          var remainingFromSeconds = timerFrom % 60;
          if (timerFrom >= 0) {
            $('#shaq-from').html(pad(hoursFrom) + ":" + pad(minutesFrom) + ":" + pad(remainingFromSeconds));
            $('#shaq-from-title').html(pad(hoursFrom) + ":" + pad(minutesFrom) + ":" + pad(remainingFromSeconds));
            timerFrom--;
          } else {
            $(".btn-accept-bid").prop("disabled", false);
            $(".btn-decline-bid").prop("disabled", false);
            $('.btn-accept-bid').attr('title', 'Accept Bid !');
            $('.btn-decline-bid').attr('title', 'Decline Bid !');
            clearInterval(window.shaqFromValid);
          }
        }, 1000);
      }
      for (let chat in window.shaq.source) {
        window.chatsInfo[window.shaq.source[chat]] = [];
      }
      for (let chat in window.shaq.target) {
        if ((window.shaq.target[chat] === "UGO") || (window.shaq.target[chat] === "GOSHIPPO")) continue;
        window.chatsInfo[window.shaq.target[chat]] = [];
      }
      getChatMsgs();

      const sort = new Object();
      sort[$('#bid-sorting-field').val()] = $('#bid-sorting-dir').val();
      getBids(sort);

      getNotifMsgs();
      $('#googleMapStart').val(window.shaq.puPlace[2] + ", " + window.shaq.puPlace[3]);
      $('#googleMapEnd').val(window.shaq.dePlace[2] + ", " + window.shaq.dePlace[3]);
      calcRoute();

      if (window.shaq.targetStatus && window.shaq.targetStatus[window.shaq.target.indexOf(usercode)] === "NoSolution") {
        noSolution();

      }
      if (window.shaq.status !== "running") {
        ShaqCompleted(window.shaq.winningbid);
      }
    }
  });

  // function for dynamic sorting
  function compareValues(key, order = 'asc') {
    return function(a, b) {
      let comparison = 0;
      if (a[key] > b[key]) {
        comparison = 1;
      } else if (a[key] < b[key]) {
        comparison = -1;
      }
      return (
        (order == 'desc') ? (comparison * -1) : comparison
      );
    };
  }

  function BidRender(bids) {
    $('#bidCount').text(bids.docs.length);
    for (let bid in bids.docs) {
      window.bids[bids.docs[bid].id] = bids.docs[bid];
      var bidInfo = $("#bid-info").clone();
      bidRefresh(bidInfo, bids.docs[bid]);
      bidInfo.find("#pickup_date").val(bid.puDate);
      bidInfo.appendTo("#bid-list");
      if ((window.shaq.status === "running") && (bids.docs[bid].id === window.shaq.winningbid) && (bids.docs[bid].status == "running")) {
        bidInfo.find('.well').removeClass('well-warning').addClass('well-success');
      }
      window.bidsInfo[bids.docs[bid].id] = bidInfo;
      if ((window.shaq.winningbid === bids.docs[bid].id) && (bids.docs[bid].status == "running")) {
        $('.bid-info-list').find('.well').removeClass("well-success")
        window.bidsInfo[window.shaq.winningbid].find('.well').removeClass('well-warning').addClass('well-success');
      }
    }
  }

  function getBids(orderBy = {
    "price": "asc"
  }) {
    const sort = {
      "status": "desc"
    };

    Object.keys(orderBy).forEach(key => sort[key] = orderBy[key]);

    $.ajax({
      "url": '/api/bid' + solrTarget + '/' + usercode + '/' + shaq + '?rows=100&sort=' + JSON.stringify(sort),
      "dataType": "json",
      "json": "json.wrf",
      "beforeSend": function(xhr) {
        xhr.setRequestHeader("Authorization", "Basic " + authbasic);
      },
      "statusCode": {
        "429": function(xhr) {
          status429();
        }
      },
      "success": function(bids) {
        console.log(bids);
        BidRender(bids);
      }
    });
  }

  function cleanBids() {
    $('#bid-list').empty();
  }

  function cleanMessage() {
    while (window.chatsInfo[window.chatCurrent].length > localSettings.chathistory) {
      window.chatsInfo[window.chatCurrent].shift();
    }
  }

  function AddChatNotification(chat) {
    let d = new Date();
    date = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate() + " " + d.getHours() + ":" + d.getMinutes();
    let pre = '<p><div id="' + chat.id + '" class="chat-container-notification alert alert-danger" align="center"><div class="message"><strong>' + chat.message + '</strong></div><div>' + date + ' - ' + window.shaq.sourceName[window.shaq.source.indexOf(chat.source[0])] + ' (' + chat.from + ') </div></div><p>';
    $('#chat-notifications-container').append(pre);
  }

  function updateChat(chat) {
    let pos = "left";
    let alertclass = "alert-success";
    if (chat.source.includes(usercode)) {
      pos = "right";
      alertclass = "alert-info";
    }
    if (["giveup", "remove", "readd", "readdall", "removeall"].indexOf(chat.channel) >= 0) {
      alertclass = "alert-warning";
      pos = "center";
    }
    let date = moment(new Date()).format("YYYY-MM-DD HH:mm");;
    if (chat.date !== "NOW") date = moment(chat.date).format("YYYY-MM-DD HH:mm");
    let chatName = "";
    if (window.shaq.source.includes(chat.source[0])) chatName = window.shaq.sourceName[window.shaq.source.indexOf(chat.source[0])];
    else chatName = window.shaq.targetName[window.shaq.target.indexOf(chat.source[0])];
    let pre = '<p><div id="' + chat.id + '" class="chat-container alert ' + alertclass + '" align="' + pos + '"><div class="message"><strong>' + chat.subject + '</strong></div><div>' + date + ' - ' + chatName + ' (' + chat.from + ') </div></div><p>';
    for (let target in chat.target) {
      console.log("1" + window.shaq.target[chat]);
      if ((window.shaq.target[chat] === "UGO") || (window.shaq.target[chat] === "GOSHIPPO")) continue;
      if ((chat.target[target] === "UGO") || (chat.target[target] === "GOSHIPPO")) continue;
      console.log("2" + chat.target[target]);
      if (chat.target[target] != usercode) {
        window.chatsInfo[chat.target[target]].push(pre);
        $('#chatBadge-' + chat.target[target]).text(parseInt($('#chatBadge-' + chat.target[target]).text()) + 1);
      } else if (chat.source[0] == usercode) {
        window.chatsInfo[usercode].push(pre);
        $('#chatBadge-' + usercode).text(parseInt($('#chatBadge-' + usercode).text()) + 1);
      }
    }
    for (let source in chat.source) {
      if (chat.source[source] != usercode) {
        window.chatsInfo[chat.source[source]].push(pre);
        $('#chatBadge-' + chat.source[source]).text(parseInt($('#chatBadge-' + chat.source[source]).text()) + 1);
      }
    }
    $('#chatCount').text(parseInt($('#chatCount').text()) + 1);
  }

  function getChatMsgs() {
    $.ajax({
      "url": '/api/chat' + solrTarget + '/' + usercode + '/' + shaq + '?rows=' + localSettings.chathistory + '&sort={"date": "desc"}',
      "dataType": "json",
      "json": "json.wrf",
      "beforeSend": function(xhr) {
        xhr.setRequestHeader("Authorization", "Basic " + authbasic);
      },
      "statusCode": {
        "429": function(xhr) {
          status429();
        }
      },
      "success": function(chats) {
        console.log(chats);
        $('#chatCount').text('0');
        let output = "";
        for (let chat in chats.docs.reverse()) {
          updateChat(chats.docs[chat])
        }
        window.chatCurrent = usercode;
        $('#' + usercode).addClass('btn-danger').find('.badge').addClass('badge-danger');
        switchRoom();
      }
    });
  }

  function getNotifMsgs() {
    $.ajax({
      "url": '/api/notif' + solrTarget + '/' + usercode + '/' + shaq + '?rows=100&sort={"date": "desc"}',
      "dataType": "json",
      "json": "json.wrf",
      "beforeSend": function(xhr) {
        xhr.setRequestHeader("Authorization", "Basic " + authbasic);
      },
      "statusCode": {
        "429": function(xhr) {
          status429();
        }
      },
      "success": function(notifs) {
        console.log(notifs);
        $('#notifCount').text(notifs.docs.length);
        $('#chatBadge-notification').text(notifs.docs.length);
        for (let notif in notifs.docs) {
          let pre = '<p><div id="' + notifs.docs[notif].id + '" class="chat-container-notification alert alert-danger" align="center"><div class="message"><strong>' + notifs.docs[notif].message + '</strong></div><div>' + notifs.docs[notif].date.substring(0, 16).replace('T', ' ') + ' - ' + window.shaq.sourceName[window.shaq.source.indexOf(notifs.docs[notif].source[0])] + ' (' + notifs.docs[notif].from + ') </div></div><p>';
          $('#chat-notifications-container').append(pre);
        }
      }
    });
  }

  socket.on(usercode, function(data) {
    let msg = JSON.parse(data.value);
    let statusMessage = "Unkown";
    switch (msg.type) {
      case "auction":
        if (msg.id === window.shaq.id) {
          window.shaq = msg;
          $("#shaq-valid-date").html(moment(window.shaq.valid_until).format('YYYY-MM-DD HH:mm'));
          $('#shaq-decision-date').html(moment(window.shaq.valid_from).format('YYYY-MM-DD HH:mm'));
          let now = new Date();
          let CurrentDate = now.getTime() + now.getTimezoneOffset() * 60000;
          let validDateFrom = window.shaq.valid_from.substring(0, 16).replace('T', ' ');
          timerFrom = Math.floor(((new Date(validDateFrom).getTime()) - CurrentDate) / 1000);
          if (!window.shaqFromValid) {
            window.shaqFromValid = setInterval(function() {
              var hoursFromLeft = Math.floor(timerFrom);
              var hoursFrom = Math.floor(hoursFromLeft / 3600);
              var minutesFromLeft = Math.floor((hoursFromLeft) - (hoursFrom * 3600));
              var minutesFrom = Math.floor(minutesFromLeft / 60);
              var remainingFromSeconds = timerFrom % 60;
              if (timerFrom >= 0) {
                $('#shaq-from').html(pad(hoursFrom) + ":" + pad(minutesFrom) + ":" + pad(remainingFromSeconds));
                $('#shaq-from-title').html(pad(hoursFrom) + ":" + pad(minutesFrom) + ":" + pad(remainingFromSeconds));
                timerFrom--;
              } else {
                $(".btn-accept-bid").prop("disabled", false);
                $(".btn-decline-bid").prop("disabled", false);
                $('.btn-accept-bid').attr('title', 'Accept Bid !');
                $('.btn-decline-bid').attr('title', 'Decline Bid !');
                clearInterval(window.shaqFromValid);
              }
            }, 1000);
          }
          let validDate = window.shaq.valid_until.substring(0, 16).replace('T', ' ');;
          shaqValiditytimer = Math.floor(((new Date(validDate).getTime()) - CurrentDate) / 1000);
          if (!window.shaqValid) {
            window.shaqValid = setInterval(function() {
              var hoursLeft = Math.floor(shaqValiditytimer);
              var hours = Math.floor(hoursLeft / 3600);
              var minutesLeft = Math.floor((hoursLeft) - (hours * 3600));
              var minutes = Math.floor(minutesLeft / 60);
              var remainingSeconds = shaqValiditytimer % 60;
              if (shaqValiditytimer > 0) {
                $('#shaq-valid').html(pad(hours) + ":" + pad(minutes) + ":" + pad(remainingSeconds));
                shaqValiditytimer--;
              } else {
                clearInterval(window.shaqValid);
              }
            }, 1000);
          }
          $('#shaq-status').attr("title", msg.status);
          for (let targetStatus in msg.targetStatus) {
            switch (msg.targetStatus[targetStatus]) {
              case "Removed":
                $("#bidderList_" + msg.target[targetStatus]).addClass("text-warning");
                $("#bidderList_" + msg.target[targetStatus]).find('span').removeClass('glyphicon-remove').addClass('glyphicon-ok');
                break;
              case "NoSolution":
                noSolution();
                $("#bidderList_" + msg.target[targetStatus]).addClass("text-danger");
                break;
              default:
                $("#bidderList_" + msg.target[targetStatus]).removeClass("text-warning");
                $("#bidderList_" + msg.target[targetStatus]).find('span').addClass('glyphicon-remove').removeClass('glyphicon-ok');
                break;
            }
          }
          if ((msg.winningbid === "") && (msg.bestbid !== "")) {
            window.bestbid = msg.bestbid;
            $('.bid-info-list').find('.well').removeClass("well-success").not('.well-danger').addClass("well-warning");
            $('#bid-add').find('.well').removeClass("well-warning");
            if (window.bidsInfo[window.shaq.bestbid]) {
              window.bidsInfo[window.shaq.bestbid].find('.well').removeClass("well-warning").addClass("well-success");
            }
          }
        }
        break;
      case "bid":
        if (msg.key !== shaq) break;
        if (window.bids[msg.id]) {
          bidRefresh(window.bidsInfo[msg.id], msg);
        } else {
          let bidInfo = $("#bid-info").clone();
          window.bidsInfo[msg.id] = bidInfo;
          bidRefresh(bidInfo, msg);
          $('#bidCount').text(parseInt($('#bidCount').text()) + 1);
          bidInfo.appendTo("#bid-list");
        }
        if ($("#InformationModal").is(':visible')) setTimeout(function() { $("#InformationModal").modal('hide') }, 1000);
        window.bids[msg.id] = msg;
        if (msg.status === "accepted") {
          ShaqCompleted(msg.id);
        } else {
          $('.bid-info-list').find('.well').removeClass("well-success").not('.well-danger').addClass("well-warning");
          $('#bid-add').find('.well').removeClass("well-warning");
          if (window.bidsInfo[window.bestbid]) {
            window.bidsInfo[window.bestbid].find('.well').removeClass("well-warning").addClass("well-success");
          }
        }
        break;
      case "message":
        if (msg.key !== window.shaq.key) break;
        if ($('#' + msg.id).length) break;
        $(".btn-send-message").attr("disabled", false);
        updateChat(msg);
        switchRoom();
        break;
      case "notification":
        if (msg.action === "clear") break;
        if ((msg.action === "archive") && (msg.id === window.shaq.id)) {
          setTimeout(function() {
            $('.header-content').hide();
            $('#not-found-message-text').html('<a href="' + window.location.href.replace("#", "").replace("?type=", "") + '?type=-archive">Shaq has been closed</a>');
            $('#not-found-message').removeClass('hide');
            $("#InformationModal").modal('hide');
          }, 1000);
          break;
        }
        if (msg.key !== window.shaq.key) break;
        if ($('#' + msg.id).length) break;
        AddChatNotification(msg);
        $('#notifCount').text(parseInt($('#notifCount').text()) + 1);
        $('#chatBadge-notification').text(parseInt($('#chatBadge-notification').text()) + 1);
        $('#chatBadge-notification').addClass("badge-danger");
        switchRoom();
    }
  });

  function updateBid(bidData) {
    $.ajax({
      "url": "/api/bid/" + usercode + "/" + shaq,
      "type": "POST",
      "dataType": "json",
      "contentType": "application/json",
      "json": "json.wrf",
      "data": bidData,
      "beforeSend": function(xhr) {
        xhr.setRequestHeader("Authorization", "Basic " + authbasic);
      },
      "statusCode": {
        "429": function(xhr) {
          status429();
        }
      },
      "success": function(msgs) {
        gtag('event', 'Bid', {
          'event_category': 'BidUpdate',
          'event_label': usercode,
          'value': JSON.stringify(bidData)
        });
      }
    });
  }

  function sendMessageAll() {
    let dataSendMessageAll = {
      "id": uuidv4(),
      "date": "NOW",
      "subject": shaq,
      "message": $('#chatNotifyModal-message').val(),
      "from": username,
      "category": "shaq",
      "key": shaq,
      "source": [usercode],
      "target": [usercode],
      "type": "notification",
      "status": "sent",
      "channel": ["message", "mail"],
      "flags": ""
    };
    $.ajax({
      "url": "/api/notif/" + usercode + "/" + shaq,
      "type": "POST",
      "dataType": "json",
      "contentType": "application/json",
      "json": "json.wrf",
      "data": JSON.stringify([dataSendMessageAll]),
      "beforeSend": function(xhr) {
        xhr.setRequestHeader("Authorization", "Basic " + authbasic);
      },
      "statusCode": {
        "429": function(xhr) {
          status429();
        }
      },
      "success": function(msg) {
        gtag('event', 'Notification', {
          'event_category': 'NotificationCreate',
          'event_label': usercode,
          'value': JSON.stringify(dataSendMessageAll)
        });
      }
    });
  }

  function sendBid() {
    let loaded = "No";
    if ($('#bid-add').find('.bidLoaded input').is(":checked")) loaded = "Yes";
    let driver = "1";
    if ($('#bid-add').find('.bidDriver input').is(":checked")) driver = "2";
    let bidstatus = "running";
    if (window.shaq.getitnow && window.shaq.getitnow >= parseFloat($('#amount').val())) bidstatus = "accepted";
    let dataSendBid = {
      "id": uuidv4(),
      "reported_at": "NOW",
      "key": shaq,
      "from": username,
      "source": [usercode],
      "target": window.shaq.source,
      "type": "bid",
      "logo": logourl + usercode + ".png",
      "status": bidstatus,
      "auction": window.shaq.source[0],
      "valid_until": $('#validitydate').val().replace(' ', 'T') + ":00.000Z",
      "vehicule": $('#vehicle_type').val(),
      "loaded": loaded,
      "price": parseFloat($('#amount').val()).toFixed(2),
      "puDate": $('#pickupdate').val().replace(' ', 'T') + ":00.000Z",
      "deDate": $('#deliverydate').val().replace(' ', 'T') + ":00.000Z",
      "lang": $('#driver-language').val(),
      "currency": $('#currency').val(),
      "driver": driver
    };
    $.ajax({
      "url": "/api/bid/" + usercode + "/" + shaq,
      "type": "POST",
      "dataType": "json",
      "contentType": "application/json",
      "json": "json.wrf",
      "data": JSON.stringify([dataSendBid]),
      "beforeSend": function(xhr) {
        xhr.setRequestHeader("Authorization", "Basic " + authbasic);
      },
      "statusCode": {
        429: function(xhr) {
          status429();
        },
        406: function() {
          if ($("#InformationModal").is(':visible')) $("#InformationModal").modal('hide');
          $.notify({
            icon: 'glyphicon glyphicon-warning-sign',
            title: "Bid : ",
            message: "Max Bids Reached !"
          }, {
            delay: 3000,
            timer: 1000,
            offset: {
              y: 50,
              x: 20
            },
            animate: {
              enter: 'animated fadeInDown',
              exit: 'animated fadeOutUp'
            },
            type: "warning",
            placement: {
              from: 'top',
              align: 'left'
            }
          });
        },
        200: function(msgs) {
          gtag('event', 'Bid', {
            'event_category': 'BidCreate',
            'event_label': usercode,
            'value': JSON.stringify(dataSendBid)
          });
          $("#amount").attr("disabled",false);
        }
      }
    });
  }

  function switchRoom() {
    cleanMessage();
    $('#chat-messages-room').html(window.chatsInfo[window.chatCurrent]);
    $('#chat-msg-text').val('');
    $("#chat-all-messages-container").animate({
      scrollTop: $(document).height()
    }, "fast");
  }

  $("#chat-msg-text").keypress(function(event) {
    if (event.keyCode == 13) {
      $('.btn-send-message').click();
    }
  });

  $("#amount").keypress(function(event) {
    if (event.keyCode === 13) {
      $("#amount").attr("disabled", true);
      $("#InformationModalText").html('   <div class="loader"></div>&nbsp;&nbsp;&nbsp;<span>Sending Offer...</span>');
      $("#InformationModalCloseBtn").attr("disabled", true);
      $("#InformationModal").modal('show');
      sendBid();
    }
  });

  $('#readdall').on('click', function() {
    readdallbidders();
  });

  $('#removeall').on('click', function() {
    removeallbidders();
  });

  $("#shaq-print").on('click', function() {
    window.print();
  });

  $('#shaq-valid li a').on('click', function() {
    console.log();
  });

  $("#chatNotifyModal-send").on('click', function() {
    sendMessageAll();
    $('#chatNotifyModal-message').val("");
  });

  $('#bid-add').find('.bidDriver input').on('change', function() {
    $('#bid-add').find('.bidDriver').toggleClass('btn-info');
  });

  $('#bid-add').find('.bidLoaded input').on('change', function() {
    $('#bid-add').find('.bidLoaded').toggleClass('btn-info');
  });

  $(document).on('click', '.btn', function() {
    if ($(this).attr('id') === "shaq-status") {
      $("#InformationModalText").html('   <div class="loader"></div>&nbsp;&nbsp;&nbsp;<span>Closing Shaq</span>');
      $("#InformationModalCloseBtn").attr("disabled", true);
      $("#InformationModal").modal('show');
      $.ajax({
        "url": "/api/shaq/" + usercode + "/cancel/" + shaq,
        "type": "POST",
        "dataType": "json",
        "contentType": "application/json",
        "beforeSend": function(xhr) {
          xhr.setRequestHeader("Authorization", "Basic " + authbasic);
        },
        "success": function(msgs) {
          gtag('event', 'Shaq', {
            'event_category': 'ShaqCancelled',
            'event_label': usercode,
            'value': JSON.stringify(data)
          });
        }
      });
    }
    if ($(this).hasClass('btn-bid')) {
      if ($(this).hasClass('btn-decline-bid')) window.bids[$(this).data("btn-bid-id")].status = "declined";
      if ($(this).hasClass('btn-cancel-bid')) window.bids[$(this).data("btn-bid-id")].status = "cancelled";
      if ($(this).hasClass('btn-accept-bid')) window.bids[$(this).data("btn-bid-id")].status = "accepted";

      if ($(this).hasClass('btn-no-solution-bid')) {
        $("#InformationModalText").html('   <div class="loader"></div>&nbsp;&nbsp;&nbsp;<span>Giving Up...</span>');
        $("#InformationModalCloseBtn").attr("disabled", true);
        $("#InformationModal").modal('show');
        let data = {
          target: usercode,
          type: "notification",
          action: "giveup"
        };
        $.ajax({
          "url": '/api/shaq/' + usercode + '/giveup/' + window.shaq.key,
          "method": "POST",
          "dataType": "json",
          "contentType": "application/json",
          "data": JSON.stringify(data),
          "beforeSend": function(xhr) {
            xhr.setRequestHeader("Authorization", "Basic " + authbasic);
          },
          "statusCode": {
            "429": function(xhr) {
              status429();
            }
          },
          "success": function(json) {
            sendMessage({
              "id": uuidv4(),
              "date": "NOW",
              "subject": "No Solution !",
              "message": "No Solution !",
              "from": username,
              "channel": "giveup",
              "key": window.shaq.key,
              "source": [usercode],
              "target": [target],
              "type": "message",
              "status": "sent"
            });
            gtag('event', 'Bid', {
              'event_category': 'BidGiveUp',
              'event_label': usercode,
              'value': JSON.stringify(data)
            });
          }
        });
      }

      if ($(this).hasClass('get-it-now-text') || $(this).hasClass('btn-getitnow-bid')) {
        if (window.shaq.getitnow) {
          $('#amount').val(window.shaq.getitnow);
          $("#InformationModalText").html('   <div class="loader"></div>&nbsp;&nbsp;&nbsp;<span>Sending Offer...</span>');
          $("#InformationModalCloseBtn").attr("disabled", true);
          $("#InformationModal").modal('show');
          sendBid();
        }
      }

      if ($(this).hasClass('btn-create-bid')) {
        if ($('#amount').val()) {
          $("#InformationModalText").html('   <div class="loader"></div>&nbsp;&nbsp;&nbsp;<span>Sending Offer...</span>');
          $("#InformationModalCloseBtn").attr("disabled", true);
          $("#InformationModal").modal('show');
          sendBid();
          $('#amount').removeClass("has-error");
        } else {
          $('#amount').addClass("has-error");
          setTimeout(function() {
            $('#amount').removeClass("has-error");
          }, 2000)
        }
      }

      if (!$(this).hasClass('btn-create-bid') && !$(this).hasClass('btn-no-solution-bid')) {
        delete window.bids[$(this).data("btn-bid-id")]["_version_"];
        $("#InformationModalText").html('   <div class="loader"></div>&nbsp;&nbsp;&nbsp;<span>Updating Offer...</span>');
        $("#InformationModalCloseBtn").attr("disabled", true);
        $("#InformationModal").modal('show');
        updateBid(JSON.stringify([window.bids[$(this).data("btn-bid-id")]]));
      }
    }
    if ($(this).hasClass('showPackage')) {
      $(this).find('.btn-message-extend-glyphicon').toggleClass('glyphicon-triangle-bottom').toggleClass('glyphicon-triangle-top');
      $('#packageList').toggleClass('hide');
    }
    if ($(this).hasClass('hideMessage')) {
      $(this).find('.btn-message-extend-glyphicon').toggleClass('glyphicon-triangle-bottom').toggleClass('glyphicon-triangle-top');
      $('#message-body').toggleClass('hide');
    }
    if ($(this).hasClass('btn-bid-extend')) {
      $(this).find('.btn-bid-extend-glyphicon').toggleClass('glyphicon-triangle-bottom').toggleClass('glyphicon-triangle-top');
      let bidIdDetail = $(this).find('.btn-bid-extend-glyphicon').data('bid-id-to-extend');
      $(window.bidsInfo[bidIdDetail]).find('.btn-bid-extend-detail').toggleClass('hide');
    }
    if ($(this).hasClass('showAllBids')) {
      showAllbids = !showAllbids;
      if (!showAllbids) $('.bid-info-list .well.well-danger').parent('.bid-info-list').addClass('hide');
      else $('.bid-info-list .well.well-danger').parent('.bid-info-list').removeClass('hide');
    }
    if ($(this).hasClass('notifyAllBidders')) {
      $("#chatNotifyModal").modal();
    }
    if ($(this).hasClass('btn-send-message')) {
      if (window.chatCurrent && ($('#chat-msg-text').val() !== "")) {
        $(".btn-send-message").attr("disabled", true);
        sendMessage();
      }
    }
    if ($(this).hasClass('btn-room')) {
      $('.btn-room').removeClass('btn-danger');
      $(this).addClass('btn-danger');
      if ($(this).attr('id') === "Notifications-Chat") {
        $('#chat-notifications-container').removeClass('hide');
        $('#chat-messages-container').addClass('hide');
        $(".btn-room .badge").removeClass("badge-danger");
        $(this).find(".badge").addClass("badge-danger");
        $('.chat-container').addClass("hide");
        $('.chat-container-notification').removeClass("hide");
      } else {
        $('#chat-notifications-container').addClass('hide');
        $('#chat-messages-container').removeClass('hide');
        $(".btn-room .badge").removeClass("badge-danger");
        $('.chat-container').removeClass("hide");
        $('.chat-container-notification').addClass("hide");
        $(this).find(".badge").addClass("badge-danger");
        window.chatCurrent = $(this).attr('id');
        switchRoom();
      }
    }
  });
  $('#bid-add #pickupdate').on('change', function(event) {
    $('#bid-add .bidTransitTime').text(TransitCalc($('#bid-add #pickupdate').val(), $('#bid-add #deliverydate').val(), window.shaq.puPlace[4], window.shaq.dePlace[4]));
  });
  $('#bid-add #deliverydate').on('change', function(event) {
    $('#bid-add .bidTransitTime').text(TransitCalc($('#bid-add #pickupdate').val(), $('#bid-add #deliverydate').val(), window.shaq.puPlace[4], window.shaq.dePlace[4]));
  });
  $('#bid-sorting-field').on('change', function(event) {
    cleanBids();
    const sort = new Object();
    sort[event.target.value] = $('#bid-sorting-dir').val();
    let Bids = [];
    for (let Bid in window.bids) {
      Bids.push(window.bids[Bid]);
    }
    Bids.sort(compareValues(event.target.value, sort[event.target.value]));
    let RenderBid = {};
    RenderBid.docs = [];
    for (let Bid in Bids) {
      RenderBid.docs.push(Bids[Bid]);
    }
    BidRender(RenderBid);
  });

  $('#bid-sorting-dir').on('click', function() {
    const button = $(this);

    if (button.val() == 'asc') {
      button.children().removeClass('glyphicon-sort-by-attributes').addClass('glyphicon-sort-by-attributes-alt');
      button.val('desc');
    } else {
      button.children().removeClass('glyphicon-sort-by-attributes-alt').addClass('glyphicon-sort-by-attributes');
      button.val('asc');
    }

    $('#bid-sorting-field').change();
  });
});
