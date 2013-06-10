var num = require('num')
, _ = require('lodash')
, debug = require('debug')('simple')

module.exports = function(app, api, tab) {
    var $el = $(require('./template.html')({
        tab: tab || null
    }))
    , controller = {
        $el: $el
    }

    return controller
}
