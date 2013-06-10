var num = require('num')
, _ = require('lodash')
, numbers = require('../../../util/numbers')
, debug = require('debug')('simple')
, footerTemplate = require('../footer.html')
, header = require('../header')

module.exports = function(app, api) {
    var $el = $(require('./template.html')())
    , controller = {
        $el: $el
    }
    , $balance = $el.find('.balance')
    , $converted = $el.find('.balance-converted')
    , $address = $el.find('.address')
    , balance
    , last
    , marketsTimer

    $el.find('.header-placeholder').replaceWith(header(app, api).$el)

    // Insert footer
    $el.find('.footer-placeholder').replaceWith(footerTemplate())

    function numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    function formatNumber(n, p) {
        var s = num(n).set_precision(p || 2).toString()
        return numberWithCommas(s)
    }

    function balancesUpdated(balances) {
        var indexed = balances.reduce(function(p, c) {
            p[c.currency] = c.available
            return p
        }, {})

        balance = indexed.BTC
        $balance.html(formatNumber(balance) + ' BTC')
        recalculate()
    }

    app.on('balances', balancesUpdated)

    app.balances() && balancesUpdated(app.balances())

    function marketsUpdated(markets) {
        var market = _.find(markets, { id: 'BTCNOK' })
        last = market.last
        recalculate()
    }

    function recalculate() {
        if (!last) {
            return debug('cannot convert without a last price')
        }

        debug('market last %s', last)

        var converted = num(balance).mul(last).toString()
        , formatted = numbers.format(converted, { ts: ' ', precision: 2 })
        $converted.html(app.i18n('simple.overview.approx', formatted))
    }

    function refreshMarkets() {
        debug('refreshing markets')

        api.call('v1/markets')
        .always(function() {
            marketsTimer = setTimeout(refreshMarkets, 30e3)
        })
        .then(marketsUpdated)
    }

    app.bitcoinAddress().done(function(address) {
        $address.attr('href', 'bitcoin:' + address)
        .html(address)
    })

    refreshMarkets()

    controller.destroy = function() {
        marketsTimer && clearTimeout(marketsTimer)
    }

    return controller
}
