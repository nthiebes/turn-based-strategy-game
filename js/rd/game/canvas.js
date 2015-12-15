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


    drawMovable = function(lineWidth, lineColor, x1, y1) {
        ctxGround1.fillStyle = lineColor;
        ctxGround1.strokeStyle = lineColor;
        ctxGround1.beginPath();
        ctxGround1.moveTo(x1 + 10, y1 + 10);

        ctxGround1.lineTo(x1 + 54, y1 + 10);
        ctxGround1.lineTo(x1 + 54, y1 + 54);
        ctxGround1.lineTo(x1 + 10, y1 + 54);
        ctxGround1.lineTo(x1 + 10, y1 + 10);
        
        ctxGround1.lineWidth = lineWidth;
        ctxGround1.stroke();
        ctxGround1.closePath();
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
            previousField = unit.pos;

        //console.log(moveRange);

        availableFields.push(previousField);

        //console.log(availableFields);

        getSurroundingFields(previousField);

        for (var i=1; i<=moveRange; i++) {
            // top
            // availableFields.push([previousField[]]);
            // previousField
        }
    },


    getSurroundingFields = function(field) {
        var fields = [];
        // top
        //availableFields.push([previousField[]]);
    },


    init = function() {
        tilesetImage = rd.utils.resources.get('img/tileset.png');
        unitStats = rd.game.units.getStats();
        drawImage();

        for (var i=1; i<colTileCount/2; i++) {
            drawLine(1, 'rgba(255,255,255,0.3)', fieldWidth * i, 0, fieldWidth * i, tileSize * rowTileCount);
        }

        for (var j=1; j<rowTileCount/2; j++) {
            drawLine(1, 'rgba(255,255,255,0.3)', 0, fieldWidth * j, tileSize * colTileCount, fieldWidth * j);
        }
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