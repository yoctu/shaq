const shaqurl = window.location.origin + "/";
var shaq = {}

function displayShaq(shaqrow) {
  let dHtml = "";
  let color = '';
  if (["cancelled", "expired"].includes(shaqrow.status)) color = 'style="border-left-color:#ffc107";"';
  if (shaqrow.status === "completed") color = 'style="border-left-color:#5cb85c";"';
  dHtml += '<div class="row" style="padding-top:10px;"><div class="row">';
  let date = new Date(shaqrow.reported_at)
  let reported = date.getFullYear() + "-" + date.getMonth().toString().padStart(2, '0') + "-" + date.getDate().toString().padStart(2, '0') + " " + date.getHours().toString().padStart(2, '0') + ":" + date.getMinutes().toString().padStart(2, '0');
  dHtml += '<div class="col-xs-7 col-sm-7" style="padding-right: 5px;padding-left: 5px;"><a onclick=\'showShaq(\"' + shaqrow.id + '\");\' style="cursor:pointer;"><b>' + reported + '</b></a></div>';
  dHtml += '<div class="col-xs-2 col-sm-2"><img src="/img/' + shaqrow.creator + '.png" width="32"/></div>';
  dHtml += '<div class="col-xs-3 col-sm-3" style="padding-top:5px;"><br></div>';
  dHtml += '</div>';
  dHtml += '<div class="row sb_' + shaqrow.id + '" style="display:block;">';
  dHtml += '<div class="col-xs-2 col-sm-2" style="padding-top:20px;"><span class="fas fa-industry" style="font-size:32px;"></span></div>';
  dHtml += '<div class="col-xs-10 col-sm-4" style="padding-top:10px;">' + shaqrow.puPlace[0].toString() + '<br>' + shaqrow.puPlace.slice(1, 4).toString() + '<br>' + shaqrow.puDate.substring(0, 16).replace('T', ' ') + '</div>';
  dHtml += '<div class="col-xs-2 col-sm-2" style="padding-top:20px;"><span class="fas fa-city" style="font-size:32px;"></span></div>';
  dHtml += '<div class="col-xs-10 col-sm-4" style="padding-top:10px;">' + shaqrow.dePlace[0].toString() + '<br>' + shaqrow.dePlace.slice(1, 4).toString() + '<br>' + shaqrow.deDate.substring(0, 16).replace('T', ' ') + '</div>';
  dHtml += '<div class="col-xs-2 col-sm-2" style="padding-top:20px;"><span class="fas fa-user" style="font-size:32px;"></span></div>';
  dHtml += '<div class="col-xs-10 col-sm-4" style="padding-top:10px;">' + shaqrow.puContact[0] + '<br>' + shaqrow.puContact[1] + '<br>' + shaqrow.puContact[2] + '<br>' + shaqrow.puContact[3] + '</div>';
  dHtml += '<div class="col-xs-2 col-sm-2" style="padding-top:20px;"><span class="far fa-user" style="font-size:32px;"></span></div>';
  dHtml += '<div class="col-xs-10 col-sm-4" style="padding-top:10px;">' + shaqrow.deContact[0] + '<br>' + shaqrow.deContact[1] + '<br>' + shaqrow.deContact[2] + '<br>' + shaqrow.deContact[3] + '</div>';
  dHtml += '<div class="col-xs-12 col-sm-12"> <br> </div>';
  dHtml += '<div class="col-xs-2 col-sm-2"><span class="glyphicon glyphicon-inbox" style="font-size:32px;"></div>';
  dHtml += '<div class="col-xs-10 col-sm-10">' + shaqrow.dimension[1] + ' / ' + shaqrow.dimension[2] + ' / ' + shaqrow.dimension[3] + ' / ' + shaqrow.dimension[4] + '</div>';
  dHtml += '</div>';
  return dHtml;
}

function shaq2go() {
  puDate = $('#dppu').datepicker('getDate').toISOString().substring(0, 11) + "11:00:00.000Z";
  deDate = $('#dpde').datepicker('getDate').toISOString().substring(0, 11) + "11:00:00.000Z";
  validFrom = new Date();
  validUntil = new Date();
  validFrom.setMinutes(validFrom.getMinutes() + 1);
  validUntil.setMinutes(validUntil.getMinutes() + 15);
  var key = uuidv4().substring(0, 18).replace(/-/g, '');
  shaq = {
    creator: 'DEMO',
    deContact: [$("#form-contact-to-company").val(), $("#form-contact-to-name").val(), $("#form-contact-to-email").val(), $("#form-contact-to-phone").val()],
    deDate: deDate,
    dePlace: [To.address1, To.postcode, To.city, To.country_code, To.country_code],
    deLocation: To.location,
    dimension: ["1", $('#form-length').val(), $('#form-width').val(), $('#form-height').val(), $('#form-weight').val(), "no"],
    id: id,
    key: key,
    name: key,
    notes: "Nothing",
    puContact: [$("#form-contact-from-company").val(), $("#form-contact-from-name").val(), $("#form-contact-from-email").val(), $("#form-contact-from-phone").val()],
    puDate: puDate,
    puPlace: [From.address1, From.postcode, From.city, From.country_code, From.country_code],
    puLocation: From.location,
    reported_at: new Date().toISOString(),
    source: [auth.auth.usercode],
    target: [],
    stackable: "No",
    visible: "public",
    valid_from: validFrom.toISOString(),
    valid_until: validUntil.toISOString(),
    currency: "EUR"
  };
  shaq.distance = parseInt(window.geolib.getDistance({
    latitude: shaq.puLocation.split(',')[0],
    longitude: shaq.puLocation.split(',')[1]
  }, {
    latitude: shaq.deLocation.split(',')[0],
    longitude: shaq.deLocation.split(',')[1]
  }) / 1000)
  $("#shaq2go").html(displayShaq(shaq));
}

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0,
      v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}


jQuery(document).ready(function() {

  $('#skoreway-shaq').on('click', function() {
    informShow('<div class="text-center">Creating auction...</div>', false);

    shaq2go();
    $.ajax({
      "url": 'https://' + auth.auth.usercode + '.shaq' + auth.auth.env + '.yoctu.solutions/api/shaq/' + auth.auth.usercode,
      "method": "POST",
      "dataType": "json",
      "contentType": "application/json",
      "data": JSON.stringify([shaq]),
      "headers": {
        "redspher-auth": "yes",
        "app-key": auth.auth.userkey,
        "Authorization": "Basic " + auth.auth.authbasic
      },
      "statusCode": {
        "429": function(xhr) {
          status429();
        }
      },
      "statusCode": {
        "406": function(xhr) {
          status406();
        }
      },
      "success": function(json) {
        setTimeout("window.close()", 1000);
      }
    })
  });

});
