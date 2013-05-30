var _ = require('underscore')
, noop = function() {}

_.each(['console', 'error', 'trace'], function(n) {
    if (window[n]) return
    window[n] = noop
})
