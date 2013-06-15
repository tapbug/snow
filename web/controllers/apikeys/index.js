
module.exports = function() {
    var $el = $(require('./template.html')())
    , controller = {
        $el: $el
    }
    , $add = $el.find('.add')

    function refresh() {
        api.call('v1/keys')
        .fail(errors.alertFromXhr)
        .done(renderKeys)
    }

    function renderKeys(keys) {
        var $keys = $el.find('.keys')
        , itemTemplate = require('./item.html')
        , $items = $.map(keys, function(key) {
            return $(itemTemplate(key))
        })
        $keys.html($items)
    }

    // Add API key
    $add.on('click', function(e) {
        e.preventDefault()

        $add.loading(true, 'Adding...')
        api.call('v1/keys', {}, { type: 'POST' })
        .always(function() {
            $add.loading(false)
        })
        .fail(errors.alertFromXhr)
        .done(refresh)
    })

    // Remove API key
    $el.on('click', '.key .remove', function(e) {
        e.preventDefault()

        var $remove = $(this).loading(true, 'Deleting...')
        , $key = $(this).closest('.key')
        , id = $key.attr('data-id')

        api.call('v1/keys/' + id, null, { type: 'DELETE' })
        .fail(function(xhr) {
            $remove.loading(false)
            errors.alertFromXhr(xhr)
        })
        .done(function() {
            $key.fadeAway()
        })
    })

    refresh()

    return controller
}
