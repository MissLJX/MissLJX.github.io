/**
 * Created by s_lei on 2017/2/7.
 */
var Address = (function () {


    var initStates = function (selectedCountry, selectedState) {
        var states = [];
        if (selectedCountry) {
            ninimour.pagecache.getStates(selectedCountry, function (data) {
                states = data.result;
                var stateOptions = _createOptions(selectedState, states, {value: '-1', label: 'State*'});
                if (stateOptions && stateOptions.length > 0) {
                    $('#states-wrapper').empty().append('<select id="state">' + stateOptions + '</select>');
                } else {
                    var input = '<input class="x-input" type="text" id="state" placeholder="State" value="' + selectedState + '">';
                    $('#states-wrapper').empty().append(input);
                }
            });
        }
    }


    var _createOptions = function (selected, list, defaultOption) {
        var html = [], obj;
        if (list && list.length > 0) {
            html.push('<option value="' + defaultOption.value + '">' + defaultOption.label + '</option>');
            for (var i = 0, len = list.length; i < len; i++) {
                obj = list[i];
                if (obj.value == selected) {
                    html.push('<option selected value="' + obj.value + '">' + obj.label + '</option>');
                } else {
                    html.push('<option value="' + obj.value + '">' + obj.label + '</option>');
                }
            }
        }
        return html;
    }


    var _init = function () {
        var countries = [];
        var selectedCountry = $('#country').val();
        ninimour.pagecache.getCountries(function (data) {
            countries = data.result;
            var countryOptions = _createOptions(selectedCountry, countries, {value: '-1', label: 'Country *'});
            $('#country').empty().append(countryOptions);

        });

        initStates(selectedCountry, shippingState);


        $('#country').on('change', function (e) {
            ninimour.event.stop(e);
            initStates($(this).val(), shippingState);
        });
    }

    var _save = function (callBack) {
        var token = $('#token').val(),
            id = $("#id").val(),
            name = $('#name').val(),
            country = $('#country').val(),
            state = $('#state').val(),
            city = $('#city').val(),
            unit = $('#unit').val(),
            zipCode = $('#zipCode').val(),
            phoneNumber = $('#phoneNumber').val(),
            streetAddress1 = $('#streetAddress1').val();

        ninimour.http.loadingPost(ninimour.base.ctx + ninimour.base.vpath + '/paypal2/anon/shipping-details-save', {
            id: id,
            token: token,
            name: name,
            country: country,
            state: state,
            city: city,
            unit: unit,
            zipCode: zipCode,
            phoneNumber: phoneNumber,
            streetAddress1: streetAddress1
        }, callBack);
    }


    return {
        init: _init ,
        save: _save
    };
})();


$(function () {
    Address.init();

    $('#ninimour-address-form').submit(function(event){
        ninimour.event.stop(event);
        Address.save(function(){
            if(shoppingpath == '3'){
                ninimour.anchor.open(ninimour.utils.urlutil.getSSLUrl('shoppingcart/placeorder?token='+token));
            }else{
                ninimour.anchor.open(ninimour.utils.urlutil.getSSLUrl('shoppingcart/authc'));
            }

        });
    });
});
