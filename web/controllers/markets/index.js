
module.exports = function() {
    var itemTemplate = require('./item.html')
    , controller = {
        $el: $(require('./template.html')())
    }
    , $tbody = controller.$el.find('tbody')

    function marketsChanged(markets) {
        $tbody.html($.map(markets, function(market) {
            return itemTemplate(market)
        }))
    }

    function refresh() {
        api.call('v1/markets')
        .fail(errors.alertFromXhr)
        .done(marketsChanged)
    }

    refresh()

    return controller
}
