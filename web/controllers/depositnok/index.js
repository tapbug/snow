module.exports = function(app, api) {
    var $el = $(require('./template.html')({
        messageToRecipient: app.user().id * 1234
    }))
    , controller = {
        $el: $el
    }

    app.section('dashboard')

    return controller
}
