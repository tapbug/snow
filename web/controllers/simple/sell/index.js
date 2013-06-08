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
    , bid
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
        bid = market.bid
        recalculate()
    }

    function recalculate() {
        if (!bid) {
            debug('cannot convert without a bid price')
            return
        }

        debug('market bid %s', bid)

        var amount = parseAmount()

        if (!(+amount > 0)) {
            $converted.find('input').val('')
            return
        }

        // convert and subtract 0.5% fee
        var converted = num(amount).mul(bid).mul(0.995).toString()
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

    var $bankAccounts = $form.find('.bank-accounts')

    api.call('v1/users/bankAccounts')
    .fail(app.alertXhrError)
    .done(function(accounts) {
        if (!accounts.length) {
            $el.find('.no-bank-accounts-error').show()
            $el.find('.sell-form-container').hide()
            return
        }

        $bankAccounts.find('select').html(accounts.map(function(a) {
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
        $amount.find('input')
        .add($bankAccounts.find('select'))
        .enabled(false)

        api.call('v1/simple/convertAndWithdraw', {
            amount: $amount.find('input').val(),
            bankAccount: +$bankAccounts.find('select').val(),
            currency: 'NOK'
        })
        .fail(app.alertXhrError)
        .done(function(res) {
            alert('Uttak av ' + res.amount + ' NOK bekreftet.')
            window.location.hash = '#simple'
        })
    })

    $amount.find('input').focusSoon()

    return controller
}
