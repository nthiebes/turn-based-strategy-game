var rd = {};


/**
 * Defines a namespace
 * @param {string}   namespace Namespace chain as string
 * @param {function} logic     
 */
rd.define = function( namespace, logic ){
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
 * @param {function} 	fn 		The callback function
 * @param {int} 		delay 	The delay in milliseconds
 */
window.requestTimeout = function(fn, delay){
    if( !window.requestAnimationFrame       && 
        !window.webkitRequestAnimationFrame && 
        !(window.mozRequestAnimationFrame && window.mozCancelRequestAnimationFrame) && // Firefox 5 ships without cancel support
        !window.oRequestAnimationFrame      && 
        !window.msRequestAnimationFrame)
            return window.setTimeout(fn, delay);
            
    var start = new Date().getTime(),
        handle = new Object();
        
    function loop(){
        var current = new Date().getTime(),
            delta = current - start;
            
        delta >= delay ? fn.call() : handle.value = requestAnimFrame(loop);
    }
    
    handle.value = requestAnimFrame(loop);
    return handle;
};
/**
 * Resources controller
 * @namespace utils.resources
 */
rd.define('utils.resources', (function() {

    /**
     * Variables
     */
    var resourceCache = {},
        readyCallbacks = [],


    /**
     * Load an image url or an array of image urls
     * @param  {[type]} urlOrArr [description]
     */
    load = function(urlOrArr) {
        if(urlOrArr instanceof Array) {
            urlOrArr.forEach(function(url) {
                _load(url);
            });
        }
        else {
            _load(urlOrArr);
        }
    },

    _load = function(url) {
        if(resourceCache[url]) {
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

    get = function(url) {
        return resourceCache[url];
    },

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

    var me = this,


    update = function(dt) {
        // Stay not yet working correct
        if (!(me.stay && me.done)) {
            me._index += me.speed*dt;
            // Always start with first frame
            if( me.frames.length === 1 ){
                me._index = 0;
            }
        }
    },


    render = function(ctx) {
        var frame;

        if(me.speed > 0) {
            var max = me.frames.length;
            var idx = Math.floor(me._index);
            frame = me.frames[idx % max];

            if(me.once && idx >= max) {
                me.done = true;
            }

            // End animation
            if( idx >= max ){
                me._index = 0;
            }
        }
        else {
            frame = 0;
        }

        me.currentFrame = frame;


        var x = me.pos[0];
        var y = me.pos[1];

        if(me.dir == 'vertical') {
            y += frame * me.size[1];
        }
        else {
            x += frame * me.size[0];
        }

        //if it is done and it has to run once, we dont update
        if(!(me.done && me.once)){
            ctx.drawImage(rd.utils.resources.get(me.url),
                          x, y,
                          me.size[0], me.size[1],
                          0, 0,
                          me.size[0], me.size[1]);
        }
    },


    setFrames = function(newFrames) {
        me.frames = newFrames;
    },


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
 * Unit
 * @namespace rd.game.unit
 */
rd.define('game.unit', function(cfg) {

    /**
     * Variables
     */
    var me = this,


    stop = function() {
        me.skin.setPos([0, 128]);
        me.skin.setFrames([0]);

        me.gear.head.setPos([0, 128]);
        me.gear.head.setFrames([0]);

        me.gear.torso.setPos([0, 128]);
        me.gear.torso.setFrames([0]);
    },


    walk = function() {
        me.skin.setPos([0, 0]);
        me.skin.setFrames([0, 1, 2, 3]);

        me.gear.head.setPos([0, 0]);
        me.gear.head.setFrames([0, 1, 2, 3]);

        me.gear.torso.setPos([0, 0]);
        me.gear.torso.setFrames([0, 1, 2, 3]);
    },


    attack = function() {
        me.skin.setPos([0, 128]);
        me.skin.setFrames([0, 1, 2]);

        me.gear.head.setPos([0, 128]);
        me.gear.head.setFrames([0, 1, 2]);

        me.gear.torso.setPos([0, 128]);
        me.gear.torso.setFrames([0, 1, 2]);
    },


    get = function() {
        return me;
    };

    me.name = cfg.name;
    me.skin = cfg.skin;
    me.pos = cfg.pos;
    me.gear = cfg.gear;
    me.skills = cfg.skills;
    me.dead = cfg.dead;
    me.visible = cfg.visible || true;
    me.wounded = cfg.wounded;
    me.count = cfg.count;
    me.weapon = cfg.weapon;
    me.health = cfg.health || 0;
    me.attributes = cfg.attributes;


    /**
     * Return public functions
     */
    return {
        get: get,
        walk: walk,
        stop: stop,
        attack: attack
    };

});
/**
 * Combat controller
 * @namespace rd.game.combat
 */
rd.define('game.combat', (function() {

    /**
     * Variables
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
                defense: 5
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
                defense: 5
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
/**
 * Canvas controller
 * @namespace game.canvas
 */
rd.define('game.canvas', (function() {

    /**
     * Variables
     */
    var canvasGround1 = document.getElementById('canvas-ground-layer'),
        canvasAnim = document.getElementById('canvas-anim'),
        ctxGround1 = canvasGround1.getContext('2d'),
        ctxAnim = canvasAnim.getContext('2d'),
        ground1 = [[126,127,126,127,126,127,126,127,126,127,126,127,126,127,126,127,126,127,126,127,126,127,126,127],
                    [142,143,142,143,142,143,142,143,142,143,142,143,142,143,142,143,142,143,142,143,142,143,142,143],
                    [126,127,126,127,126,127,126,127,126,127,126,127,126,127,126,127,126,127,126,127,126,127,126,127],
                    [142,143,142,143,142,143,142,143,142,143,142,143,142,143,142,143,142,143,142,143,142,143,142,143],
                    [126,127,126,127,126,127,126,127,126,127,126,127,126,127,126,127,126,127,126,127,126,127,126,127],
                    [142,143,142,143,142,143,142,143,142,143,142,143,142,143,142,143,142,143,142,143,142,143,142,143],
                    [126,127,126,127,126,127,126,127,126,127,126,127,126,127,126,127,126,127,126,127,126,127,126,127],
                    [142,143,142,143,142,143,142,143,142,143,142,143,142,143,142,143,142,143,142,143,142,143,142,143],
                    [126,127,126,127,126,127,126,127,126,127,126,127,126,127,126,127,126,127,126,127,126,127,126,127],
                    [142,143,142,143,142,143,142,143,142,143,142,143,142,143,142,143,142,143,142,143,142,143,142,143],
                    [126,127,126,127,126,127,126,127,126,127,126,127,126,127,126,127,126,127,126,127,126,127,126,127],
                    [142,143,142,143,142,143,142,143,142,143,142,143,142,143,142,143,142,143,142,143,142,143,142,143],
                    [126,127,126,127,126,127,126,127,126,127,126,127,126,127,126,127,126,127,126,127,126,127,126,127],
                    [142,143,142,143,142,143,142,143,142,143,142,143,142,143,142,143,142,143,142,143,142,143,142,143],
                    [126,127,126,127,126,127,126,127,126,127,126,127,126,127,126,127,126,127,126,127,126,127,126,127],
                    [142,143,142,143,142,143,142,143,142,143,142,143,142,143,142,143,142,143,142,143,142,143,142,143],
                    [126,127,126,127,126,127,126,127,126,127,126,127,126,127,126,127,126,127,126,127,126,127,126,127],
                    [142,143,142,143,142,143,142,143,142,143,142,143,142,143,142,143,142,143,142,143,142,143,142,143],
                    [126,127,126,127,126,127,126,127,126,127,126,127,126,127,126,127,126,127,126,127,126,127,126,127],
                    [142,143,142,143,142,143,142,143,142,143,142,143,142,143,142,143,142,143,142,143,142,143,142,143]],
        rowTileCount = ground1.length,
        colTileCount = ground1[0].length,
        imageNumTiles = 16,
        tileSize = 32,
        tilesetImage,
        unitStats,


    drawImage = function() {
        for (var r = 0; r < rowTileCount; r++) {
            
            for (var c = 0; c < colTileCount; c++) {
                var tile = ground1[ r ][ c ],
                    tileRow = (tile / imageNumTiles) | 0,
                    tileCol = (tile % imageNumTiles) | 0;

                ctxGround1.drawImage(tilesetImage, (tileCol * tileSize), (tileRow * tileSize), tileSize, tileSize, (c * tileSize), (r * tileSize), tileSize, tileSize);
            }
        }
    },


    /**
     * Render the canvas
     */
    render = function() {
        // Clear canvas hack
        canvasAnim.width = canvasAnim.width;
        renderEntities(unitStats);
    },

    
    renderEntities = function(list) {
        for(var i=0; i<list.length; i++) {
            renderEntity(list[i], list[i].skin, list[i].gear.torso, list[i].gear.head);
        }    
    },

    
    renderEntity = function() {
        ctxAnim.save();
        ctxAnim.translate(arguments[0].pos[0], arguments[0].pos[1]);

        for (var i=1; i<arguments.length; i++) {
            arguments[i].render(ctxAnim);
        }
        ctxAnim.restore();
    },


    init = function() {
        tilesetImage = rd.utils.resources.get('img/tileset.png');
        unitStats = rd.game.units.getStats();
        drawImage();
    };


    /**
     * Return public functions
     */
    return {
        render: render,
        init: init
    };

})());
/**
 * Main game controller
 * @namespace game.main
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
	 * @param  {[type]} dt [description]
	 */
	update = function(delta) {
	    gameTime += delta;

	    updateEntities(delta);
	},


	updateEntities = function(delta) {
        // Update all the enemies
        for( var i=0; i<unitStats.length; i++ ){
            unitStats[i].skin.update(delta);
            unitStats[i].gear.head.update(delta);
            unitStats[i].gear.torso.update(delta);
        }
    },


	/**
	 * Initialization
	 */
	init = function(){
		rd.utils.resources.load([
			'img/units/skin0.png',
			'img/units/skin1.png',
			'img/units/skin2.png',
			'img/units/skin3.png',
			'img/units/skin4.png',
			'img/units/skin5.png',
			'img/units/skin6.png',
			'img/units/head0.png',
			'img/units/head1.png',
			'img/units/head2.png',
			'img/units/torso0.png',
			'img/units/torso1.png',
            'img/tileset.png'
        ]);

		/** Initialize if all ressources are loaded */
        rd.utils.resources.onReady(function() {
        	// Units
        	rd.game.units.init();

        	// Game
        	lastTime = Date.now();
			unitStats = rd.game.units.getStats();
			units = rd.game.units.get();
			rd.game.canvas.init();
			main();

			rd.game.combat.fight(units[0], units[1]);
        });
	};


	/**
	 * Return public functions
	 */
	return {
		init: init
	};

})(rd.game.canvas));


rd.game.main.init();