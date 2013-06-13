var _ = require('lodash')
, template = require('./template.html')
, format = require('util').format
, num = require('num')
, numbers = require('../../../util/numbers')
, sjcl = require('../../../vendor/sjcl')

module.exports = function(app, api) {
    var $el = $('<div class="redeem-voucher">').html(template())
    , controller = {
        $el: $el
    }
    , $form = $el.find('.form')
    , $code = $form.find('.code')
    , $submit = $form.find('.submit')

    // Validation
    function validateCode(emptyIsError) {
        var code = $form.field('code').val()
        $code.removeClass('error is-invalid is-empty')

        if (!code.length) {
            $code.addClass('is-empty')
            if (emptyIsError === true) $code.addClass('error')
            return
        }

        code = parseCode()

        if (code.length != 12) {
            $code.addClass('is-invalid error')
            alert('length is bad')
            return
        }

        var id = code.substr(0, 10)
        , bits = sjcl.hash.sha256.hash(id)
        , hex = sjcl.codec.hex.fromBits(bits).toUpperCase()

        if (hex.substr(0, 2) != code.substr(10, 2)) {
            $code.addClass('is-invalid error')
            alert('checksum is bad ' + 'est ' + hex.substr(0, 2) + ' vs ' + code.substr(10, 2))
            return
        }

        return true
    }

    $code.on('change keyup', validateCode.bind(this, false))

    function parseCode() {
        var result = $form.field('code').val()
        result = result.replace(/[^a-f0-9]/gi, '')
        return result.toUpperCase()
    }

    // Submit
    $form.on('submit', function(e) {
        e.preventDefault()

        if (!validateCode(true)) {
            $form.field('code').focus()
            $submit.shake()
            return
        }

        $submit.loading(true)

        $form.field('code')
        .enabled(false)

        var code = parseCode()

        api.redeemVoucher(code)
        .always(function() {
            $form.field('code')
            .enabled(true)
            $submit.loading(false)
        })
        .fail(app.alertXhrError)
        .done(function(body) {
            if (body) {
                $el.addClass('is-redeemed')
                .find('.credit')
                .html(numbers.formatAmount(body.amount, body.currency) + ' ' + body.currency)
            } else {
                $el.addClass('is-cancelled')
            }

            $form.field('code').val('').focus()
            api.balances()
        })
    })

    $el.on('click', 'a[href="#reload"]', function(e) {
        e.preventDefault()
        app.router.refresh()
    })

    $form.field('code').focusSoon()

    return controller
}
