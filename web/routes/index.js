var markets = require('../controllers/markets')
, home = require('../controllers/home')
, orders = require('../controllers/orders')
, withdrawbtc = require('../controllers/withdrawbtc')
, withdrawltc = require('../controllers/withdrawltc')
, withdrawripple = require('../controllers/withdrawripple')
, login = require('../controllers/login')
, register = require('../controllers/register')
, market = require('../controllers/market')
, notfound = require('../controllers/notfound')
, dashboard = require('../controllers/dashboard')
, terms = require('../controllers/terms')
, privacy = require('../controllers/privacy')
, depositbtc = require('../controllers/depositbtc')
, depositnok = require('../controllers/depositnok')
, identity = require('../controllers/identity')
, resetPassword = require('../controllers/resetPassword')
, apiKeys = require('../controllers/apiKeys')
, changepassword = require('../controllers/changepassword')
, createvoucher = require('../controllers/vouchers/create')
, redeemvoucher = require('../controllers/vouchers/redeem')
, vouchers = require('../controllers/vouchers/index')
, depositltc = require('../controllers/depositltc')
, withdrawbank = require('../controllers/withdrawbank')
, bankaccounts = require('../controllers/bankaccounts')

module.exports = function(app, api, router) {
    var $section = $('#section')

    router
    .add(/^$/, function() {
        if (app.user()) {
            if (app.user().simple) {
                router.go('simple')
            } else {
                app.page(dashboard(app, api))
            }
        } else {
            app.page(home(), 'landing')
        }
    })
    .add(/^markets$/, function() {
        app.page(markets(app, api), 'markets')
    })
    .add(/^apiKeys$/, function() {
        app.page(apiKeys(app, api), 'home')
    })
    .add(/^resetPassword$/, function() {
        app.page(resetPassword(app, api), 'resetPassword')
    })
    .add(/^signOut$/, function() {
        $.removeCookie('apiKey')
        window.location = '/'
    })
    .add(/^markets\/(.+)$/, function(id) {
        app.page(market(app, api, id), 'market')
    })
    .add(/^register$/, function() {
        app.page(register(app, api), 'register')
    })
    .add(/^login(?:\?after=(.+))?$/, function(after) {
        app.page(login(app, api, after), 'login')
    })
    .add(/^orders$/, function() {
        if (!app.authorize()) return
        app.page(orders(app, api), 'orders')
    })
    .add(/^vouchers$/, function() {
        if (!app.authorize()) return
        app.page(vouchers(app, api))
    })
    .add(/^vouchers\/create$/, function() {
        if (!app.authorize()) return
        app.page(createvoucher(app, api))
    })
    .add(/^vouchers\/redeem$/, function() {
        if (!app.authorize()) return
        app.page(redeemvoucher(app, api))
    })
    .add(/^withdrawbtc$/, function() {
        if (!app.authorize()) return
        app.page(withdrawbtc(app, api), 'withdrawbtc')
    })
    .add(/^bankaccounts$/, function() {
        if (!app.authorize()) return
        if (!app.requireUserIdentity()) return
        app.page(bankaccounts(app, api), 'bankaccounts')
    })
    .add(/^withdrawltc$/, function() {
        if (!app.authorize()) return
        app.page(withdrawltc(app, api), 'withdrawltc')
    })
    .add(/^withdrawripple$/, function() {
        if (!app.authorize()) return
        app.page(withdrawripple(app, api), 'withdrawripple')
    })
    .add(/^identity(?:\?after=(.+))?$/, function(after) {
        if (!app.authorize()) return
        app.page(identity(app, api, after), 'identity')
    })
    .add(/^depositbtc$/, function() {
        if (!app.authorize()) return
        app.page(depositbtc(app, api), 'depositbtc')
    })
    .add(/^changepassword$/, function() {
        if (!app.authorize()) return
        app.page(changepassword(app, api), 'changepassword')
    })
    .add(/^terms$/, function() {
        app.page(terms(app, api), 'terms')
    })
    .add(/^privacy$/, function() {
        app.page(privacy(app, api), 'privacy')
    })
    .add(/^depositltc$/, function() {
        if (!app.authorize()) return
        app.page(depositltc(app, api), 'depositltc')
    })
    .add(/^withdrawbank\?currency=([A-Z]{3})$/, function(currency) {
        if (!app.authorize()) return
        if (!app.requireUserIdentity()) return

        app.page(withdrawbank(app, api, currency), 'withdrawbank')
    })
    .add(/^depositnok$/, function() {
        if (!app.authorize()) return
        if (!app.requireUserIdentity()) return
        app.page(depositnok(app, api), 'depositnok')
    })

    require('./admin').configure(app, api, router, $section)
    require('./simple').configure(app, api, router, $section)

    router
    .add(/^(.+)$/, function(hash) {
        app.page(notfound(hash))
    })
}
