var _ = require('lodash')
, debug = require('debug')('segment')

module.exports = function(app, api) {
    function attach(user) {
        debug('Fetching Intercom settings')
        api.call('v1/intercom')
        .fail(function(xhr) {
            var err = app.errorFromXhr(xhr)
            console.error('Failed to fetch intercom settings')
            console.error(err)

            if (typeof Raven != 'undefined') {
                Raven.captureException(err)
            }
        })
        .done(function(settings) {
            debug('Intercom settings', settings)
            debug('Identifying with segment.io')

            analytics.identify(user.id.toString(), {
                email: user.email,
                created: settings.created_at
            }, {
                intercom: settings
            })
        })
    }

    function verifiedphone(phone) {
        if (typeof Intercom == 'undefined' || !Intercom) {
            debug('Will not update Intercom with phone because it\'s disabled')
            return
        }

        debug('updating Intercom with phone number and time of verification')

        Intercom('update', {
            phone: phone,
            phone_verified_at: Math.round(+new Date() / 1e3)
        })
    }

    app.on('user', attach)
    app.on('verifiedphone', verifiedphone)
}
