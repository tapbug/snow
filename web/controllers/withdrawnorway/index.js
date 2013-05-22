var format = require('util').format

module.exports = function(app, api, currency) {
    var $el = $(require('./template.html')())
    , controller = {
        $el: $el
    }
    , $form = controller.$el.find('form')
    , $amount = $form.find('.amount')
    , $bankAccount = $form.find('.bank-account')

    api.call('v1/users/bankAccounts')
    .fail(app.alertXhrError)
    .done(function(accounts) {
        if (!accounts.length) {
            // TODO: use classes for state, not show/hide
            $el.find('.no-bank-accounts').show()
            $el.find('button, .amount, .bank-account').enabled(false)
            return
        }

        $bankAccount.html(accounts.map(function(a) {
            return format('<option class="bank-account" value="%s">%s (%s)</option>',
                a.id, a.displayName, a.details.account)
        }))
    })

    $form.on('submit', function(e) {
        e.preventDefault()
        api.call('v1/withdraws/norway', {
            amount: $amount.val(),
            bankAccount: +$bankAccount.val()
        })
        .fail(app.alertXhrError)
        .done(function() {
            alert('Request to withdraw received.')
            api.balances()
            window.location.hash = '#dashboard'
        })
    })

    app.section('dashboard')

    return controller
}
