var overview = require('../controllers/simple/overview')
, send = require('../controllers/simple/send')
, activities = require('../controllers/simple/activities')
, terms = require('../controllers/simple/terms')
, buy = require('../controllers/simple/buy')
, sell = require('../controllers/simple/sell')
, authorize = require('../authorize')
, master = require('../controllers/master')

module.exports = {
    configure: function() {
        router
        .add(/^simple$/, function() {
            if (!authorize.user()) return
            master(overview(), 'simple-overview')
        })
        .add(/^simple\/send$/, function() {
            if (!authorize.user()) return
            master(send(), 'simple-send')
        })
        .add(/^simple\/activities$/, function() {
            if (!authorize.user()) return
            master(activities(), 'simple-activities')
        })
        .add(/^simple\/terms$/, function() {
            if (!authorize.user()) return
            master(terms(), 'simple-terms')
        })
        .add(/^simple\/buy(?:\?(any))?$/, function(amount) {
            if (!authorize.user()) return
            master(buy(amount), 'simple-buy')
        })
        .add(/^simple\/sell$/, function() {
            if (!authorize.user()) return
            master(sell(), 'simple-sell')
        })
    }
}
