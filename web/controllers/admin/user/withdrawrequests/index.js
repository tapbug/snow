var util = require('util')
, header = require('../header')

module.exports = function(app, api, userId) {
    var itemTemplate = require('./item.html')
    , $el = $(require('./template.html')())
    , controller = {
        $el: $el
    }
    , $items = controller.$el.find('.withdraw-requests')

    // Insert header
    $el.find('.header-placeholder').replaceWith(header(userId, 'withdraw-requests').$el)

    function itemsChanged(items) {
        $items.html($.map(items, function(item) {
            return itemTemplate(item)
        }))
    }

    function refresh() {
        api.call('admin/users/' + userId + '/withdrawRequests').done(itemsChanged)
    }

    $el.on('click', '.withdraw-requests .withdraw-request .cancel', function(e) {
        e.preventDefault()

        var id = $(this).closest('.withdraw-request').attr('data-id')
        , $btn = $(this)

        alertify.prompt('Why is the request being cancelled? The user will see this.', function(ok, error) {
            if (!ok) return

            $btn.addClass('is-loading')
            .enabled(false)
            .siblings().enabled(false)


            api.call('admin/withdraws/' + id, { state: 'cancelled', error: error || null }, { type: 'PATCH' })
            .fail(function(xhr) {
                app.alertXhrError(xhr)
                refresh()
            })
            .done(function() {
                alertify.log(util.format('Order #%s cancelled.', id), 'success', 30e3)
                refresh()
            })
        })
    })

    refresh()

    return controller
}
