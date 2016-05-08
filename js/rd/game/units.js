/**
 * Units controller
 * @namespace rd.game.units
 */
rd.define('game.units', (function() {

    /**
     * Variables
     */
    var units = [],
        unitsCfg,
        armorCfg,
        weaponsCfg,
        racesCfg,
        unitCount = 0,


    /**
     * Add a new unit
     * @memberOf rd.game.units
     * @param {object} newUnit
     */
    add = function(cfg) {
        var newUnit = JSON.parse(JSON.stringify(unitsCfg[cfg.key])), // Copy object
            side = cfg.team === 1 ? 0 : 128;
        newUnit.pos = cfg.pos;
        newUnit.team = cfg.team;
        newUnit.side = side;
        newUnit.weaponsCfg = JSON.parse(JSON.stringify(weaponsCfg));
        newUnit.armorCfg = JSON.parse(JSON.stringify(armorCfg));
        newUnit.racesCfg = JSON.parse(JSON.stringify(racesCfg));
        newUnit.skin = new rd.utils.sprite(getPreset(newUnit.race + newUnit.skin, side));
        newUnit.gear.head = new rd.utils.sprite(getPreset('head' + newUnit.gear.head, side));
        newUnit.gear.torso = new rd.utils.sprite(getPreset('torso' + newUnit.gear.torso, side));
        newUnit.gear.leg = new rd.utils.sprite(getPreset('leg' + newUnit.gear.leg, side));
        newUnit.primary = new rd.utils.sprite(getPreset(newUnit.weapons.primary, side));
        newUnit.secondary = new rd.utils.sprite(getPreset(newUnit.weapons.secondary, side));
        newUnit.wounded = new rd.utils.sprite(getPreset('wounded', side));
        units.push(new rd.game.unit(newUnit));
        rd.game.map.updateMap(cfg.pos[0], cfg.pos[1], 'id-' + unitCount);
        unitCount++;
    },


    /**
     * Sprite preset
     * @param  {string}  name
     * @param  {integer} side
     * @return {object}
     */
    getPreset = function(name, side) {
        return {
            'url': 'img/units/' + name + '.png',
            'pos': [0, 256 + side],
            'size': [128, 128],
            'speed': 4,
            'frames': [0]
        };
    },


    /**
     * Get a list of all units
     * @memberOf rd.game.units
     * @return {array}
     */
    get = function() {
        return units;
    },


    /**
     * Get a list of all unit and their stats
     * @memberOf rd.game.units
     * @return {array}
     */
    getStats = function() {
        var returnArray = [];
        for (var i = 0; i < units.length; i++) {
            returnArray.push(units[i].get());
        }
        return returnArray;
    },


    /**
     * Remove a unit from the units array
     * @param {integer} index
     */
    removeUnit = function(index, stats) {
        units.splice(index, 1);

        // Update all unit arrays
        rd.game.map.updateMap(stats.pos[0], stats.pos[1], 0);
        rd.game.map.updateUnitStats();
        rd.game.main.updateUnits();
        rd.game.main.updateUnitStats();
        rd.canvas.main.updateUnitStats();
    },


    /**
     * Initialization
     * @memberOf rd.game.units
     */
    init = function(callback) {
        rd.utils.loadJSON('cfg/units.json', function(unitsJson) {
            unitsCfg = unitsJson;

            rd.utils.loadJSON('cfg/races.json', function(racesJson) {
                racesCfg = racesJson;

                rd.utils.loadJSON('cfg/weapons.json', function(weaponsJson) {
                    weaponsCfg = weaponsJson;

                    rd.utils.loadJSON('cfg/armor.json', function(armorJson) {
                        armorCfg = armorJson;

                        add({
                            key: 'nico1',
                            pos: [9, 3],
                            team: 1
                        });
                        // add({
                        //     key: 'nicoclone',
                        //     pos: [0, 6],
                        //     team: 1
                        // });
                        add({
                            key: 'enemy1',
                            pos: [11, 5],
                            team: 2
                        });
                        add({
                            key: 'enemy2',
                            pos: [11, 4],
                            team: 2
                        });
                        // add({
                        //     key: 'enemy1',
                        //     pos: [11, 7],
                        //     team: 2
                        // });

                        callback();
                    });
                });
            });
        });
    };


    /**
     * Return public functions
     */
    return {
        init: init,
        get: get,
        getStats: getStats,
        removeUnit: removeUnit
    };

})());
