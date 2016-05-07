/**
 * Splash view
 * @namespace rd.splash
 * @return {object} Public functions
 */
rd.define('splash', (function() {

    /**
     * Variables
     */
    var lightning = document.getElementById('lightning'),
        loading = document.getElementById('loading'),
        splash = document.getElementById('splash'),
        fog = document.getElementById('fog'),
        logo = document.getElementById('logo'),
        video,
        effects,
        music,
        sound = false,


    /**
     * Register event listener
     */
    eventListener = function() {
        video = document.getElementById('video');
        video.addEventListener('canplaythrough', function() {
            if (sound) {
                loadSounds(function() {
                    splashAnimations();
                });
            } else {
                splashAnimations();
            }
        });
    },


    /**
     * Register and load the sounds
     * @param {function} callback
     */
    loadSounds = function(callback) {
        var soundCount = 2,
            loadedCount = 0;

        effects = new Howl({
            urls: ['sounds/effects.ogg', 'sounds/effects.mp3'],
            volume: 0.5,
            sprite: {
                splash: [0, 16000],
                thunder: [16000, 11000]
            },
            onload: function() {
                loadedCount++;
                if (loadedCount === soundCount) {
                    callback();
                }
            }
        });

        music = new Howl({
            urls: ['sounds/test7.mp3'],
            volume: 0.5,
            onload: function() {
                loadedCount++;
                if (loadedCount === soundCount) {
                    callback();
                }
            }
        });
    },


    /**
     * Splash screen intro animations
     */
    splashAnimations = function() {
        video.play();
        effects.play('splash');
        loading.className += ' hide';


        requestTimeout(function() {
            lightning.className += ' show';
        }, 1000);

        requestTimeout(function() {
            music.play();
        }, 3000);

        requestTimeout(function() {
            logo.className += ' show';
        }, 6400);

        requestTimeout(function(){
            effects.play('thunder');
            splash.className += ' hide';
            fog.className += ' show';
            
            // rd.ui.menu.init();

            requestTimeout(function() {
                splash.remove();
            }, 2000);
        }, 14000);
    },


    /**
     * Get the video html
     * @return {string}
     */
    getVideoHtml = function() {
        return '<video id="video" preload="metadata">' +
                    '<source src="videos/embers.mp4" type="video/mp4">' +
                    '<source src="videos/embers.webm" type="video/webm">' +
                '</video>';
    },


    /**
     * Initialization
     */
    init = function(skip) {
        if (skip) {
            splash.className += ' hide';
            lightning.className += ' show';
            fog.className += ' show';

            requestTimeout(function() {
                splash.remove();
            }, 1000);
        } else {
            logo.insertAdjacentHTML('afterend', getVideoHtml());
            eventListener();
        }
    };


    /**
     * Return public functions
     */
    return {
        init: init
    };

})());
