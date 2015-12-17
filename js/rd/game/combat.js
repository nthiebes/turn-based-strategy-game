/**
 * Combat controller
 */
rd.define('game.combat', (function() {

    /**
     * Just testing stuff ...
     */
    var fight = function(attacker, defender) {
        var attackerStats = attacker.get(),
            defenderStats = defender.get(),
            attackerAttr = attackerStats.attributes,
            defenderAttr = defenderStats.attributes;

        var baseDmg = attackerStats.count * attackerAttr.attack;

        console.log('base damage:', baseDmg);

        var modifier = 0;

        if (attackerAttr.attack > defenderAttr.defense) {
            console.log('bonus:', modifier);
            modifier = 0.05 * (attackerAttr.attack - defenderAttr.defense);
        } else if (attackerAttr.attack < defenderAttr.defense) {
            console.log('reduction:', modifier);
            modifier = 0.05 * (attackerAttr.attack - defenderAttr.defense);
        }

        var modifiedDmg = baseDmg * (1 + modifier);

        console.log('modified damage:', modifiedDmg);

        var kills = modifiedDmg / 10;

        console.log('kills:', kills);

        var woundedCheck = kills - Math.floor(kills)

        console.log('wounded check:', woundedCheck);

        var wounded = (woundedCheck > 0 && woundedCheck < 0.5) ? true : false;

        // var wounded = kills % 1 !== 0 ? true : false;

        console.log('wounded:', wounded);

        kills = wounded ? Math.floor(kills) : Math.round(kills);

        console.log('rounded kills:', kills);
    };


    /**
     * Return public functions
     */
    return {
        fight: fight
    };

})());