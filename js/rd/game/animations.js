/**
 * Animations controller
 * @namespace rd.game.animations
 */
rd.define('game.animations', (function() {

    /**
     * Variables
     */
    var animations = {},


    /**
     * Update sprites
     * @param {int} delta
     */
    updateEntities = function(delta) {
        var animation;
        for (var i in animations) {
            animation = animations[i];
            if (animation.active) {
                updateEntity(delta, animation);
            }
        }
    },


    /**
     * Update one sprite
     * @param {int}    delta
     * @param {object} animation
     */
    updateEntity = function(delta, animation) {
        // Path animation
        if (animation.path) {
            if (animation.path[ animation.pathIndex ]) {
                animation.pos[0] = animation.path[ animation.pathIndex ][0];
                animation.pos[1] = animation.path[ animation.pathIndex ][1];
                animation.sprite.update(delta);
                animation.pathIndex++;
            } else {
                animation.active = false;
                animation.pathIndex = 0;
            }
        }
    },


    /**
     * Get the animations
     * @return {array}
     */
    get = function() {
        return animations;
    },


    /**
     * Play an animation
     * @param {object} cfg
     */
    play = function(cfg) {
        animations[cfg.name].angle = cfg.angle;
        animations[cfg.name].path = getPath(cfg);
        animations[cfg.name].active = true;
    },


    /**
     * Get points between two points
     * @param  {object} cfg
     * @return {array}
     */
    getPath = function(cfg) {
        var path = [],
            speed = cfg.speed,
            x1 = cfg.x1,
            y1 = cfg.y1,
            x2 = cfg.x2,
            y2 = cfg.y2,
            lastX = x1,
            lastY = y1,
            x = (x2 - x1) / speed,
            y = (y2 - y1) / speed;

        for (var i = 0; i <= speed; i++) {
            path.push([lastX, lastY]);
            lastX = lastX + x;
            lastY = lastY + y;
        }

        return path;
    },


    /**
     * Initialization
     * @memberOf rd.game.animations
     */
    init = function() {
        animations.arrow = {
            sprite: new rd.utils.sprite({
                'url': 'img/animations.png',
                'pos': [0, 0],
                'size': [64, 64],
                'speed': 0,
                'frames': [0]
            }),
            active: false,
            pos: [],
            path: [],
            pathIndex: 0,
            angle: 0
        };

        animations.bullet = {
            sprite: new rd.utils.sprite({
                'url': 'img/animations.png',
                'pos': [0, 64],
                'size': [64, 64],
                'speed': 0,
                'frames': [0]
            }),
            active: true,
            pos: [],
            path: [],
            pathIndex: 0,
            angle: 0
        };

        animations.smoke1 = {
            sprite: new rd.utils.sprite({
                'url': 'img/animations.png',
                'pos': [0, 128],
                'size': [64, 64],
                'speed': 0,
                'frames': [0]
            }),
            active: true,
            pos: [],
            path: [],
            pathIndex: 0,
            angle: 0
        };

        animations.smoke2 = {
            sprite: new rd.utils.sprite({
                'url': 'img/animations.png',
                'pos': [0, 192],
                'size': [64, 64],
                'speed': 0,
                'frames': [0]
            }),
            active: true,
            pos: [],
            path: [],
            pathIndex: 0,
            angle: 0
        };
    };


    /**
     * Return public functions
     */
    return {
        init: init,
        updateEntities: updateEntities,
        get: get,
        play: play
    };

})());
