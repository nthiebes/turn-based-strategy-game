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
        currentUnit = 0,
        tileCounter = 0,
        unitDirection,
        canvas = rd.canvas.main,
        currentMap = 0,
        canvasWrapper = document.getElementById('canvas-wrapper'),


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
    },


    /**
     * Update all the entities
     * @param {int} delta
     */
    update = function(delta) {
        gameTime += delta;

        updateEntities(delta);
    },


    /**
     * Update a unit while moving
     * @param {object} unit
     * @param {int}    index
     */
    updateMoveAnimation = function(unit, index) {
        var path = unit.path;

        unit.moving = true;

        // Vertical movement
        if (unitStats[index].nextTile[0] === path[0][0]) {

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
                unit.skin.setPos([0, 128]);
                unit.gear.head.setPos([0, 128]);
                unit.gear.torso.setPos([0, 128]);
                unit.gear.leg.setPos([0, 128]);
                unit.primary.setPos([0, 128]);
                unit.secondary.setPos([0, 128]);
                unitDirection = 'left';

            // Move right if next tile is on the right side of the current
            } else if (unit.nextTile[0] < path[0][0]) {
                unit.pos[0] = path[0][0] - ((1 / unit.steps) * unit.currentStep);
                unit.skin.setPos([0, 0]);
                unit.gear.head.setPos([0, 0]);
                unit.gear.torso.setPos([0, 0]);
                unit.gear.leg.setPos([0, 0]);
                unit.primary.setPos([0, 0]);
                unit.secondary.setPos([0, 0]);
                unitDirection = 'right';
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
    },


    /**
     * Update a unit when stopping
     * @param {object} unit
     * @param {int}    index
     */
    stopMoveAnimation = function(unit, index) {
        if (unit.moving) {
            unit.moving = false;
            units[index].stop(unitDirection);
            unitDirection = null;
            if (!unit.unitFighting) {
                canvas.enableUtils();
            }

        } else if (unit.unitFighting) {
            var frames = unit.skin.getFrames();
            if (frames.framesLength - 1 === frames.index) {
                units[index].stop(unitDirection);
                unitDirection = null;
            }
        }
    },


    /**
     * Update all the entities (e.g. sprite positions)
     * @param {object} delta
     */
    updateEntities = function(delta) {
        var unit;

        for (var i = 0; i < unitStats.length; i++) {
            unit = unitStats[i];

            unit.skin.update(delta);
            unit.gear.head.update(delta);
            unit.gear.torso.update(delta);
            unit.gear.leg.update(delta);
            unit.primary.update(delta);
            unit.secondary.update(delta);

            // Continue walking
            if (unit.path.length > 0) {
                updateMoveAnimation(unit, i);

            // Stop walking
            } else {
                stopMoveAnimation(unit, i);
            }
        }
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
        // Units
        rd.game.units.init(function() {

            rd.utils.loadJSON('maps/' + currentMap + '.json', function(mapJson) {
                // Game preparation
                lastTime = Date.now();
                unitStats = rd.game.units.getStats();
                units = rd.game.units.get();
                canvas.init(mapJson);
                rd.game.map.init();
                var currentUnitStats = unitStats[currentUnit];
                canvas.renderAttackRange(currentUnitStats.pos, currentUnitStats.attackRange);
                canvas.renderMoveRange(currentUnitStats);
                units[currentUnit].setFieldsInRange(canvas.calculateAttackRangeFields(currentUnitStats.pos, currentUnitStats.attackRange));
                main();
                rd.game.ui.init();
                canvasWrapper.className += ' show';

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
