var num = require('num')
, _ = require('lodash')
, debug = require('debug')('simple')

module.exports = function(app, api) {
    var $el = $(require('./template.html')())
    , controller = {
        $el: $el
    }

    function inner(what) {
        $el.find('.wrapper').empty().append(what.$el)
    }

    function overview() {
        inner(require('./overview')(app, api))

        $el.find('.nav .overview')
        .addClass('active')
        .siblings()
        .removeClass('active')
    }

    function activities() {
        inner(require('./activities')(app, api))

        $el.find('.nav .activities')
        .addClass('active')
        .siblings()
        .removeClass('active')
    }

    $el.on('click', '.buy a', function(e) {
        e.preventDefault()

        var modal = require('./buy')(app, api)
        modal.$el.modal()
    })

    $el.on('click', '.terms a', function(e) {
        e.preventDefault()
        var modal = require('./terms')(app, api)
        modal.$el.modal()
    })

    $el.on('click', '.activities a', function(e) {
        e.preventDefault()
        activities()
    })


    $el.on('click', '.overview a', function(e) {
        e.preventDefault()
        overview()
    })

    overview()

    return controller
}
