var num = require('num')

module.exports = {
    format: function(number, options) {
        options || (options = {})
        options.currency

        if (options.ts === true || options.ts === undefined) {
            options.ts = i18n('numbers.thousandSeparator')
        }

        var n = num(number), trim

        if (options.precision) {
            n.set_precision(options.precision)
        } else if (options.maxPrecision && n.get_precision() > options.maxPrecision) {
            n.set_precision(options.maxPrecision)
        } else {
            trim = true
        }

        var s = n.toString()

        s = s.replace('.', i18n('numbers.decimalSeparator'))

        if (trim) {
            s = s.replace(/\.0+$/, '')
        }

        return s
    },

    formatAmount: function(number, currency) {
        return this.format(number, {
            currency: currency,
            ts: true
        })
    },

    formatVolume: function(number, currency) {
        return this.format(number, {
            currency: currency,
            ts: true,
            maxPrecision: 8
        })
    },

    formatPrice: function(number) {
        return this.format(number, {
            ts: true,
            maxPrecision: 8
        })
    },

    parse: function(s) {
        s = s.replace(i18n(numbers.decimalSeparator), '.')
        s = s.replace(i18n(numbers.separatorSeparator), '')
        return s
    }
}
