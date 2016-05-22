/**
 * Combat controller
 * @namespace rd.game.combat
 */
rd.define('game.combat', (function() {

    /**
     * Variables
     */
    var units,


    /**
     * To battle!
     * @param {object} attacker
     * @param {object} defender
     */
    fight = function(attacker, defender) {
        units = rd.game.units.get();

        var attackerStats = units[attacker].get(),
            defenderStats = units[defender].get(),
            attackerAttr = attackerStats.attributes,
            defenderAttr = defenderStats.attributes,
            damageAttacker,
            baseDmg,
            modifier = 0,
            modifiedDmg,
            newHealth,
            wounded;

        // Turn units
        if (attackerStats.pos[0] < defenderStats.pos[0]) {
            units[attacker].turn('right');
        } else if (attackerStats.pos[0] > defenderStats.pos[0]) {
            units[attacker].turn('left');
        }

        // Attack animation
        units[attacker].attack();

        // Base damage
        if (attackerStats.attackRange > 1) {
            damageAttacker = attackerAttr.damageRanged;
        } else {
            damageAttacker = attackerAttr.damageMelee;
        }
        baseDmg =  7 * damageAttacker;

        // console.log(damageAttacker, 'damage');
        // console.log('vs');
        // console.log(defenderAttr.defense, 'defense');
        // console.log('base damage:', baseDmg);

        // Calculate damage modifiers
        if (damageAttacker > defenderAttr.defense) {
            modifier = 0.1 * (damageAttacker - defenderAttr.defense);
            // console.log('bonus:', modifier);
        } else if (damageAttacker < defenderAttr.defense) {
            modifier = 0.1 * (damageAttacker - defenderAttr.defense);
            // console.log('reduction:', modifier);
        }
        modifiedDmg = baseDmg * (1 + modifier);

        // console.log('modified damage:', modifiedDmg);

        // Calculate health
        newHealth = (defenderStats.health - modifiedDmg > 0 ? defenderStats.health - modifiedDmg : 0);
        newHealth = Math.floor(newHealth);
        wounded = newHealth < 50 ? true : false;

        // console.log('health', newHealth);
        // console.log('wounded:', wounded);

        requestTimeout(function() {
            if (attackerStats.arrow) {
                fireArrow(attackerStats, defenderStats);
            }
            if (attackerStats.bolt) {
                fireBolt(attackerStats, defenderStats);
            }
            if (attackerStats.bullet) {
                fireBullet(attackerStats, defenderStats);
            }
        }, 400);

        requestTimeout(function() {
            units[defender].setHealth(newHealth);
            units[defender].setWounded(wounded);

            if (newHealth > 0) {
                // Alive
                units[defender].takeDamage();
                // Next player
            } else {
                // Dead
                units[defender].die();
            }

            // Show damage
        }, 600);

        requestTimeout(function() {
            if (newHealth > 0) {
                // Fight back
                rd.game.main.endTurn();
            } else {
                rd.game.units.removeUnit(defender, defenderStats);
                rd.game.main.endTurn(true);
            }
        }, 1400);
    },


    /**
     * Trigger arrow animation
     * @param {object} attackerStats
     * @param {object} defenderStats
     */
    fireArrow = function(attackerStats, defenderStats) {
        var a = defenderStats.pos[1] - attackerStats.pos[1],
            b = defenderStats.pos[0] - attackerStats.pos[0];

        rd.game.animations.play({
            name: 'arrow',
            speed: Math.sqrt(a * a + b * b) * 4,
            angle: Math.atan2(a, b),
            x1: attackerStats.pos[0] + 0.5,
            y1: attackerStats.pos[1] + 0.5,
            x2: defenderStats.pos[0] + 0.5,
            y2: defenderStats.pos[1] + 0.5
        });
    },


    /**
     * Trigger bolt animation
     * @param {object} attackerStats
     * @param {object} defenderStats
     */
    fireBolt = function(attackerStats, defenderStats) {
        var a = defenderStats.pos[1] - attackerStats.pos[1],
            b = defenderStats.pos[0] - attackerStats.pos[0];

        rd.game.animations.play({
            name: 'bolt',
            speed: Math.sqrt(a * a + b * b) * 3,
            angle: Math.atan2(a, b),
            x1: attackerStats.pos[0] + 0.5,
            y1: attackerStats.pos[1] + 0.5,
            x2: defenderStats.pos[0] + 0.5,
            y2: defenderStats.pos[1] + 0.5
        });
    },


    /**
     * Trigger bullet animation
     * @param {object} attackerStats
     * @param {object} defenderStats
     */
    fireBullet = function(attackerStats, defenderStats) {
        var a = defenderStats.pos[1] - attackerStats.pos[1],
            b = defenderStats.pos[0] - attackerStats.pos[0];

        rd.game.animations.play({
            name: 'bullet',
            speed: Math.sqrt(a * a + b * b) * 2,
            angle: Math.atan2(a, b),
            x1: attackerStats.pos[0] + 0.5,
            y1: attackerStats.pos[1] + 0.5,
            x2: defenderStats.pos[0] + 0.5,
            y2: defenderStats.pos[1] + 0.5
        });
    };


    /**
     * Return public functions
     */
    return {
        fight: fight
    };

})());
