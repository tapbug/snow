var num = require('num')
, _ = require('lodash')
, debug = require('debug')('simple')

module.exports = function(app, api) {
    var $el = $(require('./template.html')())
    , controller = {
        $el: $el
    }
    , inner = require('./overview')(app, api)

    $el.find('.wrapper').append(inner.$el)

    $el.on('click', 'a[href="#simple/buy"]', function(e) {
        e.preventDefault()

        var modal = require('./buy')(app, api)
        modal.$el.modal()
    })

    return controller
}
