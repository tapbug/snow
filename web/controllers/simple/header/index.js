module.exports = function(tab) {
    var $el = $(require('./template.html')({
        tab: tab || null
    }))
    , controller = {
        $el: $el
    }

    return controller
}
