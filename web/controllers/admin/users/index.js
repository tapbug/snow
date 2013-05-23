module.exports = function(app, api) {
    var itemTemplate = require('./item.html')
    , $el = $(require('./template.html')())
    , controller = {
        $el: $el
    }
    , $items = controller.$el.find('.users')
    , $form = $el.find('.search-form')

    // Navigation partial
    $el.find('.nav-container').html(require('../nav.html')())

    function itemsChanged(items) {
        $items.html($.map(items, function(item) {
            var $item = $(itemTemplate(item))
            $item.attr('data-id', item.user_id)
            return $item
        }))
    }

    function refresh(query) {
        $form.addClass('is-loading')

        setTimeout(function() {
            api.call('admin/users', null, { qs: query })
            .always(function() {
                    $form.removeClass('is-loading')
            })
            .done(itemsChanged)
        }, 1000)
    }

    $el.on('click', 'a[href^="#admin/users/"]', function(e) {
        e.preventDefault()
        var userId = /\d+$/.exec($(this).attr('href'))[0]
        require('../user/')(app, api, +userId)
    })

    $form.on('submit', function(e) {
        function parseField(val) {
            var val = val.replace(/^\s+|\s+$/g, '')
            return val.length ? val : null
        }

        e.preventDefault()

        refresh({
            all: parseField($form.find('.query').val())
        })
    })

    refresh()

    app.section('admin')
    $el.find('.nav a[href="#admin/users"]').parent().addClass('active')

    $el.find('.query').focusSoon()

    return controller
}
