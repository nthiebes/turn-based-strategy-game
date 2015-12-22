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
        unitCount = 0,


    /**
     * Add a new unit
     * @memberOf rd.game.units
     * @param {object} newUnit
     */
    add = function(cfg) {
        var newUnit = JSON.parse(JSON.stringify(unitsCfg[cfg.key])); // Copy object
        newUnit.pos = cfg.pos;
        newUnit.team = cfg.team;
        newUnit.skin = new rd.utils.sprite(newUnit.skin);
        newUnit.gear.head = new rd.utils.sprite(newUnit.gear.head);
        newUnit.gear.torso = new rd.utils.sprite(newUnit.gear.torso);
        newUnit.gear.leg = new rd.utils.sprite(newUnit.gear.leg);
        units.push(new rd.game.unit(newUnit));
        rd.game.map.updateMap(cfg.pos[0], cfg.pos[1], 'id-' + unitCount);
        unitCount++;
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
        rd.utils.loadJSON('cfg/units.json', function(json) {
            unitsCfg = json;

            add({
                key: 'nico',
                pos: [0, 4],
                team: 1
            });
            add({
                key: 'nico',
                pos: [0, 6],
                team: 1
            });
            add({
                key: 'nicoclone',
                pos: [11, 5],
                team: 2
            });
            add({
                key: 'nicoclone',
                pos: [2, 4],
                team: 2
            });

            callback();
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