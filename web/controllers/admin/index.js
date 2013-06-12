var template = require('./template.html')
, header = require('./header')
, _ = require('underscore')

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
            $accounts.toggleClass('is-empty', !accounts.length)

            $accounts
            .toggleClass('is-empty', !!accounts.length)

            if (accounts.length) {
                $accounts.html(accounts.map(function(a) {
                    var template = _.template('<li><a href="#admin/users/<%= user_id %>/bank-accounts"><%= account_number %></a></li>')
                    return $(template(a))
                }))
            }
        })
    }

    refreshBtcHeight()
    refreshLtcHeight()
    refreshBankAccountsPendingVerify()

    return controller
}
