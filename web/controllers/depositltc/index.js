
module.exports = function() {
    var controller = {
        $el: $(require('./template.html')())
    }
    , $address = controller.$el.find('.address')

    caches.litecoinAddress().done(function(address) {
        $address.html($('<a href="litecoin:' + address + '">' + address + '</a>'))
    })

    return controller
}
