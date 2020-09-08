var SolrTarget = new URLSearchParams(location.search).has('type') ? new URLSearchParams(location.search).get('type') : "";
const FromType = new URLSearchParams(location.search).has('from') ? new URLSearchParams(location.search).get('from') : "";
const SfuKey = new URLSearchParams(location.search).has('key') ? new URLSearchParams(location.search).get('key') : "";
const VehiclePlace = new URLSearchParams(location.search).has('plate') ? new URLSearchParams(location.search).get('plate') : "";

var Transport = {}
var Position = {}
Position.longitude = 6.05
Position.latitude = 49.1833
Position.info = 'bh home'

var Entity = 'tracks'
if (FromType === 'carrier') Entity = 'transports'
if (VehiclePlace !== '') $('#eventPage').removeClass('hide')

function displayEventBtn() {
  if (VehiclePlace === '') return
  $('#sfu-event-btn-start').addClass('hide')
  $('#sfu-event-btn-pickup').addClass('hide')
  $('#sfu-event-btn-pickedup').addClass('hide')
  $('#sfu-event-btn-deliver').addClass('hide')
  $('#sfu-event-btn-delivered').addClass('hide')
  switch (Transport.state) {
    case 'PLANNED':
      $('#sfu-event-btn-start').removeClass('hide')
      break
    case 'RUNNING':
    case 'DELAYED':
      $('#sfu-event-btn-pickup').removeClass('hide')
      //$('#sfu-event-btn-pickedup').removeClass('hide')
      $('#sfu-event-btn-deliver').removeClass('hide')
      //$('#sfu-event-btn-delivered').removeClass('hide')
      break
  }
}

function displayPackage() {
  let dim = Transport.packages_loaded;
  let totaldim = [0, 0, 0];
  let dimWeight = 0

  $('#packageList').find('.packageClone').remove()

  for (const d in dim) {
    let dimUnit = [];
    dimUnit[0] = "<b>Lenght</b> : " + dim[d].length + ' cm';
    dimUnit[1] = "<b>Width</b> : " + dim[d].width + ' cm';
    dimUnit[2] = "<b>Height</b> : " + dim[d].height + ' cm';
    let dimWeight = "<b>Weight</b> : " + dim[d].weight + ' kgs';
    if (localSettings.unit === "Imperial") {
      dimUnit[0] = "<b>Lenght</b> : " + (Math.ceil(dim[d].length * 39.37) / 100) + ' inches'
      dimUnit[1] = "<b>Width</b> : " + (Math.ceil(dim[d].width * 39.37) / 100) + ' inches'
      dimUnit[2] = "<b>Height</b> : " + (Math.ceil(dim[d].height * 39.37) / 100) + ' inches';
    }
    totaldim[0] += dim[d].quantity
    totaldim[1] += dim[d].weight
    totaldim[2] += parseInt(dim[d].quantity) * (parseFloat(dim[d].length) * parseFloat(dim[d].width) * parseFloat(dim[d].height));
    if (localSettings.weight === "Pounds") dimWeight = "<b>Weight</b> : " + (Math.ceil(dim[d].weight * 220.46) / 100) + ' pounds';
    //if (d > 0) {
      let pkgInfo = $('#packages-well-template').clone();
      pkgInfo.addClass('packageClone')
      pkgInfo.find('.sfu-pkg-number').html(dim[d].quantity);
      pkgInfo.find('.sfu-pkg-dimension-lenght').html(dimUnit[0]);
      pkgInfo.find('.sfu-pkg-dimension-width').html(dimUnit[1]);
      pkgInfo.find('.sfu-pkg-dimension-height').html(dimUnit[2]);
      pkgInfo.find('.sfu-pkg-dimension-weight').html(dimWeight);
      pkgInfo.find('.sfu-pkg-stackable').html(dim[d].stackable);
      pkgInfo.find('.sfu-pkg-notes').html(dim[d].state);
      if (dim[d].state.match('DELAYED')) pkgInfo.find('.sfu-pkg-notes').addClass('text-danger')
      else pkgInfo.find('.sfu-pkg-notes').removeClass('text-danger')
      pkgInfo.removeClass('hide')
      $('#packageList').append(pkgInfo);
    /*} else {
      $('.sfu-pkg-number').html(dim[d].quantity);
      $('.sfu-pkg-dimension-lenght').html(dimUnit[0]);
      $('.sfu-pkg-dimension-width').html(dimUnit[1]);
      $('.sfu-pkg-dimension-height').html(dimUnit[2]);
      $('.sfu-pkg-dimension-weight').html(dimWeight);
      $('.sfu-pkg-stackable').html(dim[d].stackable ? 'yes' : 'no');
      $('.sfu-pkg-notes').html(dim[d].state);
      if (dim[d].state.match('DELAYED')) $('.sfu-pkg-notes').addClass('text-danger')
      else $('.sfu-pkg-notes').removeClass('text-danger')
    }*/
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
  $("#sfu-total-package").html(totaldim[0]);
  $("#sfu-total-weight").html(totaldim[1] + " " + totalUnitWeight);
  $("#sfu-total-volume").html(totaldim[2].toFixed(3) + " " + totalUnitCubed);
}

function displayTransport() {
  calcRoute(Transport.starting_point.address_city + ", " + Transport.starting_point.address_country, Transport.destination_point.address_city + ", " + Transport.destination_point.address_country);
  $('#sfu-name').html(Transport.key)
  $('#sfu-shipper').html(Transport.shippers_name)
  $('#sfu-carrier').html(Transport.vehicle_owner_name)
  $('#sfu-status-event').html(Transport.state)
  if (Transport.state === 'DELAYED') $('#sfu-status-event').addClass('text-danger')
  else $('#sfu-status-event').removeClass('text-danger')
  $("#tmslogo").attr('src', auth.app.logourl + Transport.creator + ".png");

  $('#sfu-vehicle-type').html(Transport.vehicle_type)
  $('#sfu-vehicle-plate').html(Transport.vehicle)
  $('#sfu-transportmode').html('NA')
  $('#sfu-incoterm').html('NA')
  $('#sfu-notes').html('NA')

  $('#sfu-pudate-range-div').html(moment(Transport.starting_point.arrival_at).tz('UTC').format('YYYY-MM-DD HH:mm'));
  $('#sfu-pudate-range').html(moment(Transport.starting_point.departure_at).tz('UTC').format('YYYY-MM-DD HH:mm'));
  $('#sfu-dedate-range-div').html(moment(Transport.destination_point.arrival_at).tz('UTC').format('YYYY-MM-DD HH:mm'));
  $('#sfu-dedate-range').html(moment(Transport.destination_point.departure_at).tz('UTC').format('YYYY-MM-DD HH:mm'));

  $("#sfu-puplace").html(Transport.starting_point.address_street + '<br>');
  $("#sfu-puplace").append(Transport.starting_point.address_zip_code + ' ' + Transport.starting_point.address_city + '<br>');
  $("#sfu-puplace").append(Transport.starting_point.address_country + '   <img width="24px" title="' + Transport.starting_point.address_country + '" src="https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.2.1/flags/4x3/' + Transport.starting_point.address_country.toLowerCase() + '.svg" class="pull-right" /><br>');
  $("#sfu-deplace").html(Transport.destination_point.address_street + '<br>');
  $("#sfu-deplace").append(Transport.destination_point.address_zip_code + ' ' + Transport.destination_point.address_city + '<br>');
  $("#sfu-deplace").append(Transport.destination_point.address_country + '   <img width="24px" title="' + Transport.destination_point.address_country + '" src="https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.2.1/flags/4x3/' + Transport.destination_point.address_country.toLowerCase() + '.svg" class="pull-right" /><br>');

  $("#sfu-puContactCompany").html(Transport.starting_point.contact_company);
  $("#sfu-puContactName").html(Transport.starting_point.contact_name);
  $("#sfu-puContactPhone").html(Transport.starting_point.contact_phone);
  $("#sfu-puContactEmail").html(Transport.starting_point.contact_email);

  $("#sfu-deContactCompany").html(Transport.starting_point.contact_company);
  $("#sfu-deContactName").html(Transport.starting_point.contact_name);
  $("#sfu-deContactPhone").html(Transport.starting_point.contact_phone);
  $("#sfu-deContactEmail").html(Transport.starting_point.contact_email);

  const myLatlng = new google.maps.LatLng(Position.latitude, Position.longitude);
  const marker = new google.maps.Marker({
    position: myLatlng,
    map: map,
    title: Position.info,
    icon: {
      url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png"
    }
  });
  marker.setMap(map);
}

$(document).ready(function() {
  $.ajax({
    "url": 'https://' + auth.auth.usercode + '.shaq' + auth.auth.env + '.yoctu.solutions/api/' + Entity + '/' + auth.auth.usercode + '/' + SolrTarget + '?key=' + SfuKey,
    "method": "GET",
    "dataType": "json",
    "contentType": "application/json",
    "headers": {
      "redspher-auth": "yes",
      "Authorization": "Basic " + auth.auth.authbasic
    },
    "statusCode": {
      "200": function(transport) {
        if (transport.numFound === 1) {
          Transport = transport.transports[0]
          displayEventBtn()
          displayTransport()
          displayPackage()
        } else console.log('transport result error')
      }
    }
  })

  $('#sfu-event-btn-sos').on('click', function() {})

  $('#sfu-event-btn-late').on('click', function() {
    $.ajax({
      "url": 'https://' + auth.auth.usercode + '.shaq' + auth.auth.env + '.yoctu.solutions/api/' + Entity + '/' + auth.auth.usercode + '/' + Transport.id + '/late',
      "method": "POST",
      "dataType": "json",
      "contentType": "application/json",
      "statusCode": {
        "202": function(result) {
          Transport.state = 'DELAYED'
          for (const p in Transport.packages_loaded) Transport.packages_loaded[p].state = 'DELAYED'
          displayEventBtn()
          displayTransport()
          displayPackage()
        }
      }
    })
  })

  $('#sfu-event-btn-start').on('click', function() {
    $.ajax({
      "url": 'https://' + auth.auth.usercode + '.shaq' + auth.auth.env + '.yoctu.solutions/api/' + Entity + '/' + auth.auth.usercode + '/' + Transport.id + '/packages-picked-up',
      "method": "POST",
      "dataType": "json",
      "contentType": "application/json",
      "statusCode": {
        "202": function(result) {
          Transport.state = 'RUNNING'
          for (const p in Transport.packages_loaded) Transport.packages_loaded[p].state = 'PICKED UP'
          displayEventBtn()
          displayTransport()
          displayPackage()
        }
      }
    })
  })

  $('#sfu-event-btn-pickup').on('click', function() {
    $.ajax({
      "url": 'https://' + auth.auth.usercode + '.shaq' + auth.auth.env + '.yoctu.solutions/api/' + Entity + '/' + auth.auth.usercode + '/' + Transport.id + '/packages-picked-up',
      "method": "POST",
      "dataType": "json",
      "contentType": "application/json",
      "statusCode": {
        "202": function(result) {
          Transport.state = 'RUNNING'
          for (const p in Transport.packages_loaded) Transport.packages_loaded[p].state = 'PICKED UP'
          displayEventBtn()
          displayTransport()
          displayPackage()
        }
      }
    })
  })

  $('#sfu-event-btn-pickedup').on('click', function() {
    $.ajax({
      "url": 'https://' + auth.auth.usercode + '.shaq' + auth.auth.env + '.yoctu.solutions/api/' + Entity + '/' + auth.auth.usercode + '/' + Transport.id + '/packages-picked-up',
      "method": "POST",
      "dataType": "json",
      "contentType": "application/json",
      "statusCode": {
        "202": function(result) {
          Transport.state = 'RUNNING'
          for (const p in Transport.packages_loaded) Transport.packages_loaded[p].state = 'PICKED UP'
          displayEventBtn()
          displayTransport()
          displayPackage()
        }
      }
    })
  })

  $('#sfu-event-btn-deliver').on('click', function() {
    $.ajax({
      "url": 'https://' + auth.auth.usercode + '.shaq' + auth.auth.env + '.yoctu.solutions/api/' + Entity + '/' + auth.auth.usercode + '/' + Transport.id + '/packages-delivered',
      "method": "POST",
      "dataType": "json",
      "contentType": "application/json",
      "statusCode": {
        "202": function(result) {
          Transport.state = 'RUNNING'
          for (const p in Transport.packages_loaded) Transport.packages_loaded[p].state = 'DELIVERED'
          displayEventBtn()
          displayTransport()
          displayPackage()
        }
      }
    })
  })

  $('#sfu-event-btn-delivered').on('click', function() {
    $.ajax({
      "url": 'https://' + auth.auth.usercode + '.shaq' + auth.auth.env + '.yoctu.solutions/api/' + Entity + '/' + auth.auth.usercode + '/' + Transport.id + '/packages-delivered',
      "method": "POST",
      "dataType": "json",
      "contentType": "application/json",
      "statusCode": {
        "202": function(result) {
          Transport.state = 'RUNNING'
          for (const p in Transport.packages_loaded) Transport.packages_loaded[p].state = 'DELIVERED'
          displayEventBtn()
          displayTransport()
          displayPackage()
        }
      }
    })
  })

  $('#showAuction').on('click', function() {
    window.open('/display.html' + window.location.search + '&type=-archive', '_blank');
  })

  $('.hideShipment').on('click', function() {
    $(this).find('.btn-shipment-extend-glyphicon').toggleClass('glyphicon-triangle-bottom').toggleClass('glyphicon-triangle-top');
    $('.panel-shipment-background').toggleClass('hide');
  });

  $('.showPackage').on('click', function() {
    $(this).find('.btn-message-extend-glyphicon').toggleClass('glyphicon-triangle-bottom').toggleClass('glyphicon-triangle-top');
    $('#packageList').toggleClass('hide');
  });

})
