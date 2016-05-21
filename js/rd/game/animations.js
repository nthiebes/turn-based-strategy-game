/**
 * Animations controller
 * @namespace rd.game.animations
 */
rd.define('game.animations', (function() {

    /**
     * Variables
     */
    var animations = [],


    /**
     * Update sprites
     * @param {int} delta
     */
    updateEntities = function(delta) {
        for (var i = 0; i < animations.length; i++) {
            if (animations[i].active) {
                animations[i].sprite.update(delta);
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
     * Initialization
     * @memberOf rd.game.animations
     */
    init = function() {
        animations.push({
            sprite: new rd.utils.sprite({
                'url': 'img/animations.png',
                'pos': [0, 0],
                'size': [64, 64],
                'speed': 4,
                'frames': [0, 1, 2, 3, 4, 5, 6, 7]
            }),
            active: true,
            pos: [1, 1]
        });
    };


    /**
     * Return public functions
     */
    return {
        init: init,
        updateEntities: updateEntities,
        get: get
    };

})());
