var _ = require('lodash')
, noop = function() {}

_.each(['console', 'error', 'trace'], function(n) {
    if (window[n]) return
    window[n] = noop
})
