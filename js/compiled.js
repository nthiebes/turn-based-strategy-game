/**
 * Game namespace
 * @namespace rd
 */
var rd = {};


/**
 * Defines a namespace
 * @namespace rd.define
 * @param {string}   namespace Namespace chain as string
 * @param {function} logic     
 */
rd.define = function(namespace, logic){
    var parts = namespace.split('.'),
        root = this,
        length = parts.length,
        i;

    for( i=0; i<length; i++ ){
        if( !root[parts[i]] ){
            if( i === length-1 ){
                root[parts[i]] = logic;
            } else{
                root[parts[i]] = {};
            }
        }
        root = root[parts[i]];
    }
};


/**
 * A cross-browser requestAnimationFrame
 */
var requestAnimFrame = (function(){
    return window.requestAnimationFrame    ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        window.oRequestAnimationFrame      ||
        window.msRequestAnimationFrame     ||
        function(callback){
            window.setTimeout(callback, 1000 / 60);
        };
})();


/**
 * Behaves the same as setTimeout except uses requestAnimationFrame() where possible for better performance
 * @global
 * @param {function} fn    The callback function
 * @param {int}      delay The delay in milliseconds
 */
window.requestTimeout = function(fn, delay) {
    if( !window.requestAnimationFrame       && 
        !window.webkitRequestAnimationFrame && 
        !(window.mozRequestAnimationFrame   && window.mozCancelRequestAnimationFrame) && // Firefox 5 ships without cancel support
        !window.oRequestAnimationFrame      && 
        !window.msRequestAnimationFrame)
            return window.setTimeout(fn, delay);
            
    var start = new Date().getTime(),
        handle = new Object();
        
    function loop() {
        var current = new Date().getTime(),
            delta = current - start;
            
        delta >= delay ? fn.call() : handle.value = requestAnimFrame(loop);
    }
    
    handle.value = requestAnimFrame(loop);
    return handle;
};


/**
 * @namespace rd.game
 */
 /**
 * Some useful functions
 * @namespace rd.utils
 */
rd.define('utils', (function() {

    /**
     * Load a json file from an url
     * @memberOf rd.utils
     * @param {string}   url
     * @param {function} callback
     */
    var loadJSON = function(url, callback) {   
        var xobj = new XMLHttpRequest();
        xobj.overrideMimeType('application/json');
        xobj.open('GET', url, true);
        xobj.onreadystatechange = function() {
            if (xobj.readyState === 4 && xobj.status === 200) {
                // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
                callback(JSON.parse(xobj.responseText));
            }
        };
        xobj.send(null);
    };


    /**
     * Return public functions
     */
    return {
        loadJSON: loadJSON
    };

})());
/**
 * Resources controller
 * @namespace rd.utils.resources
 */
rd.define('utils.resources', (function() {

    /**
     * Variables
     */
    var resourceCache = {},
        readyCallbacks = [],


    /**
     * Load an image url or an array of image urls
     * @memberOf rd.utils.resources
     * @param {string|array} urlOrArr
     */
    load = function(urlOrArr) {
        if(urlOrArr instanceof Array) {
            urlOrArr.forEach(function(url) {
                loadImage(url);
            });
        }
        else {
            loadImage(urlOrArr);
        }
    },


    /**
     * Load a single image from an url
     * @param  {string} url
     * @return {image}
     */
    loadImage = function(url) {
        if (resourceCache[url]) {
            return resourceCache[url];
        }
        else {
            var img = new Image();
            img.onload = function() {
                resourceCache[url] = img;

                if(isReady()) {
                    readyCallbacks.forEach(function(func) {
                        func();
                    });
                }
            };
            resourceCache[url] = false;
            img.src = url;
        }
    },


    /**
     * Get an image by url
     * @memberOf rd.utils.resources
     * @param  {string} url
     * @return {image}
     */
    get = function(url) {
        return resourceCache[url];
    },


    /**
     * Check if the resource has been loaded
     * @memberOf rd.utils.resources
     * @return {boolean}
     */
    isReady = function() {
        var ready = true;
        for(var k in resourceCache) {
            if(resourceCache.hasOwnProperty(k) &&
               !resourceCache[k]) {
                ready = false;
            }
        }
        return ready;
    },


    /**
     * Ready callback function
     * @memberOf rd.utils.resources
     * @param  {function} func
     */
    onReady = function(func) {
        readyCallbacks.push(func);
    };


    /**
     * Return public functions
     */
    return {
        load: load,
        get: get,
        onReady: onReady,
        isReady: isReady
    };

})());
/**
 * Sprite controller
 * @namespace rd.utils.sprite
 */
rd.define('utils.sprite', function(cfg) {

    /**
     * Variables
     */
    var me = this,


    /**
     * Update the sprite (e.g. speed)
     * @memberOf rd.utils.sprite
     * @param {int} delta
     */
    update = function(delta) {
        // Stay not yet working correct
        if (!(me.stay && me.done)) {
            me._index += me.speed * delta;
            // Always start with first frame
            if (me.frames.length === 1) {
                me._index = 0;
            }
        }
    },


    /**
     * Render the sprite onto the canvas
     * @memberOf rd.utils.sprite
     * @param {object} ctx
     */
    render = function(ctx) {
        var frame;

        if (me.speed > 0) {
            var max = me.frames.length,
                idx = Math.floor(me._index);
            frame = me.frames[idx % max];

            if (me.once && idx >= max) {
                me.done = true;
            }

            // End animation
            if (idx >= max) {
                me._index = 0;
            }
        } else {
            frame = 0;
        }

        me.currentFrame = frame;

        var x = me.pos[0],
            y = me.pos[1];

        if (me.dir === 'vertical') {
            y += frame * me.size[1];
        } else {
            x += frame * me.size[0];
        }

        // If it is done and it has to run once, we dont update
        if (!(me.done && me.once)) {
            ctx.drawImage(rd.utils.resources.get(me.url),
                          x, y,
                          me.size[0], me.size[1],
                          0, 0,
                          me.size[0], me.size[1]);
        }
    },


    /**
     * Update the frames of a sprite
     * @memberOf rd.utils.sprite
     * @param {array} newFrames
     */
    setFrames = function(newFrames) {
        me.frames = newFrames;
    },


    /**
     * Get the current frame and frames length
     * @return {object}
     */
    getFrames = function() {
        return {
            framesLength: me.frames.length,
            index: Math.floor(me._index)
        };
    },


    /**
     * Set a new frame index
     * @param {integer} newIndex
     */
    setIndex = function(newIndex) {
        me._index = newIndex;
    },


    /**
     * Update the positions within a sprite (e.g. for an animation)
     * @memberOf rd.utils.sprite
     * @param {array} newPos
     */
    setPos = function(newPos) {
        me.pos = newPos;
    };

    me.pos = cfg.pos;
    me.size = cfg.size;
    me.speed = typeof cfg.speed === 'number' ? cfg.speed : 0;
    me.frames = cfg.frames;
    me._index = 0;
    me.url = cfg.url;
    me.dir = cfg.dir || 'horizontal';
    me.once = cfg.once;
    me.stay = cfg.stay;
    me.inProgress = cfg.inProgress;
    me.currentFrame = 0;


    /**
     * Return public functions
     */
    return {
        render: render,
        update: update,
        setPos: setPos,
        setFrames: setFrames,
        getFrames: getFrames,
        setIndex: setIndex
    };

});

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

/**
 * Unit instance
 * @namespace rd.game.unit
 */
rd.define('game.unit', function(cfg) {

    /**
     * Variables
     */
    var me = this,


    /**
     * Stop animations
     * @memberOf rd.game.unit
     * @param {string} direction
     */
    stop = function(direction) {
        if (direction) {
            turn(direction);
        }

        me.skin.setPos([0, 256 + me.side]);
        me.skin.setFrames([0]);

        me.gear.head.setPos([0, 256 + me.side]);
        me.gear.head.setFrames([0]);

        me.gear.torso.setPos([0, 256 + me.side]);
        me.gear.torso.setFrames([0]);

        me.gear.leg.setPos([0, 256 + me.side]);
        me.gear.leg.setFrames([0]);

        me.primary.setPos([0, 256 + me.side]);
        me.primary.setFrames([0]);

        me.secondary.setPos([0, 256 + me.side]);
        me.secondary.setFrames([0]);

        me.wounded.setPos([0, 256 + me.side]);
        me.wounded.setFrames([0]);

        // Round new position
        me.pos[0] = Math.round(me.pos[0]);
        me.pos[1] = Math.round(me.pos[1]);

        if (me.unitFighting) {
            me.unitFighting = false;
        }

        // Start combat
        if (me.fightAfterWalking) {
            rd.game.combat.fight(rd.game.main.getCurrentUnitId(), me.nextEnemyId);
            me.fightAfterWalking = false;
        }
    },


    /**
     * Play the walk animation cycle
     * @memberOf rd.game.unit
     * @param {object} config
     */
    walk = function(config) {
        me.fightAfterWalking = config.fight;
        me.nextEnemyId = config.enemyId;

        me.skin.setPos([0, 0 + me.side]);
        me.skin.setFrames([0, 1, 2, 3]);

        me.gear.head.setPos([0, 0 + me.side]);
        me.gear.head.setFrames([0, 1, 2, 3]);

        me.gear.torso.setPos([0, 0 + me.side]);
        me.gear.torso.setFrames([0, 1, 2, 3]);

        me.gear.leg.setPos([0, 0 + me.side]);
        me.gear.leg.setFrames([0, 1, 2, 3]);

        me.primary.setPos([0, 0 + me.side]);
        me.primary.setFrames([0, 1, 2, 3]);

        me.secondary.setPos([0, 0 + me.side]);
        me.secondary.setFrames([0, 1, 2, 3]);

        me.wounded.setPos([0, 0 + me.side]);
        me.wounded.setFrames([0, 1, 2, 3]);

        me.path = config.path.splice(1, config.path.length);

        // Define the next tile for the animation
        me.nextTile = config.path[0];

        me.currentMoveRange = me.currentMoveRange - me.path.length;
    },


    /**
     * Play the attack animation
     * @memberOf rd.game.unit
     */
    attack = function() {
        me.unitFighting = true;

        me.skin.setPos([0, 256 + me.side]);
        if (me.ranged) {
            me.skin.setFrames([0, 2, 2, 2]);
        } else {
            me.skin.setFrames([0, 1, 2, 2]);
        }
        me.skin.setIndex(0);
        
        me.gear.head.setPos([0, 256 + me.side]);
        if (me.ranged) {
            me.gear.head.setFrames([0, 2, 2, 2]);
        } else {
            me.gear.head.setFrames([0, 1, 2, 2]);
        }
        me.gear.head.setIndex(0);
        
        me.gear.torso.setPos([0, 256 + me.side]);
        if (me.ranged) {
            me.gear.torso.setFrames([0, 2, 2, 2]);
        } else {
            me.gear.torso.setFrames([0, 1, 2, 2]);
        }
        me.gear.torso.setIndex(0);
        
        me.gear.leg.setPos([0, 256 + me.side]);
        if (me.ranged) {
            me.gear.leg.setFrames([0, 2, 2, 2]);
        } else {
            me.gear.leg.setFrames([0, 1, 2, 2]);
        }
        me.gear.leg.setIndex(0);

        me.wounded.setPos([0, 256 + me.side]);
        if (me.ranged) {
            me.wounded.setFrames([0, 2, 2, 2]);
        } else {
            me.wounded.setFrames([0, 1, 2, 2]);
        }
        me.wounded.setIndex(0);
        
        me.primary.setPos([0, 256 + me.side]);
        me.primary.setFrames([0, 1, 2, 2]);
        me.primary.setIndex(0);

        me.secondary.setPos([0, 256 + me.side]);
        me.secondary.setFrames([0, 1, 2, 2]);
        me.secondary.setIndex(0);
    },


    /**
     * Turn the unit
     * @memberOf rd.game.unit
     * @param {string} direction
     */
    turn = function(direction) {
        me.side = direction === 'left' ? 128 : 0;

        me.skin.setPos([0, 256 + me.side]);
        me.gear.head.setPos([0, 256 + me.side]);
        me.gear.torso.setPos([0, 256 + me.side]);
        me.gear.leg.setPos([0, 256 + me.side]);
        me.primary.setPos([0, 256 + me.side]);
        me.secondary.setPos([0, 256 + me.side]);
        me.wounded.setPos([0, 256 + me.side]);
    },


    /**
     * Save the map tiles that are in range
     * @memberOf rd.game.unit
     * @param {array} fields
     */
    setFieldsInRange = function(fields) {
        me.fieldsInRange = fields;
    },


    /**
     * Set the health
     * @memberOf rd.game.unit
     * @param {array} newHealth
     */
    setHealth = function(newHealth) {
        me.health = newHealth;
    },


    /**
     * Set the wounded status
     * @memberOf rd.game.unit
     * @param {array} wounded
     */
    setWounded = function(wounded) {
        me.isWounded = wounded;
    },


    /**
     * Get the map tiles that are in range
     * @memberOf rd.game.unit
     * @return {array}
     */
    getFieldsInRange = function() {
        return me.fieldsInRange;
    },


    /**
     * Check if a unit is in range
     * @memberOf rd.game.unit
     * @param  {array} unitPos
     * @return {boolean}
     */
    isInRange = function(unitPos) {
        for (var i = 0; i < me.fieldsInRange.length; i++) {
            if (me.fieldsInRange[i][0] === unitPos[0] && me.fieldsInRange[i][1] === unitPos[1]) {
                return true;
            }
        }
        return false;
    },


    /**
     * Set the move range to the default value
     * @memberOf rd.game.unit
     */
    resetMoveRange = function() {
        me.currentMoveRange = me.attributes.moveRange;
    },


    /**
     * Get the unit object
     * @memberOf rd.game.unit
     * @return {object}
     */
    get = function() {
        return me;
    };

    me.name = cfg.name;
    me.skin = cfg.skin;
    me.pos = cfg.pos;
    me.team = cfg.team;
    me.side = cfg.side;
    me.gear = cfg.gear;
    me.race = cfg.race;
    me.armor = cfg.armor;
    me.moving = false;
    me.skills = cfg.skills;
    me.dead = cfg.dead;
    me.visible = cfg.visible || true;
    me.isWounded = false;
    me.weapons = cfg.weapons;
    me.health = cfg.health || 0;
    me.attributes = cfg.racesCfg[cfg.race];
    me.attributes.damageMelee += (cfg.weaponsCfg[cfg.weapons.primary].damageMelee || 0);
    me.attributes.damageRanged += (cfg.weaponsCfg[cfg.weapons.primary].damageRanged || 0);
    me.attributes.moveRange = Math.round(me.attributes.moveRange + cfg.armorCfg[cfg.armor].moveRange);
    me.attributes.defense += cfg.armorCfg[cfg.armor].defense;
    me.attributes.defense += (cfg.weaponsCfg[cfg.weapons.secondary].defense || 0);
    me.primary = cfg.primary;
    me.secondary = cfg.secondary;
    me.wounded = cfg.wounded;
    me.currentMoveRange = me.attributes.moveRange;
    me.attackRange = cfg.weaponsCfg[me.weapons.primary].attackRange;
    me.path = [];
    me.fieldsInRange = [];
    me.steps = 20;
    me.currentStep = 20;
    me.unitFighting = false;
    me.ranged = me.attackRange > 1 ? true : false;
    me.arrow = cfg.weaponsCfg[me.weapons.primary].arrow;
    me.bolt = cfg.weaponsCfg[me.weapons.primary].bolt;
    me.bullet = cfg.weaponsCfg[me.weapons.primary].bullet;


    /**
     * Return public functions
     */
    return {
        get: get,
        walk: walk,
        stop: stop,
        attack: attack,
        turn: turn,
        setFieldsInRange: setFieldsInRange,
        getFieldsInRange: getFieldsInRange,
        isInRange: isInRange,
        resetMoveRange: resetMoveRange,
        setHealth: setHealth,
        setWounded: setWounded
    };

});

/**
 * Combat controller
 * @namespace rd.game.combat
 */
rd.define('game.combat', (function() {

    /**
     * Variables
     */
    var units,


    /**
     * To battle!
     * @param {object} attacker
     * @param {object} defender
     */
    fight = function(attacker, defender) {
        units = rd.game.units.get();

        var attackerStats = units[attacker].get(),
            defenderStats = units[defender].get(),
            attackerAttr = attackerStats.attributes,
            defenderAttr = defenderStats.attributes,
            damageAttacker,
            baseDmg,
            modifier = 0,
            modifiedDmg,
            newHealth,
            wounded;

        // Turn units
        if (attackerStats.pos[0] < defenderStats.pos[0]) {
            units[attacker].turn('right');
        } else if (attackerStats.pos[0] > defenderStats.pos[0]) {
            units[attacker].turn('left');
        }

        // Attack animation
        units[attacker].attack();

        // Base damage
        if (attackerStats.attackRange > 1) {
            damageAttacker = attackerAttr.damageRanged;
        } else {
            damageAttacker = attackerAttr.damageMelee;
        }
        baseDmg =  7 * damageAttacker;

        // console.log(damageAttacker, 'damage');
        // console.log('vs');
        // console.log(defenderAttr.defense, 'defense');
        // console.log('base damage:', baseDmg);

        // Calculate damage modifiers
        if (damageAttacker > defenderAttr.defense) {
            modifier = 0.1 * (damageAttacker - defenderAttr.defense);
            // console.log('bonus:', modifier);
        } else if (damageAttacker < defenderAttr.defense) {
            modifier = 0.1 * (damageAttacker - defenderAttr.defense);
            // console.log('reduction:', modifier);
        }
        modifiedDmg = baseDmg * (1 + modifier);

        // console.log('modified damage:', modifiedDmg);

        // Calculate health
        newHealth = (defenderStats.health - modifiedDmg > 0 ? defenderStats.health - modifiedDmg : 0);
        newHealth = Math.floor(newHealth);
        wounded = newHealth < 50 ? true : false;

        // console.log('health', newHealth);
        // console.log('wounded:', wounded);

        requestTimeout(function() {
            if (attackerStats.arrow) {
                fireArrow(attackerStats);
            }
            if (attackerStats.bolt) {
                fireBolt(attackerStats);
            }
            if (attackerStats.bullet) {
                fireBullet(attackerStats);
            }
        }, 400);

        requestTimeout(function() {
            units[defender].setHealth(newHealth);
            units[defender].setWounded(wounded);

            if (newHealth > 0) {
                // Alive
                // Hit animation
                // Next player
            } else {
                // Dead
                // Death animation
                rd.game.units.removeUnit(defender, defenderStats);
            }

            // Show damage
        }, 600);

        requestTimeout(function() {
            if (newHealth > 0) {
                rd.game.main.endTurn();
                // Fight back
            } else {
                rd.game.main.endTurn();
            }
        }, 1000);
    },


    fireArrow = function() {

    },

    
    fireBolt = function() {

    },


    fireBullet = function() {

    };


    /**
     * Return public functions
     */
    return {
        fight: fight
    };

})());

/**
 * Units controller
 * @namespace rd.game.units
 */
rd.define('game.units', (function() {

    /**
     * Variables
     */
    var units = [],
        unitsCfg,
        armorCfg,
        weaponsCfg,
        racesCfg,
        unitCount = 0,


    /**
     * Add a new unit
     * @memberOf rd.game.units
     * @param {object} newUnit
     */
    add = function(cfg) {
        var newUnit = JSON.parse(JSON.stringify(unitsCfg[cfg.key])), // Copy object
            side = cfg.team === 1 ? 0 : 128;
        newUnit.pos = cfg.pos;
        newUnit.team = cfg.team;
        newUnit.side = side;
        newUnit.weaponsCfg = JSON.parse(JSON.stringify(weaponsCfg));
        newUnit.armorCfg = JSON.parse(JSON.stringify(armorCfg));
        newUnit.racesCfg = JSON.parse(JSON.stringify(racesCfg));
        newUnit.skin = new rd.utils.sprite(getPreset(newUnit.race + newUnit.skin, side));
        newUnit.gear.head = new rd.utils.sprite(getPreset('head' + newUnit.gear.head, side));
        newUnit.gear.torso = new rd.utils.sprite(getPreset('torso' + newUnit.gear.torso, side));
        newUnit.gear.leg = new rd.utils.sprite(getPreset('leg' + newUnit.gear.leg, side));
        newUnit.primary = new rd.utils.sprite(getPreset(newUnit.weapons.primary, side));
        newUnit.secondary = new rd.utils.sprite(getPreset(newUnit.weapons.secondary, side));
        newUnit.wounded = new rd.utils.sprite(getPreset('wounded', side));
        units.push(new rd.game.unit(newUnit));
        rd.game.map.updateMap(cfg.pos[0], cfg.pos[1], 'id-' + unitCount);
        unitCount++;
    },


    /**
     * Sprite preset
     * @param  {string}  name
     * @param  {integer} side
     * @return {object}
     */
    getPreset = function(name, side) {
        return {
            'url': 'img/units/' + name + '.png',
            'pos': [0, 256 + side],
            'size': [128, 128],
            'speed': 4,
            'frames': [0]
        };
    },


    /**
     * Get a list of all units
     * @memberOf rd.game.units
     * @return {array}
     */
    get = function() {
        return units;
    },


    /**
     * Get a list of all unit and their stats
     * @memberOf rd.game.units
     * @return {array}
     */
    getStats = function() {
        var returnArray = [];
        for (var i = 0; i < units.length; i++) {
            returnArray.push(units[i].get());
        }
        return returnArray;
    },


    /**
     * Remove a unit from the units array
     * @param {integer} index
     */
    removeUnit = function(index, stats) {
        units.splice(index, 1);

        // Update all unit arrays
        rd.game.map.updateMap(stats.pos[0], stats.pos[1], 0);
        rd.game.map.updateUnitStats();
        rd.game.main.updateUnits();
        rd.game.main.updateUnitStats();
        rd.canvas.main.updateUnitStats();
    },


    /**
     * Initialization
     * @memberOf rd.game.units
     */
    init = function(callback) {
        rd.utils.loadJSON('cfg/units.json', function(unitsJson) {
            unitsCfg = unitsJson;

            rd.utils.loadJSON('cfg/races.json', function(racesJson) {
                racesCfg = racesJson;

                rd.utils.loadJSON('cfg/weapons.json', function(weaponsJson) {
                    weaponsCfg = weaponsJson;

                    rd.utils.loadJSON('cfg/armor.json', function(armorJson) {
                        armorCfg = armorJson;

                        add({
                            key: 'nico1',
                            pos: [9, 3],
                            team: 1
                        });
                        // add({
                        //     key: 'nicoclone',
                        //     pos: [0, 6],
                        //     team: 1
                        // });
                        add({
                            key: 'enemy1',
                            pos: [11, 5],
                            team: 2
                        });
                        add({
                            key: 'enemy2',
                            pos: [11, 4],
                            team: 2
                        });
                        // add({
                        //     key: 'enemy1',
                        //     pos: [11, 7],
                        //     team: 2
                        // });

                        callback();
                    });
                });
            });
        });
    };


    /**
     * Return public functions
     */
    return {
        init: init,
        get: get,
        getStats: getStats,
        removeUnit: removeUnit
    };

})());

/**
 * Combat controller
 * @namespace rd.game.map
 */
rd.define('game.map', (function() {

    /**
     * Variables
     */
    var map =  [[0,1,1,1,1,1,1,1,1,1,1,0],
                [0,0,0,1,1,1,1,1,1,1,1,0],
                [0,0,0,0,0,1,1,1,0,0,0,0],
                [0,0,0,1,0,1,1,1,0,0,0,0],
                [0,0,0,1,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,1,0,0,0],
                [0,0,0,0,1,1,1,0,1,0,0,0],
                [0,0,0,0,1,1,1,0,0,0,0,0],
                [0,1,1,1,1,1,1,1,1,0,0,0],
                [0,1,1,1,1,1,1,1,1,1,1,0]],
        canvasTop = document.getElementById('canvas-top1'),
        body = document.getElementsByTagName('body')[0],
        tileSize = 64,
        currentPath,
        currentCell = [],
        unitStats,
        meleePossible = false,
        rangedPossible = false,
        canvas = rd.canvas.main,


    /**
     * Register the event listener
     */
    eventListener = function() {
        canvasTop.addEventListener('click', canvasClick);
        canvasTop.addEventListener('mousemove', canvasMove);
        canvasTop.addEventListener('mouseleave', canvasLeave);
    },


    /**
     * Handle the mouseleave event
     */
    canvasLeave = function() {
        // Stop if utils are disabled
        if (canvas.areUtilsDisabled()) {
            return false;
        }

        // Redraw base tiles
        redrawUtils();

        currentCell = [];
    },


    /**
     * Handle mousemove over the canvas
     * @param  {object} e Event
     */
    canvasMove = function(e) {
        var x,
            y,
            cellType,
            hoverUnitId,
            team;

        // Stop if utils are disabled
        if (canvas.areUtilsDisabled()) {
            return false;
        }

        // Grab html page coords
        if (e.pageX !== undefined && e.pageY !== undefined) {
            x = e.pageX;
            y = e.pageY;
        } else {
            x = e.clientX + document.body.scrollLeft +
            document.documentElement.scrollLeft;
            y = e.clientY + document.body.scrollTop +
            document.documentElement.scrollTop;
        }

        // Make them relative to the canvas only
        x -= canvasTop.offsetLeft;
        y -= canvasTop.offsetTop;

        // Return tile x,y that we clicked
        var cell = [
            Math.floor(x / tileSize),
            Math.floor(y / tileSize)
        ];

        cell[1] = cell[1] < 10 ? cell[1] : 9;
        cellType = map[ cell[1] ][ cell[0] ];

        // Draw path only after entering a new cell
        if ((currentCell[0] !== cell[0] || currentCell[1] !== cell[1]) && cell[0] < 12 && cell[1] < 10) {
            currentCell = cell;

            // Unit hover
            if (typeof cellType === 'string') {
                hoverUnitId = parseInt(cellType.replace('id-', ''));

                // Current unit
                if (rd.game.main.getCurrentUnitId() === hoverUnitId) {
                    drawPath(cell);
                }

            // Field hover
            } else {
                canvas.clearUtils();
                canvas.highlightMovableTiles();
                drawPath(cell);
            }

        // Unit hover
        } else if (typeof cellType === 'string') {
            hoverUnitId = parseInt(cellType.replace('id-', ''));
            unitStats = rd.game.units.getStats();
            team = team = unitStats[hoverUnitId].team;

            // Hover effect
            if (rd.game.main.getCurrentUnitId() !== hoverUnitId) {
                var hoverUnit = unitStats[rd.game.main.getCurrentUnitId()];

                canvas.clearUtils();
                canvas.highlightMovableTiles();

                // Check if it is an enemy
                if (team !== hoverUnit.team) {
                    currentPath = null;
                    meleePossible = false;

                    var hoverUnitPos = unitStats[hoverUnitId].pos,
                        currentUnit = rd.game.main.getCurrentUnit(),
                        currentUnitStats = unitStats[rd.game.main.getCurrentUnitId()],
                        range = currentUnitStats.attackRange,
                        isInRange = currentUnit.isInRange(hoverUnitPos),
                        infoHoverEffect = false;

                    // Mouse over from left
                    if (x >= cell[0] * tileSize && x <= cell[0] * tileSize + 16 &&
                        y >= cell[1] * tileSize + 16 && y <= cell[1] * tileSize + 48 && range === 1) {
                        currentPath = findPath(map, rd.game.main.getCurrentUnitStats().pos, [cell[0] - 1,cell[1]]);

                        // Show hover effect if unit can be reached in melee
                        if (currentPath.length - 1 <= currentUnitStats.currentMoveRange && cell[0] > 0 && currentPath[currentPath.length - 1]) {
                            drawPath([cell[0] - 1,cell[1]], true);
                            body.className = 'cursor-right';
                            meleePossible = true;
                        }

                    // Mouse over from right
                    } else if (x >= cell[0] * tileSize + 48 && x <= cell[0] * tileSize + 64 &&
                                y >= cell[1] * tileSize + 16 && y <= cell[1] * tileSize + 48 && range === 1) {
                        currentPath = findPath(map, rd.game.main.getCurrentUnitStats().pos, [cell[0] + 1,cell[1]]);

                        // Show hover effect if unit can be reached in melee
                        if (currentPath.length - 1 <= currentUnitStats.currentMoveRange && cell[0] < 11 && currentPath[currentPath.length - 1]) {
                            drawPath([cell[0] + 1,cell[1]], true);
                            body.className = 'cursor-left';
                            meleePossible = true;
                        }

                    // Mouse over from top
                    } else if (x >= cell[0] * tileSize && x <= cell[0] * tileSize + tileSize &&
                                y >= cell[1] * tileSize && y <= cell[1] * tileSize + 16 && range === 1) {
                        currentPath = findPath(map, rd.game.main.getCurrentUnitStats().pos, [cell[0],cell[1] - 1]);

                        // Show hover effect if unit can be reached in melee
                        if (currentPath.length - 1 <= currentUnitStats.currentMoveRange && cell[1] > 0 && currentPath[currentPath.length - 1]) {
                            drawPath([cell[0],cell[1] - 1], true);
                            body.className = 'cursor-bottom';
                            meleePossible = true;
                        }

                    // Mouse over from bottom
                    } else if (x >= cell[0] * tileSize && x <= cell[0] * tileSize + tileSize &&
                                y >= cell[1] * tileSize + 48 && y <= cell[1] * tileSize + 64 && range === 1) {
                        currentPath = findPath(map, rd.game.main.getCurrentUnitStats().pos, [cell[0],cell[1] + 1]);

                        // Show hover effect if unit can be reached in melee
                        if (currentPath.length - 1 <= currentUnitStats.currentMoveRange && cell[1] < 9 && currentPath[currentPath.length - 1]) {
                            drawPath([cell[0],cell[1] + 1], true);
                            body.className = 'cursor-top';
                            meleePossible = true;
                        }

                    // Center
                    } else {
                        canvas.renderAttackRange(cell, unitStats[hoverUnitId].attackRange);
                        canvas.renderMoveRange(unitStats[hoverUnitId], true);
                        body.className = 'cursor-help';
                        infoHoverEffect = true;
                    }

                    // Unit not attackable through melee
                    if (!meleePossible && !infoHoverEffect) {
                        canvas.renderAttackRange(cell, unitStats[hoverUnitId].attackRange);
                        canvas.renderMoveRange(unitStats[hoverUnitId], true);
                        body.className = 'cursor-help';
                    }

                    // Unit that is in range
                    rangedPossible = false;
                    if (isInRange && range > 1) {
                        body.className = 'cursor-ranged';
                        rangedPossible = true;
                    }

                // Unit from the same team
                } else {
                    canvas.renderAttackRange(cell, unitStats[hoverUnitId].attackRange);
                    canvas.renderMoveRange(unitStats[hoverUnitId], true);
                    body.className = 'cursor-help';
                }

                canvas.drawMovable({
                    lineWidth: 2,
                    lineRgbColor: 'team' + team,
                    fillRgbColor: 'team' + team,
                    opacity: 1,
                    x: unitStats[hoverUnitId].pos[0] * tileSize,
                    y: unitStats[hoverUnitId].pos[1] * tileSize
                });
            }
        }
    },


    /**
     * Draw a moveable path
     * @param {array} cell
     */
    drawPath = function(cell, hideAttackRange) {
        var type;

        // Now we know which tile we clicked and can calculate a path
        currentPath = findPath(map, rd.game.main.getCurrentUnitStats().pos, [cell[0],cell[1]]);

        // Add the current cell if there is no path
        if (currentPath.length === 0) {
            currentPath.push(rd.game.main.getCurrentUnitStats().pos);
            body.className = 'default';
        }

        // Show path if it is below the move range
        if (currentPath.length <= rd.game.main.getCurrentUnitStats().currentMoveRange + 1) {
            // Redraw base tiles
            canvas.clearUtils();
            canvas.highlightMovableTiles();

            // Current unit or no obstacle
            if (currentPath.length === 1) {
                canvas.renderAttackRange(rd.game.main.getCurrentUnitStats().pos, rd.game.main.getCurrentUnitStats().attackRange);
            }

            // Draw attack range
            if (currentPath.length > 1 && !hideAttackRange) {
                canvas.renderAttackRange(cell, rd.game.main.getCurrentUnitStats().attackRange);
            }

            // Move range
            canvas.renderMoveRange(rd.game.main.getCurrentUnitStats());

            // Highlight the path tiles
            for (var i = 0; i < currentPath.length; i++) {
                if (i === 0 || i === currentPath.length - 1) {
                    type = 'current';
                } else {
                    type = 'move';
                }

                canvas.drawMovable({
                    lineWidth: 2,
                    lineRgbColor: type,
                    fillRgbColor: type,
                    opacity: 1,
                    x: currentPath[i][0] * tileSize,
                    y: currentPath[i][1] * tileSize
                });
            }

            // Cursors
            if (currentPath.length === 1) {
                body.className = 'default';
            } else {
                body.className = 'cursor-move';
            }

        } else {
            // Redraw base tiles
            redrawUtils();
        }
    },


    /**
     * Handle a canvas click event
     * @param {object} e Event
     */
    canvasClick = function(e) {
        var x,
            y;

        // Stop if utils are disabled
        if (canvas.areUtilsDisabled()) {
            return false;
        }

        // Grab html page coords
        if (e.pageX !== undefined && e.pageY !== undefined) {
            x = e.pageX;
            y = e.pageY;
        } else {
            x = e.clientX + document.body.scrollLeft +
            document.documentElement.scrollLeft;
            y = e.clientY + document.body.scrollTop +
            document.documentElement.scrollTop;
        }

        // Make them relative to the canvas only
        x -= canvasTop.offsetLeft;
        y -= canvasTop.offsetTop;

        // Return tile x,y that we clicked
        var cell = [
                Math.floor(x / tileSize),
                Math.floor(y / tileSize)
            ],
            cellType = map[ cell[1] ][ cell[0] ],
            clickUnitId,
            team;

        // Click on unit
        if (typeof cellType === 'string') {
            var currentUnitStats = unitStats[rd.game.main.getCurrentUnitId()];
            clickUnitId = parseInt(cellType.replace('id-', ''));
            team = unitStats[clickUnitId].team;

            // Fight
            if (currentUnitStats.team !== team) {
                // Ranged attack
                if (rangedPossible) {
                    rd.game.combat.fight(rd.game.main.getCurrentUnitId(), clickUnitId);
                    body.className = 'default';
                    rd.canvas.main.disableUtils();
                }

                // Walk and then attack
                if (currentPath && currentPath.length > 1 && meleePossible) {
                    startWalking(currentPath[currentPath.length - 1], true, clickUnitId);
                    body.className = 'default';
                    rd.canvas.main.disableUtils();
                // Just attack
                } else if (meleePossible) {
                    rd.game.combat.fight(rd.game.main.getCurrentUnitId(), clickUnitId);
                    body.className = 'default';
                    rd.canvas.main.disableUtils();
                }
            }

            return false;
        }

        // Now we know which tile we clicked and can calculate a path
        currentPath = findPath(map, rd.game.main.getCurrentUnitStats().pos, [cell[0],cell[1]]);

        // Check if player can move to that field
        if (currentPath.length <= rd.game.main.getCurrentUnitStats().currentMoveRange + 1 && canvas.isMovableField(cell)) {
            startWalking(cell);
        }
    },


    /**
     * Start the walk animation and occupy the new field
     * @param {array}   cell
     * @param {boolean} fight
     */
    startWalking = function(cell, fight, enemyId) {
        var currentUnit = rd.game.main.getCurrentUnit();

        // Walk animation
        currentUnit.walk({
            path: currentPath,
            fight: fight,
            enemyId: enemyId
        });

        canvas.disableUtils();

        // Reset old position
        map[ rd.game.main.getCurrentUnitStats().pos[1] ][ rd.game.main.getCurrentUnitStats().pos[0] ] = 0;

        // New position
        map[ cell[1] ][ cell[0] ] = 'id-' + rd.game.main.getCurrentUnitId();
    },


    /**
     * Redraw all utils
     */
    redrawUtils = function() {
        currentPath = rd.game.main.getCurrentUnitStats().pos;
        canvas.clearUtils();
        canvas.highlightMovableTiles();
        canvas.renderAttackRange(currentPath, rd.game.main.getCurrentUnitStats().attackRange);
        canvas.renderMoveRange(rd.game.main.getCurrentUnitStats());

        canvas.drawMovable({
            lineWidth: 2,
            lineRgbColor: 'current',
            fillRgbColor: 'current',
            opacity: 1,
            x: currentPath[0] * tileSize,
            y: currentPath[1] * tileSize
        });

        body.className = 'default';
    },


    /**
     * Get the map array
     * @memberOf rd.game.map
     * @return {array}
     */
    getMap = function() {
        return map;
    },


    /**
     * Update the value of a map tile
     * @param {integer} x
     * @param {integer} y
     * @param {integer} value
     */
    updateMap = function(x, y, value) {
        map[y][x] = value;
    },


    /**
     * Find a path using the A * algorithm
     * http://buildnewgames.com/astar/
     * @param  {array} world
     * @param  {array} pathStart
     * @param  {array} pathEnd
     * @return {array}
     */
    findPath = function(world, pathStart, pathEnd) {
        // Shortcuts for speed
        var abs = Math.abs;

        // the world data are integers:
        // anything higher than this number is considered blocked
        // this is handy if you use numbered sprites, more than one
        // of which is walkable road, grass, mud, etc
        var maxWalkableTileNum = 0;

        // keep track of the world dimensions
        // Note that this A-star implementation expects the world array to be square:
        // it must have equal height and width. If your game world is rectangular,
        // just fill the array with dummy values to pad the empty space.
        var worldWidth = world[0].length;
        var worldHeight = world.length;
        var worldSize = worldWidth * worldHeight;

        // which heuristic should we use?
        // default: no diagonals (Manhattan)
        var distanceFunction = ManhattanDistance;
        var findNeighbours = function() {}; // empty

        // distanceFunction functions
        // these return how far away a point is to another
        function ManhattanDistance(Point, Goal) {
            // linear movement - no diagonals - just cardinal directions (NSEW)
            return abs(Point.x - Goal.x) + abs(Point.y - Goal.y);
        }

        // Neighbours functions, used by findNeighbours function
        // to locate adjacent available cells that aren't blocked

        // Returns every available North, South, East or West
        // cell that is empty. No diagonals,
        // unless distanceFunction function is not Manhattan
        function Neighbours(x, y) {
            var N = y - 1,
            S = y + 1,
            E = x + 1,
            W = x - 1,
            myN = N > -1 && canWalkHere(x, N),
            myS = S < worldHeight && canWalkHere(x, S),
            myE = E < worldWidth && canWalkHere(E, y),
            myW = W > -1 && canWalkHere(W, y),
            result = [];
            if (myN)
            result.push({x: x, y: N});
            if (myE)
            result.push({x: E, y: y});
            if (myS)
            result.push({x: x, y: S});
            if (myW)
            result.push({x: W, y: y});
            findNeighbours(myN, myS, myE, myW, N, S, E, W, result);
            return result;
        }

        // returns boolean value (world cell is available and open)
        function canWalkHere(y, x) {
            return ((world[x] !== null) &&
                (world[x][y] !== null) &&
                (world[x][y] <= maxWalkableTileNum));
        }

        // Node function, returns a new object with Node properties
        // Used in the calculatePath function to store route costs, etc.
        function Node(Parent, Point) {
            var newNode = {
                // pointer to another Node object
                Parent: Parent,
                // array index of this Node in the world linear array
                value: Point.x + (Point.y * worldWidth),
                // the location coordinates of this Node
                x: Point.x,
                y: Point.y,
                // the heuristic estimated cost
                // of an entire path using this node
                f: 0,
                // the distanceFunction cost to get
                // from the starting point to this node
                g: 0
            };

            return newNode;
        }

        // Path function, executes AStar algorithm operations
        function calculatePath() {
            // create Nodes from the Start and End x,y coordinates
            var mypathStart = Node(null, {x: pathStart[0], y: pathStart[1]});
            var mypathEnd = Node(null, {x: pathEnd[0], y: pathEnd[1]});
            // create an array that will contain all world cells
            var AStar = new Array(worldSize);
            // list of currently open Nodes
            var Open = [mypathStart];
            // list of closed Nodes
            var Closed = [];
            // list of the final output array
            var result = [];
            // reference to a Node (that is nearby)
            var myNeighbours;
            // reference to a Node (that we are considering now)
            var myNode;
            // reference to a Node (that starts a path in question)
            var myPath;
            // temp integer variables used in the calculations
            var length, max, min, i, j;
            // iterate through the open list until none are left
            while (length = Open.length) {
                max = worldSize;
                min = -1;
                for (i = 0; i < length; i++) {
                    if (Open[i].f < max) {
                        max = Open[i].f;
                        min = i;
                    }
                }
                // grab the next node and remove it from Open array
                myNode = Open.splice(min, 1)[0];
                // is it the destination node?
                if (myNode.value === mypathEnd.value) {
                    myPath = Closed[Closed.push(myNode) - 1];
                    do {
                        result.push([myPath.x, myPath.y]);
                    }
                    while (myPath = myPath.Parent);
                    // clear the working arrays
                    AStar = Closed = Open = [];
                    // we want to return start to finish
                    result.reverse();
                } else { // not the destination
                    // find which nearby nodes are walkable
                    myNeighbours = Neighbours(myNode.x, myNode.y);
                    // test each one that hasn't been tried already
                    for (i = 0, j = myNeighbours.length; i < j; i++) {
                        myPath = Node(myNode, myNeighbours[i]);
                        if (!AStar[myPath.value]) {
                            // estimated cost of this particular route so far
                            myPath.g = myNode.g + distanceFunction(myNeighbours[i], myNode);
                            // estimated cost of entire guessed route to the destination
                            myPath.f = myPath.g + distanceFunction(myNeighbours[i], mypathEnd);
                            // remember this new path for testing above
                            Open.push(myPath);
                            // mark this node in the world graph as visited
                            AStar[myPath.value] = true;
                        }
                    }
                    // remember this route as having no more untested options
                    Closed.push(myNode);
                }
            } // keep iterating until the Open list is empty
            return result;
        }

        // actually calculate the a-star path!
        // this returns an array of coordinates
        // that is empty if no path is possible
        return calculatePath();
    },


    /**
     * Set new unit stats
     */
    updateUnitStats = function() {
        unitStats = rd.game.units.getStats();
    },


    /**
     * Initialization
     * @memberOf rd.game.map
     */
    init = function() {
        eventListener();
    };


    /**
     * Return public functions
     */
    return {
        init: init,
        getMap: getMap,
        updateMap: updateMap,
        redrawUtils: redrawUtils,
        updateUnitStats: updateUnitStats
    };

})());

/**
 * Units controller
 * @namespace rd.game.ui
 */
rd.define('game.ui', (function() {

    /**
     * Variables
     */
    var endTurn = document.getElementById('end-turn'),


    /**
     * Register the event listener
     */
    eventListener = function() {
        endTurn.addEventListener('click', endTurnClick);
    },

    
    /**
     * End turn button click actions
     */
    endTurnClick = function() {
        rd.game.main.endTurn();
    },


    /**
     * Initialization
     * @memberOf rd.game.ui
     */
    init = function() {
        eventListener();
    };


    /**
     * Return public functions
     */
    return {
        init: init
    };

})());
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
                unit.wounded.setPos([0, 128]);
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
                unit.wounded.setPos([0, 0]);
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
            unit.wounded.update(delta);

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
     * Set new unit stats
     */
    updateUnitStats = function() {
        unitStats = rd.game.units.getStats();
    },


    /**
     * Set new units array
     */
    updateUnits = function() {
        units = rd.game.units.get();
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
        
        rd.game.map.redrawUtils();
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
        endTurn: endTurn,
        updateUnitStats: updateUnitStats,
        updateUnits: updateUnits
    };

})());

/**
 * Menus
 * @namespace rd.ui.menu
 */
rd.define('ui.menu', (function() {

    /**
     * Variables
     */
    var menuMain = document.getElementById('menu-main'),
        itemContinue = document.getElementById('item-continue'),
        lightning = document.getElementById('lightning'),


    /**
     * Register event listener
     */
    eventListener = function() {
        itemContinue.addEventListener('click', function() {
            menuMain.className = menuMain.className.replace(/ show/i, '');
            rd.game.main.init();
        });
    },


    /**
     * Initialization
     */
    init = function() {
        eventListener();

        lightning.className = lightning.className.replace(/ show/i, '');
        menuMain.className += ' show';
    };


    /**
     * Return public functions
     */
    return {
        init: init
    };

})());

/**
 * Splash view
 * @namespace rd.splash
 * @return {object} Public functions
 */
rd.define('splash', (function() {

    /**
     * Variables
     */
    var lightning = document.getElementById('lightning'),
        loading = document.getElementById('loading'),
        splash = document.getElementById('splash'),
        fog = document.getElementById('fog'),
        logo = document.getElementById('logo'),
        video,
        effects,
        music,
        sound = false,


    /**
     * Register event listener
     */
    eventListener = function() {
        video = document.getElementById('video');
        video.addEventListener('canplaythrough', function() {
            if (sound) {
                loadSounds(function() {
                    splashAnimations();
                });
            } else {
                splashAnimations();
            }
        });
    },


    /**
     * Register and load the sounds
     * @param {function} callback
     */
    loadSounds = function(callback) {
        var soundCount = 2,
            loadedCount = 0;

        effects = new Howl({
            urls: ['sounds/effects.ogg', 'sounds/effects.mp3'],
            volume: 0.5,
            sprite: {
                splash: [0, 16000],
                thunder: [16000, 11000]
            },
            onload: function() {
                loadedCount++;
                if (loadedCount === soundCount) {
                    callback();
                }
            }
        });

        music = new Howl({
            urls: ['sounds/test7.mp3'],
            volume: 0.5,
            onload: function() {
                loadedCount++;
                if (loadedCount === soundCount) {
                    callback();
                }
            }
        });
    },


    /**
     * Splash screen intro animations
     */
    splashAnimations = function() {
        video.play();
        effects.play('splash');
        loading.className += ' hide';


        requestTimeout(function() {
            lightning.className += ' show';
        }, 1000);

        requestTimeout(function() {
            music.play();
        }, 3000);

        requestTimeout(function() {
            logo.className += ' show';
        }, 6400);

        requestTimeout(function(){
            effects.play('thunder');
            splash.className += ' hide';
            fog.className += ' show';
            
            rd.ui.menu.init();

            requestTimeout(function() {
                splash.remove();
            }, 2000);
        }, 14000);
    },


    /**
     * Get the video html
     * @return {string}
     */
    getVideoHtml = function() {
        return '<video id="video" preload="metadata">' +
                    '<source src="videos/embers.mp4" type="video/mp4">' +
                    '<source src="videos/embers.webm" type="video/webm">' +
                '</video>';
    },


    /**
     * Initialization
     */
    init = function(skip) {
        if (skip) {
            splash.className += ' hide';
            lightning.className += ' show';
            fog.className += ' show';

            rd.ui.menu.init();

            requestTimeout(function() {
                splash.remove();
            }, 1000);
        } else {
            logo.insertAdjacentHTML('afterend', getVideoHtml());
            eventListener();
        }
    };


    /**
     * Return public functions
     */
    return {
        init: init
    };

})());

/**
 * Main controller
 * @namespace rd.main
 */
rd.define('main', (function() {

    /**
     * Variables
     */
    var resourcesList = [
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
            'img/units/primary0.png',
            'img/units/primary1.png',
            'img/units/primary2.png',
            'img/units/primary3.png',
            'img/units/primary4.png',
            'img/units/primary5.png',
            'img/units/secondary0.png',
            'img/units/secondary1.png',
            'img/units/secondary2.png',
            'img/units/wounded.png',
            'img/cursors/default.png',
            'img/cursors/bottom.png',
            'img/cursors/help.png',
            'img/cursors/left.png',
            'img/cursors/move.png',
            'img/cursors/ranged.png',
            'img/cursors/right.png',
            'img/cursors/top.png',
            'img/tileset.png',
            'img/bg.jpg',
            'img/splash-bg.jpg',
            'img/fog.png',
            'img/main-menu.png'
        ],


    /**
     * Initialization
     * @memberOf rd.main
     */
    init = function() {
        rd.utils.resources.load(resourcesList);

        /** Show intro after all resources have been loaded */
        rd.utils.resources.onReady(function() {
            rd.splash.init(true);
        });
    };


    /**
     * Return public functions
     */
    return {
        init: init
    };

})());

window.onload = function() {
    rd.main.init();
};

/*!
 *  howler.js v1.1.27
 *  howlerjs.com
 *
 *  (c) 2013-2015, James Simpson of GoldFire Studios
 *  goldfirestudios.com
 *
 *  MIT License
 */
!function(){var e={},o=null,n=!0,t=!1;try{"undefined"!=typeof AudioContext?o=new AudioContext:"undefined"!=typeof webkitAudioContext?o=new webkitAudioContext:n=!1}catch(r){n=!1}if(!n)if("undefined"!=typeof Audio)try{new Audio}catch(r){t=!0}else t=!0;if(n){var a="undefined"==typeof o.createGain?o.createGainNode():o.createGain();a.gain.value=1,a.connect(o.destination)}var i=function(e){this._volume=1,this._muted=!1,this.usingWebAudio=n,this.ctx=o,this.noAudio=t,this._howls=[],this._codecs=e,this.iOSAutoEnable=!0};i.prototype={volume:function(e){var o=this;if(e=parseFloat(e),e>=0&&1>=e){o._volume=e,n&&(a.gain.value=e);for(var t in o._howls)if(o._howls.hasOwnProperty(t)&&o._howls[t]._webAudio===!1)for(var r=0;r<o._howls[t]._audioNode.length;r++)o._howls[t]._audioNode[r].volume=o._howls[t]._volume*o._volume;return o}return n?a.gain.value:o._volume},mute:function(){return this._setMuted(!0),this},unmute:function(){return this._setMuted(!1),this},_setMuted:function(e){var o=this;o._muted=e,n&&(a.gain.value=e?0:o._volume);for(var t in o._howls)if(o._howls.hasOwnProperty(t)&&o._howls[t]._webAudio===!1)for(var r=0;r<o._howls[t]._audioNode.length;r++)o._howls[t]._audioNode[r].muted=e},codecs:function(e){return this._codecs[e]},_enableiOSAudio:function(){var e=this;if(!o||!e._iOSEnabled&&/iPhone|iPad|iPod/i.test(navigator.userAgent)){e._iOSEnabled=!1;var n=function(){var t=o.createBuffer(1,1,22050),r=o.createBufferSource();r.buffer=t,r.connect(o.destination),"undefined"==typeof r.start?r.noteOn(0):r.start(0),setTimeout(function(){(r.playbackState===r.PLAYING_STATE||r.playbackState===r.FINISHED_STATE)&&(e._iOSEnabled=!0,e.iOSAutoEnable=!1,window.removeEventListener("touc",n,!1))},0)};return window.addEventListener("touc",n,!1),e}}};var u=null,d={};t||(u=new Audio,d={mp3:!!u.canPlayType("audio/mpeg;").replace(/^no$/,""),opus:!!u.canPlayType('audio/ogg; codecs="opus"').replace(/^no$/,""),ogg:!!u.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/,""),wav:!!u.canPlayType('audio/wav; codecs="1"').replace(/^no$/,""),aac:!!u.canPlayType("audio/aac;").replace(/^no$/,""),m4a:!!(u.canPlayType("audio/x-m4a;")||u.canPlayType("audio/m4a;")||u.canPlayType("audio/aac;")).replace(/^no$/,""),mp4:!!(u.canPlayType("audio/x-mp4;")||u.canPlayType("audio/mp4;")||u.canPlayType("audio/aac;")).replace(/^no$/,""),weba:!!u.canPlayType('audio/webm; codecs="vorbis"').replace(/^no$/,"")});var l=new i(d),f=function(e){var t=this;t._autoplay=e.autoplay||!1,t._buffer=e.buffer||!1,t._duration=e.duration||0,t._format=e.format||null,t._loop=e.loop||!1,t._loaded=!1,t._sprite=e.sprite||{},t._src=e.src||"",t._pos3d=e.pos3d||[0,0,-.5],t._volume=void 0!==e.volume?e.volume:1,t._urls=e.urls||[],t._rate=e.rate||1,t._model=e.model||null,t._onload=[e.onload||function(){}],t._onloaderror=[e.onloaderror||function(){}],t._onend=[e.onend||function(){}],t._onpause=[e.onpause||function(){}],t._onplay=[e.onplay||function(){}],t._onendTimer=[],t._webAudio=n&&!t._buffer,t._audioNode=[],t._webAudio&&t._setupAudioNode(),"undefined"!=typeof o&&o&&l.iOSAutoEnable&&l._enableiOSAudio(),l._howls.push(t),t.load()};if(f.prototype={load:function(){var e=this,o=null;if(t)return void e.on("loaderror");for(var n=0;n<e._urls.length;n++){var r,a;if(e._format)r=e._format;else{if(a=e._urls[n],r=/^data:audio\/([^;,]+);/i.exec(a),r||(r=/\.([^.]+)$/.exec(a.split("?",1)[0])),!r)return void e.on("loaderror");r=r[1].toLowerCase()}if(d[r]){o=e._urls[n];break}}if(!o)return void e.on("loaderror");if(e._src=o,e._webAudio)_(e,o);else{var u=new Audio;u.addEventListener("error",function(){u.error&&4===u.error.code&&(i.noAudio=!0),e.on("loaderror",{type:u.error?u.error.code:0})},!1),e._audioNode.push(u),u.src=o,u._pos=0,u.preload="auto",u.volume=l._muted?0:e._volume*l.volume();var f=function(){e._duration=Math.ceil(10*u.duration)/10,0===Object.getOwnPropertyNames(e._sprite).length&&(e._sprite={_default:[0,1e3*e._duration]}),e._loaded||(e._loaded=!0,e.on("load")),e._autoplay&&e.play(),u.removeEventListener("canplaythrough",f,!1)};u.addEventListener("canplaythrough",f,!1),u.load()}return e},urls:function(e){var o=this;return e?(o.stop(),o._urls="string"==typeof e?[e]:e,o._loaded=!1,o.load(),o):o._urls},play:function(e,n){var t=this;return"function"==typeof e&&(n=e),e&&"function"!=typeof e||(e="_default"),t._loaded?t._sprite[e]?(t._inactiveNode(function(r){r._sprite=e;var a=r._pos>0?r._pos:t._sprite[e][0]/1e3,i=0;t._webAudio?(i=t._sprite[e][1]/1e3-r._pos,r._pos>0&&(a=t._sprite[e][0]/1e3+a)):i=t._sprite[e][1]/1e3-(a-t._sprite[e][0]/1e3);var u,d=!(!t._loop&&!t._sprite[e][2]),f="string"==typeof n?n:Math.round(Date.now()*Math.random())+"";if(function(){var o={id:f,sprite:e,loop:d};u=setTimeout(function(){!t._webAudio&&d&&t.stop(o.id).play(e,o.id),t._webAudio&&!d&&(t._nodeById(o.id).paused=!0,t._nodeById(o.id)._pos=0,t._clearEndTimer(o.id)),t._webAudio||d||t.stop(o.id),t.on("end",f)},1e3*i),t._onendTimer.push({timer:u,id:o.id})}(),t._webAudio){var _=t._sprite[e][0]/1e3,s=t._sprite[e][1]/1e3;r.id=f,r.paused=!1,p(t,[d,_,s],f),t._playStart=o.currentTime,r.gain.value=t._volume,"undefined"==typeof r.bufferSource.start?d?r.bufferSource.noteGrainOn(0,a,86400):r.bufferSource.noteGrainOn(0,a,i):d?r.bufferSource.start(0,a,86400):r.bufferSource.start(0,a,i)}else{if(4!==r.readyState&&(r.readyState||!navigator.isCocoonJS))return t._clearEndTimer(f),function(){var o=t,a=e,i=n,u=r,d=function(){o.play(a,i),u.removeEventListener("canplaythrough",d,!1)};u.addEventListener("canplaythrough",d,!1)}(),t;r.readyState=4,r.id=f,r.currentTime=a,r.muted=l._muted||r.muted,r.volume=t._volume*l.volume(),setTimeout(function(){r.play()},0)}return t.on("play"),"function"==typeof n&&n(f),t}),t):("function"==typeof n&&n(),t):(t.on("load",function(){t.play(e,n)}),t)},pause:function(e){var o=this;if(!o._loaded)return o.on("play",function(){o.pause(e)}),o;o._clearEndTimer(e);var n=e?o._nodeById(e):o._activeNode();if(n)if(n._pos=o.pos(null,e),o._webAudio){if(!n.bufferSource||n.paused)return o;n.paused=!0,"undefined"==typeof n.bufferSource.stop?n.bufferSource.noteOff(0):n.bufferSource.stop(0)}else n.pause();return o.on("pause"),o},stop:function(e){var o=this;if(!o._loaded)return o.on("play",function(){o.stop(e)}),o;o._clearEndTimer(e);var n=e?o._nodeById(e):o._activeNode();if(n)if(n._pos=0,o._webAudio){if(!n.bufferSource||n.paused)return o;n.paused=!0,"undefined"==typeof n.bufferSource.stop?n.bufferSource.noteOff(0):n.bufferSource.stop(0)}else isNaN(n.duration)||(n.pause(),n.currentTime=0);return o},mute:function(e){var o=this;if(!o._loaded)return o.on("play",function(){o.mute(e)}),o;var n=e?o._nodeById(e):o._activeNode();return n&&(o._webAudio?n.gain.value=0:n.muted=!0),o},unmute:function(e){var o=this;if(!o._loaded)return o.on("play",function(){o.unmute(e)}),o;var n=e?o._nodeById(e):o._activeNode();return n&&(o._webAudio?n.gain.value=o._volume:n.muted=!1),o},volume:function(e,o){var n=this;if(e=parseFloat(e),e>=0&&1>=e){if(n._volume=e,!n._loaded)return n.on("play",function(){n.volume(e,o)}),n;var t=o?n._nodeById(o):n._activeNode();return t&&(n._webAudio?t.gain.value=e:t.volume=e*l.volume()),n}return n._volume},loop:function(e){var o=this;return"boolean"==typeof e?(o._loop=e,o):o._loop},sprite:function(e){var o=this;return"object"==typeof e?(o._sprite=e,o):o._sprite},pos:function(e,n){var t=this;if(!t._loaded)return t.on("load",function(){t.pos(e)}),"number"==typeof e?t:t._pos||0;e=parseFloat(e);var r=n?t._nodeById(n):t._activeNode();if(r)return e>=0?(t.pause(n),r._pos=e,t.play(r._sprite,n),t):t._webAudio?r._pos+(o.currentTime-t._playStart):r.currentTime;if(e>=0)return t;for(var a=0;a<t._audioNode.length;a++)if(t._audioNode[a].paused&&4===t._audioNode[a].readyState)return t._webAudio?t._audioNode[a]._pos:t._audioNode[a].currentTime},pos3d:function(e,o,n,t){var r=this;if(o="undefined"!=typeof o&&o?o:0,n="undefined"!=typeof n&&n?n:-.5,!r._loaded)return r.on("play",function(){r.pos3d(e,o,n,t)}),r;if(!(e>=0||0>e))return r._pos3d;if(r._webAudio){var a=t?r._nodeById(t):r._activeNode();a&&(r._pos3d=[e,o,n],a.panner.setPosition(e,o,n),a.panner.panningModel=r._model||"HRTF")}return r},fade:function(e,o,n,t,r){var a=this,i=Math.abs(e-o),u=e>o?"down":"up",d=i/.01,l=n/d;if(!a._loaded)return a.on("load",function(){a.fade(e,o,n,t,r)}),a;a.volume(e,r);for(var f=1;d>=f;f++)!function(){var e=a._volume+("up"===u?.01:-.01)*f,n=Math.round(1e3*e)/1e3,i=o;setTimeout(function(){a.volume(n,r),n===i&&t&&t()},l*f)}()},fadeIn:function(e,o,n){return this.volume(0).play().fade(0,e,o,n)},fadeOut:function(e,o,n,t){var r=this;return r.fade(r._volume,e,o,function(){n&&n(),r.pause(t),r.on("end")},t)},_nodeById:function(e){for(var o=this,n=o._audioNode[0],t=0;t<o._audioNode.length;t++)if(o._audioNode[t].id===e){n=o._audioNode[t];break}return n},_activeNode:function(){for(var e=this,o=null,n=0;n<e._audioNode.length;n++)if(!e._audioNode[n].paused){o=e._audioNode[n];break}return e._drainPool(),o},_inactiveNode:function(e){for(var o=this,n=null,t=0;t<o._audioNode.length;t++)if(o._audioNode[t].paused&&4===o._audioNode[t].readyState){e(o._audioNode[t]),n=!0;break}if(o._drainPool(),!n){var r;if(o._webAudio)r=o._setupAudioNode(),e(r);else{o.load(),r=o._audioNode[o._audioNode.length-1];var a=navigator.isCocoonJS?"canplaythrough":"loadedmetadata",i=function(){r.removeEventListener(a,i,!1),e(r)};r.addEventListener(a,i,!1)}}},_drainPool:function(){var e,o=this,n=0;for(e=0;e<o._audioNode.length;e++)o._audioNode[e].paused&&n++;for(e=o._audioNode.length-1;e>=0&&!(5>=n);e--)o._audioNode[e].paused&&(o._webAudio&&o._audioNode[e].disconnect(0),n--,o._audioNode.splice(e,1))},_clearEndTimer:function(e){for(var o=this,n=0,t=0;t<o._onendTimer.length;t++)if(o._onendTimer[t].id===e){n=t;break}var r=o._onendTimer[n];r&&(clearTimeout(r.timer),o._onendTimer.splice(n,1))},_setupAudioNode:function(){var e=this,n=e._audioNode,t=e._audioNode.length;return n[t]="undefined"==typeof o.createGain?o.createGainNode():o.createGain(),n[t].gain.value=e._volume,n[t].paused=!0,n[t]._pos=0,n[t].readyState=4,n[t].connect(a),n[t].panner=o.createPanner(),n[t].panner.panningModel=e._model||"equalpower",n[t].panner.setPosition(e._pos3d[0],e._pos3d[1],e._pos3d[2]),n[t].panner.connect(n[t]),n[t]},on:function(e,o){var n=this,t=n["_on"+e];if("function"==typeof o)t.push(o);else for(var r=0;r<t.length;r++)o?t[r].call(n,o):t[r].call(n);return n},off:function(e,o){var n=this,t=n["_on"+e],r=o?o.toString():null;if(r){for(var a=0;a<t.length;a++)if(r===t[a].toString()){t.splice(a,1);break}}else n["_on"+e]=[];return n},unload:function(){for(var o=this,n=o._audioNode,t=0;t<o._audioNode.length;t++)n[t].paused||(o.stop(n[t].id),o.on("end",n[t].id)),o._webAudio?n[t].disconnect(0):n[t].src="";for(t=0;t<o._onendTimer.length;t++)clearTimeout(o._onendTimer[t].timer);var r=l._howls.indexOf(o);null!==r&&r>=0&&l._howls.splice(r,1),delete e[o._src],o=null}},n)var _=function(o,n){if(n in e)return o._duration=e[n].duration,void c(o);if(/^data:[^;]+;base64,/.test(n)){for(var t=atob(n.split(",")[1]),r=new Uint8Array(t.length),a=0;a<t.length;++a)r[a]=t.charCodeAt(a);s(r.buffer,o,n)}else{var i=new XMLHttpRequest;i.open("GET",n,!0),i.responseType="arraybuffer",i.onload=function(){s(i.response,o,n)},i.onerror=function(){o._webAudio&&(o._buffer=!0,o._webAudio=!1,o._audioNode=[],delete o._gainNode,delete e[n],o.load())};try{i.send()}catch(u){i.onerror()}}},s=function(n,t,r){o.decodeAudioData(n,function(o){o&&(e[r]=o,c(t,o))},function(e){t.on("loaderror")})},c=function(e,o){e._duration=o?o.duration:e._duration,0===Object.getOwnPropertyNames(e._sprite).length&&(e._sprite={_default:[0,1e3*e._duration]}),e._loaded||(e._loaded=!0,e.on("load")),e._autoplay&&e.play()},p=function(n,t,r){var a=n._nodeById(r);a.bufferSource=o.createBufferSource(),a.bufferSource.buffer=e[n._src],a.bufferSource.connect(a.panner),a.bufferSource.loop=t[0],t[0]&&(a.bufferSource.loopStart=t[1],a.bufferSource.loopEnd=t[1]+t[2]),a.bufferSource.playbackRate.value=n._rate};"function"==typeof define&&define.amd&&define(function(){return{Howler:l,Howl:f}}),"undefined"!=typeof exports&&(exports.Howler=l,exports.Howl=f),"undefined"!=typeof window&&(window.Howler=l,window.Howl=f)}();