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

        inner = require('./buy')(app, api)
        $el.find('.wrapper').empty()
        $el.find('.wrapper').append(inner.$el)
    })

    return controller
}
