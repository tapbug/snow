var _ = require('lodash')
, template = require('./template.html')
, format = require('util').format
, num = require('num')

module.exports = function() {
    var $el = $('<div class="create-voucher is-creating">').html(template())
    , controller = {
        $el: $el
    }
    , $form = $el.find('.form')
    , $amount = $form.find('.amount')
    , $currency = $form.find('.currency')
    , $submit = $form.find('.submit')

    // Keep up to date on balances
    var balances
    , available

    controller.onBalancesUpdated = function(b) {
        b = _.filter(b, function(balance) {
            return ~['BTC', 'XRP', 'LTC'].indexOf(balance.currency)
        })

        if (!balances) {
            $form.field('currency')
            .html($.map(_.sortBy(b, 'currency'), function(balance) {
                return format(
                    '<option value="%s">%s</option>',
                    balance.currency,
                    balance.currency)
            }))
        }

        balances = b
        controller.updateAvailable()
    }

    // Update the user's available in the selected currency
    controller.updateAvailable = function() {
        if (!balances) return
        var currency = $form.field('currency').val()
        if (!currency) return
        var balance = _.find(balances, { currency: currency })
        if (!balance) return
        available = balance.available
        var formatted = numbers.formatAmount(available)
        $amount.find('.available').html(formatted + ' ' + currency)
    }

    controller.onBalancesUpdated(caches.balances)
    caches.balances.on('change', controller.onBalancesUpdated)

    $form.on('change keyup', '.currency select', controller.updateAvailable)

    // Validation
    function validateAmount(emptyIsError) {
        var amount = $form.field('amount').val()
        $amount.removeClass('error is-invalid is-empty')

        if (!amount.length) {
            $amount.addClass('is-empty')
            if (emptyIsError === true) $amount.addClass('error')
            return
        }

        amount = parseAmount()

        // NaN or <= 0
        if (amount <= 0 || isNaN(amount)) {
            $amount.addClass('is-invalid error')
            return
        }

        if (_.isUndefined(available)) {
            throw new Error('available is undefined')
        }

        if (num(amount).gt(available)) {
            $amount.addClass('is-invalid error')
            return
        }

        return true
    }

    $amount.on('change keyup', validateAmount.bind(this, false))
    $currency.on('change keyup', validateAmount.bind(this, false))

    function parseAmount() {
        var result = $form.field('amount').val()
        result = result.replace(/,/g, '.')
        if (result <= 0 || isNaN(result)) return null
        return result
    }

    // Submit
    $form.on('submit', function(e) {
        e.preventDefault()

        if (!validateAmount(true)) {
            $form.field('amount').focus()
            $submit.shake()
            return
        }

        $submit.loading(true)

        $form.field('amount')
        .add($form.field('currency'))
        .enabled(false)

        var amount = parseAmount()
        , currency = $form.field('currency').val()

        api.createVoucher(amount, currency)
        .always(function() {
            $form.field('amount')
            .add($form.field('currency'))
            .enabled(true)
            $submit.loading(false)
        })
        .fail(errors.alertFromXhr)
        .done(function(voucher) {
            var formatted = [
                voucher.substr(0, 4),
                voucher.substr(4, 4),
                voucher.substr(8, 4)
            ].join('-')

            alert('Voucher created: ' + formatted)
            $form.field('amount').val('').focus()
            api.balances()
        })
    })

    controller.destroy = function() {
        caches.balances.removeListener('change', controller.onBalancesUpdated)
    }

    $form.field('amount').focusSoon()

    return controller
}
