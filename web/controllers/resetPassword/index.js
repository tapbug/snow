require('../../vendor/shake')

var _ = require('lodash')
, debug = require('../../util/debug')('login')

module.exports = function(app, api) {
    var $el = $(require('./template.html')())
    , controller = {
        $el: $el
    }
    , email
    , phoneCode
    , $begin = $el.find('.begin')
    , $beginForm = $begin.find('.begin-form')
    , $email = $beginForm.find('.email')
    , $phone = $el.find('.phone')
    , $phoneForm = $phone.find('.phone-form')
    , $end = $el.find('.end')
    , $endForm = $end.find('.end-form')
    , $phoneCode = $phoneForm.find('.code')
    , $password = $endForm.find('.password')

    $beginForm.on('submit', function(e) {
        e.preventDefault()

        email = $email.find('input').val()

        var $button = $beginForm.find('.submit')
        $button.add($email.find('input')).enabled(false)
        $button.html('Emailing you...').addClass('is-loading')

        api.call('v1/resetPassword', { email: email }, { type: 'POST' })
        .fail(app.alertXhrError)
        .done(function() {
            $button.html('Check your email').removeClass('btn-primary')

            setTimeout(function() {
                $begin.fadeTo(1000, 0.75)
                $phone.show()
                $phoneCode.focusSoon()

            }, 15e3)
        })
    })

    $phoneForm.on('submit', function(e) {
        e.preventDefault()

        phoneCode = $phoneCode.find('input').val()

        if (!phoneCode.match(/^\d{4}$/)) {
            return alert('Phone code must be 4 digits')
        }

        $phoneCode.add($phoneForm.find('button')).enabled(false)
        $phone.fadeTo(1000, 0.75)
        $end.show()
        $password.focusSoon()
    })

    $endForm.on('submit', function(e) {
        e.preventDefault()

        var password = $password.find('input').val()
        , key = api.keyFromCredentials(email, password)

        api.call('v1/resetPassword/end', { email: email, code: phoneCode, key: key }, { type: 'POST' })
        .fail(app.alertXhrError)
        .done(function() {
            alert('Reset complete. Please do not forget your password again. International calls are expensive.')
            window.location = '/'
        })
    })

    $email.find('input').focusSoon()

    return controller
}
