var moment = require('moment')

module.exports = function() {
    var itemTemplate = require('./item.html')
    , controller = {
        $el: $(require('./template.html')())
    }
    , $items = controller.$el.find('.activities')

    function itemsChanged(items) {
        $items.html($.map(items, function(item) {
            var duration = +new Date() - item.created
            if (duration < 0) duration = 0

            item.text = require('../../activity')(item)
            item.ago = moment(duration).fromNow()

            return itemTemplate(item)
        }))
    }

    function refresh() {
        api.call('v1/activities')
        .fail(errors.alertFromXhr)
        .done(itemsChanged)
    }

    refresh()

    return controller
}
