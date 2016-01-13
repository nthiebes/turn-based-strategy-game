/**
 * Canvas controller
 * @namespace rd.game.canvas
 */
rd.define('game.canvas', (function() {

    /**
     * Variables
     */
    var canvasGround1 = document.getElementById('canvas-ground'),
        canvasAnim = document.getElementById('canvas-anim'),
        canvasUtils = document.getElementById('canvas-utils'),
        ctxGround1 = canvasGround1.getContext('2d'),
        ctxAnim = canvasAnim.getContext('2d'),
        ctxUtils = canvasUtils.getContext('2d'),
        // should be in an external file ...
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
    drawImage = function(ctx) {
        // Each row
        for (var r = 0; r < rowTileCount; r++) {
            // Each column
            for (var c = 0; c < colTileCount; c++) {
                var tile = ground1[ r ][ c ],
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
        ctxUtils.fillStyle = cfg.lineColor;
        ctxUtils.strokeStyle = cfg.lineColor;
        ctxUtils.beginPath();
        ctxUtils.moveTo(cfg.x1, cfg.y1);
        ctxUtils.lineTo(cfg.x2, cfg.y2);
        ctxUtils.lineWidth = cfg.lineWidth;
        ctxUtils.stroke();
        ctxUtils.closePath();
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
     * @param  {object} cfg
     */
    drawRange = function(cfg) {
        var x = cfg.x,
            y = cfg.y;

        ctxUtils.drawImage(tilesetImage, (15 * tileSize), (66 * tileSize), tileSize, tileSize, x + 16, y + 18, tileSize, tileSize);

        // ctxUtils.strokeStyle = 'rgba(' + cfg.lineRgbColor + ',' + cfg.lineOpacity + ')';
        // ctxUtils.fillStyle = 'rgba(' + cfg.fillRgbColor + ',' + cfg.fillOpacity + ')';
        // ctxUtils.beginPath();
        // ctxUtils.moveTo(x, y);

        // ctxUtils.lineTo(x + fieldWidth, y);
        // ctxUtils.lineTo(x + fieldWidth, y + fieldWidth);
        // ctxUtils.lineTo(x, y + fieldWidth);
        // ctxUtils.lineTo(x, y);
        
        // ctxUtils.closePath();
        // ctxUtils.lineWidth = cfg.lineWidth;
        // ctxUtils.stroke();
        // ctxUtils.fill();
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
     * @param {object} unit
     */
    renderAttackRange = function(pos) {
        var newFields,
            visibleFields = [pos];

        // Each map tile
        for (var i=0; i<map.length; i++) {
            for (var j=0; j<map[i].length; j++) {
                newFields = bline(pos[0], pos[1], j, i);
                visibleFields = visibleFields.concat(newFields);
            }
        }

        // Remove duplicates
        visibleFields = uniq(visibleFields);

        // Draw the attack range
        for (var k=0; k<visibleFields.length; k++) {
            drawRange({
                lineWidth: 2,
                lineRgbColor: '0,0,0',
                fillRgbColor: '255,100,100',
                lineOpacity: 0,
                fillOpacity: 0.2,
                x: fieldWidth * visibleFields[k][0],
                y: fieldWidth * visibleFields[k][1]
            });
        }
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
                for (var j=0; j<curentMoveRange.length; j++) {
                    if (fieldWidth * curentMoveRange[j][0] === fieldWidth * availableFields[i][0] &&
                        fieldWidth * curentMoveRange[j][1] === fieldWidth * availableFields[i][1]) {
                        overlap = true;
                    }
                }

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
     * @param  {array} a
     * @return {array}
     */
    uniq = function(a) {
        var seen = {};
        return a.filter(function(item) {
            return seen.hasOwnProperty(item) ? false : (seen[item] = true);
        });
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
            (field[0] === rd.game.main.getCurrentUnit().pos[0] && field[1] === rd.game.main.getCurrentUnit().pos[1]) ||
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
     * Disable the utils
     */
    disableUtils = function() {
        utilsDisabled = true;
        highlightMovableTiles();
        //renderAttackRange(rd.game.main.getCurrentUnit().pos);
    },


    /**
     * Disable the utils
     */
    enableUtils = function() {
        utilsDisabled = false;
        rd.game.map.redrawUtils();
        rd.game.canvas.renderMoveRange(rd.game.main.getCurrentUnit());
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
        drawImage(ctxGround1);
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
        init: init
    };

})());