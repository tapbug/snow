var footerTemplate = require('../footer.html')
, header = require('../header')

module.exports = function() {
    var $el = $(require('./template.html')())
    , controller = {
        $el: $el
    }

    // Insert header
    $el.find('.header-placeholder').replaceWith(header().$el)

    // Insert footer
    $el.find('.footer-placeholder').replaceWith(footerTemplate())

    return controller
}
