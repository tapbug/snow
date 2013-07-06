
module.exports = function() {
    var controller = {
        $el: $(require('./template.html')())
    }
    , $form = controller.$el.find('form')
    , $amount = $form.find('input.amount')
    , $address = $form.find('input.address')
    , $currency = $form.find('input.currency')

    $form.on('submit', function(e) {
        e.preventDefault()
        api.call('v1/ripple/out', {
            amount: $amount.parseNumber(),
            address: $address.val(),
            currency: $currency.val()
        })
        .fail(errors.alertFromXhr)
        .done(function() {
            alert(i18n('withdrawripple.confirmation'))
            api.balances()
            window.location.hash = '#'
        })
    })

    return controller
}
