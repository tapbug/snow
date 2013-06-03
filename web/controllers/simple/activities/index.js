var util = require('util')
, moment = require('moment')
, num = require('num')

module.exports = function(app, api) {
    var itemTemplate = require('./item.html')
    , controller = {
        $el: $(require('./template.html')())
    }
    , i18n = app.i18n
    , $items = controller.$el.find('.activities')

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
