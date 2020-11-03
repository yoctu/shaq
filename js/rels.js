var RELS = []

$(document).ready(function() {

window.autoinvite = function(key, autoinvite){
  	for (const r in RELS) {
      if (RELS[r].key === key) RELS[r].autoinvite = !autoinvite
    }
    refreshRelPanel()
}

function refreshRelPanel() {
  $('#rels-content-panel').html('');
  for (const r in RELS) {
    let display = 'NA'
    let autoinvite = false
    if ('display' in RELS[r]) display = RELS[r].display;
    if ('autoinvite' in RELS[r]) autoinvite = RELS[r].autoinvite;
    $('#rels-content-panel').append('<div class="col-sm-12" id="rels-row-' + RELS[r].key + '"><div class="col-sm-3">' + RELS[r].key + '</div><div class="col-sm-3">' + RELS[r].name + '</div><div class="col-sm-3">' + display + '</div><div class="col-sm-3"><a href="#" onclick=\'autoinvite("' + RELS[r].key + '", ' + autoinvite + ')\'>' + autoinvite + '</a></div></div>')
  }
}

  $.ajax({
    "url": 'https://' + auth.auth.usercode + '.shaq' + auth.auth.env + '.yoctu.solutions/api/rels/' + auth.auth.usercode,
    "dataType": "json",
    "headers": {
      "redspher-auth": "yes",
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
    "success": function(rels) {
      RELS = rels;
      refreshRelPanel()
    }
  })

  function addRel(xhr, display) {
      RELS.push({
        "name": xhr.app.usercodename,
        "key": xhr.usercode,
        "display": display || 'NA'
      })
      refreshRelPanel();
  }

  function saveRels() {
    $.ajax({
      "url": 'https://' + auth.auth.usercode + '.shaq' + auth.auth.env + '.yoctu.solutions/api/rels/' + auth.auth.usercode,
      "method": "POST",
      "dataType": "json",
      "contentType": "application/json",
      "data": JSON.stringify(RELS),
      "headers": {
        "redspher-auth": "yes",
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

  $('#saveRelsBtn').on('click', function() {
    questionShow('<div>Are you sure to save relations ?</div>', 'Save');
    $("#QuestionModalYesBtn").on("click", function() {
      saveRels();
    });
  });

  $('#rels-delete-all').on('click', function() {
    questionShow('Are you sure to delete all rels ?', 'Delete all');
    $("#QuestionModalYesBtn").on("click", function() {
      RELS = []
      saveRels();
    });
  })

  $('#rels-delete').on('click', function() {
    let showText = '<p>Name : <select class="pull-right" id="rels-delete-key">'
    for (const v in RELS)
      showText += '<option>' + RELS[v].key  + '</option>'
    showText += '</select></p><br>'
    questionShow(showText, 'Delete');
    $("#QuestionModalYesBtn").on("click", function() {
      $('#rels-row-' + $('#rels-delete-key').val()).addClass('hide')
      for (const v in RELS) {
        if (RELS[v].key === $('#rels-delete-key').val())  {
          RELS.splice(v,1)
          break
        }
      }
    });
  })

  $('#rels-add').on('click', function() {
    questionShow('<div class="form-inline"><label>Bidder Code : </label><button id="InviteModalSearchBtn" class="btn btn-default pull-right"><span class="glyphicon glyphicon-search"></span></button>\
                <input id="InviteModalSearchInput" type="text" class="form-control pull-right" autofocus></input></div>\
              <div id="inviteDescription"><hr><div><p>Code : <span class="pull-right" id="InviteModalCode"></span></p></div>\
                <div><p>Name : <span class="pull-right" id="InviteModalName"></span></p></div>\
                <div id="InviteModalDivDisplay" class="hide"><p>Display : <span class="pull-right"><input id="InviteModalDisplay" class="form-control"> </input></span></p></div></div>', 'Add');
    $("#QuestionModalYesBtn").attr('disabled', true);
    $('#InviteModalDivDisplay').addClass('hide')
    $("#InviteModalSearchBtn").on("click", function() {
      $('#InviteModalCode').html('');
      $('#InviteModalName').html('');
      $('#InviteModalInviteBtn').prop('disabled', true);
      if ($('#InviteModalSearchInput').val() !== "") {
        for (const r in RELS) {
          if (RELS[r].key === $('#InviteModalSearchInput').val()) {
            $('#InviteModalCode').html("Already in Relations");
            $('#InviteModalName').html("Already in Relations");
            return
          }
        }
        $.ajax({
          "url": 'https://' + $('#InviteModalSearchInput').val() + '.shaq' + auth.auth.env + '.yoctu.solutions/public/' + $('#InviteModalSearchInput').val() + "/",
          "method": "GET",
          "dataType": "json",
          "contentType": "application/json",
          "headers": {
            "redspher-auth": "yes",
            "Authorization": "Basic " + auth.auth.authbasic
          },
          "statusCode": {
            "200": function(xhr) {
              $('#InviteModalCode').html(xhr.usercode);
              $('#InviteModalName').html(xhr.app.usercodename);
              $('#InviteModalDivDisplay').removeClass('hide')
              $("#QuestionModalYesBtn").attr('disabled', false);
              $("#QuestionModalYesBtn").on("click", function() {
                addRel(xhr, $("#InviteModalDisplay").val())
              });
            },
            "404": function(xhr) {
              $('#InviteModalCode').html("not found");
              $('#InviteModalName').html("not found");
            }
          },
          "error": function(xhr) {
            $('#InviteModalCode').html("not found");
            $('#InviteModalName').html("not found");
          }
        });
      }
    });
  });
})
