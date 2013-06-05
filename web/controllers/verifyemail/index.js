var util = require('util')
, _ = require('lodash')
, debug = require('../../util/debug')('verifyemail')

module.exports = function(app, api) {
    var $el = $(require('./template.html')({
        email: app.user().email
    }))
    , controller = {
        $el: $el
    }
    , timer

    $el.on('click', '.send', function(e) {
        e.preventDefault()

        $(e.target)
        .enabled(false)
        .addClass('is-loading')
        .html(app.i18n('verifyemail.send button.sending', app.user().email))

        api.call('v1/email/verify/send', {}, { type: 'POST' })
        .fail(app.alertXhrError)
        .done(function() {
            $(e.target).html(app.i18n('verifyemail.send button.waiting', app.user().email))

            timer = setInterval(function() {
                api.call('v1/whoami')
                .fail(function(err) {
                    debug('failed to whoami for email check')
                    debug(err)
                })
                .done(function(user) {
                    if (!user.emailVerified) return
                    clearInterval(timer)
                    $el.modal('hide')
                    alertify.log(app.i18n('verifyemail.confirmation'))
                })
            }, 5e3)
        })
    })

    return controller
}
