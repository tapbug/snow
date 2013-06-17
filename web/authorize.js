exports.user = function(register) {
    if (user()) return true
    var after = window.location.hash.substr(1)

    // Avoid looping after-inception
    after = after.replace(/(register|login)\?after=/, '')

    router.go((register ? 'register' : 'login') + '?after=' + after)
}

exports.admin = function() {
    if (user.admin) return true
    alert('Not admin')
}

exports.identity = function() {
    if (user.firstName) return true
    router.go('identity?after=' + window.location.hash.substr(1))
}
