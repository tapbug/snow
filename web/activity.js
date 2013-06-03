var format = require('util').format
, num = require('num')

module.exports = function(i18n, activity) {
    if (activity.type == 'CreateOrder') {
        return format(i18n('activities.CreateOrder'),
            (activity.details.side || activity.details.type) == 'bid' ? 'buy' : 'sell',
            activity.details.volume || activity.details.amount,
            activity.details.market.substr(0, 3),
            num(activity.details.price).mul(activity.details.volume || activity.details.amount).toString(),
            activity.details.market.substr(3))
    }

    if (activity.type == 'CancelOrder') {
        return format(i18n('activities.CancelOrder'), activity.details.id)
    }

    if (activity.type == 'BankCredit') {
        return format(i18n('activities.BankCredit'),
            activity.details.amount,
            activity.details.currency,
            activity.details.reference)
    }

    if (activity.type == 'RippleWithdraw') {
        return format(i18n('activities.RippleWithdraw'),
            activity.details.amount, activity.details.currency, activity.details.address)
    }

    if (activity.type == 'LTCWithdraw') {
        return format(i18n('activities.LTCWithdraw'),
            activity.details.amount, activity.details.address)
    }

    if (activity.type == 'BTCWithdraw') {
        return format(i18n('activities.BTCWithdraw'),
            activity.details.amount, activity.details.address)
    }

    if (activity.type == 'SendToUser') {
        return format(i18n('activities.SendToUser'),
            activity.details.amount, activity.details.currency, activity.details.to)
    }

    if (activity.type == 'Created') {
        return i18n('activities.Created')
    }

    if (activity.type == 'IdentitySet') {
        return i18n('activities.IdentitySet')
    }

    if (activity.type == 'AdminBankAccountCredit') {
        return format('Admin: Credited user %s\'s bank account (#%s) with %s %s (%s)',
            activity.details.user_id, activity.details.bank_account_id,
            activity.details.amount, activity.details.currency_id,
            activity.details.reference)
    }

    if (activity.type == 'AdminWithdrawCancel') {
        return format('Admin: Cancelled withdraw request #%s (%s)',
            activity.details.id, activity.details.error)
    }

    if (activity.type == 'AdminWithdrawComplete') {
        return format('Admin: Completed withdraw request #%s', activity.details.id)
    }

    if (activity.type == 'AdminWithdrawProcess') {
        return format('Admin: Started processing withdraw request #%s', activity.details.id)
    }

    return JSON.stringify(activity)
}
