/* global task, file, directory, cat */
var base = 'build/landing'
, common = require('./common')

var head = [
    'vendor/raven.min.js',
    'vendor/modernizr.js'
]

task('landing', [
    'build',
    base,
    base + '/vendor.js',
    base + '/entry.js',
    base + '/styles.css',
    base + '/head.js',
    base + '/index.html',
    base + '/entry.js'
])

task('landing-dist', [
    'landing',
    base + '/vendor.min.js',
    base + '/styles.min.css',
    base + '/head.min.js',
    base + '/entry.min.js',
    base + '/index.min.html',
    base + '/entry.min.js'
])

directory('build/landing')

var vendor = [
    'components/jquery/jquery.min.js',
    'vendor/jquery.cookie.js'
]

file(base + '/head.js', head, common.concatFiles)
file(base + '/vendor.js', vendor, common.concatFiles)

file(base + '/index.css', function() {
    common.exec('stylus assets/landing/index.styl -o build/landing');
})

file(base + '/index.html', function() {
    var ejs = require('ejs')
    ejs.render(cat('assets/landing/index.ejs'), {
        minify: false,
        segment: process.env.SEGMENT,
        timestamp: +new Date(),
        bucket: process.env.BUCKET
    })
    .to(this.name)
})

file(base + '/index.min.html', function() {
    var ejs = require('ejs')
    ejs.render(cat('assets/landing/index.ejs'), {
        minify: true,
        segment: process.env.SEGMENT,
        timestamp: +new Date(),
        bucket: process.env.BUCKET
    })
    .to(this.name)
})

file(base + '/styles.css', [base + '/index.css'], common.concatFiles)

file(base + '/vendor.min.js', [base + '/vendor.js'], common.compressJs)
file(base + '/head.min.js', [base + '/head.js'], common.compressJs)
file(base + '/entry.min.js', [base + '/entry.js'], common.compressJs)
file(base + '/styles.min.css', [base + '/styles.css'], common.compressCss)

file(base + '/entry.js', function() {
    var bundle = common.exec('browserify -d -t ./node_modules/browserify-ejs ./landing.js')
    bundle.to(this.name)
})
