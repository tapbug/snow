
module.exports = function() {
    var controller = {
        $el: $(require('./template.html')())
    }
    , $form = controller.$el.find('form')
    , $amount = $form.find('input.amount')
    , $address = $form.find('input.address')

    $form.on('submit', function(e) {
        e.preventDefault()
        api.call('v1/ltc/out', {
            amount: $amount.parseNumber(),
            address: $address.val()
        })
        .fail(errors.alertFromXhr)
        .done(function() {
            alert(i18n('withdrawltc.confirmation'))
            api.balances()
            window.location.hash = '#'
        })
    })

    return controller
}
