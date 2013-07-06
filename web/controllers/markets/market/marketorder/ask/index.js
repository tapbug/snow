var num = require('num')
, _ = require('lodash')
, template = require('./template.html')
, debug = require('../../../../../util/debug')('trade')

module.exports = function(market) {
    var $el = $('<div class="ask">').html(template({
        base: market.substr(0, 3),
        quote: market.substr(3, 3)
    }))
    , controller = {
        $el: $el
    }
    , quote = market.substr(3, 3)
    , base = market.substr(0, 3)
    , depth
    , $sell = $el.find('.sell')

    function updateQuote() {
        $el.removeClass('is-too-deep')

        if (!depth) return
        var sell = numbers.parse($el.field('sell').val())

        if (sell === null) return
        sell = num(sell)

        if (sell.lte(0)) return

        if (!depth.bids.length) {
            $sell.addClass('error')
            $el.addClass('is-too-deep')
            return
        }

        var receive = num(0)
        , volumePrecision = num(depth.bids[0][1]).get_precision()
        , quotePrecision = 5
        sell.set_precision(quotePrecision)

        var remaining = num(sell)

        debug('volume precision %s', volumePrecision.toString())

        var filled = _.some(depth.bids, function(level) {
            debug('%s remaining', remaining.toString())

            var price = num(level[0])
            , volume = num(level[1])
            , take = volume.gte(remaining) ? remaining : volume

            // Decrease precision from currency scale to order amount scale.
            take.set_precision(volume.get_precision())

            if (take.eq(0)) {
                return true
            }

            var total = take.mul(price)

            debug('Taking %s @ %s (of %s); Total %s',
                take.toString(), price.toString(), volume.toString(),
                total.toString())

            receive = receive.add(take.mul(price))
            remaining = remaining.sub(take)
        })

        $el.toggleClass('is-too-deep', !filled)

        if (!filled) {
            $sell.addClass('error')
            return
        }

        // Subtract fee
        receive = receive.mul('0.995')

        var effectivePrice = receive.div(sell)
        effectivePrice.set_precision(3) // TODO: Remove magic number

        receive.set_precision(5) // TODO: Remove magic number

        $el.find('.receive-quote').html(
            numbers.format(receive.toString()))

        $el.find('.receive-price').html(
            numbers.format(effectivePrice.toString()))
    }

    function balancesUpdated() {
        var balances = api.balances.current
        , item = _.find(balances, { currency: base })

        $el.find('.available')
        .html(numbers.format(item.available,
            { maxPrecision: 2, currency: item.currency }))
        .attr('title', numbers.format(item.available, { currency: item.currency }))
    }

    function validateSell(emptyIsError) {
        $el
        .removeClass('has-insufficient-funds')
        .removeClass('is-precision-too-high')

        var val = $el.field('sell').val()
        , valid

        if (!val.length) {
            valid = !emptyIsError
            $sell.toggleClass('error', !valid)
            return valid
        }

        var sell = numbers.parse(val)

        if (sell === null) {
            valid = false
        } else {
            if (num(sell).lte(0)) return

            var precision = num(sell).get_precision()
            , maxPrecision = 5 // TODO: Remove magic number

            if (precision > maxPrecision) {
                valid = false
                $el.addClass('is-precision-too-high')
            } else {
                var item = _.find(api.balances.current, { currency: base })
                , available = item.available

                if (num(sell).gt(available)) {
                    debug('Available %s < required %s', available.toString(),
                        sell.toString())

                    valid = false
                    $el.addClass('has-insufficient-funds')
                } else {
                    valid = true
                }
            }
        }

        $sell.toggleClass('error', !valid)

        return valid
    }

    function refreshDepth() {
        return api.call('v1/markets/' + market + '/depth')
        .always(function() {
            // new timer
        })
        .fail(function(err) {
            debug('Failed to update market depth: ' + JSON.stringify(err, null, 4))
        })
        .done(function(res) {
            depth = res
            updateQuote()
        })
    }

    controller.destroy = function() {
        api.off('balances', balancesUpdated)
    }

    // Update market order sell (bid)
    $el.field('sell').on('change keyup', function() {
        // Order matters. Validate clears error, bid quote may add error.
        validateSell()
        updateQuote()
    })

    $el.on('submit', 'form', function(e) {
        e.preventDefault()

        var $button = $el.find('[type="submit"]')
        , $form = $el.find('form')

        if (!validateSell(true)) {
            $form.field('sell').focus()
            $button.shake()
            return
        }

        $button.loading(true, i18n('markets.market.marketorder.ask.placing order'))
        $form.addClass('is-loading')

        api.call('v1/orders', {
            market: market,
            type: 'ask',
            amount: $el.field('sell').parseNumber(),
            price: null
        })
        .always(function() {
            $button.loading(false)
            $form.removeClass('is-loading')
        })
        .fail(function(err) {
            errors.alertFromXhr(err)
        })
        .done(function() {
            $el.field('amount', '')
            .field('price', '')
            api.balances()
            $el.find('.available').flash()
            $el.trigger('trade')
            $form.field('amount').focus()
        })
    })

    $el.on('click', '[data-action="sell-all"]', function(e) {
        e.preventDefault()
        $el.field('sell').val(numbers.format(
            _.find(api.balances.current, { currency: base }).available))
        $el.field('sell').trigger('change')
    })

    // Subscribe to balance updates
    api.balances.current && balancesUpdated()
    api.on('balances', balancesUpdated)

    refreshDepth()

    return controller
}
