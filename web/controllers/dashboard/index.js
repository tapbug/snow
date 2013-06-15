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

    function numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    }

    function formatNumber(n, p) {
        var s = num(n).set_precision(p || 2).toString()
        return numberWithCommas(s)
    }

    function balancesUpdated(balances) {
        $btc.find('.available').html(formatNumber(balances['BTC'].available) + ' BTC')
        $ltc.find('.available').html(formatNumber(balances['LTC'].available) + ' LTC')
        $xrp.find('.available').html(formatNumber(balances['XRP'].available) + ' XRP')
        $nok.find('.available').html(formatNumber(balances['NOK'].available) + ' NOK')
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
