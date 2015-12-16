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
        fieldWidth = tileSize * 2,
        tilesetImage,
        unitStats,
        map,


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


    drawLine = function(lineWidth, lineColor, x1, y1, x2, y2) {
        ctxGround1.fillStyle = lineColor;
        ctxGround1.strokeStyle = lineColor;
        ctxGround1.beginPath();
        ctxGround1.moveTo(x1, y1);
        ctxGround1.lineTo(x2, y2);
        ctxGround1.lineWidth = lineWidth;
        ctxGround1.stroke();
        ctxGround1.closePath();
    },


    drawMovable = function(lineWidth, rgbColor, opacity, x1, y1) {
        ctxGround1.strokeStyle = 'rgba(' + rgbColor + ',' + opacity + ')';
        ctxGround1.fillStyle = 'rgba(' + rgbColor + ',' + (opacity >= 0.8 ? opacity - 0.8 : 0) + ')';
        ctxGround1.beginPath();
        ctxGround1.moveTo(x1 + 8, y1 + 8);

        ctxGround1.lineTo(x1 + 27, y1 + 8);
        ctxGround1.lineTo(x1 + 32, y1 + 3);
        ctxGround1.lineTo(x1 + 37, y1 + 8);
        ctxGround1.lineTo(x1 + 56, y1 + 8);

        ctxGround1.lineTo(x1 + 56, y1 + 27);
        ctxGround1.lineTo(x1 + 61, y1 + 32);
        ctxGround1.lineTo(x1 + 56, y1 + 37);
        ctxGround1.lineTo(x1 + 56, y1 + 56);

        ctxGround1.lineTo(x1 + 37, y1 + 56);
        ctxGround1.lineTo(x1 + 32, y1 + 61);
        ctxGround1.lineTo(x1 + 27, y1 + 56);
        ctxGround1.lineTo(x1 + 8, y1 + 56);

        ctxGround1.lineTo(x1 + 8, y1 + 37);
        ctxGround1.lineTo(x1 + 3, y1 + 32);
        ctxGround1.lineTo(x1 + 8, y1 + 27);
        ctxGround1.lineTo(x1 + 8, y1 + 8);
        
        ctxGround1.closePath();
        ctxGround1.lineWidth = lineWidth;
        ctxGround1.stroke();
        ctxGround1.fill();
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


    renderMoveRange = function(unit) {
        var moveRange = unit.attributes.moveRange,
            availableFields = [],
            newFields,
            previousField = unit.pos;

        //console.log(moveRange);

        map = rd.game.map.getMap();

        availableFields.push(previousField);

        newFields = getSurroundingFields(previousField);

        for (var i=0; i<newFields.length; i++) {
            availableFields.push( newFields[i] );
        }


        console.log('availableFields', availableFields);


        // for (var i=1; i<=moveRange; i++) {
            

        //     for (var j=0; j<availableFields.length; j++) {
        //         console.log( availableFields[j] );
        //         availableFields.push( getSurroundingFields(availableFields[j]) );
        //     }
        // }

        // console.log('availableFields', availableFields);
    },


    getSurroundingFields = function(field) {
        var fields = [];

        console.log('field', field);

        var fieldType = map[ field[0] ][ field[1] ],
            top = [],
            right = []
            bottom = []
            left = [];

        // Nothing in our way
        if (fieldType === 0) {
            // Top
            if (field[1] > 0) {
                fields.push( [field[0], field[1] - 1] );
            }

            // Right
            if (field[0] < map[0].length) {
                fields.push( [field[0] + 1, field[1]] );
            }

            // Bottom
            if (field[1] < map.length) {
                fields.push( [field[0], field[1] + 1] );
            }

            // Left
            if (field[0] > 0) {
                fields.push( [field[0] - 1, field[1]] );
            }
        }

        console.log( 'fields', fields );

        return fields;
    },


    init = function() {
        tilesetImage = rd.utils.resources.get('img/tileset.png');
        unitStats = rd.game.units.getStats();
        drawImage();

        for (var i=0; i<colTileCount/2; i++) {
            for (var j=0; j<rowTileCount/2; j++) {
                drawMovable(2, '255,255,255', '0.2', fieldWidth * i, fieldWidth * j);
            }
        }

        // for (var i=1; i<colTileCount/2; i++) {
        //     drawLine(1, 'rgba(255,255,255,0.3)', fieldWidth * i, 0, fieldWidth * i, tileSize * rowTileCount);
        // }

        // for (var j=1; j<rowTileCount/2; j++) {
        //     drawLine(1, 'rgba(255,255,255,0.3)', 0, fieldWidth * j, tileSize * colTileCount, fieldWidth * j);
        // }
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