module.exports = function() {
    var controller = {
        $el: $(require('./template.html')())
    }
    , $form = controller.$el.find('form')
    , $amount = $form.find('input.amount')
    , $address = $form.find('input.address')

    $form.on('submit', function(e) {
        e.preventDefault()

        api.call('v1/btc/out', {
            amount: $amount.val(),
            address: $address.val()
        })
        .fail(function(err) {
            if (err.name == 'NoFunds') {
                api.balances()
                alertify.alert('Sorry, you have insufficient funds ' +
                    'to withdraw that amount.')

                return
            }

            errors.alertFromXhr(err)
        })
        .done(function() {
            alert(i18n('withdrawbtc.confirmation'))
            api.balances()
            window.location.hash = '#'
        })
    })

    return controller
}
