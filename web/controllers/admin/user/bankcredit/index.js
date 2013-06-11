var util = require('util')
, _ = require('lodash')
, debug = require('../../../../util/debug')('admin:bankcredit')
, header = require('../header')
, template = require('./template.html')

module.exports = function(app, api, userId) {
    var $el = $('<div class="admin-bank-credit">').html(template())
    , controller = {
        $el: $el
    }

    // Navigation partial
    $el.find('.nav-container').replaceWith(header(userId, 'bank-credit').$el)

    $el.on('submit', 'form', function(e) {
        e.preventDefault()

        var $el = $(this)

        var body = {
            user_id: userId,
            amount: $el.find('.amount input').val(),
            reference: $el.find('.reference input').val(),
            currency_id: $el.find('.currency input').val()
        }

        if (!body.amount) return alert('amount id not set')
        if (!body.currency_id) return alert('currency_id not set')
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
            $el.find('.user input').focusSoon()
        })
    })

    $el.find('.nav a[href="#admin/credit"]').parent().addClass('active')

    return controller
}
