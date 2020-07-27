const shaqurl = window.location.origin + "/";

function shaq2go() {
    puDate = $('#dppu').datepicker('getDate').toISOString().substring(0,11) + "11:00:00.000Z";
    deDate = $('#dpde').datepicker('getDate').toISOString().substring(0,11) + "11:00:00.000Z";
    validFrom = new Date();
    validUntil = new Date();
    validFrom.setMinutes(validFrom.getMinutes() + 1);
    validUntil.setMinutes(validUntil.getMinutes() + 15);
    var key = uuidv4().substring(0,18).replace(/-/g,'');
    shaq = { creator: usercode, deContact: [ $("#form-contact-to-company").val(), $("#form-contact-to-name").val(), $("#form-contact-to-email").val(), $("#form-contact-to-phone").val() ], deDate: deDate, dePlace: [ To.address1, To.postcode, To.city, To.country_code, To.country_code], dimension: [ "1", parseFloat($('#form-length').val()), parseFloat($('#form-width').val()), parseFloat($('#form-height').val()), parseFloat($('#form-weight').val()), "no"], id: id, key: key, name: key, notes: "Nothing", puContact: [ $("#form-contact-from-company").val(), $("#form-contact-from-name").val(), $("#form-contact-from-email").val(), $("#form-contact-from-phone").val() ], puDate: puDate, puPlace: [ From.address1, From.postcode, From.city, From.country_code, From.country_code ], reported_at: new Date().toISOString(), source: [ usercode ], sourceName: [ usercode ], sourceEmail: [ $("#email").val() ], stackable: "No", status: "running", target: [], type: "auction", visible: "public", valid_from: validFrom.toISOString(), valid_until: validUntil.toISOString(), transport: "LAMBDA", currency: "EUR" };
    $("#shaq2go").html(displayShaq(shaq, false, true));
}

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}


jQuery(document).ready(function () {

  $('#skoreway-shaq').on('click', function() {
    shaq2go();
  });

});
