var _ = require('lodash')
, app = require('./app')

module.exports = function() {
    var api = {}

    api.keyFromCredentials = function(email, password) {
        var concat = email.toLowerCase() + password
        , bits = sjcl.hash.sha256.hash(concat)
        , hex = sjcl.codec.hex.fromBits(bits)
        return hex
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
            var params = _.map(options.qs, function(v, k) {
                // this is a little hackish. to send a key without a value
                if (v === null) return null
                if (_.isString(v) && !v.length) return k
                return k + '=' + encodeURIComponent(v)
            })

            params = _.filter(params, function(x) {
                return x !== null
            })

            settings.url += '?' + params.join('&')
        }

        var xhr = $.ajax(settings)
        xhr.settings = settings

        return xhr
    }

    api.loginWithKey = function(key) {
        return api.call('v1/whoami', null, { key: key })
        .then(function(user) {
            $.cookie('apiKey', key)
            $.cookie('existingUser', true, { expires: 365 * 10 })
            api.key = key
            app.user(user)
        })
    }

    api.login = function(email, password) {
        var key = api.keyFromCredentials(email, password)
        return api.loginWithKey(key)
    }

    api.register = function(email, password, simple) {
        return api.call('v1/users', {
            email: email,
            key: api.keyFromCredentials(email, password),
            simple: simple
        })
        .then(function() {
            return api.login(email, password)
        })
    }

    api.balances = function() {
        api.call('v1/balances')
        .done(_.bind(app.balances, app))
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

    return api
}
