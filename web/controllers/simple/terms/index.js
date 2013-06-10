var num = require('num')
, _ = require('lodash')
, debug = require('debug')('simple')
, footerTemplate = require('../footer.html')
, header = require('../header')

module.exports = function(app, api) {
    var $el = $(require('./template.html')())
    , controller = {
        $el: $el
    }

    // Insert header
    $el.find('.header-placeholder').replaceWith(header(app, api).$el)

    // Insert footer
    $el.find('.footer-placeholder').replaceWith(footerTemplate())

    return controller
}
