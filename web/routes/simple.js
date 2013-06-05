var overview = require('../controllers/simple/overview')
, send = require('../controllers/simple/send')
, buy = require('../controllers/simple/buy')
, sell = require('../controllers/simple/sell')
, app = require('../app')

module.exports = {
    configure: function(app, api, router, $section) {
        router
        .add(/^simple$/, function() {
            if (!app.authorize()) return
            app.section('simple-overview')
            $section.html(overview(app, api).$el)
        })
        .add(/^simple\/send$/, function() {
            if (!app.authorize()) return
            app.section('simple-send')
            $section.html(send(app, api).$el)
        })
        .add(/^simple\/buy(?:\?(any))?$/, function(amount) {
            if (!app.authorize()) return
            app.section('simple-buy')
            $section.html(buy(app, api, amount).$el)
        })
        .add(/^simple\/sell$/, function() {
            if (!app.authorize()) return
            app.section('simple-sell')
            $section.html(sell(app, api).$el)
        })
    }
}
