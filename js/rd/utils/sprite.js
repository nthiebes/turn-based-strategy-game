/**
 * Sprite controller
 * @namespace rd.utils.sprite
 */
rd.define('utils.sprite', function(cfg) {

    var me = this,


    update = function(dt) {
        // Stay not yet working correct
        if (!(me.stay && me.done)) {
            me._index += me.speed*dt;
            // Always start with first frame
            if( me.frames.length === 1 ){
                me._index = 0;
            }
        }
    },


    render = function(ctx) {
        var frame;

        if(me.speed > 0) {
            var max = me.frames.length;
            var idx = Math.floor(me._index);
            frame = me.frames[idx % max];

            if(me.once && idx >= max) {
                me.done = true;
            }

            // End animation
            if( idx >= max ){
                me._index = 0;
            }
        }
        else {
            frame = 0;
        }

        me.currentFrame = frame;


        var x = me.pos[0];
        var y = me.pos[1];

        if(me.dir == 'vertical') {
            y += frame * me.size[1];
        }
        else {
            x += frame * me.size[0];
        }

        //if it is done and it has to run once, we dont update
        if(!(me.done && me.once)){
            ctx.drawImage(rd.utils.resources.get(me.url),
                          x, y,
                          me.size[0], me.size[1],
                          0, 0,
                          me.size[0], me.size[1]);
        }
    },


    setFrames = function(newFrames) {
        me.frames = newFrames;
    },


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
        setFrames: setFrames
    };

});