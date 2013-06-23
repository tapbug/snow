var _ = require('lodash')

exports.patch = function(oldModel, newModel) {
    return _.reduce(newModel, function(p, v, k) {
        console.log(JSON.stringify(p, null, 4))
        if (v !== oldModel[k]) p[k] = v
        return p
    }, {})
}
