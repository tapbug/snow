module.exports = function(hash) {
    var $el = $(require('./template.html')({ hash: hash }))
    , controller = {
        $el: $el
    }
    , $video = $el.find('video')
    , video = $video.get(0)
    , $window = $(window)
    , videoSize
    , $cta = $el.find('.cta')
    , $tagline = $el.find('.tagline')
    , $signup = $el.find('.signup')
    , taglineRotateTimer = setInterval(rotateTagline, 3.5e3)
    , currentVideo

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
        , width
        , height
        , scale = videoSize.width / videoSize.height

        if (windowWidth / windowHeight > scale) {
            width = windowWidth
            height = width / scale
        } else {
            height = windowHeight
            width = height * scale
        }

        $video.css({
            width: width,
            height: height
        })

        $cta.css({
            left: windowWidth / 2 - $cta.width() / 2
        })

        if (currentVideo == 'landing') {
            $cta.css({
                top: windowHeight / 2 - $cta.height() / 2
            })

            $tagline.css({
                fontSize: windowWidth / 30
            })
        } else {
            $cta.css('top', '')
        }
    }

    $window.on('resize', resize)

    setTimeout(resize, 0)

    function play(what, sound, done) {
        $video.find('source').remove()
        $video.append('<source src="' + what + '.mp4" type="video/mp4">')
        $video.append('<source src="' + what + '.ogv" type="video/ogg">')

        if (sound) $video.removeAttr('muted')
        else $video.attr('muted', 'true')

        video.load()
        video.play()

        video.muted = !sound
        //video.muted = true

        currentVideo && $el.removeClass('is-playing-' + currentVideo)
        $el.addClass('is-playing-' + what)

        if (what == 'landing') $video.attr('loop', 'loop')
        else $video.removeAttr('loop')

        videoSize = {
            'landing': { width: 596, height: 336 },
            'what-is-bitcoin': { width: 1280, height: 720 },
            'what-is-ripple': { width: 640, height: 480 }
        }[what]

        currentVideo = what

        resize()

        if (done) {
            $video.one('ended', done)
        }
    }

    play('landing')

    $el.on('click', '.what-is-bitcoin', function(e) {
        e.preventDefault()
        play('what-is-bitcoin', true, function() {
            play('landing', false)
        })
    })

    $el.on('click', '.what-is-ripple', function(e) {
        e.preventDefault()
        play('what-is-ripple', true, function() {
            play('landing', false)
        })
    })

    $video.on('error', function(err) {
        console.error('video error')
        console.error(err)
    })

    $video.on('canplay', function() {
        video.play()
    })

    return controller
}
