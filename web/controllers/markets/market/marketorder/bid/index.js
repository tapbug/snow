var num = require('num')
, _ = require('lodash')
, template = require('./template.html')
, debug = require('../../../../../util/debug')('trade')

module.exports = function(market) {
    var $el = $('<div class="bid">').html(template({
        base: market.substr(0, 3),
        quote: market.substr(3, 3)
    }))
    , controller = {
        $el: $el
    }
    , quote = market.substr(3, 3)
    , depth
    , $spend = $el.find('.spend')
    , quotePrecision = _.find(api.currencies.value, { id: quote }).scale

    function updateQuote() {
        $el.removeClass('is-too-deep')

        if (!depth) return
        var spend = $el.field('spend').parseNumber()
        if (spend === null) return

        spend = num(spend)
        spend.set_precision(quotePrecision)

        if (spend.lte(0)) return

        if (!depth.asks.length) {
            $spend.addClass('error')
            $el.addClass('is-too-deep')
            return
        }

        var receive = num(0)
        , volumePrecision = num(depth.asks[0][1]).get_precision()

        var remaining = num(spend)

        debug('volume precision %s', volumePrecision.toString())
        debug('Spend up to %s', spend.toString())

        debug('test %s', num(1).set_precision())

        var filled = _.some(depth.asks, function(level) {
            debug('%s remaining', remaining.toString())

            var price = num(level[0])
            , volume = num(level[1])
            , theirTotal = price.mul(volume)
            , filled = theirTotal.gte(remaining)
            , take = filled ? remaining.div(price) : volume

            take.set_precision(volume.get_precision())

            debug('Volume %s, their total %s, take %s',
                volume.toString(), theirTotal.toString(), take.toString())

            if (take.eq(0)) {
                debug('Would take zero, breaking')
                return true
            }

            var ourTotal = take.mul(price)

            debug('Taking %s @ %s (of %s); Total %s',
                take.toString(), price.toString(), volume.toString(),
                ourTotal.toString())

            receive = receive.add(take)
            remaining = remaining.sub(ourTotal)

            if (filled) {
                return true
            }
        })

        $el.toggleClass('is-too-deep', !filled)

        if (!filled) {
            debug('Would not be filled')
            $spend.addClass('error')
            return
        }

        // Subtract fee
        receive = receive.mul('0.995')

        var actualSpend = spend.sub(remaining)

        debug('Spend %s - remaining %s = %s',
            spend.toString(), remaining.toString(), actualSpend.toString())

        var effectivePrice = actualSpend.div(receive)

        debug('Effective price: %s / %s = %s', actualSpend.toString(),
            receive.toString(), effectivePrice.toString())

        $el.find('.actual-spend').html(
            numbers.format(actualSpend.toString()))

        $el.find('.receive-quote').html(
            numbers.format(receive.toString()))

        $el.find('.receive-price').html(
            numbers.format(effectivePrice.toString()))
    }

    function balancesUpdated() {
        var balances = api.balances.current
        , item = _.find(balances, { currency: quote })

        $el.find('.available')
        .html(numbers.format(item.available,
            { maxPrecision: 2, currency: item.currency }))
        .attr('title', numbers.format(item.available, { currency: item.currency }))
    }

    function validateSpend(emptyIsError) {
        $el
        .removeClass('has-insufficient-funds')
        .removeClass('is-precision-too-high')

        var val = $el.field('spend').val()
        , valid

        if (!val.length) {
            valid = !emptyIsError
            $spend.toggleClass('error', !valid)
            return valid
        }

        var spend = numbers.parse(val)

        if (spend === null) {
            valid = false
        } else {
            var precision = num(spend).get_precision()
            , maxPrecision = 5 // TODO: Remove magic number

            if (precision > maxPrecision) {
                valid = false
                $el.addClass('is-precision-too-high')
            } else {
                var item = _.find(api.balances.current, { currency: quote })
                , available = item.available

                if (num(spend).gt(available)) {
                    valid = false
                    $el.addClass('has-insufficient-funds')
                } else {
                    valid = true
                }
            }
        }

        $spend.toggleClass('error', !valid)

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

    // Update market order spend (bid)
    $el.field('spend').on('change keyup', function() {
        // Order matters. Validate clears error, bid quote may add error.
        validateSpend()
        updateQuote()
    })

    $el.on('submit', 'form', function(e) {
        e.preventDefault()

        var $button = $el.find('[type="submit"]')
        , $form = $el.find('form')

        if (!validateSpend(true)) {
            $form.field('spend').focus()
            $button.shake()
            return
        }

        $button.loading(true, i18n('markets.market.marketorder.bid.placing order'))
        $form.addClass('is-loading')

        api.call('v1/spend', {
            market: market,
            amount: $el.field('spend').parseNumber()
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
            $form.field('spend').focus()
        })
    })

    $el.on('click', '[data-action="spend-all"]', function(e) {
        e.preventDefault()
        $el.field('spend').val(numbers.format(
            _.find(api.balances.current, { currency: quote }).available))
        $el.field('spend').trigger('change')
    })

    // Subscribe to balance updates
    api.balances.current && balancesUpdated()
    api.on('balances', balancesUpdated)

    refreshDepth()


    return controller
}
