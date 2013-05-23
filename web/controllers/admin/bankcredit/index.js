var util = require('util')
, debug = require('debug')('admin:bankcredit')

module.exports = function(app, api, userId) {
    var $el = $(require('./template.html')())
    , controller = {
        $el: $el
    }

    // Navigation partial
    $el.filter('.nav-container').html(require('../nav.html')())

    $el.on('submit', 'form', function(e) {
        e.preventDefault()

        var $el = $(this)

        var body = {
            userId: userId,
            amount: $el.find('.amount input').val(),
            reference: $el.find('.reference input').val(),
            currency_id: $el.find('.currency input').val(),
            bank_account_id: $el.find('.bank-account select').val()
        }

        if (!body.amount) return alert('amount id not set')
        if (!body.currency_id) return alert('currency_id not set')
        if (!body.bank_account_id) return alert('bank_account_id not set')
        if (!body.reference) return alert('reference not set')

        $el.addClass('is-loading').enabled(false)

        api.call('admin/bankCredit', body, { type: 'POST' })
        .always(function() {
            $el.removeClass('is-loading').enabled(true)
        })
        .fail(app.alertXhrError)
        .done(function() {
            alertify.log(util.format(
                'User #%s credited with %s %s (%s)',
                userId,
                body.amount,
                body.currency_id,
                body.reference), 'success', 30e3)

            $el.find('input').val('')
            $el.find('.user input').focus()
        })
    })

    $el.on('click', '.add-bank-account', function(e) {
        e.preventDefault()
        var modal = require('./addaccount')(app, api, userId)
        modal.$el.on('added', refreshBankAccounts)
    })

    debug('looking up bank accounts for %s...', userId)

    function refreshBankAccounts() {
        api.call('admin/users/' + userId + '/bankAccounts')
        .fail(app.alertXhrError)
        .done(function(accounts) {
            $el.find('.bank-account select').html(accounts.map(function(a) {
                return util.format('<option value="%s">%s (%s)</option>',
                    a.id, a.displayName || 'Unnamed', a.iban || a.accountNumber)
            }))
        })
    }

    refreshBankAccounts()

    app.section('admin')
    $el.find('.nav a[href="#admin/credit"]').parent().addClass('active')

    return controller
}
