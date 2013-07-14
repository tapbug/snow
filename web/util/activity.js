/* jshint maxcomplexity: 99 */
var format = require('util').format
, num = require('num')

function formatFillOrder(details) {
    var amount = details.original
    , base = details.market.substr(0, 3)
    , quote = details.market.substr(3)
    , amountFormatted = numbers.format(amount, { currency: base })
    , price = details.price
    , type = details.type || details.side

    var totalFormatted = numbers.format(details.total, { currency: quote })
    , priceFormatted = numbers.format(price, { currency: quote })

    if (type == 'bid') {
        return i18n('activities.FillOrder.bid', amountFormatted,
            totalFormatted, priceFormatted)
    }

    return i18n('activities.FillOrder.ask', amountFormatted,
        totalFormatted, priceFormatted)
}

function formatCreateOrder(details) {
    var amount = details.volume || details.amount
    , quote = details.market.substr(3, 3)
    , base = details.market.substr(0, 3)
    , amountFormatted = numbers.format(amount, { currency: base })
    , price = details.price
    , type = details.type || details.side

    if (price) {
        var total = num(price).mul(amount).toString()
        , totalFormatted = numbers.format(total, { currency: quote })
        , priceFormatted = numbers.format(price, { currency: quote })

        if (type == 'bid') {
            return i18n('activities.CreateOrder.limit.bid', amountFormatted,
                totalFormatted, priceFormatted)
        }

        return i18n('activities.CreateOrder.limit.ask', amountFormatted,
            totalFormatted, priceFormatted)
    } else {
        if (type == 'bid') {
            return i18n('activities.CreateOrder.market.bid', amountFormatted, quote)
        }

        return i18n('activities.CreateOrder.market.ask', amountFormatted, quote)
    }
}

function formatAdminBankAccountCredit(details) {
    return format('Admin: Credited user %s\'s bank account (#%s) with %s %s (%s)',
        details.user_id,
        details.bank_account_id,
        numbers.format(details.amount),
        details.currency_id,
        details.reference)
}

module.exports = function(activity) {
    var details = activity.details

    if (activity.type == 'CreateOrder') {
        return formatCreateOrder(details)
    }

    if (activity.type == 'FillOrder') {
        return formatFillOrder(details)
    }

    if (activity.type == 'WithdrawComplete') {
        return i18n('activities.WithdrawComplete',
            numbers.format(details.amount, { currency: details.currency }))
    }

    if (activity.type == 'CreateVoucher') {
        return i18n('activities.CreateVoucher', numbers.format(details.amount,
            { currency: details.currency }))
    }

    if (activity.type == 'CancelOrder') {
        return format(i18n('activities.CancelOrder'), activity.details.id)
    }

    if (activity.type == 'BankCredit') {
        return format(i18n('activities.BankCredit'),
            numbers.format(activity.details.amount),
            activity.details.currency,
            activity.details.reference)
    }

    if (activity.type == 'RippleWithdraw') {
        return format(i18n('activities.RippleWithdraw'),
            activity.details.amount, activity.details.currency, activity.details.address)
    }

    if (activity.type == 'LTCWithdraw') {
        return format(i18n('activities.LTCWithdraw'),
            numbers.format(activity.details.amount), activity.details.address)
    }

    if (activity.type == 'BTCWithdraw') {
        return format(i18n('activities.BTCWithdraw'),
            numbers.format(activity.details.amount), activity.details.address)
    }

    if (activity.type == 'SendToUser') {
        return format(i18n('activities.SendToUser'),
            numbers.format(activity.details.amount),
            activity.details.currency,
            activity.details.to)
    }

    if (activity.type == 'Created') {
        return i18n('activities.Created')
    }

    if (activity.type == 'IdentitySet') {
        return i18n('activities.IdentitySet')
    }

    if (activity.type == 'AdminBankAccountCredit') {
        return formatAdminBankAccountCredit(details)
    }

    if (activity.type == 'AdminWithdrawCancel') {
        return format('Admin: Cancelled withdraw request #%s (%s)',
            activity.details.id, activity.details.error)
    }

    if (activity.type == 'AdminWithdrawComplete') {
        return format('Admin: Completed withdraw request #%s', activity.details.id)
    }

    if (activity.type == 'AdminWithdrawProcess') {
        return format('Admin: Started processing withdraw request #%s',
            activity.details.id)
    }

    return JSON.stringify(activity)
}
