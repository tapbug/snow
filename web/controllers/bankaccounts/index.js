module.exports = function(app, api) {
    var $el = $(require('./template.html')())
    , controller = {
        $el: $el
    }
    , $add = $el.find('.add')
    , addModalTemplate = require('./add.html')

    function refresh() {
        api.call('v1/bankAccounts')
        .fail(app.alertXhrError)
        .done(renderAccounts)
    }

    function renderAccounts(accounts) {
        var $accounts = $el.find('.accounts')
        , itemTemplate = require('./item.html')
        , $items = $.map(accounts, function(account) {
            return $(itemTemplate(account))
        })
        $accounts.html($items)
    }

    // Add account
    $add.on('click', function(e) {
        var $modal = $(addModalTemplate())
        $modal.modal()

        $modal.on('click', '.add-button', function(e) {
            e.preventDefault()
            var $accountNumber = $modal.find('.account-number input')
            , accountNumber = $accountNumber.val()

            if (!accountNumber.length) {
                $modal.modal('hide')
                return
            }

            $add.loading(true, 'Adding...')
            $modal.modal('hide')

            api.call('v1/bankAccounts', {
                accountNumber: accountNumber
            }, { type: 'POST' })
            .always(function() {
                $add.loading(false)
            })
            .fail(app.alertXhrError)
            .done(refresh)
        })

        $modal.find('.account-number input').focusSoon()
    })

    // Verify account
    $el.on('click', '.account .verify', function() {
        var $code = $(this).closest('td').find('.code')
        , $verify = $(this).loading(true, 'Verifying...')
        , $account = $(this).closest('.account')

        if (!$code.val()) {
            return alert('Code missing')
        }

        var id = $account.attr('data-id')

        api.call('v1/bankAccounts/' + id + '/verify', { code: $code.val() },  { type: 'POST' })
        .fail(function(xhr) {
            $verify.loading(false)
            app.alertXhrError(xhr)
        })
        .done(function() {
            refresh()
        })
    })

    refresh()

    return controller
}
