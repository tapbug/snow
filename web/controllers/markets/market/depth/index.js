var _ = require('lodash')
, priceTemplate = require('./price.html')
, template = require('./template.html')

module.exports = function(id) {
    var base = id.substr(0, 3)
    , quote = id.substr(3)
    , $el = $('<div class="depth">').html(template({
        id: id,
        base_currency: base,
        quote_currency: quote
    }))
    , controller = {
        $el: $el
    }
    , $depth = controller.$el.find('.depth')

    function depthChanged(depth) {
        var combined = []

        _.each(depth.bids, function(x) {
            combined.push({
                type: 'bid',
                price: x[0],
                volume: x[1]
            })
        })

        _.each(depth.asks, function(x) {
            combined.push({
                type: 'ask',
                price: x[0],
                volume: x[1]
            })
        })

        combined.sort(function(a, b) {
            return a.price - b.price
        })

        $depth.find('tbody').html($.map(combined, function(item) {
            return priceTemplate(item)
        }))
    }

    function refreshDepth() {
        api.call('v1/markets/' + id + '/depth')
        .fail(errors.alertFromXhr)
        .done(depthChanged)
    }

    controller.refresh = refreshDepth

    refreshDepth()

    return controller
}
