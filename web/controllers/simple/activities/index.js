var moment = require('moment')
, header = require('../header')
, footerTemplate = require('../footer.html')

module.exports = function() {
    var itemTemplate = require('./item.html')
    , $el = $(require('./template.html')({}))
    , controller = {
        $el: $el
    }
    , $items = controller.$el.find('.activities')

    // Insert header
    $el.find('.header-placeholder').replaceWith(header().$el)

    // Insert footer
    $el.find('.footer-placeholder').replaceWith(footerTemplate())

    function itemsChanged(items) {
        $items.html($.map(items, function(item) {
            item.text = require('../../../activity')(item)
            item.ago = moment(item.created).fromNow()

            return itemTemplate(item)
        }))
    }

    function refresh() {
        api.call('v1/activities').done(itemsChanged)
    }

    refresh()

    return controller
}
