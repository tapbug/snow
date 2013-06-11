module.exports = function(app, api) {
    var itemTemplate = require('./item.html')
    , $el = $(require('./template.html')())
    , controller = {
        $el: $el
    }
    , $balances = $el.find('.balances')

    $el.filter('.header-placeholder').html(require('../header')('balances').$el)

    function itemsChanged(items) {
        $balances.html($.map(items, function(item) {
            return itemTemplate(item)
        }))
    }

    function refresh() {
        api.call('admin/balances')
        .fail(app.alertXhrError)
        .done(itemsChanged)
    }

    refresh()

    app.section('admin')

    $el.find('.nav a[href="#admin/balances"]').parent().addClass('active')

    return controller
}
