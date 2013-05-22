var util = require('util')
, _ = require('lodash')
, debug = require('debug')('identitymodal')

module.exports = function(app, api, after) {
    var $el = $(require('./template.html')())
    , controller = {
        $el: $el
    }
    , $form = $el.find('form')

    var countries = require('../../assets/callingcodes.json')
    , $country = $el.find('.country')
    $country.append(_.map(countries, function(country) {
        return util.format('<option value="%s">%s</option>', country.code, country.name)
    }))

    setTimeout(function() {
        $form.find('.first-name').focus()
    }, 250)

    $form.on('submit', function(e) {
        e.preventDefault()

        var address1 = $el.find('.address1').val()
        , address2 = $el.find('.address2').val()
        , address = address2 ? address1 + '\n' + address2 : address1

        var data = {
            firstName: $el.find('.first-name').val(),
            lastName: $el.find('.last-name').val(),
            address: address,
            city: $el.find('.city').val(),
            postalArea: $el.find('.postal-area').val(),
            country: $el.find('.country').val()
        }

        api.call('v1/users/identity', data)
        .done(function() {
            alertify.log(app.i18n('identity.confirmation'))
            _.extend(app.user(), data)

            if (typeof Intercom != 'undefined' && Intercom) {
                Intercom('update', {
                    name: data.firstName + ' ' + data.lastName,
                    address: data.address,
                    city: data.city,
                    postalArea: data.postalArea,
                    country: data.country
                })
            }

            window.location.hash = '#' + (after || 'dashboard')
        })
        .fail(function(xhr) {
            var err = app.errorFromXhr(xhr)
            alert(JSON.stringify(err, null, 4))
        })
    })

    return controller
}
