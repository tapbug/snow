var util = require('util')
, debug = require('debug')('i18n')
, _ = require('lodash')
, dicts = {
    'en-US': require('./en-US.json'),
    'nb-NO': require('./nb-NO.json'),
    'es-ES': require('./es-ES.json')
}
, mappings = {
    'en': 'en-US',
    'en-GB': 'en-US',
    'no-NO': 'nb-NO',
    'no': 'nb-NO',
    'nb': 'nb-NO',
    'es': 'es-ES'
}
, fallback = 'en-US'

module.exports = function(lang) {
    var fn = function(key) {
        var s = fn.dict[key]
        if (typeof s == 'undefined') {
            debug(key + ' is not defined for ' + fn.lang + ' falling back to ' + fallback)
            s = dicts[fallback][key]
        }

        if (typeof s == 'undefined') {
            console.error('ERROR: missing translation key: ' + key)
            return 'translation missing!'
        }

        //s = '!!' + s + '!!'

        var args = _.toArray(arguments)
        args.splice(0, 1, s)

        return util.format.apply(util, args)
    }

    fn.set = function(lang) {
        debug('language set to %s', lang)

        if (mappings[lang]) {
            debug('mapping ' + lang + ' to ' + mappings[lang])
            lang = mappings[lang]
        }

        fn.lang = lang
        fn.dict = dicts[lang]
        $('html').attr('lang', lang).attr('xml:lang', lang)
        $('meta[http-equiv="Content-Language"]').attr('content', lang)
    }

    if (lang) {
        debug('using hard coded language %s', lang)
        fn.desired = lang
        fn.set(lang)
    } else {
        debug('user language %s', window.navigator.userLanguage || '<null>')
        debug('navigator language %s', window.navigator.language || '<null>')
        lang = window.navigator.userLanguage || window.navigator.language

        if (lang) {
            debug('browser language: %s', lang)
            fn.desired = lang

            if (dicts[lang]) {
                debug('translation exists for %s', lang)
                fn.set(lang)
            } else {
                debug('no translation for browser language')
                fn.set(fallback)
            }
        } else {
            debug('there is no browser language')
            fn.set(fallback)
        }
    }

    return fn
}
