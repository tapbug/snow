module.exports = function(app, api) {
    var $el = $(require('./template.html')())
    , controller = {
        $el: $el
    }
    , $callForm = $el.find('form.call')
    , $codeForm = $el.find('form.code')
    , $number = $callForm.find('input[name="phone"]')
    , $code = $codeForm.find('input[name="code"]')
    , number

    $callForm.on('submit', function(e) {
        e.preventDefault()

        number = $number.val().replace(/[^\d\+]/g, '')

        if (!/^\+\d{2,16}$/.test(number)) {
            return alert('Please enter your number as +46 123456 where 46 is the country code')
        }

        $callForm.find('button')
        .enabled(false)
        .addClass('is-loading')
        .html(app.i18n('verifyphone.calling you'))

        $number.enabled(false)

        setTimeout(function() {
            $codeForm.show()
        }, 10000)

        api.call('v1/users/verify/call', { number: number })
        .done(function() {
        })
        .fail(function(xhr) {
            var err = app.errorFromXhr(xhr)
            alert(JSON.stringify(err, null, 4))
        })
    })

    $codeForm.on('submit', function(e) {
        e.preventDefault()

        $codeForm.find('button')
        .enabled(false)
        .addClass('is-loading')
        .html(app.i18n('verifyphone.verifying code'))

        var code = $code.val()

        if (!/^\d{4}$/.test(code)) {
            return alert('The code should be four digits')
        }

        $code.enabled(false)

        api.call('v1/users/verify', { code: code })
        .done(function() {
            app.user.phone = number
            $el.modal('hide')

            alertify.log(app.i18n('verifyphone.verified', app.user.phone))
        })
        .fail(function(xhr) {
            var err = app.errorFromXhr(xhr)
            alert(JSON.stringify(err, null, 4))
            window.location = '/'
        })
    })

    return controller
}
