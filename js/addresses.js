
var From = {
    address1: '',
    address2: '',
    address3: '',
    country_code: '',
    postcode: '',
    city: '',
    pro: 0
};

var To = {
    address1: '',
    address2: '',
    address3: '',
    country_code: '',
    postcode: '',
    city: '',
    pro: 0
};

function initMap() {
    var fromAddr = document.getElementById('form-from');
    var toAddr = document.getElementById('form-to');
    var autocompleteFrom = new google.maps.places.Autocomplete(fromAddr);
    var autocompleteTo = new google.maps.places.Autocomplete(toAddr);

    if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(function(position) {
            $.ajax({
                url: 'https://maps.googleapis.com/maps/api/geocode/json?latlng='+position.coords.latitude+','+position.coords.longitude+'&key=AIzaSyABQ8h9v6a5SaqoEo7VbzTZaWtvo5J0Hi8',
                dataType: 'json'
            }).done(function (result) {
                $("#form-from").val(result.results[1].formatted_address);
            });
          }, function() {
                console.error("error");
          });
        } else {
          console.error("error");
        }

    autocompleteTo.addListener('place_changed', function () {
        var placeTo = autocompleteTo.getPlace();
        if (!placeTo.geometry) {
            return;
        }

        var addressTo = '';
        if (placeTo.address_components) {
            addressTo = [
                (placeTo.address_components[0] && placeTo.address_components[0].short_name || ''),
                (placeTo.address_components[1] && placeTo.address_components[1].short_name || ''),
                (placeTo.address_components[2] && placeTo.address_components[2].short_name || '')
            ].join(' ');

            parseGoogleAdresse(placeTo, To);
        }
    });


    autocompleteFrom.addListener('place_changed', function () {
        var placeFrom = autocompleteFrom.getPlace();
        if (!placeFrom.geometry) {
            return;
        }

        var addressFrom = '';
        if (placeFrom.address_components) {
            addressFrom = [
                (placeFrom.address_components[0] && placeFrom.address_components[0].short_name || ''),
                (placeFrom.address_components[1] && placeFrom.address_components[1].short_name || ''),
                (placeFrom.address_components[2] && placeFrom.address_components[2].short_name || '')
            ].join(' ');
            parseGoogleAdresse(placeFrom, From);
        }
    });
}

var parseGoogleAdresse = function (googleAdresse, target) {
    for (var i = 0; i < googleAdresse.address_components.length; i++) {
        switch (googleAdresse.address_components[i].types[0]) {
            case 'postal_code':
                target.postcode = googleAdresse.address_components[i].short_name;
                break;
            case 'street_number':
                target.address1 = googleAdresse.address_components[i].short_name;
                break;
            case 'route':
                target.address1 = target.address1+' '+googleAdresse.address_components[i].short_name;
                break;
            case 'locality':
                target.city = googleAdresse.address_components[i].short_name;
                break;
            case 'country':
                target.country_code = googleAdresse.address_components[i].short_name;
                break;
            case 'neighborhood':
                target.city = googleAdresse.address_components[i].long_name;
                break;
            default:
        }
    }
};
