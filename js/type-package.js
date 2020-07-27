var envelope = {
  "ISO": {
    "A3": {
      "fr": [297, 420],
      "us": [11.7, 16.5]
    },
    "A2": {
      "fr": [420, 594],
      "us": [16.5, 23.4]
    },
    "A5": {
      "fr": [148, 210],
      "us": [5.8, 8.3]
    },
    "A4": {
      "fr": [210, 297],
      "us": [8.3, 11.7]
    }
  }
};
var envelopeFull = {};
var parcel_unit = "fr";
var divide_unit = 10;

function toggleUnit() {
  if (parcel_unit === "fr") {
      parcel_unit = "us";
      divide_unit = 1;
      $('#unitType').text("Met.");
  } else {
      parcel_unit = "fr";
      divide_unit = 10;
      $('#unitType').text("Imp.");
  }
  if (envelope["ISO"][$('.form-template-type').val()][parcel_unit])
    $('#form-width').val((parseFloat(envelope["ISO"][$('.form-template-type').val()][parcel_unit][0]) / divide_unit).toFixed(1));
    $('#form-length').val((parseFloat(envelope["ISO"][$('.form-template-type').val()][parcel_unit][1]) / divide_unit).toFixed(1));
}

function EnvelopeInit() {
  $('#form-type-display').text($('input[name="formType"]').attr('data-text'));
  for (var options in envelope["ISO"]) {
    $('.form-template-type').append($("<option></option>").attr("value", options).text(options));
  }
}

$(document).ready(function() {

  $("select[name='form-template-type']").change(function() {
    $(".form-template-type option:selected").removeAttr("selected");
    $('.form-template-type').val($(this).val() );
    if (envelope["ISO"][$(this).val()][parcel_unit].length < 3) $('#form-height').val('0.1');
    else $('#form-height').val(parseFloat(envelope["ISO"][$(this).val()][parcel_unit][2] / divide_unit).toFixed(1));
    if (envelope["ISO"][$(this).val()][parcel_unit].length < 4) $('#form-weight').val('0.1');
    else $('#form-weight').val(parseFloat(envelope["ISO"][$(this).val()][parcel_unit][3]).toFixed(1));
    $('#form-width').val((parseFloat(envelope["ISO"][$(this).val()][parcel_unit][0]) / divide_unit).toFixed(1));
    $('#form-length').val((parseFloat(envelope["ISO"][$(this).val()][parcel_unit][1]) / divide_unit).toFixed(1));
  });

  $(".fa-box-open.pkglist").on('click', function() {
    let html = '<div class="row">';
    for (var options in envelope["ISO"]) {
      html += '<div class="row">';
      //html += '<div class="col-sm-2 col-xs-6"></div>';
      html += '<div class="col-sm-2 col-xs-12">' + options + '</div>';
      if (envelope["ISO"][options][parcel_unit].length < 4) html += '<div class="col-sm-2 col-xs-3">0.1</div>';
      else html += '<div class="col-sm-2 col-xs-3">' + parseFloat(envelope["ISO"][options][parcel_unit][3]).toFixed(1) + "</div>";
      html += '<div class="col-sm-2 col-xs-3">' + parseFloat(envelope["ISO"][options][parcel_unit][0] / divide_unit).toFixed(1) + "</div>";
      html += '<div class="col-sm-2 col-xs-3">' + parseFloat(envelope["ISO"][options][parcel_unit][1] / divide_unit).toFixed(1) + "</div>";
      if (envelope["ISO"][options][parcel_unit].length < 3) html += '<div class="col-sm-2 col-xs-3">0.1</div>';
      else html += '<div class="col-sm-2 col-xs-3">' + parseFloat(envelope["ISO"][options][parcel_unit][2] / divide_unit).toFixed(1) + "</div>";
      html += '</div><hr>';
    }
    html += '</div>';
    $("#InformationModalText").html(html);
    $("#InformationModalTitle").html("Package");
    $("#InformationModal").modal();
  });

  $("#save-envelope").on('click', function() {
    $("#QuestionModalText").html('<br><div class="form-inline form-group"><label>Name : </label>\
          <input id="EnvelopeName" type="text" class="form-control" autofocus></input></div><br>');
    $("#QuestionModalTitle").html("Package");
    $("#QuestionModal").modal();
    $("#QuestionModalYesBtn").on("click", function() {
      envelopeFull.envelope["ISO"][$("#EnvelopeName").val()] = {};
      envelopeFull.envelope["ISO"][$("#EnvelopeName").val()]["fr"] = [$('#form-length').val()*10, $('#form-width').val()*10, $('#form-height').val()*10, $('#form-weight').val()*1];
      envelopeFull.envelope["ISO"][$("#EnvelopeName").val()]["us"] = [$('#form-length').val()*1, $('#form-width').val()*1, $('#form-height').val()*1, $('#form-weight').val()*1];
      envelope = envelopeFull.envelope;
      $('.form-template-type').empty();
      EnvelopeInit();
      $('.form-template-type').val($("#EnvelopeName").val());
    });
  });
});
