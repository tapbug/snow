
module.exports = function() {
    var controller = {
        $el: $(require('./template.html')())
    }
    , $address = controller.$el.find('.address')

    caches.bitcoinAddress().done(function(address) {
        $address.html($('<a href="bitcoin:' + address + '">' + address + '</a>'))
    })

    return controller
}
