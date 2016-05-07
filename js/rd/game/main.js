/**
 * Main game controller
 * @namespace rd.game.main
 */
rd.define('game.main', (function() {

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
        unitDirection,
        elmFps = document.getElementById('fps'),
        canvas = rd.game.canvas,


    /**
     * The main game loop
     */
    main = function() {
        var now = Date.now(),
            delta = (now - lastTime) / 1000.0;

        if (!pause) {
            update(delta);
            canvas.render();
        }

        lastTime = now;

        requestAnimFrame(main);

        fpsLimiter++;
        if (fpsLimiter === 10) {
            fpsLimiter = 0;
            fps = 1 / delta;
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

        for (var i = 0; i < unitStats.length; i++) {
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
                    } else if (unit.nextTile[1] < path[0][1]) {
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
                        unitDirection = 64;

                    // Move right if next tile is on the right side of the current
                    } else if (unit.nextTile[0] < path[0][0]) {
                        unit.pos[0] = path[0][0] - ((1 / unit.steps) * unit.currentStep);
                        unit.skin.setPos([0, 0]);
                        unit.gear.head.setPos([0, 0]);
                        unit.gear.torso.setPos([0, 0]);
                        unit.gear.leg.setPos([0, 0]);
                        unitDirection = 0;
                    }
                }

                // End of an animation from tile to tile
                if (unit.currentStep === 1) {
                    unit.nextTile = path[0];

                    // Remove the first tile in the array
                    path.splice(0, 1);

                    // Reset to start animation for next tile
                    unit.currentStep = unit.steps;

                    tileCounter++;
                }

                unit.currentStep--;
            } else {
                if (unit.moving) {
                    stopWalking(unit, i, unitDirection);
                } else if (unit.unitFighting) {
                    var frames = unit.skin.getFrames();
                    if (frames.framesLength - 1 === frames.index) {
                        units[i].stop();
                    }
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
    init = function() {
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

})());


rd.game.main.init();
