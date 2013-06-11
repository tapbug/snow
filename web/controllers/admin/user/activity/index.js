var util = require('util')
, format = util.format
, header = require('../header')
, formatActivity = require('../../../../activity')

module.exports = function(app, api, userId) {
    var itemTemplate = require('./item.html')
    , $el = $(require('./template.html')())
    , controller = {
        $el: $el
    }
    , $items = controller.$el.find('.activities')

    // Insert header
    $el.find('.header-placeholder').replaceWith(header(userId, 'activity').$el)

    function itemsChanged(items) {
        $items.html($.map(items, function(item) {
            item.text = formatActivity(app.i18n, item)
            return itemTemplate(item)
        }))
    }

    function refresh() {
        api.call('admin/users/' + userId + '/activity')
        .done(itemsChanged)
    }

    refresh()

    return controller
}
