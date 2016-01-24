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
            side = cfg.team === 1 ? 0 : 64;
        newUnit.pos = cfg.pos;
        newUnit.team = cfg.team;
        newUnit.side = side;
        newUnit.weaponsCfg = JSON.parse(JSON.stringify(weaponsCfg));
        newUnit.armorCfg = JSON.parse(JSON.stringify(armorCfg));
        newUnit.racesCfg = JSON.parse(JSON.stringify(racesCfg));
        newUnit.skin = new rd.utils.sprite(getSkinPreset(newUnit.race, newUnit.skin, side));
        newUnit.gear.head = new rd.utils.sprite(getHeadPreset(newUnit.gear.head, side));
        newUnit.gear.torso = new rd.utils.sprite(getTorsoPreset(newUnit.gear.torso, side));
        newUnit.gear.leg = new rd.utils.sprite(getLegPreset(newUnit.gear.leg, side));
        units.push(new rd.game.unit(newUnit));
        rd.game.map.updateMap(cfg.pos[0], cfg.pos[1], 'id-' + unitCount);
        unitCount++;
    },


    /**
     * Skin sprite preset
     * @param  {string}  race
     * @param  {integer} skin
     * @param  {integer} side
     * @return {object}
     */
    getSkinPreset = function(race, skin, side) {
        return {
            "url": "img/units/" + race + skin + ".png",
            "pos": [0, 128 + side],
            "size": [64, 64],
            "speed": 4,
            "frames": [0]
        };
    },


    /**
     * Head sprite preset
     * @param  {string}  head
     * @param  {integer} side
     * @return {object}
     */
    getHeadPreset = function(head, side) {
        return {
            "url": "img/units/head" + head + ".png",
            "pos": [0, 128 + side],
            "size": [64, 64],
            "speed": 4,
            "frames": [0]
        };
    },


    /**
     * Torso sprite preset
     * @param  {string}  torso
     * @param  {integer} side
     * @return {object}
     */
    getTorsoPreset = function(torso, side) {
        return {
            "url": "img/units/torso" + torso + ".png",
            "pos": [0, 128 + side],
            "size": [64, 64],
            "speed": 4,
            "frames": [0]
        };
    },


    /**
     * Leg sprite preset
     * @param  {string}  leg
     * @param  {integer} side
     * @return {object}
     */
    getLegPreset = function(leg, side) {
        return {
            "url": "img/units/leg" + leg + ".png",
            "pos": [0, 128 + side],
            "size": [64, 64],
            "speed": 4,
            "frames": [0]
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
        for (var i=0; i<units.length; i++) {
            returnArray.push(units[i].get());
        }
        return returnArray;
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
                            key: 'nico',
                            pos: [0, 4],
                            team: 1
                        });
                        add({
                            key: 'nicoclone',
                            pos: [0, 6],
                            team: 1
                        });
                        add({
                            key: 'enemy1',
                            pos: [11, 5],
                            team: 2
                        });
                        // add({
                        //     key: 'enemy1',
                        //     pos: [11, 4],
                        //     team: 2
                        // });
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
        getStats: getStats
    };

})());