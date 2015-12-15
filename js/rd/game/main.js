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
			rd.game.map.init();
			main();

			//rd.game.combat.fight(units[0], units[1]);
			
			rd.game.canvas.renderMoveRange(unitStats[0]);
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