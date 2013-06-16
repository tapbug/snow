var util = require('util')
, debug = require('../util/debug')('i18n')
, _ = require('lodash')
, dicts = {
    'en-US': require('./en-US.json'),
    'nb-NO': require('./nb-NO.json'),
    'es-ES': require('./es-ES.json')
}
, mappings = {
    '^en': 'en-US',
    '^(no|nb)': 'nb-NO',
    '^es': 'es-ES'
}
, fallback = 'en-US'
, moment = require('moment')

require('moment/lang/es')
require('moment/lang/nb')

var i18n = module.exports = function(key) {
    var s = i18n.dict[key]
    if (typeof s == 'undefined') {
        debug(key + ' is not defined for ' + i18n.lang + ' falling back to ' + fallback)
        s = dicts[fallback][key]
    }

    if (typeof s == 'undefined') {
        debug('ERROR: missing translation key: ' + key)
        return 'translation missing!'
    }

    //s = '!!' + s + '!!'

    var args = _.toArray(arguments)
    args.splice(0, 1, s)

    return util.format.apply(util, args)
}

i18n.set = function(lang) {
    debug('language set to %s', lang)

    var mapping = _.find(_.keys(mappings), function(m) {
        if (new RegExp(m, 'i').test(lang)) {
            return true
        }
    })

    if (mapping) {
        debug('mapping %s (%s) to %s', lang, mapping, mappings[mapping])
        lang = mappings[mapping]
    }

    i18n.lang = lang
    i18n.dict = dicts[lang]
    $('html').attr('lang', lang).attr('xml:lang', lang)
    $('meta[http-equiv="Content-Language"]').attr('content', lang)
}

$.fn.i18n = function() {
    $(this).html(i18n.apply(i18n, arguments))
}

i18n.detect = function() {
    var lang = $.cookie('language') || null

    if (!lang) {
        api.call('v1/language')
        .fail(errors.reportFromXhr)
        .done(function(res) {
            if (!res.language) {
                debug('API failed to guess our language')
            } else {
                $.cookie('language', res.language, { path: '/', expires: 365 * 10 })

                if (res.language.toLowerCase() == i18n.lang.toLowerCase()) {
                    debug('Already using the language suggested by the API')
                } else {
                    debug('Should switch language to %s', res.language)
                    i18n.setLanguageAndRefresh(res.language)
                }
            }
        })
    }

    if (lang) {
        debug('using hard coded language %s', lang)
        i18n.desired = lang
        i18n.set(lang)
    } else {
        debug('user language %s', window.navigator.userLanguage || '<null>')
        debug('navigator language %s', window.navigator.language || '<null>')
        lang = window.navigator.userLanguage || window.navigator.language

        if (lang) {
            debug('browser language: %s', lang)
            i18n.desired = lang

            if (dicts[lang]) {
                debug('translation exists for %s', lang)
                i18n.set(lang)
            } else {
                debug('no translation for browser language')
                i18n.set(fallback)
            }
        } else {
            debug('there is no browser language')
            i18n.set(fallback)
        }
    }

    if (i18n.lang == 'nb-NO') moment.lang('nb')
    else if (i18n.lang == 'es-ES') moment.lang('es')
    else moment.lang('en')
}

i18n.setLanguageAndRefresh = function(language) {
    debug('changing language to ' + language + ' with cookie')
    $.cookie('language', language, { path: '/', expires: 365 * 10 })
    window.location.reload()
}
