var util = require('util')
, noop = function() {}

module.exports = function(name) {
    if (typeof console == 'undefined') {
        return noop
    }

    if (typeof console.log == 'undefined') {
        return noop
    }

    name = name || ''

    return function() {
        try {
            var message = util.format.apply(util, arguments)
            console.log('[' + name + '] ' + message)
        } catch (e) {
        }
    }
}
