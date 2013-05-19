module.exports = function(app, api) {
    var balanceTemplate = require('./balance.html')
     $el = $(require('./template.html')())
    , controller = {
        $el: $el
    }
    , $summary = controller.$el.find('.account-summary')
    , $balances = $summary.find('.balances')
    , balancesTimer = null

    function balancesChanged(balances) {
        $balances.html($.map(balances, function(item) {
            return balanceTemplate(item)
        }))
    }

    app.on('balances', function(balances) {
        balancesChanged(balances)
        balancesTimer && clearTimeout(balancesTimer)
        balancesTimer = setTimeout(api.balances, 30e3)
    })

    app.on('user', function(user) {
        $summary.find('.email').html(user.email)
        api.balances()
    })

    $el.on('click', '.brand', function(e) {
        if (!app.user()) return
        e.preventDefault()
        app.router.go('dashboard')
    })

    return controller
}
