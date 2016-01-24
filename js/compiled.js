/**
 * Game namespace
 * @namespace rd
 */
var rd = {};


/**
 * Defines a namespace
 * @namespace rd.define
 * @param {string}   namespace Namespace chain as string
 * @param {function} logic     
 */
rd.define = function(namespace, logic){
	var parts = namespace.split('.'),
		root = this,
		length = parts.length,
		i;

	for( i=0; i<length; i++ ){
		if( !root[parts[i]] ){
			if( i === length-1 ){
				root[parts[i]] = logic;
			} else{
				root[parts[i]] = {};
			}
		}
		root = root[parts[i]];
	}
};


/**
 * A cross-browser requestAnimationFrame
 */
var requestAnimFrame = (function(){
	return window.requestAnimationFrame    ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame    ||
		window.oRequestAnimationFrame      ||
		window.msRequestAnimationFrame     ||
		function(callback){
			window.setTimeout(callback, 1000 / 60);
		};
})();


/**
 * Behaves the same as setTimeout except uses requestAnimationFrame() where possible for better performance
 * @global
 * @param {function} fn    The callback function
 * @param {int} 	 delay The delay in milliseconds
 */
window.requestTimeout = function(fn, delay) {
    if( !window.requestAnimationFrame       && 
        !window.webkitRequestAnimationFrame && 
        !(window.mozRequestAnimationFrame && window.mozCancelRequestAnimationFrame) && // Firefox 5 ships without cancel support
        !window.oRequestAnimationFrame      && 
        !window.msRequestAnimationFrame)
            return window.setTimeout(fn, delay);
            
    var start = new Date().getTime(),
        handle = new Object();
        
    function loop() {
        var current = new Date().getTime(),
            delta = current - start;
            
        delta >= delay ? fn.call() : handle.value = requestAnimFrame(loop);
    }
    
    handle.value = requestAnimFrame(loop);
    return handle;
};


/**
 * @namespace rd.game
 */
 /**
 * Some useful functions
 * @namespace rd.utils
 */
rd.define('utils', (function() {

    /**
     * Load a json file from an url
     * @memberOf rd.utils
     * @param {string}   url
     * @param {function} callback
     */
    var loadJSON = function(url, callback) {   
        var xobj = new XMLHttpRequest();
        xobj.overrideMimeType('application/json');
        xobj.open('GET', url, true);
        xobj.onreadystatechange = function() {
            if (xobj.readyState === 4 && xobj.status === 200) {
                // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
                callback(JSON.parse(xobj.responseText));
            }
        };
        xobj.send(null);
    };


    /**
     * Return public functions
     */
    return {
        loadJSON: loadJSON
    };

})());
/**
 * Resources controller
 * @namespace rd.utils.resources
 */
rd.define('utils.resources', (function() {

    /**
     * Variables
     */
    var resourceCache = {},
        readyCallbacks = [],


    /**
     * Load an image url or an array of image urls
     * @memberOf rd.utils.resources
     * @param {string|array} urlOrArr
     */
    load = function(urlOrArr) {
        if(urlOrArr instanceof Array) {
            urlOrArr.forEach(function(url) {
                loadImage(url);
            });
        }
        else {
            loadImage(urlOrArr);
        }
    },


    /**
     * Load a single image from an url
     * @param  {string} url
     * @return {image}
     */
    loadImage = function(url) {
        if (resourceCache[url]) {
            return resourceCache[url];
        }
        else {
            var img = new Image();
            img.onload = function() {
                resourceCache[url] = img;

                if(isReady()) {
                    readyCallbacks.forEach(function(func) {
                        func();
                    });
                }
            };
            resourceCache[url] = false;
            img.src = url;
        }
    },


    /**
     * Get an image by url
     * @memberOf rd.utils.resources
     * @param  {string} url
     * @return {image}
     */
    get = function(url) {
        return resourceCache[url];
    },


    /**
     * Check if the resource has been loaded
     * @memberOf rd.utils.resources
     * @return {boolean}
     */
    isReady = function() {
        var ready = true;
        for(var k in resourceCache) {
            if(resourceCache.hasOwnProperty(k) &&
               !resourceCache[k]) {
                ready = false;
            }
        }
        return ready;
    },


    /**
     * Ready callback function
     * @memberOf rd.utils.resources
     * @param  {function} func
     */
    onReady = function(func) {
        readyCallbacks.push(func);
    };


    /**
     * Return public functions
     */
    return {
        load: load,
        get: get,
        onReady: onReady,
        isReady: isReady
    };

})());
/**
 * Sprite controller
 * @namespace rd.utils.sprite
 */
rd.define('utils.sprite', function(cfg) {

    /**
     * Variables
     */
    var me = this,


    /**
     * Update the sprite (e.g. speed)
     * @memberOf rd.utils.sprite
     * @param {int} delta
     */
    update = function(delta) {
        // Stay not yet working correct
        if (!(me.stay && me.done)) {
            me._index += me.speed * delta;
            // Always start with first frame
            if (me.frames.length === 1) {
                me._index = 0;
            }
        }
    },


    /**
     * Render the sprite onto the canvas
     * @memberOf rd.utils.sprite
     * @param {object} ctx
     */
    render = function(ctx) {
        var frame;

        if (me.speed > 0) {
            var max = me.frames.length,
                idx = Math.floor(me._index);
            frame = me.frames[idx % max];

            if (me.once && idx >= max) {
                me.done = true;
            }

            // End animation
            if (idx >= max){
                me._index = 0;
            }
        }
        else {
            frame = 0;
        }

        me.currentFrame = frame;

        var x = me.pos[0],
            y = me.pos[1];

        if (me.dir === 'vertical') {
            y += frame * me.size[1];
        }
        else {
            x += frame * me.size[0];
        }

        // If it is done and it has to run once, we dont update
        if (!(me.done && me.once)) {
            ctx.drawImage(rd.utils.resources.get(me.url),
                          x, y,
                          me.size[0], me.size[1],
                          0, 0,
                          me.size[0], me.size[1]);
        }
    },


    /**
     * Update the frames of a sprite
     * @memberOf rd.utils.sprite
     * @param {array} newFrames
     */
    setFrames = function(newFrames) {
        me.frames = newFrames;
    },


    /**
     * Update the positions within a sprite (e.g. for an animation)
     * @memberOf rd.utils.sprite
     * @param {array} newPos
     */
    setPos = function(newPos) {
        me.pos = newPos;
    };


    me.pos = cfg.pos;
    me.size = cfg.size;
    me.speed = typeof cfg.speed === 'number' ? cfg.speed : 0;
    me.frames = cfg.frames;
    me._index = 0;
    me.url = cfg.url;
    me.dir = cfg.dir || 'horizontal';
    me.once = cfg.once;
    me.stay = cfg.stay;
    me.inProgress = cfg.inProgress;
    me.currentFrame = 0;


    /**
     * Return public functions
     */
    return {
        render: render,
        update: update,
        setPos: setPos,
        setFrames: setFrames
    };

});
/**
 * Unit instance
 * @namespace rd.game.unit
 */
rd.define('game.unit', function(cfg) {

    /**
     * Variables
     */
    var me = this,


    /**
     * Stop animations
     * @memberOf rd.game.unit
     * @param {string} direction
     */
    stop = function(direction) {
        var offset = direction || me.directionOffset;
        
        me.skin.setPos([0, 128 + offset]);
        me.skin.setFrames([0]);

        me.gear.head.setPos([0, 128 + offset]);
        me.gear.head.setFrames([0]);

        me.gear.torso.setPos([0, 128 + offset]);
        me.gear.torso.setFrames([0]);

        me.gear.leg.setPos([0, 128 + offset]);
        me.gear.leg.setFrames([0]);

        // Round new position
        me.pos[0] = Math.round(me.pos[0]);
        me.pos[1] = Math.round(me.pos[1]);

        // Start combat
        if (me.fightAfterWalking) {
            rd.game.combat.fight(rd.game.main.getCurrentUnitId(), me.nextEnemyId);
        }
    },


    /**
     * Play the walk animation cycle
     * @memberOf rd.game.unit
     * @param {object} cfg
     */
    walk = function(cfg) {
        me.fightAfterWalking = cfg.fight;
        me.nextEnemyId = cfg.enemyId;

        me.skin.setPos([0, 0]);
        me.skin.setFrames([0, 1, 2, 3]);

        me.gear.head.setPos([0, 0]);
        me.gear.head.setFrames([0, 1, 2, 3]);

        me.gear.torso.setPos([0, 0]);
        me.gear.torso.setFrames([0, 1, 2, 3]);

        me.gear.leg.setPos([0, 0]);
        me.gear.leg.setFrames([0, 1, 2, 3]);

        me.path = cfg.path.splice(1,cfg.path.length);

        // Define the next tile for the animation
        me.nextTile = cfg.path[0];

        me.currentMoveRange = me.currentMoveRange - me.path.length;
    },


    /**
     * Play the attack animation
     * @memberOf rd.game.unit
     */
    attack = function() {
        me.skin.setPos([0, 128 + me.directionOffset]);
        me.skin.setFrames([0, 1, 2]);

        me.gear.head.setPos([0, 128 + me.directionOffset]);
        me.gear.head.setFrames([0, 1, 2]);

        me.gear.torso.setPos([0, 128 + me.directionOffset]);
        me.gear.torso.setFrames([0, 1, 2]);

        me.gear.leg.setPos([0, 128 + me.directionOffset]);
        me.gear.leg.setFrames([0, 1, 2]);
    },


    /**
     * Turn the unit
     * @memberOf rd.game.unit
     * @param {string} direction
     */
    turn = function(direction) {
        var offset = direction === 'left' ? 64 : 0;
        me.directionOffset = offset;

        me.skin.setPos([0, 128 + offset]);
        me.gear.head.setPos([0, 128 + offset]);
        me.gear.torso.setPos([0, 128 + offset]);
        me.gear.leg.setPos([0, 128 + offset]);
    },


    /**
     * Save the map tiles that are in range
     * @memberOf rd.game.unit
     * @param {array} fields
     */
    setFieldsInRange = function(fields) {
        me.fieldsInRange = fields;
    },


    /**
     * Get the map tiles that are in range
     * @memberOf rd.game.unit
     * @return {array}
     */
    getFieldsInRange = function() {
        return me.fieldsInRange;
    },


    /**
     * Check if a unit is in range
     * @memberOf rd.game.unit
     * @param  {array} unitPos
     * @return {boolean}
     */
    isInRange = function(unitPos) {
        for (var i=0; i<me.fieldsInRange.length; i++) {
            if (me.fieldsInRange[i][0] === unitPos[0] && me.fieldsInRange[i][1] === unitPos[1]) {
                return true;
            }
        }
        return false;
    },


    /**
     * Set the move range to the default value
     * @memberOf rd.game.unit
     */
    resetMoveRange = function() {
        me.currentMoveRange = me.attributes.moveRange;
    },


    /**
     * Get the unit object
     * @memberOf rd.game.unit
     * @return {object}
     */
    get = function() {
        return me;
    };


    me.name = cfg.name;
    me.skin = cfg.skin;
    me.pos = cfg.pos;
    me.team = cfg.team;
    me.side = cfg.side;
    me.gear = cfg.gear;
    me.race = cfg.race;
    me.armor = cfg.armor;
    me.moving = false;
    me.skills = cfg.skills;
    me.dead = cfg.dead;
    me.visible = cfg.visible || true;
    me.wounded = cfg.wounded;
    me.posOffset = cfg.posOffset;
    me.weapons = cfg.weapons;
    me.health = cfg.health || 0;
    me.attributes = cfg.racesCfg[cfg.race];
    me.attributes.damageMelee += (cfg.weaponsCfg[cfg.weapons.primary].damageMelee || 0);
    me.attributes.damageRanged += (cfg.weaponsCfg[cfg.weapons.primary].damageRanged || 0);
    me.attributes.moveRange = Math.round(me.attributes.moveRange + cfg.armorCfg[cfg.armor].moveRange);
    me.attributes.defense += cfg.armorCfg[cfg.armor].defense;
    me.attributes.defense += (cfg.weaponsCfg[cfg.weapons.secondary].defense || 0);
    me.currentMoveRange = me.attributes.moveRange;
    me.attackRange = cfg.weaponsCfg[me.weapons.primary].attackRange;
    me.path = [];
    me.fieldsInRange = [];
    me.steps = 20;
    me.currentStep = 20;
    me.directionOffset = me.team === 1 ? 0 : 64;


    /**
     * Return public functions
     */
    return {
        get: get,
        walk: walk,
        stop: stop,
        attack: attack,
        turn: turn,
        setFieldsInRange: setFieldsInRange,
        getFieldsInRange: getFieldsInRange,
        isInRange: isInRange,
        resetMoveRange: resetMoveRange
    };

});
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

        //kills = wounded ? Math.floor(kills) : Math.round(kills);

        // console.log('rounded kills:', kills);
    };


    /**
     * Return public functions
     */
    return {
        fight: fight
    };

})());
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
/**
 * Canvas controller
 * @namespace rd.game.canvas
 */
rd.define('game.canvas', (function() {

    /**
     * Variables
     */
    var canvasGround1 = document.getElementById('canvas-ground1'),
        canvasGround2 = document.getElementById('canvas-ground2'),
        canvasTop1 = document.getElementById('canvas-top1'),
        canvasAnim = document.getElementById('canvas-anim'),
        canvasUtils = document.getElementById('canvas-utils'),
        ctxGround1 = canvasGround1.getContext('2d'),
        ctxGround2 = canvasGround2.getContext('2d'),
        ctxTop1 = canvasTop1.getContext('2d'),
        ctxAnim = canvasAnim.getContext('2d'),
        ctxUtils = canvasUtils.getContext('2d'),
        // should be in an external file ...
        mapLayers = [
            [[257,127,126,127,126,127,126,85,70,65,81,82,66,65,88,99,126,127,126,85,88,127,126,127],[257,143,142,143,142,143,142,101,102,80,82,87,82,81,72,143,142,143,142,161,104,143,142,143],[126,127,126,127,126,127,126,127,126,107,85,145,65,66,88,148,149,149,149,127,126,127,126,127],[142,143,142,143,142,143,142,143,142,143,142,97,81,82,72,164,165,165,165,166,142,143,142,143],[126,127,126,127,126,127,126,127,126,127,126,69,129,93,104,164,165,165,165,157,149,149,149,150],[142,143,142,143,142,143,142,143,142,143,142,101,108,143,142,180,172,165,165,165,165,165,173,182],[149,150,126,127,126,127,126,127,126,127,126,101,102,127,126,127,164,165,173,181,181,181,182,127],[165,166,142,143,142,143,142,143,142,143,142,143,142,143,142,143,180,181,182,143,142,143,142,143],[165,157,149,149,150,127,126,127,126,127,126,127,126,127,126,127,126,127,126,127,126,127,126,127],[203,203,204,173,182,143,142,148,150,143,142,143,142,143,142,143,142,143,142,143,142,143,142,143],[171,235,236,166,126,127,148,156,166,127,126,127,126,127,126,127,126,127,126,127,126,127,126,127],[236,173,181,182,142,143,164,165,166,143,142,143,142,143,142,143,142,143,142,143,142,143,142,143],[181,182,126,127,126,127,164,165,166,127,126,127,126,127,126,127,126,127,126,127,151,152,152,153],[142,143,142,143,142,143,164,165,157,149,150,143,142,143,142,143,142,143,142,143,167,219,219,169],[126,127,126,127,126,127,180,181,172,165,166,127,126,127,126,127,126,127,148,149,158,219,175,185],[142,143,142,143,142,143,142,143,180,181,182,143,142,143,142,143,142,143,164,165,165,173,185,143],[126,127,126,127,126,127,126,127,126,127,126,127,126,127,126,127,126,127,164,165,165,166,126,127],[142,143,142,257,142,143,142,143,142,143,142,143,142,143,142,143,142,143,180,181,181,182,142,143],[126,127,126,69,70,87,50,127,126,127,126,127,126,127,126,127,126,127,126,127,126,127,126,127],[142,143,142,85,87,70,87,75,54,55,142,143,142,143,142,143,142,143,142,143,142,143,142,143]],[[0,227,274,0,223,269,84,0,0,0,253,0,0,253,420,0,118,119,144,773,0,89,0,0],[243,258,355,356,239,0,100,0,0,722,269,253,253,269,0,115,134,135,160,752,753,105,0,0],[227,274,0,0,0,0,116,117,106,738,688,269,269,0,0,89,478,479,176,177,120,121,0,0],[274,0,0,0,0,0,132,133,122,123,96,327,328,0,0,73,494,495,192,193,136,137,0,0],[0,0,0,0,0,0,0,0,138,139,112,343,344,222,0,105,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,100,359,360,109,120,121,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,116,123,124,125,136,137,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,132,133,140,141,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,357,358,0,240,242,0,0,0,0,0,0,0,0,0,0,0,0,0],[222,0,0,0,0,0,0,0,0,256,258,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,256,258,0,0,0,0,0,752,753,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,272,274,0,0,524,0,0,773,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,237,0,0,738,0,540,0,0,0,708,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,345,346,347,348,523,0,0,0,0,0,0,240,241,242,0,0],[0,0,0,0,0,0,0,0,361,362,363,364,340,0,323,324,0,0,0,272,273,274,0,0],[0,0,240,241,241,242,0,0,756,757,344,355,356,0,339,340,672,0,0,0,0,0,0,0],[0,0,256,53,54,55,56,0,689,0,360,0,336,337,355,356,0,706,0,0,0,0,0,0],[0,0,68,0,240,241,242,51,38,39,355,356,352,353,354,0,0,0,389,0,758,759,0,240],[0,0,84,0,256,257,211,241,242,0,56,0,270,339,340,359,360,325,240,241,241,241,241,210]],[[0,0,339,340,0,0,240,210,227,274,0,0,0,0,0,0,0,0,0,736,737,0,0,0],[0,0,0,0,0,0,272,273,274,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,309,310,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,325,326,0,0,0,0,0,690,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,341,342,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,736,737,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,221,0,0,722,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,329,330,331,332,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,323,324,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,327,328,339,304,305,306,0,0,0,0,0,0,0,0,0],[0,0,0,37,38,39,40,0,0,343,323,324,320,321,322,0,0,0,0,0,0,0,0,0],[0,0,52,329,330,331,332,57,0,359,339,340,0,0,338,327,328,0,0,0,0,0,0,0],[0,0,0,345,346,347,348,0,0,0,40,0,0,323,324,343,344,309,310,0,0,0,0,0],[0,0,0,361,362,363,364,0,0,222,0,57,0,0,0,0,0,0,340,373,0,0,0,0]],
        ],
        ground1 = mapLayers[0],
        ground2 = mapLayers[1],
        top1 = mapLayers[2],
        rowTileCount = ground1.length,
        colTileCount = ground1[0].length,
        imageNumTiles = 16,
        tileSize = 32,
        fieldWidth = tileSize * 2,
        tilesetImage,
        utilsDisabled = false,
        unitStats,
        map,
        curentMoveRange,


    /**
     * Draw the images of a sprite onto the canvas
     * @param {object} ctx Canvas context
     */
    drawImage = function(ctx, array) {
        // Each row
        for (var r = 0; r < rowTileCount; r++) {
            // Each column
            for (var c = 0; c < colTileCount; c++) {
                var tile = array[ r ][ c ],
                    tileRow = (tile / imageNumTiles) | 0,
                    tileCol = (tile % imageNumTiles) | 0;

                ctx.drawImage(tilesetImage, (tileCol * tileSize), (tileRow * tileSize), tileSize, tileSize, (c * tileSize), (r * tileSize), tileSize, tileSize);
            }
        }
    },


    /**
     * Draw a single line
     * @memberOf rd.game.canvas
     * @param {object} cfg Configuration
     */
    drawLine = function(cfg) {
        ctxUtils.strokeStyle = cfg.lineColor;
        ctxUtils.beginPath();
        ctxUtils.moveTo(cfg.x1, cfg.y1);
        ctxUtils.lineTo(cfg.x2, cfg.y2);
        ctxUtils.lineWidth = cfg.lineWidth;
        ctxUtils.stroke();
        ctxUtils.closePath();
    },


    /**
     * Draw a rectangle with gradient
     * @memberOf rd.game.canvas
     * @param {object} cfg Configuration
     */
    drawGradient = function(cfg) {
        var gradient = ctxUtils.createLinearGradient(cfg.x1, cfg.y1, cfg.x2, cfg.y2);
        gradient.addColorStop(0, 'rgba(' + cfg.rgbColor + ',' + (cfg.opacity - 0.3) + ')');
        gradient.addColorStop(1, 'transparent');
        ctxUtils.fillStyle = gradient;
        ctxUtils.fillRect(cfg.x0, cfg.y0, fieldWidth, fieldWidth);
    },


    /**
     * Clear the utils canvas
     */
    clearUtils = function() {
        canvasUtils.width = canvasUtils.width;
    },


    /**
     * Draw the 'movable' custom shape
     * @memberOf rd.game.canvas
     * @param {object} cfg Configuration
     */
    drawMovable = function(cfg) {
        var x = cfg.x,
            y = cfg.y;

        if (cfg.lineRgbColor === 'move') {
            cfg.lineRgbColor = '0,200,0';
        } else if (cfg.lineRgbColor === 'current') {
            cfg.lineRgbColor = '255,255,50';
        } else if (cfg.lineRgbColor === 'hover') {
            cfg.lineRgbColor = '50,50,50';
        } else if (cfg.lineRgbColor === 'team1') {
            cfg.lineRgbColor = '200,200,200';
        } else if (cfg.lineRgbColor === 'team2') {
            cfg.lineRgbColor = '255,150,0';
        }

        if (cfg.fillRgbColor === 'move') {
            cfg.fillRgbColor = '0,200,0';
        } else if (cfg.fillRgbColor === 'current') {
            cfg.fillRgbColor = '255,255,50';
        } else if (cfg.fillRgbColor === 'hover') {
            cfg.fillRgbColor = '20,20,20';
        } else if (cfg.fillRgbColor === 'team1') {
            cfg.fillRgbColor = '200,200,200';
        } else if (cfg.fillRgbColor === 'team2') {
            cfg.fillRgbColor = '255,150,0';
        }

        ctxUtils.strokeStyle = 'rgba(' + cfg.lineRgbColor + ',' + cfg.opacity + ')';
        ctxUtils.fillStyle = 'rgba(' + cfg.fillRgbColor + ',' + (cfg.opacity >= 0.8 ? cfg.opacity - 0.8 : 0) + ')';
        ctxUtils.beginPath();
        ctxUtils.moveTo(x + 8, y + 8);

        ctxUtils.lineTo(x + 27, y + 8);
        ctxUtils.lineTo(x + 32, y + 3);
        ctxUtils.lineTo(x + 37, y + 8);
        ctxUtils.lineTo(x + 56, y + 8);

        ctxUtils.lineTo(x + 56, y + 27);
        ctxUtils.lineTo(x + 61, y + 32);
        ctxUtils.lineTo(x + 56, y + 37);
        ctxUtils.lineTo(x + 56, y + 56);

        ctxUtils.lineTo(x + 37, y + 56);
        ctxUtils.lineTo(x + 32, y + 61);
        ctxUtils.lineTo(x + 27, y + 56);
        ctxUtils.lineTo(x + 8, y + 56);

        ctxUtils.lineTo(x + 8, y + 37);
        ctxUtils.lineTo(x + 3, y + 32);
        ctxUtils.lineTo(x + 8, y + 27);
        ctxUtils.lineTo(x + 8, y + 8);
        
        ctxUtils.closePath();
        ctxUtils.lineWidth = cfg.lineWidth;
        ctxUtils.stroke();
        ctxUtils.fill();
    },


    /**
     * Draw the range custom shape
     * @param {object} cfg
     */
    drawRange = function(cfg) {
        var x = cfg.x,
            y = cfg.y,
            border = isBorderTile(x/fieldWidth, y/fieldWidth, cfg.visibleFields);

        // Draw border on right side
        if (border.right) {
            drawLine({
                lineColor: 'rgba(' + cfg.lineRgbColor + ',' + cfg.lineOpacity + ')',
                lineWidth: cfg.lineWidth,
                x1: x + fieldWidth,
                x2: x + fieldWidth,
                y1: y,
                y2: y + fieldWidth
            });

            drawGradient({
                rgbColor: cfg.lineRgbColor,
                opacity: cfg.lineOpacity,
                x0: x,
                y0: y,
                x1: x + fieldWidth,
                x2: x,
                y1: y,
                y2: y
            });
        }

        // Draw border on left side
        if (border.left) {
            drawLine({
                lineColor: 'rgba(' + cfg.lineRgbColor + ',' + cfg.lineOpacity + ')',
                lineWidth: cfg.lineWidth,
                x1: x,
                x2: x,
                y1: y,
                y2: y + fieldWidth
            });

            drawGradient({
                rgbColor: cfg.lineRgbColor,
                opacity: cfg.lineOpacity,
                x0: x,
                y0: y,
                x1: x,
                x2: x + fieldWidth,
                y1: y,
                y2: y
            });
        }

        // Draw border on bottom side
        if (border.bottom) {
            drawLine({
                lineColor: 'rgba(' + cfg.lineRgbColor + ',' + cfg.lineOpacity + ')',
                lineWidth: cfg.lineWidth,
                x1: x,
                x2: x + fieldWidth,
                y1: y + fieldWidth,
                y2: y + fieldWidth
            });

            drawGradient({
                rgbColor: cfg.lineRgbColor,
                opacity: cfg.lineOpacity,
                x0: x,
                y0: y,
                x1: x,
                x2: x,
                y1: y + fieldWidth,
                y2: y
            });
        }

        // Draw border on top side
        if (border.top) {
            drawLine({
                lineColor: 'rgba(' + cfg.lineRgbColor + ',' + cfg.lineOpacity + ')',
                lineWidth: cfg.lineWidth,
                x1: x,
                x2: x + fieldWidth,
                y1: y,
                y2: y
            });

            drawGradient({
                rgbColor: cfg.lineRgbColor,
                opacity: cfg.lineOpacity,
                x0: x,
                y0: y,
                x1: x,
                x2: x,
                y1: y,
                y2: y + fieldWidth
            });
        }
    },


    /**
     * Checks for fields that are at the border
     * @param  {integer} x
     * @param  {integer} y
     * @param  {array}   fields
     * @return {object}
     */
    isBorderTile = function(x, y, fields) {
        var right = x + 1,
            left = x - 1,
            bottom = y + 1,
            top = y - 1,
            result = {
                right: true,
                left: true,
                bottom: true,
                top: true
            };

        // Each field in range
        for (var i=0; i<fields.length; i++) {
            // Check the right side
            if (fields[i][0] === right && fields[i][1] === y) {
                result.right = false;
            }

            // Check the left side
            if (fields[i][0] === left && fields[i][1] === y) {
                result.left = false;
            }

            // Check the bottom side
            if (fields[i][0] === x && fields[i][1] === bottom) {
                result.bottom = false;
            }

            // Check the top side
            if (fields[i][0] === x && fields[i][1] === top) {
                result.top = false;
            }
        }

        return result;
    },


    /**
     * Render the canvas
     * @memberOf rd.game.canvas
     */
    render = function() {
        // Clear canvas hack
        canvasAnim.width = canvasAnim.width;
        renderEntities(unitStats);
    },

    
    /**
     * Go through the list of entities
     * @param {array} list
     */
    renderEntities = function(list) {
        for (var i=0; i<list.length; i++) {
            renderEntity(list[i], list[i].skin, list[i].gear.leg, list[i].gear.torso, list[i].gear.head);
        }
    },

    
    /**
     * Render a single entity
     */
    renderEntity = function() {
        ctxAnim.save();
        ctxAnim.translate(arguments[0].pos[0] * fieldWidth, arguments[0].pos[1] * fieldWidth + arguments[0].posOffset);

        for (var i=1; i<arguments.length; i++) {
            arguments[i].render(ctxAnim);
        }
        ctxAnim.restore();
    },


    /**
     * Attack range
     * @memberOf rd.game.canvas
     * @param {array}   pos
     * @param {integer} range
     */
    renderAttackRange = function(pos, range) {
        if (range === 1) {
            return false;
        }

        var visibleFields = calculateAttackRangeFields(pos, range);

        // Draw the attack range
        for (var k=0; k<visibleFields.length; k++) {
            drawRange({
                lineWidth: 2,
                lineRgbColor: '150,0,0',
                lineOpacity: 0.5,
                x: fieldWidth * visibleFields[k][0],
                y: fieldWidth * visibleFields[k][1],
                visibleFields: visibleFields
            });    
        }
    },


    /**
     * Calculate all valid fields that are in range
     * @memberOf rd.game.canvas
     * @param  {array}   pos
     * @param  {integer} range
     * @return {array}
     */
    calculateAttackRangeFields = function(pos, range) {
        var attackRangeFields = [],
            newFields = [],
            visibleFields = [pos];

        // Collect circle tiles for each range
        for (var l=1; l<=range; l++) {
            attackRangeFields = attackRangeFields.concat(getCircle(pos[0], pos[1], l));
        }

        // Remove tiles that are out of the map
        attackRangeFields = removeNegative(attackRangeFields);

        // Fill gaps
        for (var i=0; i<attackRangeFields.length; i++) {
            var y = attackRangeFields[i][0],
                x = attackRangeFields[i][1];

            if (x > pos[1]) {
                newFields.push([y,x-1]);
            }

            if (x < pos[1]) {
                newFields.push([y,x+1]);
            }
        }

        // Merge the new array
        attackRangeFields = attackRangeFields.concat(newFields);

        // Remove fields that are out of the viewport
        for (var j=0; j<attackRangeFields.length; j++) {
            newFields = bline(pos[0], pos[1], attackRangeFields[j][0], attackRangeFields[j][1]);
            visibleFields = visibleFields.concat(newFields);
        }

        // Remove duplicates
        visibleFields = uniq(visibleFields);

        return visibleFields;
    },


    /**
     * Show the move range
     * @memberOf rd.game.canvas
     */
    renderMoveRange = function(unit, hover) {
        var moveRange = unit.currentMoveRange,
            availableFields = [],
            newFields;

        availableFields.push(unit.pos);

        // Get and concat movable fields
        function getFields() {
            newFields = [];
            for (var j=0; j<availableFields.length; j++) {
                newFields = newFields.concat( getSurroundingFields(availableFields[j], hover) );
            }

            availableFields = uniq(availableFields.concat(newFields));
        }

        // Highlight fields for each move range
        for (var i=1; i<=moveRange; i++) {
            getFields();
        }

        // Save move range so that we can compare it when hovering over another unit
        if (!hover) {
            curentMoveRange = availableFields;
        }

        // Highlight all movable fields
        for (var i=0; i<availableFields.length; i++) {
            var lineRgbColor = 'move',
                fillRgbColor = 'move';

            if (hover) {
                var overlap = false;
                fillRgbColor = 'hover';
                
                // Check if the field is also highlighted for the current move range
                // for (var j=0; j<curentMoveRange.length; j++) {
                //     if (fieldWidth * curentMoveRange[j][0] === fieldWidth * availableFields[i][0] &&
                //         fieldWidth * curentMoveRange[j][1] === fieldWidth * availableFields[i][1]) {
                //         overlap = true;
                //     }
                // }

                // Define colors
                if (overlap) {
                    lineRgbColor = 'move';
                } else {
                    lineRgbColor = 'hover';
                }
            }

            // Draw the thing
            if (hover && i === 0) {

            } else {
                drawMovable({
                    lineWidth: 2,
                    lineRgbColor: lineRgbColor,
                    fillRgbColor: fillRgbColor,
                    opacity: hover ? 1 : 0.8,
                    x: fieldWidth * availableFields[i][0],
                    y: fieldWidth * availableFields[i][1]
                });
            }
        }
    },


    /**
     * Removes duplicates from array
     * @param  {array} array
     * @return {array}
     */
    uniq = function(array) {
        var seen = {};
        return array.filter(function(item) {
            return seen.hasOwnProperty(item) ? false : (seen[item] = true);
        });
    },


    removeNegative = function(array) {
        var fields = [];
        for (var i=0; i<array.length; i++) {
            var x = array[i][0],
                y = array[i][1];
            if (x < 0) {
                x = 0;
            } else if (x > 11) {
                x = 11;
            }
            if (y < 0) {
                y = 0;
            } else if (y > 9) {
                y = 9;
            }
            fields.push([x, y]);
        }
        return fields;
    },


    /**
     * Get all surrounding fields
     * @param  {array} field
     * @return {array}
     */
    getSurroundingFields = function(field, hover) {
        var fields = [],
            newField = [];

        // Nothing in our way
        if (isMovableField(field) ||
            (field[0] === rd.game.main.getCurrentUnitStats().pos[0] && field[1] === rd.game.main.getCurrentUnitStats().pos[1]) ||
            hover) {
            // Top
            if (field[1] > 0) {
                newField = [field[0], field[1] - 1];
                if (isMovableField(newField)) {
                    fields.push( newField );
                }
            }

            // Right
            if (field[0] < map[0].length) {
                newField = [field[0] + 1, field[1]];
                if (isMovableField(newField)) {
                    fields.push( newField );
                }
            }

            // Bottom
            if (field[1] < map.length) {
                newField = [field[0], field[1] + 1];
                if (isMovableField(newField)) {
                    fields.push( newField );
                }
            }

            // Left
            if (field[0] > 0) {
                newField = [field[0] - 1, field[1]];
                if (isMovableField(newField)) {
                    fields.push( newField );
                }
            }
        }
        
        return fields;
    },


    /**
     * Check if the unit can move onto that field
     * @param  {array}  field
     * @return {boolean}
     */
    isMovableField = function(field) {
        if (map[ field[1] ] !== undefined && map[ field[1] ][ field[0] ] !== undefined && map[ field[1] ][ field[0] ] === 0) {
            return true;
        } else {
            return false;
        }
    },


    /**
     * Highlight movable tiles
     * @memberOf rd.game.canvas
     */
    highlightMovableTiles = function() {
        for (var i=0; i<colTileCount/2; i++) {
            for (var j=0; j<rowTileCount/2; j++) {
                // Only movable tiles
                if (map[j][i] === 0 || typeof map[j][i] === 'string') {
                    var opacity= 0.2;
                    if (typeof map[j][i] === 'string' || utilsDisabled) {
                        opacity = 0;
                    }
                    drawMovable({
                        lineWidth: 2,
                        lineRgbColor: '255,255,255',
                        fillRgbColor: '255,255,255',
                        opacity: opacity,
                        x: fieldWidth * i,
                        y: fieldWidth * j
                    });
                }
            }
        }
    },


    /**
     * Bresenham ray casting algorithm
     * @param  {integer} x0
     * @param  {integer} y0
     * @param  {integer} x1
     * @param  {integer} y1
     * @return {array}
     */
    bline = function(x0, y0, x1, y1) {
        var dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1,
            dy = Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1,
            err = (dx>dy ? dx : -dy)/2,
            fields = [];

        while(true) {
            if (map[y0][x0] === 0 || typeof map[y0][x0] === 'string') {
                fields.push([x0,y0]);
            } else {
                break;
            }
            if (x0 === x1 && y0 === y1) break;
            var e2 = err;
            if (e2 > -dx) {
                err -= dy; x0 += sx;
            }
            if (e2 < dy) {
                err += dx; y0 += sy;
            }
        }

        return fields;
    },


    /**
     * Returns an array of circle tiles
     * @param  {integer} x0
     * @param  {integer} y0
     * @param  {integer} radius
     * @return {array}
     */
    getCircle = function(x0, y0, radius){
        var x = -radius,
            y = 0,
            err = 2 - 2 * radius,
            fields = [];

        do {
            fields.push([(x0 - x), (y0 + y)]);
            fields.push([(x0 - y), (y0 - x)]);
            fields.push([(x0 + x), (y0 - y)]);
            fields.push([(x0 + y), (y0 + x)]);

            radius = err;
            if (radius <= y) {
                y++;
                err += y * 2 + 1;
            }          
            if (radius > x || err > y) {
                x++;
                err += x * 2 + 1;
            } 
        } while (x < 0);

        return fields;
    },


    /**
     * Disable the utils
     */
    disableUtils = function() {
        clearUtils();
        utilsDisabled = true;
        highlightMovableTiles();
    },


    /**
     * Disable the utils
     */
    enableUtils = function() {
        var currentUnitStats = rd.game.main.getCurrentUnitStats();
        utilsDisabled = false;
        rd.game.map.redrawUtils();
        rd.game.main.getCurrentUnit().setFieldsInRange(calculateAttackRangeFields(currentUnitStats.pos, currentUnitStats.attackRange));
    },


    /**
     * Get the utilsDisabled value
     * @return {boolean}
     */
    areUtilsDisabled = function() {
        return utilsDisabled;
    },


    /**
     * Canvas initialization
     * @memberOf rd.game.canvas
     */
    init = function() {
        tilesetImage = rd.utils.resources.get('img/tileset.png');
        unitStats = rd.game.units.getStats();
        drawImage(ctxGround1, ground1);
        drawImage(ctxGround2, ground2);
        drawImage(ctxTop1, top1);
        map = rd.game.map.getMap();
        highlightMovableTiles();
    };


    /**
     * Return public functions
     */
    return {
        render: render,
        drawLine: drawLine,
        clearUtils: clearUtils,
        renderMoveRange: renderMoveRange,
        renderAttackRange: renderAttackRange,
        highlightMovableTiles: highlightMovableTiles,
        drawMovable: drawMovable,
        isMovableField: isMovableField,
        disableUtils: disableUtils,
        enableUtils: enableUtils,
        areUtilsDisabled: areUtilsDisabled,
        calculateAttackRangeFields: calculateAttackRangeFields,
        init: init
    };

})());
/**
 * Combat controller
 * @namespace rd.game.map
 */
rd.define('game.map', (function(canvas) {

    /**
     * Variables
     */
    var map =  [[0,1,1,1,1,1,1,1,1,1,1,0],
                [0,0,0,1,1,1,1,1,1,1,1,0],
                [0,0,0,0,0,1,1,1,0,0,0,0],
                [0,0,0,1,0,1,1,1,0,0,0,0],
                [0,0,0,1,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,1,0,0,0],
                [0,0,0,0,1,1,1,0,1,0,0,0],
                [0,0,0,0,1,1,1,0,0,0,0,0],
                [0,1,1,1,1,1,1,1,1,0,0,0],
                [0,1,1,1,1,1,1,1,1,1,1,0]],
        canvasTop = document.getElementById('canvas-top1'),
        body = document.getElementsByTagName('body')[0],
        tileSize = 64,
        currentPath,
        currentCell = [],
        unitStats,
        meleePossible = false,
        rangedPossible = false,


    /**
     * Register the event listener
     */
    eventListener = function() {
        canvasTop.addEventListener('click', canvasClick);
        canvasTop.addEventListener('mousemove', canvasMove);
        canvasTop.addEventListener('mouseleave', canvasLeave);
    },


    /**
     * Handle the mouseleave event
     */
    canvasLeave = function() {
        // Stop if utils are disabled
        if (rd.game.canvas.areUtilsDisabled()) {
            return false;
        }

        // Redraw base tiles
        redrawUtils();

        currentCell = [];
    },


    /**
     * Handle mousemove over the canvas
     * @param  {object} e Event
     */
    canvasMove = function(e) {
        var x,
            y,
            cellType,
            hoverUnitId,
            team;

        // Stop if utils are disabled
        if (rd.game.canvas.areUtilsDisabled()) {
            return false;
        }

        // Grab html page coords
        if (e.pageX !== undefined && e.pageY !== undefined) {
            x = e.pageX;
            y = e.pageY;
        } else {
            x = e.clientX + document.body.scrollLeft +
            document.documentElement.scrollLeft;
            y = e.clientY + document.body.scrollTop +
            document.documentElement.scrollTop;
        }

        // Make them relative to the canvas only
        x -= canvasTop.offsetLeft;
        y -= canvasTop.offsetTop;

        // Return tile x,y that we clicked
        var cell = [
            Math.floor(x/tileSize),
            Math.floor(y/tileSize)
        ];

        cell[1] = cell[1] < 10 ? cell[1] : 9;
        cellType = map[ cell[1] ][ cell[0] ];

        // Draw path only after entering a new cell
        if ((currentCell[0] !== cell[0] || currentCell[1] !== cell[1]) && cell[0] < 12 && cell[1] < 10) {
            currentCell = cell;

            // Unit hover
            if (typeof cellType === 'string') {
                hoverUnitId = parseInt(cellType.replace('id-', ''));

                // Current unit
                if (rd.game.main.getCurrentUnitId() === hoverUnitId) {
                    drawPath(cell);
                }
            
            // Field hover
            } else {
                canvas.clearUtils();
                canvas.highlightMovableTiles();
                drawPath(cell);
            }

        // Unit hover
        } else if (typeof cellType === 'string') {
            hoverUnitId = parseInt(cellType.replace('id-', ''));
            unitStats = rd.game.units.getStats();
            team = team = unitStats[hoverUnitId].team;

            // Hover effect
            if (rd.game.main.getCurrentUnitId() !== hoverUnitId) {
                var hoverUnit = unitStats[rd.game.main.getCurrentUnitId()];

                canvas.clearUtils();
                canvas.highlightMovableTiles();

                // Check if it is an enemy
                if (team !== hoverUnit.team) {
                    currentPath = null;
                    meleePossible = false;

                    var hoverUnitPos = unitStats[hoverUnitId].pos,
                        currentUnit = rd.game.main.getCurrentUnit(),
                        currentUnitStats = unitStats[rd.game.main.getCurrentUnitId()],
                        range = currentUnitStats.attackRange,
                        isInRange = currentUnit.isInRange(hoverUnitPos),
                        infoHoverEffect = false;

                    // Mouse over from left
                    if (x >= cell[0] * tileSize && x <= cell[0] * tileSize + 16 &&
                        y >= cell[1] * tileSize + 16 && y <= cell[1] * tileSize + 48 && range === 1) {
                        currentPath = findPath(map, rd.game.main.getCurrentUnitStats().pos, [cell[0]-1,cell[1]]);

                        // Show hover effect if unit can be reached in melee
                        if (currentPath.length-1 <= currentUnitStats.currentMoveRange && cell[0] > 0 && currentPath[currentPath.length-1]) {
                            drawPath([cell[0]-1,cell[1]], true);
                            body.className = 'cursor-right';
                            meleePossible = true;
                        }

                    // Mouse over from right
                    } else if (x >= cell[0] * tileSize + 48 && x <= cell[0] * tileSize + 64 &&
                                y >= cell[1] * tileSize + 16 && y <= cell[1] * tileSize + 48 && range === 1) {
                        currentPath = findPath(map, rd.game.main.getCurrentUnitStats().pos, [cell[0]+1,cell[1]]);
                        
                        // Show hover effect if unit can be reached in melee
                        if (currentPath.length-1 <= currentUnitStats.currentMoveRange && cell[0] < 11 && currentPath[currentPath.length-1]) {
                            drawPath([cell[0]+1,cell[1]], true);
                            body.className = 'cursor-left';
                            meleePossible = true;
                        }

                    // Mouse over from top
                    } else if (x >= cell[0] * tileSize && x <= cell[0] * tileSize + tileSize &&
                                y >= cell[1] * tileSize && y <= cell[1] * tileSize + 16 && range === 1) {
                        currentPath = findPath(map, rd.game.main.getCurrentUnitStats().pos, [cell[0],cell[1]-1]);
                        
                        // Show hover effect if unit can be reached in melee
                        if (currentPath.length-1 <= currentUnitStats.currentMoveRange && cell[1] > 0 && currentPath[currentPath.length-1]) {
                            drawPath([cell[0],cell[1]-1], true);
                            body.className = 'cursor-bottom';
                            meleePossible = true;
                        }

                    // Mouse over from bottom
                    } else if (x >= cell[0] * tileSize && x <= cell[0] * tileSize + tileSize &&
                                y >= cell[1] * tileSize + 48 && y <= cell[1] * tileSize + 64 && range === 1) {
                        currentPath = findPath(map, rd.game.main.getCurrentUnitStats().pos, [cell[0],cell[1]+1]);
                        
                        // Show hover effect if unit can be reached in melee
                        if (currentPath.length-1 <= currentUnitStats.currentMoveRange && cell[1] < 9 && currentPath[currentPath.length-1]) {
                            drawPath([cell[0],cell[1]+1], true);
                            body.className = 'cursor-top';
                            meleePossible = true;
                        }

                    // Center
                    } else {
                        canvas.renderAttackRange(cell, unitStats[hoverUnitId].attackRange);
                        canvas.renderMoveRange(unitStats[hoverUnitId], true);
                        body.className = 'cursor-help';
                        infoHoverEffect = true;
                    }

                    // Unit not attackable through melee
                    if (!meleePossible && !infoHoverEffect) {
                        canvas.renderAttackRange(cell, unitStats[hoverUnitId].attackRange);
                        canvas.renderMoveRange(unitStats[hoverUnitId], true);
                        body.className = 'cursor-help';
                    }

                    // Unit that is in range
                    rangedPossible = false;
                    if (isInRange && range > 1) {
                        body.className = 'cursor-ranged';
                        rangedPossible = true;
                    }

                // Unit from the same team
                } else {
                    canvas.renderAttackRange(cell, unitStats[hoverUnitId].attackRange);
                    canvas.renderMoveRange(unitStats[hoverUnitId], true);
                    body.className = 'cursor-help';
                }

                canvas.drawMovable({
                    lineWidth: 2,
                    lineRgbColor: 'team' + team,
                    fillRgbColor: 'team' + team,
                    opacity: 1,
                    x: unitStats[hoverUnitId].pos[0] * tileSize,
                    y: unitStats[hoverUnitId].pos[1] * tileSize
                });
            }
        }
    },


    /**
     * Draw a moveable path
     * @param {array} cell
     */
    drawPath = function(cell, hideAttackRange) {
        var type;

        // Now we know which tile we clicked and can calculate a path
        currentPath = findPath(map, rd.game.main.getCurrentUnitStats().pos, [cell[0],cell[1]]);

        // Add the current cell if there is no path
        if (currentPath.length === 0) {
            currentPath.push(rd.game.main.getCurrentUnitStats().pos);
            body.className = 'default';
        }

        // Show path if it is below the move range
        if (currentPath.length <= rd.game.main.getCurrentUnitStats().currentMoveRange + 1) {
            // Redraw base tiles
            canvas.clearUtils();
            canvas.highlightMovableTiles();

            // Current unit or no obstacle
            if (currentPath.length === 1) {
                canvas.renderAttackRange(rd.game.main.getCurrentUnitStats().pos, rd.game.main.getCurrentUnitStats().attackRange);
            }

            // Draw attack range
            if (currentPath.length > 1 && !hideAttackRange) {
                canvas.renderAttackRange(cell, rd.game.main.getCurrentUnitStats().attackRange);
            }

            // Move range
            canvas.renderMoveRange(rd.game.main.getCurrentUnitStats());

            // Highlight the path tiles
            for (var i=0; i<currentPath.length; i++) {
                if (i === 0 || i === currentPath.length-1) {
                    type = 'current';
                } else {
                    type = 'move';
                }

                canvas.drawMovable({
                    lineWidth: 2,
                    lineRgbColor: type,
                    fillRgbColor: type,
                    opacity: 1,
                    x: currentPath[i][0] * tileSize,
                    y: currentPath[i][1] * tileSize
                });
            }

            // Cursors
            if (currentPath.length === 1) {
                body.className = 'default';
            } else {
                body.className = 'cursor-move';
            }

        } else {
            // Redraw base tiles
            redrawUtils();
        }
    },


    /**
     * Handle a canvas click event
     * @param {object} e Event
     */
    canvasClick = function(e) {
        var x,
            y;

        // Stop if utils are disabled
        if (rd.game.canvas.areUtilsDisabled()) {
            return false;
        }

        // Grab html page coords
        if (e.pageX !== undefined && e.pageY !== undefined) {
            x = e.pageX;
            y = e.pageY;
        } else {
            x = e.clientX + document.body.scrollLeft +
            document.documentElement.scrollLeft;
            y = e.clientY + document.body.scrollTop +
            document.documentElement.scrollTop;
        }

        // Make them relative to the canvas only
        x -= canvasTop.offsetLeft;
        y -= canvasTop.offsetTop;

        // Return tile x,y that we clicked
        var cell = [
                Math.floor(x/tileSize),
                Math.floor(y/tileSize)
            ],
            cellType = map[ cell[1] ][ cell[0] ],
            clickUnitId,
            team;

        // Click on unit
        if (typeof cellType === 'string') {
            var currentUnitStats = unitStats[rd.game.main.getCurrentUnitId()];
            clickUnitId = parseInt(cellType.replace('id-', ''));
            team = unitStats[clickUnitId].team;

            // Fight
            if (currentUnitStats.team !== team) {
                // Ranged attack
                if (rangedPossible) {
                    rd.game.combat.fight(rd.game.main.getCurrentUnitId(), clickUnitId);
                }

                // Walk and then attack
                if (currentPath.length > 1 && meleePossible) {
                    startWalking(currentPath[currentPath.length-1], true, clickUnitId);
                // Just attack
                } else if (meleePossible) {
                    rd.game.combat.fight(rd.game.main.getCurrentUnitId(), clickUnitId);
                }
            }

            return false;
        }

        // Now we know which tile we clicked and can calculate a path
        currentPath = findPath(map, rd.game.main.getCurrentUnitStats().pos, [cell[0],cell[1]]);

        // Check if player can move to that field
        if (currentPath.length <= rd.game.main.getCurrentUnitStats().currentMoveRange + 1 && rd.game.canvas.isMovableField(cell)) {
            startWalking(cell);
        }
    },


    /**
     * Start the walk animation and occupy the new field
     * @param {array}   cell
     * @param {boolean} fight
     */
    startWalking = function(cell, fight, enemyId) {
        var currentUnit = rd.game.main.getCurrentUnit();

        // Walk animation
        currentUnit.walk({
            path: currentPath,
            fight: fight,
            enemyId: enemyId
        });

        rd.game.canvas.disableUtils();

        // Reset old position
        map[ rd.game.main.getCurrentUnitStats().pos[1] ][ rd.game.main.getCurrentUnitStats().pos[0] ] = 0;

        // New position
        map[ cell[1] ][ cell[0] ] = 'id-' + rd.game.main.getCurrentUnitId();
    },


    /**
     * Redraw all utils
     */
    redrawUtils = function() {
        currentPath = rd.game.main.getCurrentUnitStats().pos;
        canvas.clearUtils();
        canvas.highlightMovableTiles();
        canvas.renderAttackRange(currentPath, rd.game.main.getCurrentUnitStats().attackRange);
        canvas.renderMoveRange(rd.game.main.getCurrentUnitStats());
        
        canvas.drawMovable({
            lineWidth: 2,
            lineRgbColor: 'current',
            fillRgbColor: 'current',
            opacity: 1,
            x: currentPath[0] * tileSize,
            y: currentPath[1] * tileSize
        });

        body.className = 'default';
    },


    /**
     * Get the map array
     * @memberOf rd.game.map
     * @return {array}
     */
    getMap = function() {
        return map;
    },


    /**
     * Update the value of a map tile
     * @param {integer} x
     * @param {integer} y
     * @param {integer} value
     */
    updateMap = function(x, y, value) {
        map[y][x] = value;
    },


    /**
     * Find a path using the A * algorithm
     * http://buildnewgames.com/astar/
     * @param  {array} world
     * @param  {array} pathStart
     * @param  {array} pathEnd
     * @return {array}
     */
    findPath = function(world, pathStart, pathEnd) {
        // Shortcuts for speed
        var abs = Math.abs;

        // the world data are integers:
        // anything higher than this number is considered blocked
        // this is handy if you use numbered sprites, more than one
        // of which is walkable road, grass, mud, etc
        var maxWalkableTileNum = 0;

        // keep track of the world dimensions
        // Note that this A-star implementation expects the world array to be square: 
        // it must have equal height and width. If your game world is rectangular, 
        // just fill the array with dummy values to pad the empty space.
        var worldWidth = world[0].length;
        var worldHeight = world.length;
        var worldSize = worldWidth * worldHeight;

        // which heuristic should we use?
        // default: no diagonals (Manhattan)
        var distanceFunction = ManhattanDistance;
        var findNeighbours = function(){}; // empty

        // distanceFunction functions
        // these return how far away a point is to another
        function ManhattanDistance(Point, Goal) {
            // linear movement - no diagonals - just cardinal directions (NSEW)
            return abs(Point.x - Goal.x) + abs(Point.y - Goal.y);
        }

        // Neighbours functions, used by findNeighbours function
        // to locate adjacent available cells that aren't blocked

        // Returns every available North, South, East or West
        // cell that is empty. No diagonals,
        // unless distanceFunction function is not Manhattan
        function Neighbours(x, y) {
            var N = y - 1,
            S = y + 1,
            E = x + 1,
            W = x - 1,
            myN = N > -1 && canWalkHere(x, N),
            myS = S < worldHeight && canWalkHere(x, S),
            myE = E < worldWidth && canWalkHere(E, y),
            myW = W > -1 && canWalkHere(W, y),
            result = [];
            if(myN)
            result.push({x:x, y:N});
            if(myE)
            result.push({x:E, y:y});
            if(myS)
            result.push({x:x, y:S});
            if(myW)
            result.push({x:W, y:y});
            findNeighbours(myN, myS, myE, myW, N, S, E, W, result);
            return result;
        }

        // returns boolean value (world cell is available and open)
        function canWalkHere(y, x) {
            return ((world[x] !== null) &&
                (world[x][y] !== null) &&
                (world[x][y] <= maxWalkableTileNum));
        }

        // Node function, returns a new object with Node properties
        // Used in the calculatePath function to store route costs, etc.
        function Node(Parent, Point) {
            var newNode = {
                // pointer to another Node object
                Parent:Parent,
                // array index of this Node in the world linear array
                value:Point.x + (Point.y * worldWidth),
                // the location coordinates of this Node
                x:Point.x,
                y:Point.y,
                // the heuristic estimated cost
                // of an entire path using this node
                f:0,
                // the distanceFunction cost to get
                // from the starting point to this node
                g:0
            };

            return newNode;
        }

        // Path function, executes AStar algorithm operations
        function calculatePath() {
            // create Nodes from the Start and End x,y coordinates
            var mypathStart = Node(null, {x:pathStart[0], y:pathStart[1]});
            var mypathEnd = Node(null, {x:pathEnd[0], y:pathEnd[1]});
            // create an array that will contain all world cells
            var AStar = new Array(worldSize);
            // list of currently open Nodes
            var Open = [mypathStart];
            // list of closed Nodes
            var Closed = [];
            // list of the final output array
            var result = [];
            // reference to a Node (that is nearby)
            var myNeighbours;
            // reference to a Node (that we are considering now)
            var myNode;
            // reference to a Node (that starts a path in question)
            var myPath;
            // temp integer variables used in the calculations
            var length, max, min, i, j;
            // iterate through the open list until none are left
            while (length = Open.length) {
                max = worldSize;
                min = -1;
                for (i = 0; i < length; i++) {
                    if(Open[i].f < max)
                    {
                        max = Open[i].f;
                        min = i;
                    }
                }
                // grab the next node and remove it from Open array
                myNode = Open.splice(min, 1)[0];
                // is it the destination node?
                if (myNode.value === mypathEnd.value) {
                    myPath = Closed[Closed.push(myNode) - 1];
                    do {
                        result.push([myPath.x, myPath.y]);
                    }
                    while (myPath = myPath.Parent);
                    // clear the working arrays
                    AStar = Closed = Open = [];
                    // we want to return start to finish
                    result.reverse();
                }
                else { // not the destination
                    // find which nearby nodes are walkable
                    myNeighbours = Neighbours(myNode.x, myNode.y);
                    // test each one that hasn't been tried already
                    for (i = 0, j = myNeighbours.length; i < j; i++) {
                        myPath = Node(myNode, myNeighbours[i]);
                        if (!AStar[myPath.value]) {
                            // estimated cost of this particular route so far
                            myPath.g = myNode.g + distanceFunction(myNeighbours[i], myNode);
                            // estimated cost of entire guessed route to the destination
                            myPath.f = myPath.g + distanceFunction(myNeighbours[i], mypathEnd);
                            // remember this new path for testing above
                            Open.push(myPath);
                            // mark this node in the world graph as visited
                            AStar[myPath.value] = true;
                        }
                    }
                    // remember this route as having no more untested options
                    Closed.push(myNode);
                }
            } // keep iterating until the Open list is empty
            return result;
        }

        // actually calculate the a-star path!
        // this returns an array of coordinates
        // that is empty if no path is possible
        return calculatePath();
    },


    /**
     * Initialization
     * @memberOf rd.game.map
     */
    init = function() {
        eventListener();
    };


    /**
     * Return public functions
     */
    return {
        init: init,
        getMap: getMap,
        updateMap: updateMap,
        redrawUtils: redrawUtils
    };

})(rd.game.canvas));
/**
 * Units controller
 * @namespace rd.game.ui
 */
rd.define('game.ui', (function() {

    /**
     * Variables
     */
    var endTurn = document.getElementById('end-turn'),


    /**
     * Register the event listener
     */
    eventListener = function() {
        endTurn.addEventListener('click', endTurnClick);
    },

    
    /**
     * End turn button click actions
     */
    endTurnClick = function() {
        rd.game.main.endTurn();
    },


    /**
     * Initialization
     * @memberOf rd.game.ui
     */
    init = function() {
        eventListener();
    };


    /**
     * Return public functions
     */
    return {
        init: init
    };

})());
/**
 * Main game controller
 * @namespace rd.game.main
 */
rd.define('game.main', (function(canvas) {

	/**
	 * Variables
	 */
	var pause = false,
		gameTime = 0,
		lastTime,
		units,
		unitStats,
		fps,
		fpsLimiter = 0,
		currentUnit = 0,
		tileCounter = 0,
		direction,
		elmFps = document.getElementById('fps'),


	/**
	 * The main game loop
	 */
	main = function() {
	    var now = Date.now(),
	    	delta = (now - lastTime) / 1000.0;

	    if( !pause ){
	        update(delta);
	        canvas.render();
	    }

	    lastTime = now;

	    requestAnimFrame(main);

	    fpsLimiter++;
	    if (fpsLimiter === 10) {
	    	fpsLimiter = 0;
		    fps = 1/delta;
		    elmFps.innerHTML = Math.round(fps);
	    }
	},


	/**
	 * Update all the entities
	 * @param {object} delta
	 */
	update = function(delta) {
	    gameTime += delta;

	    updateEntities(delta);
	},


	/**
	 * Update all the entities (e.g. sprite positions)
	 * @param {object} delta
	 */
	updateEntities = function(delta) {
		var unit,
			path;

        for (var i=0; i<unitStats.length; i++) {
        	unit = unitStats[i];

            unit.skin.update(delta);
            unit.gear.head.update(delta);
            unit.gear.torso.update(delta);
            unit.gear.leg.update(delta);

            if (unit.path.length > 0) {
            	unit.moving = true;
	            path = unit.path;
	            
	            // Vertical movement
	            if (unitStats[i].nextTile[0] === path[0][0]) {

					// Move top if next tile is above current
					if (unit.nextTile[1] > path[0][1]) {
						unit.pos[1] = path[0][1] + ((1 / unit.steps) * unit.currentStep);
						
					// Move bottom if next tile is below current
					} else if (unit.nextTile[1] < path[0][1]){
						unit.pos[1] = path[0][1] - ((1 / unit.steps) * unit.currentStep);
					}

				// Horizontal movement
				} else {

					// Move left if next tile is on the left side of the current
					if (unit.nextTile[0] > path[0][0]) {
						unit.pos[0] = path[0][0] + ((1 / unit.steps) * unit.currentStep);
						unit.skin.setPos([0, 64]);
						unit.gear.head.setPos([0, 64]);
						unit.gear.torso.setPos([0, 64]);
						unit.gear.leg.setPos([0, 64]);
						direction = 64;
						
					// Move right if next tile is on the right side of the current
					} else if (unit.nextTile[0] < path[0][0]) {
						unit.pos[0] = path[0][0] - ((1 / unit.steps) * unit.currentStep);
						unit.skin.setPos([0, 0]);
						unit.gear.head.setPos([0, 0]);
						unit.gear.torso.setPos([0, 0]);
						unit.gear.leg.setPos([0, 0]);
						direction = 0;
					}
				}

				// End of an animation from tile to tile
				if (unit.currentStep === 1) {
					unit.nextTile = path[0];

					// Remove the first tile in the array
					path.splice(0,1);

					// Reset to start animation for next tile 
					unit.currentStep = unit.steps;

					tileCounter++;
				}

				unit.currentStep--;
	        } else {
	        	if (unit.moving) {
	        		stopWalking(unit, i, direction);
	        	}
	        }
        }
    },


    /**
     * Stop the walk animation and show hud
     */
    stopWalking = function(unit, id, direction) {
    	unit.moving = false;
		units[id].stop(direction);
		canvas.enableUtils();
    },


    /**
	 * Get the stats of the current unit
	 * @memberOf rd.game.main
	 * @return {object}
	 */
    getCurrentUnitStats = function() {
    	return unitStats[currentUnit];
    },


    /**
     * Get the ID of the current unit
     * @memberOf rd.game.main
     * @return {integer}
     */
    getCurrentUnitId = function() {
    	return currentUnit;
    },

    
    /**
     * Get the current unit
     * @memberOf rd.game.main
     * @return {object}
     */
    getCurrentUnit = function() {
    	return units[currentUnit];
    },


    /**
     * Ende the current turn
     * @memberOf rd.game.main
     */
    endTurn = function() {
    	getCurrentUnit().resetMoveRange();
    	currentUnit++;
    	if (!units[currentUnit]) {
    		currentUnit = 0;
    	}
    	canvas.enableUtils();
    },


	/**
	 * Initialization
	 * @memberOf rd.game.main
	 */
	init = function(){
		rd.utils.resources.load([
			'img/units/human0.png',
			'img/units/human1.png',
			'img/units/human2.png',
			'img/units/human3.png',
			'img/units/human4.png',
			'img/units/human5.png',
			'img/units/human6.png',
			'img/units/zombie0.png',
			'img/units/zombie1.png',
			'img/units/zombie2.png',
			'img/units/zombie3.png',
			'img/units/zombie4.png',
			'img/units/zombie5.png',
			'img/units/zombie6.png',
			'img/units/orc0.png',
			'img/units/orc1.png',
			'img/units/orc2.png',
			'img/units/orc3.png',
			'img/units/vampire0.png',
			'img/units/ghost0.png',
			'img/units/elf0.png',
			'img/units/head0.png',
			'img/units/head1.png',
			'img/units/head2.png',
			'img/units/head3.png',
			'img/units/head4.png',
			'img/units/head5.png',
			'img/units/torso0.png',
			'img/units/torso1.png',
			'img/units/torso2.png',
			'img/units/torso3.png',
			'img/units/torso4.png',
			'img/units/leg0.png',
			'img/units/leg1.png',
			'img/units/leg2.png',
			'img/units/leg3.png',
			'img/units/leg4.png',
            'img/tileset.png'
        ]);

		/** Initialize if all ressources are loaded */
        rd.utils.resources.onReady(function() {
        	// Units
        	rd.game.units.init(function() {
        		// Game
	        	lastTime = Date.now();
				unitStats = rd.game.units.getStats();
				units = rd.game.units.get();
				canvas.init();
				rd.game.map.init();
				var currentUnitStats = unitStats[currentUnit];
				canvas.renderAttackRange(currentUnitStats.pos, currentUnitStats.attackRange);
				canvas.renderMoveRange(currentUnitStats);
				units[currentUnit].setFieldsInRange(canvas.calculateAttackRangeFields(currentUnitStats.pos, currentUnitStats.attackRange));
				main();
				rd.game.ui.init();

				// Default movable
		        canvas.drawMovable({
		            lineWidth: 2,
		            lineRgbColor: 'current',
		            fillRgbColor: 'current',
		            opacity: 1,
		            x: unitStats[currentUnit].pos[0] * 64,
		            y: unitStats[currentUnit].pos[1] * 64
		        });
        	});
        });
	};


	/**
	 * Return public functions
	 */
	return {
		init: init,
		getCurrentUnitId: getCurrentUnitId,
		getCurrentUnitStats: getCurrentUnitStats,
		getCurrentUnit: getCurrentUnit,
		endTurn: endTurn
	};

})(rd.game.canvas));


rd.game.main.init();