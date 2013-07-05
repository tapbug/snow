var template = require('./template.html')
, marketTemplate = require('./market.html')

module.exports = function(id) {
    var $el = $('<div class="markets">').html(template())
    , controller = {
        $el: $el
    }
    , market
    , currentMarketId

    function setMarket(id) {
        market && market.destroy()
        market = require('./market')(id)
        $el.find('.market-container').html(market.$el)

        // Set active navigation item
        $el.find('.markets-nav .market[data-id="' + id + '"]')
        .addClass('active').siblings().removeClass('active')

        currentMarketId = id
    }

    setMarket(id)

    function marketsChanged(markets) {
        $el.find('.markets-nav').html($.map(markets, function(market) {
            return $(marketTemplate(market))
        }))

        $el.find('.markets-nav .market[data-id="' + currentMarketId + '"]')
        .addClass('active').siblings().removeClass('active')
    }

    function refresh() {
        api.call('v1/markets')
        .fail(errors.alertFromXhr)
        .done(marketsChanged)
    }

    refresh()

    return controller
}
