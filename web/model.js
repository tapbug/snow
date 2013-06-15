var EventEmitter = require('events').EventEmitter
, _ = require('lodash')
module.exports = function() {
    var model = function(k, v) {
        if (!k) return model.id || null
        if (_.isPlainObject(k)) {
            var changes = []
            _.some(model, function(v, k) {
                if (model[k] === v) return
                model[k] = v
                model.emit('change:' + k, v)
                changes.push(k)
            })
            changes.length && model.emit('change', changes)
            return model
        } else if (v !== undefined) {
            model[k] = v
            model.emit('change', { k: v })
            model.emit('change:' + k, v)
        }
        return model[k]
    }

    _.extend(model, EventEmitter.prototype)
    EventEmitter.call(model)
    return model
}
