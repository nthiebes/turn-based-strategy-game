/**
 * Canvas controller
 * @namespace rd.game.canvas
 */
rd.define('game.canvas', (function() {

    /**
     * Variables
     */
    var canvasGround1 = document.getElementById('canvas-ground-layer'),
        canvasAnim = document.getElementById('canvas-anim'),
        ctxGround1 = canvasGround1.getContext('2d'),
        ctxAnim = canvasAnim.getContext('2d'),
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
        unitStats,
        map,


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
        ctxGround1.fillStyle = cfg.lineColor;
        ctxGround1.strokeStyle = cfg.lineColor;
        ctxGround1.beginPath();
        ctxGround1.moveTo(cfg.x1, cfg.y1);
        ctxGround1.lineTo(cfg.x2, cfg.y2);
        ctxGround1.lineWidth = cfg.lineWidth;
        ctxGround1.stroke();
        ctxGround1.closePath();
    },


    /**
     * Draw the 'movable' custom shape
     * @memberOf rd.game.canvas
     * @param {object} cfg Configuration
     */
    drawMovable = function(cfg) {
        var x = cfg.x,
            y = cfg.y;

        ctxGround1.strokeStyle = 'rgba(' + cfg.rgbColor + ',' + cfg.opacity + ')';
        ctxGround1.fillStyle = 'rgba(' + cfg.rgbColor + ',' + (cfg.opacity >= 0.8 ? cfg.opacity - 0.8 : 0) + ')';
        ctxGround1.beginPath();
        ctxGround1.moveTo(x + 8, y + 8);

        ctxGround1.lineTo(x + 27, y + 8);
        ctxGround1.lineTo(x + 32, y + 3);
        ctxGround1.lineTo(x + 37, y + 8);
        ctxGround1.lineTo(x + 56, y + 8);

        ctxGround1.lineTo(x + 56, y + 27);
        ctxGround1.lineTo(x + 61, y + 32);
        ctxGround1.lineTo(x + 56, y + 37);
        ctxGround1.lineTo(x + 56, y + 56);

        ctxGround1.lineTo(x + 37, y + 56);
        ctxGround1.lineTo(x + 32, y + 61);
        ctxGround1.lineTo(x + 27, y + 56);
        ctxGround1.lineTo(x + 8, y + 56);

        ctxGround1.lineTo(x + 8, y + 37);
        ctxGround1.lineTo(x + 3, y + 32);
        ctxGround1.lineTo(x + 8, y + 27);
        ctxGround1.lineTo(x + 8, y + 8);
        
        ctxGround1.closePath();
        ctxGround1.lineWidth = cfg.lineWidth;
        ctxGround1.stroke();
        ctxGround1.fill();
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
            renderEntity(list[i], list[i].skin, list[i].gear.torso, list[i].gear.head);
        }    
    },

    
    /**
     * Render a single entity
     */
    renderEntity = function() {
        ctxAnim.save();
        ctxAnim.translate(arguments[0].pos[0] * fieldWidth, arguments[0].pos[1] * fieldWidth);

        for (var i=1; i<arguments.length; i++) {
            arguments[i].render(ctxAnim);
        }
        ctxAnim.restore();
    },


    /**
     * WIP
     * @memberOf rd.game.canvas
     */
    renderMoveRange = function(unit) {
        var moveRange = unit.attributes.moveRange,
            availableFields = [],
            newFields;

        moveRange = 5;

        availableFields.push(unit.pos);

        function test() {
            newFields = [];
            for (var j=0; j<availableFields.length; j++) {
                newFields = newFields.concat( getSurroundingFields(availableFields[j]) );
            }

            availableFields = uniq(availableFields.concat(newFields));
        }

        function uniq(a) {
            var seen = {};
            return a.filter(function(item) {
                return seen.hasOwnProperty(item) ? false : (seen[item] = true);
            });
        }

        for (var i=1; i<=moveRange; i++) {
            test();
        }

        for (var i=0; i<availableFields.length; i++) {
            drawMovable({
                lineWidth: 2,
                rgbColor: '0,200,0',
                opacity: 0.8,
                x: fieldWidth * availableFields[i][0],
                y: fieldWidth * availableFields[i][1]
            });
        }

        console.log('availableFields', availableFields);
    },


    /**
     * Get all surrounding fields
     * @param  {array} field
     * @return {array}
     */
    getSurroundingFields = function(field) {
        var fields = [],
            newField = [];

        // Nothing in our way
        if (isMovableField(field)) {
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
        //console.log( field, map[ field[0] ][ field[1] ] );
        if (map[ field[1] ][ field[0] ] === 0) {
            return true;
        } else {
            return false;
        }
    },


    /**
     * Highlight movable tiles
     */
    highlightMovableTiles = function() {
        for (var i=0; i<colTileCount/2; i++) {
            for (var j=0; j<rowTileCount/2; j++) {
                // Only movable tiles
                if (map[j][i] === 0) {
                    drawMovable({
                        lineWidth: 2,
                        rgbColor: '255,255,255',
                        opacity: 0.2,
                        x: fieldWidth * i,
                        y: fieldWidth * j
                    });
                }
            }
        }
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
        drawLine : drawLine,
        renderMoveRange: renderMoveRange,
        drawMovable: drawMovable,
        init: init
    };

})());