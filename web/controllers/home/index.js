var Player = require('./Player')
, _ = require('lodash')

module.exports = function(hash) {
    var $el = $(require('./template.html')({ hash: hash }))
    , controller = {
        $el: $el
    }
    , $window = $(window)
    , $cta = $el.find('.cta')
    , $tagline = $el.find('.tagline')
    , $signup = $el.find('.signup')
    , taglineRotateTimer = setInterval(rotateTagline, 3.5e3)
    , player

    if (Modernizr.video) {
        player = new Player({
            landing: {
                sources: [
                    'landing.mp4',
                    'landing.ogv'
                ],
                greedy: true,
                loop: true
            },
            bitcoin: {
                sources: [
                    'what-is-bitcoin.mp4',
                    'what-is-bitcoin.ogv'
                ]
            },
            ripple: {
                sources: [
                    'what-is-ripple.mp4',
                    'what-is-ripple.ogv'
                ]
            }
        }).play('landing').fullscreen(true)

        $el.find('video').replaceWith(player.$el)

        player.$el.on('playing', function() {
            $el.removeClasses(/^is-playing/)
            .addClass('is-playing-' + player.current)
            resize()
        })
    }

    var taglines = [
        'Your digital currency exchange',
        'Your Bitcoin exchange',
        'Your trusted, open source service',
        'Your Ripple gateway',
        'Your key to the future of money',
        'Your Litecoin exchange'
    ]

    function rotateTagline() {
        var tagline = taglines.shift()
        taglines.push(tagline)
        $tagline.html(tagline)
        resize()
    }

    function resize() {
        var windowWidth = $window.width()
        , windowHeight = $window.height()

        $cta.css({
            left: windowWidth / 2 - $cta.width() / 2
        })

        if (!player || player.current == 'landing') {
            $cta.css({
                top: windowHeight / 2 - $cta.height() / 2
            })

            $tagline.css({
                fontSize: windowWidth / 30
            })
        }

        if (player && player.current != 'landing') {
            $cta.css('top', '')
        }
    }

    $window.on('resize', resize)

    $el.on('click', '.what-is-bitcoin', function(e) {
        if (!player) return
        e.preventDefault()
        player.play('bitcoin').enqueue('landing')
    })

    $el.on('click', '.what-is-ripple', function(e) {
        if (!player) return
        e.preventDefault()
        player.play('ripple').enqueue('landing')
    })

    $signup.on('click', function(e) {
        e.preventDefault()
        window.location.hash = '#register'
    })

    if (typeof analytics != 'undefined') {
        analytics.trackLink($signup, 'Clicked Start with Justcoin')
        analytics.trackLink($el.find('.what-is-bitcoin'), 'Clicked What is Bitcoin')
        analytics.trackLink($el.find('.what-is-ripple'), 'Clicked What is Ripple')
    }

    setTimeout(resize, 0)

    return controller
}
