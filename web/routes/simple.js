var overview = require('../controllers/simple/overview')
, send = require('../controllers/simple/send')
, buy = require('../controllers/simple/buy')
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
        .add(/^simple\/buy$/, function() {
            if (!app.authorize()) return
            app.section('simple-buy')
            $section.html(buy(app, api).$el)
        })
    }
}
