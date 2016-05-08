/**
 * Sprite controller
 * @namespace rd.utils.sprite
 */
rd.define('utils.sprite', function(cfg) {

    /**
     * Variables
     */
    var me = this,


    /**
     * Update the sprite (e.g. speed)
     * @memberOf rd.utils.sprite
     * @param {int} delta
     */
    update = function(delta) {
        // Stay not yet working correct
        if (!(me.stay && me.done)) {
            me._index += me.speed * delta;
            // Always start with first frame
            if (me.frames.length === 1) {
                me._index = 0;
            }
        }
    },


    /**
     * Render the sprite onto the canvas
     * @memberOf rd.utils.sprite
     * @param {object} ctx
     */
    render = function(ctx) {
        var frame;

        if (me.speed > 0) {
            var max = me.frames.length,
                idx = Math.floor(me._index);
            frame = me.frames[idx % max];

            if (me.once && idx >= max) {
                me.done = true;
            }

            // End animation
            if (idx >= max) {
                me._index = 0;
            }
        } else {
            frame = 0;
        }

        me.currentFrame = frame;

        var x = me.pos[0],
            y = me.pos[1];

        if (me.dir === 'vertical') {
            y += frame * me.size[1];
        } else {
            x += frame * me.size[0];
        }

        // If it is done and it has to run once, we dont update
        if (!(me.done && me.once)) {
            ctx.drawImage(rd.utils.resources.get(me.url),
                          x, y,
                          me.size[0], me.size[1],
                          0, 0,
                          me.size[0], me.size[1]);
        }
    },


    /**
     * Update the frames of a sprite
     * @memberOf rd.utils.sprite
     * @param {array} newFrames
     */
    setFrames = function(newFrames) {
        me.frames = newFrames;
    },


    /**
     * Get the current frame and frames length
     * @return {object}
     */
    getFrames = function() {
        return {
            framesLength: me.frames.length,
            index: Math.floor(me._index)
        };
    },


    /**
     * Set a new frame index
     * @param {integer} newIndex
     */
    setIndex = function(newIndex) {
        me._index = newIndex;
    },


    /**
     * Update the positions within a sprite (e.g. for an animation)
     * @memberOf rd.utils.sprite
     * @param {array} newPos
     */
    setPos = function(newPos) {
        me.pos = newPos;
    };

    me.pos = cfg.pos;
    me.size = cfg.size;
    me.speed = typeof cfg.speed === 'number' ? cfg.speed : 0;
    me.frames = cfg.frames;
    me._index = 0;
    me.url = cfg.url;
    me.dir = cfg.dir || 'horizontal';
    me.once = cfg.once;
    me.stay = cfg.stay;
    me.inProgress = cfg.inProgress;
    me.currentFrame = 0;


    /**
     * Return public functions
     */
    return {
        render: render,
        update: update,
        setPos: setPos,
        setFrames: setFrames,
        getFrames: getFrames,
        setIndex: setIndex
    };

});
