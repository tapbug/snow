var _ = require('lodash')
, debug = require('./util/debug')('router')

module.exports = function() {
    var routes = []
    , $window = $(window)

    var add = function(expr, fn) {
        routes.push({ expr: expr, fn: fn })
        return add
    }

    add.now = function() {
        var hash = window.location.hash.substr(1)

        debug('routing %s', hash)

        _.some(routes, function(route) {
            var match = route.expr.exec(hash)
            if (!match) return
            route.fn.apply(route, match.slice(1))
            return true
        })
    }

    add.go = function(hash) {
        window.location.hash = hash
    }

    $window.on('hashchange', add.now)

    return add.add = add
}
