var template = require('./template.html')

module.exports = function(market) {
    var $el = $('<div class="market-order">').html(template({
        base: market.substr(0, 3),
        quote: market.substr(3, 3)
    }))
    , controller = {
        $el: $el
    }
    , bid = require('./bid')(market)
    , ask = require('./ask')(market)

    $el.find('.bid').replaceWith(bid.$el)
    $el.find('.ask').replaceWith(ask.$el)

    // Set order type (bid or ask)
    function setOrderType(type) {
        $el
        .removeClasses(/^is-order-type/).addClass('is-order-type-' + type)

        // Update navigation pills
        $el.find('[data-order-type="' + type + '"]')
        .parent().addClass('active').siblings().removeClass('active')

        // Focus the input
        $el.find('input:visible:first').focus()
    }

    // Change order type
    $el.on('click', '[data-action="toggle-order-type"]', function(e) {
        e.preventDefault()
        var type = $(this).attr('data-order-type')
        setOrderType(type)
    })

    controller.destroy = function() {
        bid.destroy()
        ask.destroy()
    }

    setOrderType('bid')

    return controller
}
