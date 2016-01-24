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
     * @param {string} direction
     */
    stop = function(direction) {
        var offset = direction || me.directionOffset;
        
        me.skin.setPos([0, 128 + offset]);
        me.skin.setFrames([0]);

        me.gear.head.setPos([0, 128 + offset]);
        me.gear.head.setFrames([0]);

        me.gear.torso.setPos([0, 128 + offset]);
        me.gear.torso.setFrames([0]);

        me.gear.leg.setPos([0, 128 + offset]);
        me.gear.leg.setFrames([0]);

        // Round new position
        me.pos[0] = Math.round(me.pos[0]);
        me.pos[1] = Math.round(me.pos[1]);

        // Start combat
        if (me.fightAfterWalking) {
            rd.game.combat.fight(rd.game.main.getCurrentUnitId(), me.nextEnemyId);
        }
    },


    /**
     * Play the walk animation cycle
     * @memberOf rd.game.unit
     * @param {object} cfg
     */
    walk = function(cfg) {
        me.fightAfterWalking = cfg.fight;
        me.nextEnemyId = cfg.enemyId;

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
        me.skin.setPos([0, 128 + me.directionOffset]);
        me.skin.setFrames([0, 1, 2]);

        me.gear.head.setPos([0, 128 + me.directionOffset]);
        me.gear.head.setFrames([0, 1, 2]);

        me.gear.torso.setPos([0, 128 + me.directionOffset]);
        me.gear.torso.setFrames([0, 1, 2]);

        me.gear.leg.setPos([0, 128 + me.directionOffset]);
        me.gear.leg.setFrames([0, 1, 2]);
    },


    /**
     * Turn the unit
     * @memberOf rd.game.unit
     * @param {string} direction
     */
    turn = function(direction) {
        var offset = direction === 'left' ? 64 : 0;
        me.directionOffset = offset;

        me.skin.setPos([0, 128 + offset]);
        me.gear.head.setPos([0, 128 + offset]);
        me.gear.torso.setPos([0, 128 + offset]);
        me.gear.leg.setPos([0, 128 + offset]);
    },


    /**
     * Save the map tiles that are in range
     * @memberOf rd.game.unit
     * @param {array} fields
     */
    setFieldsInRange = function(fields) {
        me.fieldsInRange = fields;
    },


    /**
     * Get the map tiles that are in range
     * @memberOf rd.game.unit
     * @return {array}
     */
    getFieldsInRange = function() {
        return me.fieldsInRange;
    },


    /**
     * Check if a unit is in range
     * @memberOf rd.game.unit
     * @param  {array} unitPos
     * @return {boolean}
     */
    isInRange = function(unitPos) {
        for (var i=0; i<me.fieldsInRange.length; i++) {
            if (me.fieldsInRange[i][0] === unitPos[0] && me.fieldsInRange[i][1] === unitPos[1]) {
                return true;
            }
        }
        return false;
    },


    /**
     * Set the move range to the default value
     * @memberOf rd.game.unit
     */
    resetMoveRange = function() {
        me.currentMoveRange = me.attributes.moveRange;
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
    me.side = cfg.side;
    me.gear = cfg.gear;
    me.race = cfg.race;
    me.armor = cfg.armor;
    me.moving = false;
    me.skills = cfg.skills;
    me.dead = cfg.dead;
    me.visible = cfg.visible || true;
    me.wounded = cfg.wounded;
    me.posOffset = cfg.posOffset;
    me.weapons = cfg.weapons;
    me.health = cfg.health || 0;
    me.attributes = cfg.racesCfg[cfg.race];
    me.attributes.damageMelee += (cfg.weaponsCfg[cfg.weapons.primary].damageMelee || 0);
    me.attributes.damageRanged += (cfg.weaponsCfg[cfg.weapons.primary].damageRanged || 0);
    me.attributes.moveRange = Math.round(me.attributes.moveRange + cfg.armorCfg[cfg.armor].moveRange);
    me.attributes.defense += cfg.armorCfg[cfg.armor].defense;
    me.attributes.defense += (cfg.weaponsCfg[cfg.weapons.secondary].defense || 0);
    me.currentMoveRange = me.attributes.moveRange;
    me.attackRange = cfg.weaponsCfg[me.weapons.primary].attackRange;
    me.path = [];
    me.fieldsInRange = [];
    me.steps = 20;
    me.currentStep = 20;
    me.directionOffset = me.team === 1 ? 0 : 64;


    /**
     * Return public functions
     */
    return {
        get: get,
        walk: walk,
        stop: stop,
        attack: attack,
        turn: turn,
        setFieldsInRange: setFieldsInRange,
        getFieldsInRange: getFieldsInRange,
        isInRange: isInRange,
        resetMoveRange: resetMoveRange
    };

});