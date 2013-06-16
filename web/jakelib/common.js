/* global cat, cp */
require('shelljs/global')

exports.compressCss = function() {
    var inputFn = this.name.replace(/min\.css$/, 'css')
    exports.exec('cleancss ' + inputFn).to(this.name)
}

exports.compressJs = function() {
    var inputFn = this.name.replace(/min\.js$/, 'js')
    var res = exports.exec('uglifyjs ' + inputFn + ' --compress warnings=false --mangle')
    .to(this.name)
}

exports.exec = function() {
    var result = global.exec.apply(this, arguments)
    if (result.code) throw new Error(result.output)
    return result.output
}

exports.concatFiles = function() {
    var delim = this.prereqs[0].match(/.js$/i) ? ';' : '\n'

    this.prereqs.reduce(function(p, c) {
        return p + delim + cat(c)
    }, '')
    .to(this.name)
}

exports.copy = function() {
    cp(this.prereqs[0], this.name)
}
