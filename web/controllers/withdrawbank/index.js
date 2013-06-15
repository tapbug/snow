var format = require('util').format
, _ = require('lodash')

module.exports = function(currency) {
    var $el = $(require('./template.html')())
    , controller = {
        $el: $el
    }
    , $form = controller.$el.find('form')
    , $amount = $form.find('.amount')
    , $bankAccount = $form.find('.bank-account')

    if (currency !== 'NOK') {
        throw new Error('Expected currency to equal NOK')
    }

    api.call('v1/users/bankAccounts')
    .fail(errors.alertFromXhr)
    .done(function(accounts) {
        accounts = _.filter(accounts, function(a) {
            return a.verified
        })

        if (!accounts.length) {
            // TODO: use classes for state, not show/hide
            $el.find('.no-bank-accounts').show()
            $el.find('button, .amount, .bank-account').enabled(false)
            return
        }

        $bankAccount.html(_.map(accounts, function(a) {
            return format('<option class="bank-account" value="%s">%s (%s)</option>',
                a.id, a.displayName || 'Unnamed', a.accountNumber)
        }))
    })

    $form.on('submit', function(e) {
        e.preventDefault()
        api.call('v1/withdraws/bank', {
            amount: $amount.val(),
            bankAccount: +$bankAccount.val(),
            currency: 'NOK'
        })
        .fail(errors.alertFromXhr)
        .done(function() {
            alert('Request to withdraw received.')
            api.balances()
            window.location.hash = '#'
        })
    })

    return controller
}
