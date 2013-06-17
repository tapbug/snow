var num = require('num')
, Activities = require('../activities')
, Withdraws = require('./withdraws')
, format = require('util').format

module.exports = function() {
    var template = require('./template.html')
    , controller = {
        $el: $('<div class="dashboard container"></div>').html(template())
    }
    , $balances = controller.$el.find('.balances')
    , $btc = $balances.find('.btc')
    , $ltc = $balances.find('.ltc')
    , $xrp = $balances.find('.xrp')
    , $nok = $balances.find('.nok')
    , activities = Activities()
    , withdraws = Withdraws()
    , $activities = controller.$el.find('.activities')
    , $withdraws = controller.$el.find('.withdraws')
    , $depositXrp = controller.$el.find('.deposit-xrp')
    , $depositNok = controller.$el.find('.deposit-nok')

    $activities.replaceWith(activities.$el)
    $withdraws.replaceWith(withdraws.$el)

    $depositNok.on('click', function(e) {
        e.preventDefault()
        window.location.hash = '#depositnok'
    })

    function balancesUpdated(balances) {
        $btc.find('.available').html(numbers.format(balances['BTC'].available, { maxPrecision: 2, ts: true }))
        $ltc.find('.available').html(numbers.format(balances['LTC'].available, { maxPrecision: 2, ts: true }))
        $xrp.find('.available').html(numbers.format(balances['XRP'].available, { maxPrecision: 2, ts: true }))
        $nok.find('.available').html(numbers.format(balances['NOK'].available, { maxPrecision: 2, ts: true }))
    }

    caches.balances.on('change', balancesUpdated.bind(this, caches.balances))
    caches.balances.refresh()

    caches.rippleAddress().done(function(address) {
        $depositXrp.attr('href', format('https://ripple.com//send?to=%s&dt=%s',
            address, user.id))
    })

    // TODO: Leaking timers

    caches.balances.refresh()

    return controller
}
