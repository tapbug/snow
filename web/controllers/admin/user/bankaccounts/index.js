var util = require('util')
, format = util.format
, header = require('../header')

module.exports = function(app, api, userId) {
    var itemTemplate = require('./item.html')
    , $el = $(require('./template.html')())
    , controller = {
        $el: $el
    }
    , $items = controller.$el.find('.accounts')

    // Insert header
    $el.find('.header-placeholder').replaceWith(header(userId, 'bank-accounts').$el)

    function itemsChanged(items) {
        $items.html($.map(items, function(item) {
            return itemTemplate(item)
        }))
    }

    function refresh() {
        api.call('admin/users/' + userId + '/bankAccounts').done(itemsChanged)
    }

    $items.on('click', '.start-verify', function(e) {
        e.preventDefault()
        var id = $(this).closest('tr').attr('data-id')
        $(this).enabled(false).loading(true, 'Starting verify...')
        var url = format('admin/users/%s/bankAccounts/%s/startVerify', userId, id)

        api.call(url, {}, { type: 'POST' })
        .fail(app.alertXhrError)
        .done(function() {
            refresh()
        })
    })

    $items.on('click', '.set-verified', function(e) {
        e.preventDefault()
        var id = $(this).closest('tr').attr('data-id')
        $(this).enabled(false).loading(true, 'Starting verify...')
        var url = format('admin/users/%s/bankAccounts/%s/setVerified', userId, id)

        api.call(url, null, { type: 'POST' })
        .fail(app.alertXhrError)
        .done(function() {
            refresh()
        })
    })

    refresh()

    return controller
}
