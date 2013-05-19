var num = require('num')
, _ = require('lodash')
, debug = require('debug')('simple')

module.exports = function(app, api) {
    var $el = $(require('./template.html')())
    , controller = {
        $el: $el
    }

    return controller
}
