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


    /**
     * Add a new unit
     * @memberOf rd.game.units
     * @param {object} newUnit
     */
    add = function(key) {
        var newUnit = unitsCfg[key];
        newUnit.skin = new rd.utils.sprite(newUnit.skin);
        newUnit.gear.head = new rd.utils.sprite(newUnit.gear.head);
        newUnit.gear.torso = new rd.utils.sprite(newUnit.gear.torso);
        units.push(new rd.game.unit(newUnit));
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

            add('nico');
            add('nicoclone');
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