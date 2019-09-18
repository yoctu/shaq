$(document).ready(function() {
  var isMobile = false;
  var animating = false;
  var decisionVal = 80;
  var pullDeltaX = 0;
  var deg = 0;
  var bidCards = [];
  var $card;

  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) isMobile = true;

  function pullChange() {
    animating = true;
    deg = pullDeltaX / 10;
    $card.css("transform", "translateX(" + pullDeltaX + "px) rotate(" + deg + "deg)");
    var opacity = pullDeltaX / 200;
    if (1 - Math.abs(opacity) < 1) {
      $card.css("opacity",1 - Math.abs(opacity));
      if (opacity < 0) $card.css("background-color", "red");
      else $card.css("background-color", "green");
    }
    if (window.shaq.source.includes(usercode)) {
      if (!bidCards[$card]) {
        if (opacity < -1) {
          bidCards[$card] = true;
          $card.find('.btn-decline-bid').click();
          $card.addClass("hide");
        }
        if (opacity > 1) {
          bidCards[$card] = true;
          $card.find('.btn-accept-bid').click();
          $card.addClass("hide");
        }
      }
    } else {
      if (Math.abs(opacity) > 1) {
        if (!bidCards[$card]) {
          bidCards[$card] = true;
          $card.find('.btn-cancel-bid').click();
          $card.addClass("hide");
        }
      }
    }

  };

  function release() {
    if (pullDeltaX >= decisionVal) {
      $card.css("transform","translateX(30rem) rotate(30deg) !important");
    } else if (pullDeltaX <= -decisionVal) {
      $card.css("transform","translateX(-30rem) rotate(-30deg) !important");
    }
    if (Math.abs(pullDeltaX) < decisionVal) {
      $card.css("transition","transform 0.3s");
      $card.css("transform","translateX(0) !important");
    }
    setTimeout(function() {
      $card.attr("style", "").removeClass("reset")
        .find(".demo__card__choice").attr("style", "");
      pullDeltaX = 0;
      animating = false;
    }, 300);
  };

  $(document).on("mousedown touchstart", ".bid-info-list:not(.inactive)", function(e) {
    if (animating) return;
    if (!isMobile) return;
    let CurrentDateFrom = new Date(window.shaq.valid_from.substring(0, 16).replace('T', ' '));
    let CurrentDate = new Date().getTime() + CurrentDateFrom.getTimezoneOffset() * 60000;
    if ((CurrentDateFrom > CurrentDate) && window.shaq.source.includes(usercode)) return;
    $card = $(this);
    if (window.bids[$card.find(".bidBidderId").text()].status != "running" ) return;
    bidCards[$card] = false;
    var startX = e.pageX || e.originalEvent.touches[0].pageX;
    $(document).on("mousemove touchmove", function(e) {
      var x = e.pageX || e.originalEvent.touches[0].pageX;
      pullDeltaX = (x - startX);
      if (!pullDeltaX) return;
      pullChange();
    });
    $(document).on("mouseup touchend", function() {
      $(document).off("mousemove touchmove mouseup touchend");
      if (!pullDeltaX) return;
      release();
    });
  });

});
