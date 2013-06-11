var util = require('util')
, _= require('lodash')
, header = require('./header')

module.exports = function(app, api, userId) {
    var $el = $(require('./template.html')({
        userId: userId
    }))
    , controller = {
        $el: $el
    }

    $el.find('.header-placeholder').replaceWith(header(userId, 'user').$el)

    function userRetrieved(user) {
        $el.find('.user-placeholder')
        .replaceWith(require('./user.html')(user))
    }

    function refresh() {
        api.call('admin/users/' + userId)
        .fail(app.alertXhrError)
        .done(userRetrieved)
    }

    $el.on('click', '.send-email-verification', function(e) {
        e.preventDefault()
        var userId = $(e.target).closest('.user').attr('data-user-id')

        api.call('admin/users/' + userId + '/sendVerificationEmail', null, { type: 'POST' })
        .fail(app.alertXhrError)
        .done(function() {
            alert('Done')
        })
    })

    refresh()

    return controller
}
