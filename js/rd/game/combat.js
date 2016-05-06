/**
 * Combat controller
 * @namespace rd.game.combat
 */
rd.define('game.combat', (function() {

    /**
     * Just testing stuff ...
     */
    var units,


    fight = function(attacker, defender) {
        units = rd.game.units.get();

        var attackerStats = units[attacker].get(),
            defenderStats = units[defender].get(),
            attackerAttr = attackerStats.attributes,
            defenderAttr = defenderStats.attributes,
            damageAttacker;

        console.log( attackerStats, defenderStats );


        // Turn units
        if (attackerStats.pos[0] < defenderStats.pos[0]) {
            units[attacker].turn('right');
        } else if (attackerStats.pos[0] > defenderStats.pos[0]) {
            units[attacker].turn('left');
        } else if (attackerStats.pos[0] === defenderStats.pos[0]) {
            if (attackerStats.team === 1) {
                units[attacker].turn('right');
            } else {
                units[attacker].turn('left');
            }
        }

        units[attacker].attack();

        

        

        if (attackerStats.attackRange > 1) {
            damageAttacker = attackerAttr.damageRanged;
        } else {
            damageAttacker = attackerAttr.damageMelee;
        }


        console.log(damageAttacker, 'damage');
        console.log('vs');
        console.log(defenderAttr.defense, 'defense');

        var baseDmg =  7 * damageAttacker;


        console.log('base damage:', baseDmg);

        var modifier = 0;

        if (damageAttacker > defenderAttr.defense) {
            modifier = 0.1 * (damageAttacker - defenderAttr.defense);
            console.log('bonus:', modifier);
        } else if (damageAttacker < defenderAttr.defense) {
            modifier = 0.1 * (damageAttacker - defenderAttr.defense);
            console.log('reduction:', modifier);
        }

        var modifiedDmg = baseDmg * (1 + modifier);

        console.log('modified damage:', modifiedDmg);

        var newHealth = (defenderStats.health - modifiedDmg > 0 ? defenderStats.health - modifiedDmg : 0);

        newHealth = Math.floor(newHealth);

        console.log('health', newHealth);

        var wounded = newHealth < 50 ? true : false;

        // var wounded = kills % 1 !== 0 ? true : false;

        console.log('wounded:', wounded);

        units[defender].setHealth(newHealth);
    };


    /**
     * Return public functions
     */
    return {
        fight: fight
    };

})());