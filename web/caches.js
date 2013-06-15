var EventEmitter = require('events').EventEmitter
, _ = require('lodash')
, bitcoinAddress
, litecoinAddress
, rippleAddress

function createCache(refresh, idAttribute, expires, now) {
    var models = {}
    , timer

    _.extend(models, EventEmitter.prototype)
    EventEmitter.call(models)

    models.refresh = function() {
        timer && clearTimeout(timer)
        refresh()
        .always(function() {
            if (!expires) return
            timer = setTimeout(models.refresh, expires)
        })
        .done(function(newModels) {
            _.each(newModels, function(newModel) {
                var id = newModel[idAttribute || 'id']
                , model = models[id]
                if (model) {
                    _.extend(model, newModel)
                } else {
                    models[id] = newModel
                    newModel.id = id
                }
            })
            models.emit('change', models)
        })
    }
    now && models.refresh()
    return models
}

exports.balances = createCache(api.balances, 'currency', 60e3)
exports.markets = createCache(api.markets, 'id', 240e3, true)
exports.currencies = createCache(api.currencies, 'id', 240e3, true)

exports.bitcoinAddress = function() {
    var d = $.Deferred()
    if (bitcoinAddress) d.resolve(bitcoinAddress)
    return api.call('v1/BTC/address')
    .then(function(result) {
        return result.address
    })
}

exports.litecoinAddress = function() {
    var d = $.Deferred()
    if (litecoinAddress) d.resolve(litecoinAddress)
    return api.call('v1/LTC/address')
    .then(function(result) {
        return result.address
    })
}

exports.rippleAddress = function() {
    var d = $.Deferred()
    if (rippleAddress) d.resolve(rippleAddress)
    return api.call('v1/ripple/address')
    .then(function(result) {
        return result.address
    })
}
