
module.exports = function() {
    var $el = $(require('./template.html')({
        messageToRecipient: user.id * 1234
    }))
    , controller = {
        $el: $el
    }

    return controller
}
