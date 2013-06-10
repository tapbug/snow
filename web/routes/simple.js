var overview = require('../controllers/simple/overview')
, send = require('../controllers/simple/send')
, activities = require('../controllers/simple/activities')
, terms = require('../controllers/simple/terms')
, buy = require('../controllers/simple/buy')
, sell = require('../controllers/simple/sell')

module.exports = {
    configure: function(app, api, router, $section) {
        router
        .add(/^simple$/, function() {
            if (!app.authorize()) return
            app.page(overview(app, api), 'simple-overview')
        })
        .add(/^simple\/send$/, function() {
            if (!app.authorize()) return
            app.page(send(app, api), 'simple-send')
        })
        .add(/^simple\/activities$/, function() {
            if (!app.authorize()) return
            app.page(activities(app, api), 'simple-activities')
        })
        .add(/^simple\/terms$/, function() {
            if (!app.authorize()) return
            app.section('simple-terms')
            app.page(terms(app, api), '')
        })
        .add(/^simple\/buy(?:\?(any))?$/, function(amount) {
            if (!app.authorize()) return
            app.page(buy(app, api, amount), 'simple-buy')
        })
        .add(/^simple\/sell$/, function() {
            if (!app.authorize()) return
            app.page(sell(app, api), 'simple-sell')
        })
    }
}
