/* global file, directory, task, cat */
var base = 'build/client'
, common = require('./common')

directory(base)
directory(base + '/img')
directory(base + '/img/flags')

var head = [
    'vendor/raven.min.js',
    'vendor/modernizr.js'
]

var vendor = [
    'components/jquery/jquery.min.js',
    'vendor/jquery.cookie.js',
    'vendor/sjcl.js',
    'components/alertify/alertify.min.js',
    'vendor/bootstrap/js/bootstrap.min.js',
    'components/bootstrap-notify/js/bootstrap-notify.js'
]

task('client-dist', [
    'client',
    base + '/head.min.js',
    base + '/entry.min.js',
    base + '/styles.min.css',
    base + '/index.min.html',
    base + '/vendor.min.js'
])

task('client', [
    base,
    base + '/head.js',
    base + '/entry.js',
    base + '/vendor.js',
    base + '/styles.css',
    base + '/index.html',
    base + '/img',
    base + '/img/registerbg.jpg',
    base + '/img/icon-top-bar.png',
    base + '/img/flags',
    base + '/img/flags/NO.png',
    base + '/img/flags/US.png',
    base + '/img/flags/ES.png'
])

file(base + '/head.js', head, common.concatFiles)
file(base + '/vendor.js', vendor, common.concatFiles)

file(base + '/entry.min.js', [base + '/entry.js'], common.compressJs)
file(base + '/vendor.min.js', [base + '/vendor.js'], common.compressJs)
file(base + '/head.min.js', [base + '/head.js'], common.compressJs)
file(base + '/styles.min.css', [base + '/styles.css'], common.compressCss)

file(base + '/img/registerbg.jpg', ['assets/client/img/registerbg.jpg'], common.copy)
file(base + '/img/icon-top-bar.png', ['assets/client/img/icon-top-bar.png'], common.copy)
file(base + '/img/flags/NO.png', ['assets/client/img/flags/NO.png'], common.copy)
file(base + '/img/flags/US.png', ['assets/client/img/flags/US.png'], common.copy)
file(base + '/img/flags/ES.png', ['assets/client/img/flags/ES.png'], common.copy)

file(base + '/index.html', function() {
    var ejs = require('ejs')
    ejs.render(cat('assets/client/index.ejs'), {
        minify: false,
        segment: process.env.SEGMENT,
        timestamp: +new Date(),
        bucket: process.env.BUCKET
    })
    .to(this.name)
})

file(base + '/index.min.html', function() {
    var ejs = require('ejs')
    ejs.render(cat('assets/client/index.ejs'), {
        minify: false,
        segment: process.env.SEGMENT,
        timestamp: +new Date(),
        bucket: process.env.BUCKET
    })
    .to(this.name)
})

file(base + '/index.css', function() {
    common.exec('stylus assets/client/index.styl -o ' + base)
})

file(base + '/styles.css', [
    'components/alertify/themes/alertify.core.css',
    'components/alertify/themes/alertify.bootstrap.css',
    'vendor/bootstrap/css/bootstrap.min.css',
    'vendor/bootstrap/css/bootstrap-responsive.min.css',
    'components/bootstrap-notify/css/bootstrap-notify.css',
    'build/client/index.css'
], common.concatFiles)

file(base + '/entry.js', ['build'].concat(vendor), function() {
    var bundle = common.exec('browserify -d -t ./node_modules/browserify-ejs ./client.js')
    bundle.to(this.name)
})
