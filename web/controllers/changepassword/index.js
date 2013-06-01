require('../../vendor/shake')

var _ = require('lodash')

module.exports = function(app, api, after) {
    var $el = $(require('./template.html')())
    , controller = {
        $el: $el
    }
    , $newPassword = $el.find('.new-password')
    , $newPasswordRepeat = $el.find('.new-password-repeat')
    , $button = $el.find('button')

    $el.on('submit', 'form', function(e) {
        e.preventDefault()

        var newPassword = $newPassword.find('input').val()
        , newPasswordRepeat = $newPasswordRepeat.find('input').val()

        if (newPassword.length < 6) {
            return alert('Minimum 6 characters, please')
        }

        if (newPassword != newPasswordRepeat) {
            return alert('Password and repeat are not the same')
        }

        $newPassword.add($newPasswordRepeat).add($button)
        .enabled(false)

        if (!app.user().email) throw new Error('email is missing from user')

        var newKey = api.keyFromCredentials(app.user().email, newPassword)

        api.call('v1/keys/replace', { key: newKey })
        .always(function() {
            $newPassword.add($newPasswordRepeat).add($button)
            .enabled(true)
        }).done(function() {
            alert('Password has been changed. Please sign in again.')
            window.location = '/'
        }).fail(function(xhr) {
            app.alertXhrError(xhr)
        })
    })

    $newPassword.find('input').focusSoon()

    return controller
}
