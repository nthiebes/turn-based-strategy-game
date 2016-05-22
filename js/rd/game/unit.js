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
        if (direction) {
            turn(direction);
        }

        me.skin.setPos([0, me.idleOffset + me.side]);
        me.skin.setFrames([0]);

        me.gear.head.setPos([0, me.idleOffset + me.side]);
        me.gear.head.setFrames([0]);

        me.gear.torso.setPos([0, me.idleOffset + me.side]);
        me.gear.torso.setFrames([0]);

        me.gear.leg.setPos([0, me.idleOffset + me.side]);
        me.gear.leg.setFrames([0]);

        me.primary.setPos([0, me.idleOffset + me.side]);
        me.primary.setFrames([0]);

        me.secondary.setPos([0, me.idleOffset + me.side]);
        me.secondary.setFrames([0]);

        me.wounded.setPos([0, me.idleOffset + me.side]);
        me.wounded.setFrames([0]);

        // Round new position
        me.pos[0] = Math.round(me.pos[0]);
        me.pos[1] = Math.round(me.pos[1]);

        if (me.animationInProgress) {
            me.animationInProgress = false;
        }

        // Start combat
        if (me.fightAfterWalking) {
            rd.game.combat.fight(rd.game.main.getCurrentUnitId(), me.nextEnemyId);
            me.fightAfterWalking = false;
        }
    },


    /**
     * Play the walk animation cycle
     * @memberOf rd.game.unit
     * @param {object} config
     */
    walk = function(config) {
        me.fightAfterWalking = config.fight;
        me.nextEnemyId = config.enemyId;

        me.skin.setPos([0, 0 + me.side]);
        me.skin.setFrames([0, 1, 2, 3]);

        me.gear.head.setPos([0, 0 + me.side]);
        me.gear.head.setFrames([0, 1, 2, 3]);

        me.gear.torso.setPos([0, 0 + me.side]);
        me.gear.torso.setFrames([0, 1, 2, 3]);

        me.gear.leg.setPos([0, 0 + me.side]);
        me.gear.leg.setFrames([0, 1, 2, 3]);

        me.primary.setPos([0, 0 + me.side]);
        me.primary.setFrames([0, 1, 2, 3]);

        me.secondary.setPos([0, 0 + me.side]);
        me.secondary.setFrames([0, 1, 2, 3]);

        me.wounded.setPos([0, 0 + me.side]);
        me.wounded.setFrames([0, 1, 2, 3]);

        me.path = config.path.splice(1, config.path.length);

        // Define the next tile for the animation
        me.nextTile = config.path[0];

        me.currentMoveRange = me.currentMoveRange - me.path.length;
    },


    /**
     * Play the attack animation
     * @memberOf rd.game.unit
     */
    attack = function() {
        me.animationInProgress = true;

        me.skin.setPos([0, me.idleOffset + me.side]);
        if (me.ranged) {
            me.skin.setFrames([0, 2, 2, 2]);
        } else {
            me.skin.setFrames([0, 1, 2, 2]);
        }
        me.skin.setIndex(0);
        
        me.gear.head.setPos([0, me.idleOffset + me.side]);
        if (me.ranged) {
            me.gear.head.setFrames([0, 2, 2, 2]);
        } else {
            me.gear.head.setFrames([0, 1, 2, 2]);
        }
        me.gear.head.setIndex(0);
        
        me.gear.torso.setPos([0, me.idleOffset + me.side]);
        if (me.ranged) {
            me.gear.torso.setFrames([0, 2, 2, 2]);
        } else {
            me.gear.torso.setFrames([0, 1, 2, 2]);
        }
        me.gear.torso.setIndex(0);
        
        me.gear.leg.setPos([0, me.idleOffset + me.side]);
        if (me.ranged) {
            me.gear.leg.setFrames([0, 2, 2, 2]);
        } else {
            me.gear.leg.setFrames([0, 1, 2, 2]);
        }
        me.gear.leg.setIndex(0);

        me.wounded.setPos([0, me.idleOffset + me.side]);
        if (me.ranged) {
            me.wounded.setFrames([0, 2, 2, 2]);
        } else {
            me.wounded.setFrames([0, 1, 2, 2]);
        }
        me.wounded.setIndex(0);
        
        me.primary.setPos([0, me.idleOffset + me.side]);
        me.primary.setFrames([0, 1, 2, 2]);
        me.primary.setIndex(0);

        me.secondary.setPos([0, me.idleOffset + me.side]);
        me.secondary.setFrames([0, 1, 2, 2]);
        me.secondary.setIndex(0);
    },


    /**
     * Play the 'take damage' animation
     * @memberOf rd.game.unit
     */
    takeDamage = function() {
        me.animationInProgress = true;

        me.skin.setPos([0, 768 + me.side]);
        me.skin.setFrames([0, 0]);

        me.gear.head.setPos([0, 768 + me.side]);
        me.gear.head.setFrames([0, 0]);

        me.gear.torso.setPos([0, 768 + me.side]);
        me.gear.torso.setFrames([0, 0]);

        me.gear.leg.setPos([0, 768 + me.side]);
        me.gear.leg.setFrames([0, 0]);

        me.primary.setPos([0, 768 + me.side]);
        me.primary.setFrames([0, 0]);

        me.secondary.setPos([0, 768 + me.side]);
        me.secondary.setFrames([0, 0]);

        me.wounded.setPos([0, 768 + me.side]);
        me.wounded.setFrames([0, 0]);
    },


    /**
     * Play the die animation
     * @memberOf rd.game.unit
     */
    die = function() {
        me.skin.setPos([0, 768 + me.side]);
        me.skin.setFrames([0, 1, 1, 1, 1, 1, 1, 1, 1, 1]);

        me.gear.head.setPos([0, 768 + me.side]);
        me.gear.head.setFrames([0, 1, 1, 1, 1, 1, 1, 1, 1, 1]);

        me.gear.torso.setPos([0, 768 + me.side]);
        me.gear.torso.setFrames([0, 1, 1, 1, 1, 1, 1, 1, 1, 1]);

        me.gear.leg.setPos([0, 768 + me.side]);
        me.gear.leg.setFrames([0, 1, 1, 1, 1, 1, 1, 1, 1, 1]);

        me.primary.setPos([0, 768 + me.side]);
        me.primary.setFrames([0, 1, 1, 1, 1, 1, 1, 1, 1, 1]);

        me.secondary.setPos([0, 768 + me.side]);
        me.secondary.setFrames([0, 1, 1, 1, 1, 1, 1, 1, 1, 1]);

        me.wounded.setPos([0, 768 + me.side]);
        me.wounded.setFrames([0, 1, 1, 1, 1, 1, 1, 1, 1, 1]);
    },


    /**
     * Turn the unit
     * @memberOf rd.game.unit
     * @param {string} direction
     */
    turn = function(direction) {
        me.side = direction === 'left' ? 128 : 0;

        me.skin.setPos([0, me.idleOffset + me.side]);
        me.gear.head.setPos([0, me.idleOffset + me.side]);
        me.gear.torso.setPos([0, me.idleOffset + me.side]);
        me.gear.leg.setPos([0, me.idleOffset + me.side]);
        me.primary.setPos([0, me.idleOffset + me.side]);
        me.secondary.setPos([0, me.idleOffset + me.side]);
        me.wounded.setPos([0, me.idleOffset + me.side]);
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
     * Set the health
     * @memberOf rd.game.unit
     * @param {array} newHealth
     */
    setHealth = function(newHealth) {
        me.health = newHealth;
    },


    /**
     * Set the wounded status
     * @memberOf rd.game.unit
     * @param {array} wounded
     */
    setWounded = function(wounded) {
        me.isWounded = wounded;
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
        for (var i = 0; i < me.fieldsInRange.length; i++) {
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
    me.visible = cfg.visible || true;
    me.isWounded = false;
    me.weapons = cfg.weapons;
    me.health = cfg.health || 0;
    me.attributes = cfg.racesCfg[cfg.race];
    me.attributes.damageMelee += (cfg.weaponsCfg[cfg.weapons.primary].damageMelee || 0);
    me.attributes.damageRanged += (cfg.weaponsCfg[cfg.weapons.primary].damageRanged || 0);
    me.attributes.moveRange = Math.round(me.attributes.moveRange + cfg.armorCfg[cfg.armor].moveRange);
    me.attributes.defense += cfg.armorCfg[cfg.armor].defense;
    me.attributes.defense += (cfg.weaponsCfg[cfg.weapons.secondary].defense || 0);
    me.primary = cfg.primary;
    me.secondary = cfg.secondary;
    me.wounded = cfg.wounded;
    me.currentMoveRange = me.attributes.moveRange;
    me.attackRange = cfg.weaponsCfg[me.weapons.primary].attackRange;
    me.path = [];
    me.fieldsInRange = [];
    me.steps = 20;
    me.currentStep = 20;
    me.animationInProgress = false;
    me.ranged = me.attackRange > 1 ? true : false;
    me.arrow = cfg.weaponsCfg[me.weapons.primary].arrow;
    me.bolt = cfg.weaponsCfg[me.weapons.primary].bolt;
    me.bullet = cfg.weaponsCfg[me.weapons.primary].bullet;
    me.idleOffset = cfg.idleOffset;


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
        resetMoveRange: resetMoveRange,
        setHealth: setHealth,
        setWounded: setWounded,
        takeDamage: takeDamage,
        die: die
    };

});
