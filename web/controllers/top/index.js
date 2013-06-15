var _ = require('lodash')

module.exports = function() {
    var balanceTemplate = require('./balance.html')
    , $el = $(require('./template.html')())
    , controller = {
        $el: $el
    }
    , $summary = controller.$el.find('.account-summary')
    , balancesTimer
    , $balances = $summary.find('.balances')
    , oldBalances

    function balancesChanged(balances) {
        balances = _.filter(balances, function(x) {
            return x.available > 0 || x.currency == 'BTC'
        })

        $balances.html($.map(balances, function(item) {
            return balanceTemplate(item)
        }))

        if (oldBalances) {
            var changed = _.filter(balances, function(x) {
                var ob = _.find(oldBalances, { currency: x.currency })
                return !ob || ob.available != x.available
            })

            _.each(changed, function(x) {
                var $available = $balances.find('.balance[data-currency="' +
                    x.currency + '"] .available')
                $available.addClass('flash')
            })
        }

        oldBalances = balances
    }

    caches.balances.on('change', function(balances) {
        balancesChanged(balances)
        balancesTimer && clearTimeout(balancesTimer)
        balancesTimer = setTimeout(caches.balances.refresh, 30e3)
    })

    user.on('change', function(changes, user) {
        $summary.find('.email').html(user.email)
        caches.balances.refresh()
    })

    return controller
}
