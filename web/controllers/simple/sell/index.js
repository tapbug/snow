var num = require('num')
, _ = require('lodash')
, debug = require('debug')('simple-buy')
, footerTemplate = require('../footer.html')
, header = require('../header')

module.exports = function() {
    var $el = $('<div class="simple sell">')
    , controller = {
        $el: $el
    }
    , $form
    , $amount
    , $converted
    , bid
    , balance
    , $balance
    , amountValidateTimer
    , marketsTimer
    , bankAccounts
    , $bankAccount

    function balancesUpdated(balances) {
        var indexed = _.reduce(balances, function(p, c) {
            p[c.currency] = c.available
            return p
        }, {})

        balance = indexed.BTC
        $balance.html(numbers.format(balance, { ts: ',', maxPrecision: 8 }) + ' BTC')
    }

    function validateAmount(emptyIsError) {
        var amount = $amount.find('input').val().replace(',', '.')
        $amount.removeClass('error is-invalid is-empty')

        if (!amount.length) {
            $amount.addClass('is-empty')
            if (emptyIsError === true) $amount.addClass('error')
            return
        }

        if (amount <= 0 || isNaN(amount)) {
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

    function parseAmount() {
        var result = $amount.find('input').val()
        result = result.replace(/,/g, '.')
        if (result <= 0 || isNaN(result)) return null
        return result
    }

    function marketsUpdated(markets) {
        var market = _.find(markets, { id: 'BTCNOK' })
        bid = market.bid
        recalculate()
    }

    function recalculate() {
        if (bid <= 0 || isNaN(bid)) {
            return debug('cannot convert without a bid price')
        }

        debug('market bid %s', bid)

        var amount = parseAmount()

        if (amount <= 0 || isNaN(amount)) {
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
            marketsTimer = setTimeout(refreshMarkets, 30e3)
        })
        .then(marketsUpdated)
    }

    controller.destroy = function() {
        amountValidateTimer && clearTimeout(amountValidateTimer)
        marketsTimer && clearTimeout(marketsTimer)
    }

    function refreshBankAccounts() {
        return api.call('v1/bankAccounts')
        .fail(errors.alertFromXhr)
        .done(function(accounts) {
            bankAccounts = accounts
            render()
        })
    }

    function render() {
        var bankAccountVerified = !!_.where(bankAccounts, { verified: true }).length
        , identityVerified = !!api.user.lastName
        , canSell = bankAccountVerified && identityVerified

        $el.toggleClass('is-user-identified', identityVerified)
        $el.toggleClass('is-bank-account-added', !!bankAccounts.length)
        $el.toggleClass('is-bank-account-verified', bankAccountVerified)
        $el.toggleClass('is-bank-account-verifying', !!_.where(bankAccounts, {
            verified: false,
            verifying: true
        }).length)

        $el.html(require('./template.html')({
            messageToRecipient: api.user.id * 1234,
            identified: !!api.user.lastName,
            bankAccountAdded: !!bankAccounts.length,
            bankAccountVerified: !!_.where(bankAccounts, { verified: true }).length
        }))

        $form = $el.find('.sell-form')
        $amount = $el.find('.amount')
        $converted = $el.find('.amount-converted')
        $balance = $el.find('.balance')
        $bankAccount = $form.find('.bank-account')

        // Insert header
        $el.find('.header-placeholder').replaceWith(header().$el)

        // Insert footer
        $el.find('.footer-placeholder').replaceWith(footerTemplate())

        if (canSell) {
            $bankAccount.find('.account-number')
            .html(bankAccounts[0].accountNumber)

            refreshMarkets()
        }

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
            .enabled(false)

            api.call('v1/simple/convertAndWithdraw', {
                amount: $amount.find('input').val(),
                bankAccount: bankAccounts[0].account_number,
                currency: 'NOK'
            })
            .fail(errors.alertFromXhr)
            .done(function(res) {
                alert('Uttak av ' + res.amount + ' NOK bekreftet.')
                window.location.hash = '#simple'
            })
        })

        $amount.on('change keyup leave', function() {
            $amount.removeClass('error is-invalid is-empty')
            amountValidateTimer && clearTimeout(amountValidateTimer)
            amountValidateTimer = setTimeout(validateAmount, 750)
            recalculate()
        })

        api.on('balances', balancesUpdated)
        api.balances()

        $amount.find('input').focusSoon()
    }

    $el.on('click', '.add-bank-account', function(e) {
        e.preventDefault()
        e.stopPropagation()

        var $modal = $('.add-bank-account-modal').modal()

        $modal.on('click', '.add-button', function(e) {
            e.preventDefault()
            var $accountNumber = $modal.find('.account-number input')
            , accountNumber = $accountNumber.val()
            , $addButton = $modal.find('.add-button')

            if (!accountNumber.length) {
                $modal.modal('hide')
                return
            }

            $addButton.loading(true, 'Adding...')
            $modal.modal('hide')

            api.call('v1/bankAccounts', {
                accountNumber: accountNumber
            }, { type: 'POST' })
            .always(function() {
                $addButton.loading(false)
            })
            .fail(errors.alertFromXhr)
            .done(function() {
                window.location.reload()
            })
        })

        $modal.find('.account-number input').focusSoon()
    })

    // Verify account
    $el.on('submit', '.verify-form', function(e) {
        e.preventDefault()

        var $code = $(this).closest('td').find('.code')
        , $verify = $(this).find('button').loading(true, 'Verifying...')
        , code = $code.val()

        if (!code) {
            return alert('Code missing')
        }

        if (code.length != 4) {
            return alert('Code must be exactly 4 characters')
        }

        var id = bankAccounts[0].id
        , url = 'v1/bankAccounts/' + id + '/verify'

        api.call(url, { code: $code.val() }, { type: 'POST' })
        .always(function() {
            $verify.loading(false)
        })
        .fail(errors.alertFromXhr)
        .done(function() {
            window.location.reload()
        })
    })

    refreshBankAccounts()

    return controller
}
