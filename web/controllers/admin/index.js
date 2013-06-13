var template = require('./template.html')
, header = require('./header')
, _ = require('underscore')
, itemTemplate = require('./bank-account-pending-verify.html')

module.exports = function(app, api) {
    var $el = $('<div class="admin">').html(template())
    , controller = {
        $el: $el
    }

    // Header
    $el.find('.header-placeholder').replaceWith(header('overview').$el)

    function refreshBtcHeight() {
        api.call('admin/btc/height')
        .fail(app.alertXhrError)
        .done(function(res) {
            $el.find('.btc-height').html(res.height)
        })
    }

    function refreshLtcHeight() {
        api.call('admin/ltc/height')
        .fail(app.alertXhrError)
        .done(function(res) {
            $el.find('.ltc-height').html(res.height)
        })
    }

    function refreshBankAccountsPendingVerify() {
        api.call('admin/bankaccounts')
        .fail(app.alertXhrError)
        .done(function(accounts) {
            var $accounts = $el.find('.bank-accounts-pending-verify .bank-accounts')

            $el.find('.bank-accounts-pending-verify').toggleClass('is-empty', !accounts.length)

            $accounts
            .toggleClass('is-empty', !!accounts.length)

            if (accounts.length) {
                $accounts.html(_.map(accounts, function(a) {
                    return $(itemTemplate(a))
                }))
            }
        })
    }

    refreshBtcHeight()
    refreshLtcHeight()
    refreshBankAccountsPendingVerify()

    return controller
}
