/**
 * Unit
 * @namespace rd.game.unit
 */
rd.define('game.unit', function(cfg) {

    /**
     * Variables
     */
    var me = this,


    stop = function() {
        me.skin.setPos([0, 128]);
        me.skin.setFrames([0]);

        me.gear.head.setPos([0, 128]);
        me.gear.head.setFrames([0]);

        me.gear.torso.setPos([0, 128]);
        me.gear.torso.setFrames([0]);
    },


    walk = function() {
        me.skin.setPos([0, 0]);
        me.skin.setFrames([0, 1, 2, 3]);

        me.gear.head.setPos([0, 0]);
        me.gear.head.setFrames([0, 1, 2, 3]);

        me.gear.torso.setPos([0, 0]);
        me.gear.torso.setFrames([0, 1, 2, 3]);
    },


    attack = function() {
        me.skin.setPos([0, 128]);
        me.skin.setFrames([0, 1, 2]);

        me.gear.head.setPos([0, 128]);
        me.gear.head.setFrames([0, 1, 2]);

        me.gear.torso.setPos([0, 128]);
        me.gear.torso.setFrames([0, 1, 2]);
    },


    get = function() {
        return me;
    };

    me.name = cfg.name;
    me.skin = cfg.skin;
    me.pos = cfg.pos;
    me.gear = cfg.gear;
    me.skills = cfg.skills;
    me.dead = cfg.dead;
    me.visible = cfg.visible || true;
    me.wounded = cfg.wounded;
    me.count = cfg.count;
    me.weapon = cfg.weapon;
    me.health = cfg.health || 0;
    me.attributes = cfg.attributes;


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