var adminBalances = require('../controllers/admin/balances')
, adminUsers = require('../controllers/admin/users')
, adminUser = require('../controllers/admin/user')
, adminWithdraws = require('../controllers/admin/withdraws')
, adminBankCredit = require('../controllers/admin/bankcredit')

module.exports = {
    configure: function(app, api, router, $section) {
        router
        .add(/^admin\/users\/(\d+)$/, function(userId) {
            if (!app.authorize()) return
            $section.html(adminUser(app, api, userId).$el)
        })
        .add(/^admin\/balances$/, function() {
            if (!app.authorize()) return
            $section.html(adminBalances(app, api).$el)
        })
        .add(/^admin\/users$/, function() {
            if (!app.authorize()) return
            $section.html(adminUsers(app, api).$el)
        })
        .add(/^admin\/withdraws$/, function() {
            if (!app.authorize()) return
            $section.html(adminWithdraws(app, api).$el)
        })
        .add(/^admin\/bankcredit\/(\d+)$/, function(userId) {
            if (!app.authorize()) return
            $section.html(adminBankCredit(app, api, userId).$el)
        })
    }
}
