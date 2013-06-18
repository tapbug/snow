
module.exports = function() {
    var controller = {
        $el: $(require('./template.html')())
    }
    , $address = controller.$el.find('.address')

    api.once('litecoinAddress', function(address) {
        $address.html($('<a href="litecoin:' + address + '">' + address + '</a>'))
    })

    return controller
}
