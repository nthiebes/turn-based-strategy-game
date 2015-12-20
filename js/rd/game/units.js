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
    add = function(key, pos) {
        var newUnit = JSON.parse(JSON.stringify(unitsCfg[key])); // Copy object
        newUnit.pos = pos;
        newUnit.skin = new rd.utils.sprite(newUnit.skin);
        newUnit.gear.head = new rd.utils.sprite(newUnit.gear.head);
        newUnit.gear.torso = new rd.utils.sprite(newUnit.gear.torso);
        units.push(new rd.game.unit(newUnit));
        rd.game.map.updateMap(pos[0], pos[1], 'id-' + unitCount);
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

            add('nico', [0, 4]);
            add('nico', [0, 6]);
            add('nicoclone', [11, 5]);
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