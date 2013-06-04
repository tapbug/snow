var num = require('num')
, _ = require('lodash')
, numbers = require('../../../util/numbers')
, debug = require('debug')('simple')
, headerTemplate = require('../header.html')

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

    $el.find('.header-placeholder').replaceWith(headerTemplate())

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
            debug('cannot convert without a last price')
            return
        }

        debug('market last %s', last)
        debug('*** FAKING LAST TO 760.38 ***')
        last = 760.38

        var converted = num(balance).mul(last).toString()
        , formatted = numbers.format(converted, { ts: ' ', precision: 2 })
        $converted.html('tilsvarer ' + formatted + ' NOK')
    }

    function refreshMarkets() {
        debug('refreshing markets')

        api.call('v1/markets')
        .always(function() {
            setTimeout(refreshMarkets, 30e3)
        })
        .then(marketsUpdated)
    }

    app.bitcoinAddress().done(function(address) {
        $address.attr('href', 'bitcoin:' + address)
        .html(address)
    })

    refreshMarkets()

    return controller
}
