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
            refreshWithdrawRequests()
            return
        }

        throw new Error(href)
    })

    function refreshWithdrawRequests() {
        var $requests = $el.find('#withdraw-requests')
        api.call('admin/users/' + userId + '/withdrawRequests')
        .fail(app.alertXhrError)
        .done(function(requests) {
            $requests.find('tbody').html(requests.map(function(request) {
                return require('./withdraw.html')(request)
            }))
        })
    }

    function userRetrieved(user) {
        $el.find('#summary').html(require('./user.html')(user))
    }

    function refresh() {
        api.call('admin/users/' + userId)
        .fail(app.alertXhrError)
        .done(userRetrieved)
    }

    $el.on('click', '.send-email-verification', function(e) {
        e.preventDefault()
        var userId = $(e.target).closest('.user').attr('data-user-id')

        api.call('admin/users/' + userId + '/sendVerificationEmail', null, { type: 'POST' })
        .fail(app.alertXhrError)
        .done(function() {
            alert('Done')
        })
    })

    $el.on('click', '#withdraw-requests .withdraw .cancel', function(e) {
        e.preventDefault()

        var id = $(this).closest('.withdraw').attr('data-id')
        , $btn = $(this)

        alertify.prompt('Why is the request being cancelled? The user will see this.', function(ok, error) {
            if (!ok) return

            $btn.addClass('is-loading')
            .enabled(false)
            .siblings().enabled(false)


            api.call('admin/withdraws/' + id, { state: 'cancelled', error: error || null }, { type: 'PATCH' })
            .fail(function(xhr) {
                app.alertXhrError(xhr)
                refreshWithdrawRequests()
            })
            .done(function() {
                alertify.log(util.format('Order #%s cancelled.', id), 'success', 30e3)
                refreshWithdrawRequests()
            })
        })
    })

    refresh()

    return controller
}
