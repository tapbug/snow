var num = require('num')
, _ = require('lodash')
, numbers = require('../../../util/numbers')
, debug = require('debug')('simple-buy')
, headerTemplate = require('../header.html')

module.exports = function(app, api, amount) {
    var $el = $(require('./template.html')({
        messageToRecipient: app.user().id * 1234
    }))
    , controller = {
        $el: $el
    }
    , $form = $el.find('.estimate-form')
    , $amount = $el.find('.amount')
    , $converted = $el.find('.amount-converted')
    , last
    , amountValidateTimer

    // Insert header
    $el.find('.header-placeholder').replaceWith(headerTemplate())

    function validateAmount(emptyIsError) {
        var amount = $amount.find('input').val().replace(',', '.')
        $amount.removeClass('error is-invalid is-empty')

        if (!amount.length) {
            $amount.addClass('is-empty')
            if (emptyIsError === true) $amount.addClass('error')
            return
        }

        // NaN or <= 0
        if (parseAmount() === null) {
            $amount.addClass('is-invalid error')
            return
        }

        return true
    }

    $amount.on('change keyup leave', function() {
        $amount.removeClass('error is-invalid is-empty')
        amountValidateTimer && clearTimeout(amountValidateTimer)
        amountValidateTimer = setTimeout(validateAmount, 750)
        recalculate()
    })

    function parseAmount() {
        var result = $amount.find('input').val()
        result = result.replace(/,/g, '.')
        if (!(+result) > 0) return null
        return result
    }

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
        last = 760.3832

        var amount = parseAmount()

        if (!(+amount > 0)) {
            $converted.find('input').val('')
            return
        }

        var converted = num(amount)
        converted.set_precision(8) // TODO: Remove magic number
        converted = converted.div(last).toString()

        var formatted = numbers.format(converted, { ts: ' ', precision: 3 })
        $converted.find('input').val(formatted)
    }

    function refreshMarkets() {
        debug('refreshing markets')

        api.call('v1/markets')
        .always(function() {
            setTimeout(refreshMarkets, 30e3)
        })
        .then(marketsUpdated)
    }

    refreshMarkets()

    $form.on('submit', function(e) {
        e.preventDefault()

        if (!validateAmount(true)) {
            $amount.find('input').focus()
        }

        if ($form.find('.is-empty, .is-invalid').length) {
            return
        }

        $form.find('.continue-button').loading(true)
        $amount.find('input').enabled(false)

        setTimeout(function() {
            $el.toggleClass('is-step-estimate is-step-payment')
            var amount = $amount.find('input').val()
            $el.find('.payment-step .amount').html(amount)
        }, 750)
    })

    if (amount == 'any') {
        $el.toggleClass('is-step-estimate is-step-payment')
        $el.find('.payment-step .amount').closest('tr').hide()
    }

    $amount.find('input').focusSoon()

    return controller
}
