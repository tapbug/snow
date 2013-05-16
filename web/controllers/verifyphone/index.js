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

        $callForm.find('button')
        .enabled(false)
        .addClass('is-loading')
        .html(app.i18n('verifyphone.calling you'))

        $number.enabled(false)

        setTimeout(function() {
            $codeForm.show()
        }, 10000)

        var number = $number.val().replace(/[^\d\+]/g, '')

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

        $code.enabled(false)

        api.call('v1/users/verify', { code: $code.val() })
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
