var util = require('util')
, moment = require('moment')
, num = require('num')
, header = require('../header')
, footerTemplate = require('../footer.html')

module.exports = function(app, api) {
    var itemTemplate = require('./item.html')
    , $el = $(require('./template.html')({}))
    , controller = {
        $el: $el
    }
    , i18n = app.i18n
    , $items = controller.$el.find('.activities')

    // Insert header
    $el.find('.header-placeholder').replaceWith(header(app, api).$el)

    // Insert footer
    $el.find('.footer-placeholder').replaceWith(footerTemplate())

    function itemsChanged(items) {
        $items.html($.map(items, function(item) {
            item.text = require('../../../activity')(app.i18n, item)
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
