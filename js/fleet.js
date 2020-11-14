var FLEET = []

$(document).ready(function() {

window.autoinvite = function(key, autoinvite){
  	for (const r in FLEET) {
      if (FLEET[r].key === key) FLEET[r].autoinvite = !autoinvite
    }
    refreshFleetPanel()
}

function refreshFleetPanel() {
  $('#fleet-content-panel').html('');
  for (const r of FLEET) {
    $('#fleet-content-panel').append('<div id="settings-vehicles-row-' + r.name + '" class="row text-center"><div class="col-sm-3">' + r.name + '</div>\
    <div class="col-sm-2">' + r.id + '</div>\
    <div class="col-sm-3">' + r.driver + '</div>\
    <div class="col-sm-2">' + r.plate + '</div>\
    <div class="col-sm-2">' + r.provider + '</div></div><br><br>')
  }
}

  $.ajax({
    "url": 'https://' + auth.auth.usercode + '.shaq' + auth.auth.env + '.yoctu.solutions/api/fleet/' + auth.auth.usercode,
    "dataType": "json",
    "headers": {
      "redspher-auth": "yes",
      "app-key": auth.auth.userkey,
      "Authorization": "Basic " + auth.auth.authbasic
    },
    "statusCode": {
      "429": function(xhr) {
        status429();
      },
      "401": function(xhr) {
        status401();
      },
      "403": function(xhr) {
        status403();
      },
      "404": function(xhr) {
        status404();
      }
    },
    "error": function() {
      status500();
    },
    "success": function(fleet) {
      FLEET = fleet;
      refreshFleetPanel()
    }
  })

  function addVehicle(xhr, display) {
      FLEET.push({
        "name": xhr.app.usercodename,
        "key": xhr.usercode,
        "display": display || 'NA'
      })
      refreshFleetPanel();
  }

  function saveFleet() {
    $.ajax({
      "url": 'https://' + auth.auth.usercode + '.shaq' + auth.auth.env + '.yoctu.solutions/api/fleet/' + auth.auth.usercode,
      "method": "POST",
      "dataType": "json",
      "contentType": "application/json",
      "data": JSON.stringify(FLEET),
      "headers": {
        "redspher-auth": "yes",
        "app-key": auth.auth.userkey,
        "Authorization": "Basic " + auth.auth.authbasic
      },
      "statusCode": {
        "403": function(xhr) {
          informShow('   <div class="text-danger">Already In!</div>');
        }
      },
      "success": function(json) {
        $("#InviteModal").modal('hide');
      }
    });
  }

  $('#shaq-fleet-save-btn').on('click', function() {
    questionShow('<div>Are you sure to save relations ?</div>', 'Save');
    $("#QuestionModalYesBtn").on("click", function() {
      saveFleet();
    });
  });

  $('#fleet-delete-all').on('click', function() {
    questionShow('Are you sure to delete all vehicles ?', 'Delete all');
    $("#QuestionModalYesBtn").on("click", function() {
      FLEET = []
      refreshFleetPanel()
    });
  })

  $('#fleet-delete').on('click', function() {
    let showText = '<p>Name : <select class="pull-right" id="fleet-delete-name">'
    for (const v in FLEET)
      showText += '<option>' + FLEET[v].name  + '</option>'
    showText += '</select></p><br>'
    questionShow(showText, 'Delete');
    $("#QuestionModalYesBtn").on("click", function() {
      $('#fleet-row-' + $('#fleet-delete-name').val()).addClass('hide')
      for (const v in FLEET) {
        if (FLEET[v].name === $('#fleet-delete-name').val())  {
          FLEET.splice(v,1)
          refreshFleetPanel()
          break
        }
      }
    });
  })

  $('#fleet-add').on('click', function() {
    $('#fleet-vehicle-add').addClass('hide')
    $('#fleet-vehicle-delete').addClass('hide')
    questionShow('<p>Name : <input class="pull-right" id="fleet-add-name"></input></p><br>\
                <p>DeviceId : <input class="pull-right" id="fleet-add-id"></input></p><br>\
                <p>Driver : <input class="pull-right" id="fleet-add-driver"></input></p><br>\
                <p>Plate : <input class="pull-right" id="fleet-add-plate"></input></p><br>\
                <p>Provider : <select class="pull-right" id="fleet-add-provider"><option>ftk</option><option>shippeo</option></select></p><br>', 'Add');
    $("#QuestionModalYesBtn").on("click", function() {
      let vehicle = {}
      vehicle.id = $('#fleet-add-id').val() || "000000"
      vehicle.name = $('#fleet-add-name').val() || "default"
      vehicle.driver = $('#fleet-add-driver').val() || "default"
      vehicle.plate = $('#fleet-add-plate').val() || "xxxx-xx-xx"
      vehicle.provider  = $('#fleet-add-provider').val()
      FLEET.push(vehicle)
      refreshFleetPanel()
    });
  });
})
