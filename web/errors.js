/* global Raven, alertify */
var debug = require('./util/debug')('errors')
, format = require('util').format

exports.bodyFromXhr = function(xhr) {
    if (xhr.getAllResponseHeaders().match(/Content-Type: application\/json/i)) {
        try {
            return JSON.parse(xhr.responseText)
        }
        catch (e) {
        }
    }

    return xhr.responseText
}

exports.alertFromXhr = function(error) {
    if (error.xhr.readyState === 0) return

    exports.reportFromXhr(error)

    alertify.alert(
        'Something went wrong!<br/>' +
        'We have logged the error and will fix it soon.<br/>' +
        'Here\'s what our computers said:<br/>' +
        JSON.stringify(exports.bodyFromXhr(error.xhr), null, 4))
}

exports.reportFromXhr = function(error) {
    if (!error.xhr.readyState || !error.xhr.status) return

    var message = format('XHR Error: %s %s: %s',
        error.xhr.settings.url.substr(0, 50),
        error.xhr.statusText,
        error.xhr.responseText.substr(0, 200))

    var data = {
        tags: ['xhr'],
        extra: {
            url: error.xhr.settings.url,
            status: error.xhr.status,
            type: error.xhr.settings.type,
            requestData: error.xhrOptions.data || null,
            responseText: error.xhr.responseText,
            user: user.id || null
        }
    }

    debug(message)
    debug(JSON.stringify(data, null, 4))

    if (typeof Raven !== undefined) {
        Raven.captureMessage(message, data)
    }
}
