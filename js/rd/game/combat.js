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
                fireArrow(attackerStats);
            }
            if (attackerStats.bolt) {
                fireBolt(attackerStats);
            }
            if (attackerStats.bullet) {
                fireBullet(attackerStats);
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
            } else {
                rd.game.units.removeUnit(defender, defenderStats);
            }

            rd.game.main.endTurn();
        }, 1400);
    },


    fireArrow = function() {

    },

    
    fireBolt = function() {

    },


    fireBullet = function() {

    };


    /**
     * Return public functions
     */
    return {
        fight: fight
    };

})());
