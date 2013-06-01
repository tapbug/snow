var num = require('num')

module.exports = {
    format: function(number, options) {
        options || (options = {})
        options.currency

        var n = num(number), trim

        if (options.precision) {
            n.set_precision(options.precision)
        } else if (options.maxPrecision && n.get_precision() > options.maxPrecision) {
            n.set_precision(options.maxPrecision)
        } else {
            trim = true
        }

        var s = n.toString()

        if (trim) {
            s = s.replace(/\.0+$/, '')
        }

        function addCommas(nStr)
        {
            nStr += '';
            x = nStr.split('.');
            x1 = x[0];
            x2 = x.length > 1 ? '.' + x[1] : '';
            var rgx = /(\d+)(\d{3})/;
            while (rgx.test(x1)) {
                x1 = x1.replace(rgx, '$1' + ',' + '$2');
            }
            return x1 + x2;
        }

        if (options.ts) {
            s = addCommas(s)
        }

        return s
    },

    formatAmount: function(number, currency) {
        return this.format(number, {
            currency: currency,
            ts: ','
        })
    },

    formatVolume: function(number, currency) {
        return this.format(number, {
            currency: currency,
            ts: ',',
            maxPrecision: 8
        })
    },

    formatPrice: function(number) {
        return this.format(number, {
            ts: ',',
            maxPrecision: 8
        })
    }
}
