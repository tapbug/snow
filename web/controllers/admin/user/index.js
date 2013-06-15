var header = require('./header')

module.exports = function(userId) {
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
        .fail(errors.alertFromXhr)
        .done(userRetrieved)
    }

    $el.on('click', '.send-email-verification', function(e) {
        e.preventDefault()
        var userId = $(e.target).closest('.user').attr('data-user-id')

        var url = 'admin/users/' + userId + '/sendVerificationEmail'

        api.call(url, null, { type: 'POST' })
        .fail(errors.alertFromXhr)
        .done(function() {
            alert('Done')
        })
    })

    refresh()

    return controller
}
