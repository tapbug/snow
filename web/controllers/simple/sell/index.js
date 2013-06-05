var num = require('num')
, _ = require('lodash')
, numbers = require('../../../util/numbers')
, debug = require('debug')('simple-buy')
, headerTemplate = require('../header.html')
, format = require('util').format

module.exports = function(app, api) {
    var $el = $(require('./template.html')({
        messageToRecipient: app.user().id * 1234
    }))
    , controller = {
        $el: $el
    }
    , $form = $el.find('.sell-form')
    , $amount = $el.find('.amount')
    , $converted = $el.find('.amount-converted')
    , last
    , balance
    , $balance = $el.find('.balance')
    , amountValidateTimer

    function balancesUpdated(balances) {
        var indexed = balances.reduce(function(p, c) {
            p[c.currency] = c.available
            return p
        }, {})

        balance = indexed.BTC
        $balance.html(numbers.format(balance, { ts: ',', maxPrecision: 8 }) + ' BTC')
    }

    app.on('balances', balancesUpdated)

    app.balances() && balancesUpdated(app.balances())

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
        if (!(+amount > 0)) {
            $amount.addClass('is-invalid error')
            return
        }

        if (_.isUndefined(balance)) {
            throw new Error('balance is undefined')
        }

        if (num(amount).gt(balance)) {
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
        last = 760.38

        var amount = parseAmount()

        if (!(+amount > 0)) {
            $converted.find('input').val('')
            return
        }

        var converted = num(amount).mul(last).toString()
        , formatted = numbers.format(converted, { ts: ' ', precision: 2 })
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

    var $bankAccount = $form.find('.bank-account')

    api.call('v1/users/bankAccounts')
    .fail(app.alertXhrError)
    .done(function(accounts) {
        if (true || !accounts.length) {
            $el.find('.no-bank-accounts-error').show()
            $el.find('.sell-form-container').hide()
            return
        }

        $bankAccount.html(accounts.map(function(a) {
            return format('<option class="bank-account" value="%s">%s</option>',
                a.id, a.accountNumber)
        }))
    })

    $form.on('submit', function(e) {
        e.preventDefault()

        if (!validateAmount(true)) {
            $amount.find('input').focus()
        }

        if ($form.find('.is-empty, .is-invalid').length) {
            return
        }

        $form.find('.sell-button').loading(true)
        $amount.enabled(false)

        setTimeout(function() {
            $el.toggleClass('is-step-estimate is-step-payment')
            var converted = $converted.find('input').val()
            $el.find('.payment-step .amount-converted').html(converted)
        }, 750)
    })

    $amount.find('input').focusSoon()

    return controller
}