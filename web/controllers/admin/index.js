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

    function refreshInternalBtcHeight() {
        api.call('admin/btc/height')
        .fail(app.alertXhrError)
        .done(function(res) {
            $el.find('.internal-btc-height').html(res.height)
        })
    }

    function refreshExternalBtcHeight() {
        $.ajax({
            url: 'http://www.corsproxy.com/blockchain.info/latestblock'
        })
        .fail(app.alertXhrError)
        .done(function(res) {
            $el.find('.external-btc-height').html(res.height)
        })
    }

    function refreshInternalLtcHeight() {
        api.call('admin/ltc/height')
        .fail(app.alertXhrError)
        .done(function(res) {
            $el.find('.internal-ltc-height').html(res.height)
        })
    }

    function refreshExternalLtcHeight() {
        $.ajax({
            url: 'http://www.corsproxy.com/explorer.litecoin.net/chain/Litecoin/q/getblockcount'
        })
        .fail(app.alertXhrError)
        .done(function(res) {
            $el.find('.external-ltc-height').html(res)
        })
    }

    function refreshBankAccountsPendingVerify() {
        api.call('admin/bankaccounts')
        .fail(app.alertXhrError)
        .done(function(accounts) {
            var $accounts = $el.find('.bank-accounts-pending-verify .bank-accounts')

            if (accounts.length) {
                $accounts.html(accounts.map(function(a) {
                    var template = _.template('<a href="#admin/users/<%= user_id %>/bank-accounts"><%= account_number %></a>')
                    return $(template(a))
                }))
            } else {
                $accounts.html('No accounts pending verify')
            }
        })
    }

    refreshInternalBtcHeight()
    refreshExternalBtcHeight()
    refreshInternalLtcHeight()
    refreshExternalLtcHeight()
    refreshBankAccountsPendingVerify()

    return controller
}
