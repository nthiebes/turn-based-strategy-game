/**
 * Units controller
 * @namespace rd.game.units
 */
rd.define('game.units', (function() {

    /**
     * Variables
     */
    var units = [],

    add = function(newUnit) {
        units.push(new rd.game.unit(newUnit));
    },

    
    get = function() {
        return units;
    },


    getStats = function() {
        var returnArray = [];
        for (var i=0; i<units.length; i++) {
            returnArray.push(units[i].get());
        }
        return returnArray;
    },


    init = function() {
        add({
            name: 'Nico',
            pos: [0, 0],
            skin: new rd.utils.sprite({
                url: 'img/units/skin1.png',
                pos: [0, 128],
                size: [64, 64],
                speed: 4,
                frames: [0]
            }),
            gear: {
                head: new rd.utils.sprite({
                    url: 'img/units/head1.png',
                    pos: [0, 128],
                    size: [64, 64],
                    speed: 4,
                    frames: [0]
                }),
                torso: new rd.utils.sprite({
                    url: 'img/units/torso1.png',
                    pos: [0, 128],
                    size: [64, 64],
                    speed: 4,
                    frames: [0]
                }),
                legs: 0
            },
            count: 10,
            weapons: {
                primary: 0,
                secondary: 0
            },
            attributes: {
                attack: 5,
                defense: 5,
                attackRange: 1,
                moveRange: 5
            }
        });

        add({
            name: 'Nico Klon',
            pos: [64, 64],
            skin: new rd.utils.sprite({
                url: 'img/units/skin4.png',
                pos: [0, 192],
                size: [64, 64],
                speed: 4,
                frames: [0]
            }),
            gear: {
                head: new rd.utils.sprite({
                    url: 'img/units/head2.png',
                    pos: [0, 192],
                    size: [64, 64],
                    speed: 4,
                    frames: [0]
                }),
                torso: new rd.utils.sprite({
                    url: 'img/units/torso0.png',
                    pos: [0, 192],
                    size: [64, 64],
                    speed: 4,
                    frames: [0]
                }),
                legs: 0
            },
            count: 10,
            weapons: {
                primary: 0,
                secondary: 0
            },
            attributes: {
                attack: 5,
                defense: 5,
                attackRange: 6,
                moveRange: 4
            }
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