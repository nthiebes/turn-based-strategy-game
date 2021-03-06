/**
 * Canvas controller
 * @namespace rd.canvas.main
 */
rd.define('canvas.main', (function() {

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
        animations,
        mapLayers,
        ground1,
        ground2,
        top1,
        rowTileCount,
        colTileCount,
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
     * @param {array}  array
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
     * @memberOf rd.canvas.main
     * @param {object} cfg Configuration
     */
    drawLine = function(cfg) {
        cfg.ctx.strokeStyle = cfg.lineColor;
        cfg.ctx.beginPath();
        cfg.ctx.moveTo(cfg.x1, cfg.y1);
        cfg.ctx.lineTo(cfg.x2, cfg.y2);
        cfg.ctx.lineWidth = cfg.lineWidth;
        cfg.ctx.stroke();
        cfg.ctx.closePath();
    },


    /**
     * Draw a rectangle with gradient
     * @memberOf rd.canvas.main
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
     * @memberOf rd.canvas.main
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
            border = isBorderTile(x / fieldWidth, y / fieldWidth, cfg.visibleFields);

        // Draw border on right side
        if (border.right) {
            drawLine({
                ctx: ctxUtils,
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
                ctx: ctxUtils,
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
                ctx: ctxUtils,
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
                ctx: ctxUtils,
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
        for (var i = 0; i < fields.length; i++) {
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
     * @memberOf rd.canvas.main
     */
    render = function() {
        // Clear canvas hack
        canvasAnim.width = canvasAnim.width;
        renderEntities(unitStats);
        renderAnimations(animations.get());
    },


    /**
     * Go through the list of entities
     * @param {array} list
     */
    renderEntities = function(list) {
        var fullWidth = 48;
        for (var i = 0; i < list.length; i++) {
            // Unit gear
            renderEntity(list[i], list[i].secondary, list[i].skin, list[i].gear.leg, list[i].gear.torso, list[i].primary, list[i].gear.head);

            if (list[i].isWounded) {
                renderEntity(list[i], list[i].wounded);
            }

            // Health bar
            var test = 100 / fullWidth,
                healthWidth = Math.round((list[i].health) / test);

            drawLine({
                ctx: ctxAnim,
                lineWidth: 4,
                lineColor: '#000',
                x1: list[i].pos[0] * 64 + 7,
                y1: list[i].pos[1] * 64 + 59,
                x2: list[i].pos[0] * 64 + 57,
                y2: list[i].pos[1] * 64 + 59
            });

            drawLine({
                ctx: ctxAnim,
                lineWidth: 2,
                lineColor: '#070',
                x1: list[i].pos[0] * 64 + 8,
                y1: list[i].pos[1] * 64 + 59,
                x2: list[i].pos[0] * 64 + 8 + healthWidth,
                y2: list[i].pos[1] * 64 + 59
            });
        }
    },


    /**
     * Render a single entity
     */
    renderEntity = function() {
        ctxAnim.save();
        ctxAnim.translate(arguments[0].pos[0] * fieldWidth - 32, arguments[0].pos[1] * fieldWidth - 70);

        for (var i = 1; i < arguments.length; i++) {
            arguments[i].render(ctxAnim);
        }
        ctxAnim.restore();
    },


    /**
     * Render all the animations
     * @param {array} list
     */
    renderAnimations = function(list) {
        for (var i in list) {
            if (list[i].active) {
                ctxAnim.save();
                ctxAnim.translate(list[i].pos[0] * fieldWidth, list[i].pos[1] * fieldWidth);
                if (list[i].angle) {
                    ctxAnim.rotate(list[i].angle);
                }
                list[i].sprite.render(ctxAnim);
                ctxAnim.restore();
            }
        }
    },


    /**
     * Attack range
     * @memberOf rd.canvas.main
     * @param {array}   pos
     * @param {integer} range
     */
    renderAttackRange = function(pos, range) {
        if (range === 1) {
            return false;
        }

        var visibleFields = calculateAttackRangeFields(pos, range);

        // Draw the attack range
        for (var k = 0; k < visibleFields.length; k++) {
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
     * @memberOf rd.canvas.main
     * @param  {array}   pos
     * @param  {integer} range
     * @return {array}
     */
    calculateAttackRangeFields = function(pos, range) {
        var attackRangeFields = [],
            newFields = [],
            visibleFields = [pos];

        // Collect circle tiles for each range
        for (var l = 1; l <= range; l++) {
            attackRangeFields = attackRangeFields.concat(getCircle(pos[0], pos[1], l));
        }

        // Remove tiles that are out of the map
        attackRangeFields = removeNegative(attackRangeFields);

        // Fill gaps
        for (var i = 0; i < attackRangeFields.length; i++) {
            var y = attackRangeFields[i][0],
                x = attackRangeFields[i][1];

            if (x > pos[1]) {
                newFields.push([y,x - 1]);
            }

            if (x < pos[1]) {
                newFields.push([y,x + 1]);
            }
        }

        // Merge the new array
        attackRangeFields = attackRangeFields.concat(newFields);

        // Remove fields that are out of the viewport
        for (var j = 0; j < attackRangeFields.length; j++) {
            newFields = bline(pos[0], pos[1], attackRangeFields[j][0], attackRangeFields[j][1]);
            visibleFields = visibleFields.concat(newFields);
        }

        // Remove duplicates
        visibleFields = uniq(visibleFields);

        return visibleFields;
    },


    /**
     * Show the move range
     * @memberOf rd.canvas.main
     */
    renderMoveRange = function(unit, hover) {
        var moveRange = unit.currentMoveRange,
            availableFields = [],
            newFields;

        availableFields.push(unit.pos);

        // Get and concat movable fields
        function getFields() {
            newFields = [];
            for (var j = 0; j < availableFields.length; j++) {
                newFields = newFields.concat(getSurroundingFields(availableFields[j], hover));
            }

            availableFields = uniq(availableFields.concat(newFields));
        }

        // Highlight fields for each move range
        for (var i = 1; i <= moveRange; i++) {
            getFields();
        }

        // Save move range so that we can compare it when hovering over another unit
        if (!hover) {
            curentMoveRange = availableFields;
        }

        // Highlight all movable fields
        for (var i = 0; i < availableFields.length; i++) {
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
        for (var i = 0; i < array.length; i++) {
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
                    fields.push(newField);
                }
            }

            // Right
            if (field[0] < map[0].length) {
                newField = [field[0] + 1, field[1]];
                if (isMovableField(newField)) {
                    fields.push(newField);
                }
            }

            // Bottom
            if (field[1] < map.length) {
                newField = [field[0], field[1] + 1];
                if (isMovableField(newField)) {
                    fields.push(newField);
                }
            }

            // Left
            if (field[0] > 0) {
                newField = [field[0] - 1, field[1]];
                if (isMovableField(newField)) {
                    fields.push(newField);
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
     * @memberOf rd.canvas.main
     */
    highlightMovableTiles = function() {
        for (var i = 0; i < colTileCount / 2; i++) {
            for (var j = 0; j < rowTileCount / 2; j++) {
                // Only movable tiles
                if (map[j][i] === 0 || typeof map[j][i] === 'string') {
                    var opacity = 0.2;
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
            err = (dx > dy ? dx : -dy) / 2,
            fields = [];

        while (true) {
            if (map[y0][x0] === 0 || typeof map[y0][x0] === 'string') {
                fields.push([x0,y0]);
            } else {
                break;
            }
            if (x0 === x1 && y0 === y1) {
                break;
            }
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
    getCircle = function(x0, y0, radius) {
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
     * Set new unit stats
     */
    updateUnitStats = function() {
        unitStats = rd.game.units.getStats();
    },


    /**
     * Canvas initialization
     * @memberOf rd.canvas.main
     */
    init = function(mapJson) {
        animations = rd.game.animations;
        mapLayers = mapJson.map;
        ground1 = mapLayers[0];
        ground2 = mapLayers[1];
        top1 = mapLayers[2];
        rowTileCount = ground1.length;
        colTileCount = ground1[0].length;
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
        updateUnitStats: updateUnitStats,
        init: init
    };

})());
