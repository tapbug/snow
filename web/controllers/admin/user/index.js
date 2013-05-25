var util = require('util')
, formatActivity = require('../../../activity')
, _= require('lodash')

module.exports = function(app, api, userId) {
    var $el =$(require('./template.html')())
    , controller = {
        $el: $el
    }

    $el.find('.nav-container').html(require('../nav.html')())

    // Tab activation (from Bootstrap docs)
    $el.find('#admin-user-tabs a').click(function(e) {
        e.preventDefault()
        $(this).tab('show')
    })

    $el.find('#admin-user-tabs').on('shown', function(e) {
        var href = $(e.target).attr('href')

        if (href == '#activity') {
            var $activity = $el.find('#activity')

            api.call('admin/users/' + userId + '/activities')
            .fail(app.alertXhrError)
            .done(function(activities) {
                $activity.find('tbody').html(activities.map(function(activity) {
                    var template = _.template('<tr><td><%= created %></td><td><%= text %></td></tr>')
                    activity.text = formatActivity(app.i18n, activity)
                    return template(activity)
                }))
            })

            return
        }

        if (href == '#withdraw-requests') {
            var $requests = $el.find('#withdraw-requests')

            api.call('admin/users/' + userId + '/withdrawRequests')
            .fail(app.alertXhrError)
            .done(function(requests) {
                $requests.find('tbody').html(requests.map(function(request) {
                    return require('./withdraw.html')(request)
                }))
            })

            return
        }

        throw new Error(href)
    })

    function userRetrieved(user) {
        $el.find('#summary').html(require('./user.html')(user))
    }

    function refresh() {
        api.call('admin/users/' + userId)
        .fail(app.alertXhrError)
        .done(userRetrieved)
    }

    refresh()

    return controller
}
