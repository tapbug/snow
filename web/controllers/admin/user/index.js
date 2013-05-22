var util = require('util')

module.exports = function(app, api, userId) {
    var $el
    , controller = {
    }

    function userRetrieved(user) {
        $el = controller.$el = $(require('./template.html')(user))
        $el.modal()
    }

    function refresh() {
        api.call('admin/users/' + userId).done(userRetrieved)
    }

    refresh()

    return controller
}
