/* global sjcl */
var _ = require('lodash')
, emitter = require('./util/emitter')
, api = module.exports = emitter()

function keyFromCredentials(email, password) {
    var concat = email.toLowerCase() + password
    , bits = sjcl.hash.sha256.hash(concat)
    , hex = sjcl.codec.hex.fromBits(bits)
    return hex
}

function formatQuerystring(qs) {
    var params = _.map(qs, function(v, k) {
        if (v === null) return null
        if (_.isString(v) && !v.length) return k
        return k + '=' + encodeURIComponent(v)
    })

    params = _.filter(params, function(x) {
        return x !== null
    })

    return params.length ? '?' + params.join('&') : ''
}

api.call = function(method, data, options) {
    var settings = {
        url: '/api/' + method
    }

    options = options || {}
    options.qs = options.qs || {}
    options.qs.ts = +new Date()

    if (options.key || api.key) {
        options.qs.key = options.key || api.key
    }

    if (options.type) settings.type = options.type
    else if (data) settings.type = 'POST'

    if (data) {
        settings.contentType = 'application/json; charset=utf-8'
        settings.data = JSON.stringify(data)
    }

    if (_.size(options.qs)) {
        settings.url += formatQuerystring(options.qs)
    }

    var xhr = $.ajax(settings)
    xhr.settings = settings

    return xhr
    .then(null, function(xhr, statusText, status) {
        var body = errors.bodyFromXhr(xhr)

        var error = {
            xhr: xhr,
            xhrOptions: options,
            body: body,
            name: body.name || null,
            message: body.message | null
        }

        return error
    })
}

api.loginWithKey = function(key) {
    return api.call('v1/whoami', null, { key: key })
    .then(function(user) {
        $.cookie('apiKey', key)
        $.cookie('existingUser', true, { path: '/', expires: 365 * 10 })

        api.key = key
        api.user = user
        api.trigger('user', user)

        $app.addClass('is-logged-in')
    })
}

api.login = function(email, password) {
    var key = keyFromCredentials(email, password)
    return api.loginWithKey(key)
}

api.register = function(email, password, simple) {
    return api.call('v1/users', {
        email: email,
        key: keyFromCredentials(email, password),
        simple: simple
    })
    .done(function() {
        return api.login(email, password)
    })
}

api.balances = function() {
    return api.call('v1/balances')
    .done(function(balances) {
        api.balances.current = balances
        api.trigger('balances', balances)
    })
}

api.currencies = function() {
    return api.call('v1/currencies')
    .done(function(currencies) {
        api.currencies.value = currencies
        api.trigger('currencies', currencies)
    })
}

api.bootstrap = function() {
    return $.when(
        api.currencies(),
        api.markets()
    ).done(function() {
        $app.removeClass('is-loading')
    })
}

api.sendToUser = function(email, amount, currency, allowNewUser) {
    return api.call('v1/send', {
        email: email,
        amount: amount,
        currency: currency,
        allowNewUser: allowNewUser
    })
}

api.resetPasswordEnd = function(email, phoneCode, newPassword) {
    var key = keyFromCredentials(email, newPassword)
    , body = { email: email, code: phoneCode, key: key }

    return api.call('v1/resetPassword/end', body, { type: 'POST' })
}

api.changePassword = function(newPassword) {
    var newKey = keyFromCredentials(api.user.email, newPassword)
    return api.call('v1/keys/replace', { key: newKey })
}

api.patchUser = function(attrs) {
    return api.call('v1/users/current', attrs, { type: 'PATCH' })
}

api.markets = function() {
    return api.call('v1/markets')
    .then(function(markets) {
        api.trigger('markets', markets)
    })
}

// curl -H "Content-type: application/json" -X POST \
// -d '{ "amount": "123.45", "currency": "BTC" }' \
// https://api.justcoin.com/v1/vouchers
//
// { "voucher": "A1B2C3E4F5FF" }
api.createVoucher = function(amount, currency) {
    return api.call('v1/vouchers', {
        amount: amount,
        currency: currency
    }).then(function(res) {
        return res.voucher
    })
}

// curl -X POST https://api.justcoin.com/v1/vouchers/A1B2C3E4F5FF/redeem
//
// 200: { "amount": "123.45", "currency": "BTC" }
// 204: (voucher cancelled)
api.redeemVoucher = function(code) {
    return api.call('v1/vouchers/' + code + '/redeem', null, { type: 'POST' })
    .then(function(body, status, xhr) {
        if (xhr.status == 204) {
            return null
        }

        return body
    })
}

api.bitcoinAddress = function() {
    return api.call('v1/BTC/address')
    .then(function(result) {
        return result.address
    })
    .done(function(address) {
        api.trigger('bitcoinAddress', address)
    })
}

api.litecoinAddress = function() {
    return api.call('v1/LTC/address')
    .then(function(result) {
        return result.address
    })
    .done(function(address) {
        api.trigger('litecoinAddress', address)
    })
}

api.rippleAddress = function() {
    return api.call('v1/ripple/address')
    .then(function(result) {
        return result.address
    })
    .done(function(address) {
        api.trigger('rippleAddress', address)
    })
}
