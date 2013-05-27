$.fn.enabled = function(value) {
    if (typeof value != 'undefined') {
        return $(this).prop('disabled', !value)
        .toggleClass('disabled', !value)
    }
    return !this.prop('disabled')
}

$.fn.fadeAway = function(delay) {
    return $(this).fadeOut(delay || 500, function() { $(this).remove() })
}

$.fn.focusSoon = function() {
    var that = this
    setTimeout(function() {
        $(that).focus()
    }, 500)
}

$.fn.field = function(name, value) {
    var $fields = $(this).find('[name="' + name + '"]')

    if (value !== undefined) {
        $fields.each(function() {
            $(this).val(value)
        })
    }

    return $fields
}
