var EventEmitter = require('events').EventEmitter
, _ = require('lodash')
, user = module.exports = function(k, v) {
    if (!k) return user.id || null

    if (_.isPlainObject(k)) {
        _.extend(user, k)
        user.emit('change', _.keys(k), user)
        _.each(k, function(v, k) {
            user.emit('change:' + k, v, user)
        })
        return user
    } else if (v !== undefined) {
        user[k] = v
        user.emit('change', { k: v }, user)
        user.emit('change:' + k, v, user)
    }

    return user[k]
}

_.extend(user, EventEmitter.prototype)
EventEmitter.call(user)
