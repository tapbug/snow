module.exports = function(app, api, currency) {
    var $el = $(require('./template.html')())
    , controller = {
        $el: $el
    }
    , $form = controller.$el.find('form')
    , $amount = $form.find('input.amount')
    , $bankAccount = $form.find('input.bank-account')

    api.call('v1/users/bankAccounts')
    .fail(app.alertXhrError)
    .done(function(accounts) {
        if (!accounts.length) {
            // TODO: use classes for state, not show/hide
            $el.find('.no-bank-accounts').show()
            $el.find('button, .amount, .bank-account').enabled(false)
            return
        }

        alert(JSON.stringify(accounts, null, 4))
    })

    $form.on('submit', function(e) {
        e.preventDefault()
        api.call('v1/btc/out', {
            amount: $amount.val(),
            address: $address.val()
        })
        .fail(app.alertXhrError)
        .done(function() {
            alert(app.i18n('withdrawbtc.confirmation'))
            window.location.hash = '#dashboard'
        })
    })

    app.section('dashboard')

    return controller
}
