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
        for (var i=0; i<unitStats.length; i++) {
            unitStats[i].skin.update(delta);
            unitStats[i].gear.head.update(delta);
            unitStats[i].gear.torso.update(delta);
        }
    },


    /**
	 * Get the stats of the current unit
	 * @memberOf rd.game.main
	 */
    getCurrentUnit = function() {
    	return unitStats[currentUnit];
    },


    getCurrentUnitId = function() {
    	return currentUnit;
    },


	/**
	 * Initialization
	 * @memberOf rd.game.main
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
        	rd.game.units.init(function() {
        		// Game
	        	lastTime = Date.now();
				unitStats = rd.game.units.getStats();
				units = rd.game.units.get();
				rd.game.canvas.init();
				rd.game.map.init();
				rd.game.canvas.renderMoveRange(unitStats[currentUnit]);
				main();

				// Default movable
		        rd.game.canvas.drawMovable({
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
		getCurrentUnit: getCurrentUnit,
		getCurrentUnitId: getCurrentUnitId
	};

})(rd.game.canvas));


rd.game.main.init();