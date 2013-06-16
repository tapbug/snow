/* global task, jake, complete */
var common = require('./common')
, format = require('util').format

function publish(hostname, cb) {
    var files = {
        'build/client/head.min.js': 'client/head.min.js',
        'build/client/entry.min.js': 'client/entry.min.js',
        'build/client/vendor.min.js': 'client/vendor.min.js',
        'build/client/styles.min.css': 'client/styles.min.css',
        'build/client/index.min.html': 'client/index.html',
        'assets/ripple.txt': 'ripple.txt',
        'build/client/img/registerbg.jpg': 'client/img/registerbg.jpg',
        'build/client/img/flags/NO.png': 'client/img/flags/NO.png',
        'build/client/img/flags/ES.png': 'client/img/flags/ES.png',
        'build/client/img/flags/US.png': 'client/img/flags/US.png',
        'build/landing/head.min.js': 'head.min.js',
        'build/landing/entry.min.js': 'entry.min.js',
        'build/landing/vendor.min.js': 'vendor.min.js',
        'build/landing/styles.min.css': 'styles.min.css',
        'build/landing/index.min.html': 'index.html'
    }

    var cmds = []
    var baseDir = '/home/ubuntu/snow-web/public/'
    var dirs = ['landing', 'client/img/flags']

    cmds = cmds.concat(dirs.map(function(dir) {
        return 'ssh ubuntu@' + hostname + ' mkdir -p ' + baseDir + dir
    }))

    cmds = cmds.concat(Object.keys(files).map(function(fn) {
        var outName = files[fn] || fn
        return format('scp -C %s ubuntu@%s:%s%s', fn, hostname, baseDir, outName)
    }))

    jake.exec(cmds, { printStdout: true, printStderr: true }, cb)
}

// publishing
var segment

task('pp', ['publish-prod'])
task('publish-prod', function() {
    segment = 'bc0p8b3ul1'
    process.env.BUCKET = 'https://s3-eu-west-1.amazonaws.com/justcoin-production/'

    jake.Task['clean'].invoke()
    jake.Task['default'].invoke()

    publish('10.0.0.184', function(err) {
        if (err) return complete(err)
        var tag = new Date().toISOString().match(/^[^\.]+/)[0].replace(/:/g, '-')
        common.exec('git tag ' + tag)
        complete()
    })
}, { async: true })

task('ps', ['publish-staging'])
task('publish-staging', function() {
    process.env.SEGMENT = '52j6v06i1t'
    process.env.BUCKET = 'https://s3-eu-west-1.amazonaws.com/justcoin-production/'

    jake.Task['default'].on('complete', function() {
        publish('54.217.208.30', complete)
    })

    jake.Task['default'].invoke()

}, { async: true })
