exports.user = function() {
    if (user()) return true
    router.go('login?after=' + window.location.hash.substr(1))
}

exports.admin = function() {
    if (user.admin) return true
    alert('Not admin')
}

exports.identity = function() {
    if (user.firstName) return true
    router.go('identity?after=' + window.location.hash.substr(1))
}
