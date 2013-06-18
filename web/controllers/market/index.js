/* global alertify */
var num = require('num')
, _ = require('lodash')

module.exports = function(id) {
    var priceTemplate = require('./price.html')
    , base = id.substr(0, 3)
    , quote = id.substr(3)
    , controller = {
        $el: $(require('./template.html')({
            id: id,
            type: 'bid',
            price: '',
            amount: '',
            base_currency: base,
            quote_currency: quote
        }))
    }
    , $depth = controller.$el.find('.depth')
    , $buy = controller.$el.find('.buy')
    , $buyPrice = $buy.find('*[name="price"]')
    , $buyAmount = $buy.find('*[name="amount"]')
    , $buySummary = $buy.find('.summary')
    , $sell = controller.$el.find('.sell')
    , $sellPrice = $sell.find('*[name="price"]')
    , $sellAmount = $sell.find('*[name="amount"]')
    , $sellSummary = $sell.find('.summary')

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

        var ask, bid

        if (!$buyPrice.hasClass('is-changed')) {
            ask = _.find(combined, { type: 'ask'})
            if (ask) {
                $buyPrice.val(numbers(ask.price))
            }
        }

        if (!$sellPrice.hasClass('is-changed')) {
            bid = _.last(_.where(combined, { type: 'bid'}))
            if (bid) {
                $sellPrice.val(numbers(bid.price))
            }
        }
    }

    function refreshDepth() {
        api.call('v1/markets/' + id + '/depth')
        .fail(errors.alertFromXhr)
        .done(depthChanged)
    }

    function updateBuySummary() {
        var buyPrice = numbers.parse($buyPrice.val())
        , buyAmount = numbers.parse($buyAmount.val())

        if (!buyPrice || buyPrice < 0) {
            $buySummary.html('')
            return
        }

        var total = num(buyPrice).mul(buyAmount)

        $buySummary.i18n('market.buy summary',
            $buyAmount.val(),
            base,
            numbers(total),
            quote)
    }

    function updateSellSummary() {
        var sellPrice = numbers.parse($sellPrice.val())
        , sellAmount = numbers.parse($sellAmount.val())

        if (!sellPrice || sellPrice < 0) {
            $sellSummary.html('')
            return
        }

        var total = num(sellPrice).mul(sellAmount)

        $sellSummary.i18n('market.sell summary',
            $sellAmount.val(),
            base,
            numbers(total),
            quote)
    }

    $buy.on('submit', function(e) {
        e.preventDefault()

        api.call('v1/orders', {
            market: id,
            type: 'bid',
            price: numbers.parse($buyPrice.val()),
            amount: numbers.parse($buyAmount.val())
        })
        .fail(function(err) {
            if (err.name == 'InsufficientFunds') {
                alertify.alert('Insufficient funds to place order.')
                return
            }

            errors.alertFromXhr(err)
        })
        .done(function(order) {
            api.balances()
            alertify.log(i18n('market.order placed', order.id))
            $buyPrice.val('')
            $buyAmount.val('')
            updateBuySummary()
            $buyAmount.focus()
            refreshDepth()
        })
    })

    $sell.on('submit', function(e) {
        e.preventDefault()
        api.call('v1/orders', {
            market: id,
            type: 'ask',
            price: numbers.parse($sellPrice.val()),
            amount: numbers.parse($sellAmount.val())
        })
        .fail(function(err) {
            if (err.name == 'InsufficientFunds') {
                alertify.alert('Insufficient funds to place order.')
                return
            }

            errors.alertFromXhr(err)
        })
        .done(function(order) {
            api.balances()
            alertify.log(i18n('market.order placed', order.id))
            $sellPrice.val('')
            $sellAmount.val('')
            updateSellSummary()
            $sellAmount.focus()
            refreshDepth()
        })
    })

    $buyPrice.on('keyup change', function() {
        $buyPrice.addClass('is-changed')
        updateBuySummary()
    })

    $buyAmount.on('keyup change', function() {
        updateBuySummary()
    })

    $sellPrice.on('keyup change', function() {
        $sellPrice.addClass('is-changed')
        updateSellSummary()
    })

    $sellAmount.on('keyup change', function() {
        updateSellSummary()
    })

    refreshDepth()

    return controller
}
