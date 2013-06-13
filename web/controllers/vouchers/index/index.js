var _ = require('lodash')
, template = require('./template.html')
, itemTemplate = require('./item.html')

module.exports = function(app, api) {
    var $el = $('<div class="vouchers">').html(template())
    , controller = {
        $el: $el
    }
    , $items = $el.find('.vouchers')

    function refresh() {
        api.call('v1/vouchers')
        .fail(app.alertXhrError)
        .done(itemsUpdated)
    }

    function itemsUpdated(items) {
        $el.toggleClass('is-empty', !items.length)
        $items.html($.map(items, function(item) {
            return $(itemTemplate(item))
        }))
    }

    $items.on('click', '.cancel', function(e) {
        e.preventDefault()

        var $item = $(this).closest('.voucher')
        , $button = $(this).loading(true)

        api.call('v1/vouchers/' + $item.attr('data-id') + '/redeem', null, { type: 'POST' })
        .always(function() {
            $button.loading(false)
        })
        .fail(app.alertXhrError)
        .done(function() {
            $item.fadeAway()
            alertify.log('Voucher cancelled and funds returned to your account.')
            api.balances()
        })
    })

    refresh()

    return controller
}
