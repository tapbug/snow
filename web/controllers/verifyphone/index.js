var util = require('util')
, _ = require('lodash')
, debug = require('debug')('verifyphone')

module.exports = function(app, api) {
    var $el = $(require('./template.html')())
    , controller = {
        $el: $el
    }
    , $callForm = $el.find('form.call')
    , $codeForm = $el.find('form.code')
    , $number = $callForm.find('input[name="phone"]')
    , $country = $callForm.find('select[name="country"]')
    , $code = $codeForm.find('input[name="code"]')
    , number

    // Add countries
    var countries = require('../../assets/callingcodes.json')
    $country.append(_.map(countries, function(country) {
        return util.format('<option value="%s">%s (%s)</option>', country.code, country.name, country.dial_code)
    }))

    // TODO: use user language(s)
    var country = 'US'
    , desired = app.i18n.desired ? /[a-z]{2}$/i.exec(app.i18n.desired) : null

    if (desired) {
        country = desired[0].toUpperCase()
        debug('Country from browser language ' + country)
    }

    var options = _.sortBy(_.where(countries, { code: country }), function(x) {
        return x.name.length
    })

    var option = options[0]

    if (option) {
        $country.val(option.code)

        setTimeout(function() {
            $number.focus()
        }, 500)
    } else {
        debug('There is no option that matches the country ' + country)

        setTimeout(function() {
            $country.focus()
        }, 500)
    }

    $callForm.on('submit', function(e) {
        e.preventDefault()

        var code = _.find(countries, { code: $country.val() }).dial_code
        number = $number.val().replace(/[^\d]/g, '')

        if (!number.length) {
            $number.focus()
            $number.shake()
            return
        }

        number = code + number

        $callForm.find('button')
        .enabled(false)
        .addClass('is-loading')
        .html(app.i18n('verifyphone.calling you'))

        $number.enabled(false)
        $country.enabled(false)

        setTimeout(function() {
            $codeForm.show()
            $code.focus()
        }, 2500)

        api.call('v1/users/verify/call', { number: number })
        .done(function() {
        })
        .fail(function(xhr) {
            var err = app.errorFromXhr(xhr)
            alert(JSON.stringify(err, null, 4))
        })
    })

    $codeForm.on('submit', function(e) {
        e.preventDefault()

        var code = $code.val()

        if (!/^\d{4}$/.test(code)) {
            alert('The code should be four digits')
            $code.focus()
            $code.shake()
            return
        }

        $codeForm.find('button')
        .enabled(false)
        .addClass('is-loading')
        .html(app.i18n('verifyphone.verifying code'))

        $code.enabled(false)

        api.call('v1/users/verify', { code: code })
        .done(function() {
            app.user.phone = number

            app.emit('verifiedphone', number)

            $el.modal('hide')

            alertify.log(app.i18n('verifyphone.verified', app.user.phone))
        })
        .fail(function(xhr) {
            var err = app.errorFromXhr(xhr)
            alert(JSON.stringify(err, null, 4))
            window.location = '/'
        })
    })

    return controller
}
