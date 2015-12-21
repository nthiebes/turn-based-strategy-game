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

            if (unit.path.length > 0) {
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
						
					// Move right if next tile is on the right side of the current
					} else if (unit.nextTile[0] < path[0][0]) {
						unit.pos[0] = path[0][0] - ((1 / unit.steps) * unit.currentStep);
						unit.skin.setPos([0, 0]);
						unit.gear.head.setPos([0, 0]);
						unit.gear.torso.setPos([0, 0]);
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
	        }
        }
    },


    /**
	 * Get the stats of the current unit
	 * @memberOf rd.game.main
	 */
    getCurrentUnit = function() {
    	return unitStats[currentUnit];
    },


    /**
     * Get the ID of the current unit
     * @return {integer}
     */
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