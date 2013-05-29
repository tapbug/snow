var _ = require('lodash')
, markets = require('./controllers/markets')
, home = require('./controllers/home')
, orders = require('./controllers/orders')
, withdrawbtc = require('./controllers/withdrawbtc')
, withdrawltc = require('./controllers/withdrawltc')
, withdrawripple = require('./controllers/withdrawripple')
, login = require('./controllers/login')
, register = require('./controllers/register')
, market = require('./controllers/market')
, notfound = require('./controllers/notfound')
, dashboard = require('./controllers/dashboard')
, terms = require('./controllers/terms')
, privacy = require('./controllers/privacy')
, depositbtc = require('./controllers/depositbtc')
, depositnok = require('./controllers/depositnok')
, identity = require('./controllers/identity')
, resetPassword = require('./controllers/resetPassword')
, apiKeys = require('./controllers/apiKeys')
, changepassword = require('./controllers/changepassword')
, depositltc = require('./controllers/depositltc')
, withdrawbank = require('./controllers/withdrawbank')
, adminBalances = require('./controllers/admin/balances')
, adminUsers = require('./controllers/admin/users')
, adminUser = require('./controllers/admin/user')
, adminWithdraws = require('./controllers/admin/withdraws')
, adminBankCredit = require('./controllers/admin/bankcredit')
, $app = $('body')

function section(name) {
    _.each($app[0].className.split(/\s+/), function(name) {
        if (!/is-section-/.test(name)) return
        $app.removeClass(name)
    })
    $app.addClass('is-section-' + name)
}

module.exports = function(app, api, router) {
    var $section = $('#section')

    router
    .add(/^$/, function() {
        if (app.user()) {
            $section.html(dashboard(app, api).$el)
            section('dashboard')
        } else {
            $section.html(home().$el)
            section('home')
        }
    })
    .add(/^markets$/, function() {
        $section.html(markets(app, api).$el)
        section('markets')
    })
    .add(/^apiKeys$/, function() {
        $section.html(apiKeys(app, api).$el)
        section('home')
    })
    .add(/^resetPassword$/, function() {
        $section.html(resetPassword(app, api).$el)
        section('resetPassword')
    })
    .add(/^signOut$/, function() {
        $.removeCookie('apiKey')
        window.location = '/'
    })
    .add(/^markets\/(.+)$/, function(id) {
        $section.html(market(app, api, id).$el)
        section('market')
    })
    .add(/^register$/, function() {
        $section.html(register(app, api).$el)
        section('register')
    })
    .add(/^login(?:\?after=(.+))?$/, function(after) {
        $section.html(login(app, api, after).$el)
        section('login')
    })
    .add(/^orders$/, function() {
        if (!app.authorize()) return
        $section.html(orders(app, api).$el)
        section('orders')
    })
    .add(/^withdrawbtc$/, function() {
        if (!app.authorize()) return
        $section.html(withdrawbtc(app, api).$el)
        section('withdrawbtc')
    })
    .add(/^withdrawltc$/, function() {
        if (!app.authorize()) return
        $section.html(withdrawltc(app, api).$el)
        section('withdrawltc')
    })
    .add(/^withdrawripple$/, function() {
        if (!app.authorize()) return
        $section.html(withdrawripple(app, api).$el)
        section('withdrawripple')
    })
    .add(/^identity(?:\?after=(.+))?$/, function(after) {
        if (!app.authorize()) return
        $section.html(identity(app, api, after).$el)
        section('identity')
    })
    .add(/^depositbtc$/, function() {
        if (!app.authorize()) return
        $section.html(depositbtc(app, api).$el)
        section('depositbtc')
    })
    .add(/^changepassword$/, function() {
        if (!app.authorize()) return
        $section.html(changepassword(app, api).$el)
        section('changepassword')
    })
    .add(/^terms$/, function() {
        $section.html(terms(app, api).$el)
        section('terms')
    })
    .add(/^privacy$/, function() {
        $section.html(privacy(app, api).$el)
        section('privacy')
    })
    .add(/^depositltc$/, function() {
        if (!app.authorize()) return
        $section.html(depositltc(app, api).$el)
        section('depositltc')
    })
    .add(/^withdrawbank\?currency=([A-Z]{3})$/, function(currency) {
        if (!app.authorize()) return
        $section.html(withdrawbank(app, api, currency).$el)
        section('withdrawbank')
    })
    .add(/^depositnok$/, function() {
        if (!app.authorize()) return
        if (!app.user().firstName) {
            window.location.hash = '#identity?after=depositnok'
            return
        }
        $section.html(depositnok(app, api).$el)
        section('depositnok')
    })
    .add(/^admin\/users\/(\d+)$/, function(userId) {
        if (!app.authorize()) return
        $section.html(adminUser(app, api, userId).$el)
        section('admin-balances')
    })
    .add(/^admin\/balances$/, function() {
        if (!app.authorize()) return
        $section.html(adminBalances(app, api).$el)
        section('admin-balances')
    })
    .add(/^admin\/users$/, function() {
        if (!app.authorize()) return
        $section.html(adminUsers(app, api).$el)
        section('admin-users')
    })
    .add(/^admin\/withdraws$/, function() {
        if (!app.authorize()) return
        $section.html(adminWithdraws(app, api).$el)
        section('admin-withdraws')
    })
    .add(/^admin\/bankcredit\/(\d+)$/, function(userId) {
        if (!app.authorize()) return
        $section.html(adminBankCredit(app, api, userId).$el)
        section('admin-bank-credit')
    })
    .add(/^(.+)$/, function(hash) {
        $section.html(notfound(hash).$el)
        section('notfound')
    })
}
