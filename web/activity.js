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

    return JSON.stringify(activity)
}
