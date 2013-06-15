
module.exports = function() {
    var itemTemplate = require('./item.html')
    , controller = {
        $el: $(require('./template.html')())
    }
    , $items = controller.$el.find('.items')

    function itemsChanged(items) {
        $items.append($.map(items, function(item) {
            var $el = $(itemTemplate(item))
            $el.attr('data-id', item.id)


            return $el
        }))
    }

    function refresh() {
        api.call('v1/orders')
        .fail(errors.alertFromXhr)
        .done(itemsChanged)
    }

    $items.on('click', 'button.cancel', function(e) {
        e.preventDefault()
        var $item = $(e.target).closest('.item')

        api.call('v1/orders/' + $item.attr('data-id'), null, { type: 'DELETE' })
        .fail(errors.alertFromXhr)
        .done(function() {
            // TODO: Rename api.balances
            api.balances()
            $item.remove()
        })
    })

    refresh()

    return controller
}
