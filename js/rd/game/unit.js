/**
 * Unit instance
 * @namespace rd.game.unit
 */
rd.define('game.unit', function(cfg) {

    /**
     * Variables
     */
    var me = this,


    /**
     * Stop animations
     * @memberOf rd.game.unit
     */
    stop = function() {
        me.skin.setPos([0, 128]);
        me.skin.setFrames([0]);

        me.gear.head.setPos([0, 128]);
        me.gear.head.setFrames([0]);

        me.gear.torso.setPos([0, 128]);
        me.gear.torso.setFrames([0]);

        me.gear.leg.setPos([0, 128]);
        me.gear.leg.setFrames([0]);

        // Round new position
        me.pos[0] = Math.round(me.pos[0]);
        me.pos[1] = Math.round(me.pos[1]);
    },


    /**
     * Play the walk animation cycle
     * @memberOf rd.game.unit
     */
    walk = function(cfg) {
        me.skin.setPos([0, 0]);
        me.skin.setFrames([0, 1, 2, 3]);

        me.gear.head.setPos([0, 0]);
        me.gear.head.setFrames([0, 1, 2, 3]);

        me.gear.torso.setPos([0, 0]);
        me.gear.torso.setFrames([0, 1, 2, 3]);

        me.gear.leg.setPos([0, 0]);
        me.gear.leg.setFrames([0, 1, 2, 3]);

        me.path = cfg.path.splice(1,cfg.path.length);

        // Define the next tile for the animation
        me.nextTile = cfg.path[0];

        me.currentMoveRange = me.currentMoveRange - me.path.length;
    },


    /**
     * Play the attack animation
     * @memberOf rd.game.unit
     */
    attack = function() {
        me.skin.setPos([0, 128]);
        me.skin.setFrames([0, 1, 2]);

        me.gear.head.setPos([0, 128]);
        me.gear.head.setFrames([0, 1, 2]);

        me.gear.torso.setPos([0, 128]);
        me.gear.torso.setFrames([0, 1, 2]);

        me.gear.leg.setPos([0, 128]);
        me.gear.leg.setFrames([0, 1, 2]);
    },


    /**
     * Get the unit object
     * @memberOf rd.game.unit
     * @return {object}
     */
    get = function() {
        return me;
    };


    me.name = cfg.name;
    me.skin = cfg.skin;
    me.pos = cfg.pos;
    me.team = cfg.team;
    me.gear = cfg.gear;
    me.moving = false;
    me.skills = cfg.skills;
    me.dead = cfg.dead;
    me.visible = cfg.visible || true;
    me.wounded = cfg.wounded;
    me.count = cfg.count;
    me.posOffset = cfg.posOffset;
    me.weapon = cfg.weapon;
    me.health = cfg.health || 0;
    me.attributes = cfg.attributes;
    me.path = [];
    me.currentMoveRange = cfg.attributes.moveRange;
    me.steps = 20;
    me.currentStep = 20;


    /**
     * Return public functions
     */
    return {
        get: get,
        walk: walk,
        stop: stop,
        attack: attack
    };

});