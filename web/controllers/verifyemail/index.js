/* global alertify */
var debug = require('../../util/debug')('verifyemail')

module.exports = function() {
    var $el = $(require('./template.html')({
        email: user.email
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
        .html(i18n('verifyemail.send button.sending', user.email))

        api.call('v1/email/verify/send', {}, { type: 'POST' })
        .fail(errors.alertFromXhr)
        .done(function() {
            $(e.target).html(i18n('verifyemail.send button.waiting', user.email))

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
                    alertify.log(i18n('verifyemail.confirmation'))
                })
            }, 5e3)
        })
    })

    return controller
}
