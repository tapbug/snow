var adminBalances = require('../controllers/admin/balances')
, adminUsers = require('../controllers/admin/users')
, adminUser = require('../controllers/admin/user')
, adminWithdraws = require('../controllers/admin/withdraws')
, adminUserBankAccounts = require('../controllers/admin/user/bankaccounts')
, adminUserWithdrawRequests = require('../controllers/admin/user/withdrawrequests')
, adminUserActivity = require('../controllers/admin/user/activity')
, adminUserBankCredit = require('../controllers/admin/user/bankcredit')
, admin = require('../controllers/admin')

module.exports = {
    configure: function(app, api, router, $section) {
        router
        .add(/^admin$/, function() {
            if (!app.authorize()) return
            $section.html(admin(app, api).$el)
        })
        .add(/^admin\/users\/(\d+)$/, function(userId) {
            if (!app.authorize()) return
            $section.html(adminUser(app, api, userId).$el)
        })
        .add(/^admin\/users\/(\d+)\/bank-accounts$/, function(userId) {
            if (!app.authorize()) return
            app.page(adminUserBankAccounts(app, api, userId), 'admin')
        })
        .add(/^admin\/users\/(\d+)\/withdraw-requests$/, function(userId) {
            if (!app.authorize()) return
            app.page(adminUserWithdrawRequests(app, api, userId), 'admin')
        })
        .add(/^admin\/users\/(\d+)\/activity$/, function(userId) {
            if (!app.authorize()) return
            app.page(adminUserActivity(app, api, userId), 'admin')
        })
        .add(/^admin\/users\/(\d+)\/bank-credit$/, function(userId) {
            if (!app.authorize()) return
            app.page(adminUserBankCredit(app, api, userId), 'admin')
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
    }
}
