var rd = {};


/**
 * Defines a namespace
 * @param {string}   namespace Namespace chain as string
 * @param {function} logic     
 */
rd.define = function( namespace, logic ){
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
 * @param {function} 	fn 		The callback function
 * @param {int} 		delay 	The delay in milliseconds
 */
window.requestTimeout = function(fn, delay){
    if( !window.requestAnimationFrame       && 
        !window.webkitRequestAnimationFrame && 
        !(window.mozRequestAnimationFrame && window.mozCancelRequestAnimationFrame) && // Firefox 5 ships without cancel support
        !window.oRequestAnimationFrame      && 
        !window.msRequestAnimationFrame)
            return window.setTimeout(fn, delay);
            
    var start = new Date().getTime(),
        handle = new Object();
        
    function loop(){
        var current = new Date().getTime(),
            delta = current - start;
            
        delta >= delay ? fn.call() : handle.value = requestAnimFrame(loop);
    }
    
    handle.value = requestAnimFrame(loop);
    return handle;
};
/**
 * Resources controller
 * @namespace utils.resources
 */
rd.define('utils.resources', (function() {

    /**
     * Variables
     */
    var resourceCache = {},
        readyCallbacks = [],


    /**
     * Load an image url or an array of image urls
     * @param  {[type]} urlOrArr [description]
     */
    load = function(urlOrArr) {
        if(urlOrArr instanceof Array) {
            urlOrArr.forEach(function(url) {
                _load(url);
            });
        }
        else {
            _load(urlOrArr);
        }
    },

    _load = function(url) {
        if(resourceCache[url]) {
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

    get = function(url) {
        return resourceCache[url];
    },

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

    var me = this,


    update = function(dt) {
        // Stay not yet working correct
        if (!(me.stay && me.done)) {
            me._index += me.speed*dt;
            // Always start with first frame
            if( me.frames.length === 1 ){
                me._index = 0;
            }
        }
    },


    render = function(ctx) {
        var frame;

        if(me.speed > 0) {
            var max = me.frames.length;
            var idx = Math.floor(me._index);
            frame = me.frames[idx % max];

            if(me.once && idx >= max) {
                me.done = true;
            }

            // End animation
            if( idx >= max ){
                me._index = 0;
            }
        }
        else {
            frame = 0;
        }

        me.currentFrame = frame;


        var x = me.pos[0];
        var y = me.pos[1];

        if(me.dir == 'vertical') {
            y += frame * me.size[1];
        }
        else {
            x += frame * me.size[0];
        }

        //if it is done and it has to run once, we dont update
        if(!(me.done && me.once)){
            ctx.drawImage(rd.utils.resources.get(me.url),
                          x, y,
                          me.size[0], me.size[1],
                          0, 0,
                          me.size[0], me.size[1]);
        }
    },


    setFrames = function(newFrames) {
        me.frames = newFrames;
    },


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
        setFrames: setFrames
    };

});
/**
 * Unit
 * @namespace rd.game.unit
 */
rd.define('game.unit', function(cfg) {

    /**
     * Variables
     */
    var me = this,


    stop = function() {
        me.skin.setPos([0, 128]);
        me.skin.setFrames([0]);

        me.gear.head.setPos([0, 128]);
        me.gear.head.setFrames([0]);

        me.gear.torso.setPos([0, 128]);
        me.gear.torso.setFrames([0]);
    },


    walk = function() {
        me.skin.setPos([0, 0]);
        me.skin.setFrames([0, 1, 2, 3]);

        me.gear.head.setPos([0, 0]);
        me.gear.head.setFrames([0, 1, 2, 3]);

        me.gear.torso.setPos([0, 0]);
        me.gear.torso.setFrames([0, 1, 2, 3]);
    },


    attack = function() {
        me.skin.setPos([0, 128]);
        me.skin.setFrames([0, 1, 2]);

        me.gear.head.setPos([0, 128]);
        me.gear.head.setFrames([0, 1, 2]);

        me.gear.torso.setPos([0, 128]);
        me.gear.torso.setFrames([0, 1, 2]);
    },


    get = function() {
        return me;
    };

    me.name = cfg.name;
    me.skin = cfg.skin;
    me.pos = cfg.pos;
    me.gear = cfg.gear;
    me.skills = cfg.skills;
    me.dead = cfg.dead;
    me.visible = cfg.visible || true;
    me.wounded = cfg.wounded;
    me.count = cfg.count;
    me.weapon = cfg.weapon;
    me.health = cfg.health || 0;
    me.attributes = cfg.attributes;


    /**
     * Return public functions
     */
    return {
        get: get,
        walk: walk,
        stop: stop,
        attack: attack
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
    var fight = function(attacker, defender) {
        var attackerStats = attacker.get(),
            defenderStats = defender.get(),
            attackerAttr = attackerStats.attributes,
            defenderAttr = defenderStats.attributes;

        var baseDmg = attackerStats.count * attackerAttr.attack;

        console.log('base damage:', baseDmg);

        var modifier = 0;

        if (attackerAttr.attack > defenderAttr.defense) {
            console.log('bonus:', modifier);
            modifier = 0.05 * (attackerAttr.attack - defenderAttr.defense);
        } else if (attackerAttr.attack < defenderAttr.defense) {
            console.log('reduction:', modifier);
            modifier = 0.05 * (attackerAttr.attack - defenderAttr.defense);
        }

        var modifiedDmg = baseDmg * (1 + modifier);

        console.log('modified damage:', modifiedDmg);

        var kills = modifiedDmg / 10;

        console.log('kills:', kills);

        var woundedCheck = kills - Math.floor(kills)

        console.log('wounded check:', woundedCheck);

        var wounded = (woundedCheck > 0 && woundedCheck < 0.5) ? true : false;

        // var wounded = kills % 1 !== 0 ? true : false;

        console.log('wounded:', wounded);

        kills = wounded ? Math.floor(kills) : Math.round(kills);

        console.log('rounded kills:', kills);
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

    add = function(newUnit) {
        units.push(new rd.game.unit(newUnit));
    },

    
    get = function() {
        return units;
    },


    getStats = function() {
        var returnArray = [];
        for (var i=0; i<units.length; i++) {
            returnArray.push(units[i].get());
        }
        return returnArray;
    },


    init = function() {
        add({
            name: 'Nico',
            pos: [0, 0],
            skin: new rd.utils.sprite({
                url: 'img/units/skin1.png',
                pos: [0, 128],
                size: [64, 64],
                speed: 4,
                frames: [0]
            }),
            gear: {
                head: new rd.utils.sprite({
                    url: 'img/units/head1.png',
                    pos: [0, 128],
                    size: [64, 64],
                    speed: 4,
                    frames: [0]
                }),
                torso: new rd.utils.sprite({
                    url: 'img/units/torso1.png',
                    pos: [0, 128],
                    size: [64, 64],
                    speed: 4,
                    frames: [0]
                }),
                legs: 0
            },
            count: 10,
            weapons: {
                primary: 0,
                secondary: 0
            },
            attributes: {
                attack: 5,
                defense: 5,
                attackRange: 1,
                moveRange: 5
            }
        });

        add({
            name: 'Nico Klon',
            pos: [64, 64],
            skin: new rd.utils.sprite({
                url: 'img/units/skin4.png',
                pos: [0, 192],
                size: [64, 64],
                speed: 4,
                frames: [0]
            }),
            gear: {
                head: new rd.utils.sprite({
                    url: 'img/units/head2.png',
                    pos: [0, 192],
                    size: [64, 64],
                    speed: 4,
                    frames: [0]
                }),
                torso: new rd.utils.sprite({
                    url: 'img/units/torso0.png',
                    pos: [0, 192],
                    size: [64, 64],
                    speed: 4,
                    frames: [0]
                }),
                legs: 0
            },
            count: 10,
            weapons: {
                primary: 0,
                secondary: 0
            },
            attributes: {
                attack: 5,
                defense: 5,
                attackRange: 6,
                moveRange: 4
            }
        });
    };


    /**
     * Return public functions
     */
    return {
        init: init,
        get: get,
        getStats: getStats
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
    var map =  [[0,0,0,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,1,0,0,0,0],
                [0,0,0,0,0,0,0,1,0,0,0,0],
                [0,0,0,1,1,1,1,1,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0,0,0]],
        canvas = document.getElementById('canvas-anim'),
        tileSize = 64,
        currentPath,


    eventListener = function() {
        canvas.addEventListener('click', canvasClick);
    },


    canvasClick = function(e) {
        var x;
        var y;

        // grab html page coords
        if (e.pageX !== undefined && e.pageY !== undefined) {
            x = e.pageX;
            y = e.pageY;
        } else {
            x = e.clientX + document.body.scrollLeft +
            document.documentElement.scrollLeft;
            y = e.clientY + document.body.scrollTop +
            document.documentElement.scrollTop;
        }

        // make them relative to the canvas only
        x -= canvas.offsetLeft;
        y -= canvas.offsetTop;

        // return tile x,y that we clicked
        var cell = [
            Math.floor(x/tileSize),
            Math.floor(y/tileSize)
        ];

        // now we know while tile we clicked
        currentPath = findPath(map, [0,0], [cell[0],cell[1]]);

        for (var i=0; i<currentPath.length; i++) {
            rd.game.canvas.drawMovable(1, '#0f0', currentPath[i][0] * tileSize, currentPath[i][1] * tileSize);
        }

        // calculate path
        //currentPath = findPath(world,pathStart,pathEnd);
        //redraw();
    },


    /**
     * Find a path using the A * algorithm
     * @param  {array} world
     * @param  {array} pathStart
     * @param  {array} pathEnd
     * @return {array}
     */
    findPath = function(world, pathStart, pathEnd){
        // shortcuts for speed
        var abs = Math.abs;
        var max = Math.max;
        var pow = Math.pow;
        var sqrt = Math.sqrt;

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
        var findNeighbours = function(){}; // empty

        /*

        // alternate heuristics, depending on your game:

        // diagonals allowed but no sqeezing through cracks:
        var distanceFunction = DiagonalDistance;
        var findNeighbours = DiagonalNeighbours;

        // diagonals and squeezing through cracks allowed:
        var distanceFunction = DiagonalDistance;
        var findNeighbours = DiagonalNeighboursFree;

        // euclidean but no squeezing through cracks:
        var distanceFunction = EuclideanDistance;
        var findNeighbours = DiagonalNeighbours;

        // euclidean and squeezing through cracks allowed:
        var distanceFunction = EuclideanDistance;
        var findNeighbours = DiagonalNeighboursFree;

        */

        // distanceFunction functions
        // these return how far away a point is to another

        function ManhattanDistance(Point, Goal){
            // linear movement - no diagonals - just cardinal directions (NSEW)
            return abs(Point.x - Goal.x) + abs(Point.y - Goal.y);
        }

        function DiagonalDistance(Point, Goal){
            // diagonal movement - assumes diag dist is 1, same as cardinals
            return max(abs(Point.x - Goal.x), abs(Point.y - Goal.y));
        }

        function EuclideanDistance(Point, Goal){
            // diagonals are considered a little farther than cardinal directions
            // diagonal movement using Euclide (AC = sqrt(AB^2 + BC^2))
            // where AB = x2 - x1 and BC = y2 - y1 and AC will be [x3, y3]
            return sqrt(pow(Point.x - Goal.x, 2) + pow(Point.y - Goal.y, 2));
        }

        // Neighbours functions, used by findNeighbours function
        // to locate adjacent available cells that aren't blocked

        // Returns every available North, South, East or West
        // cell that is empty. No diagonals,
        // unless distanceFunction function is not Manhattan
        function Neighbours(x, y){
            var N = y - 1,
            S = y + 1,
            E = x + 1,
            W = x - 1,
            myN = N > -1 && canWalkHere(x, N),
            myS = S < worldHeight && canWalkHere(x, S),
            myE = E < worldWidth && canWalkHere(E, y),
            myW = W > -1 && canWalkHere(W, y),
            result = [];
            if(myN)
            result.push({x:x, y:N});
            if(myE)
            result.push({x:E, y:y});
            if(myS)
            result.push({x:x, y:S});
            if(myW)
            result.push({x:W, y:y});
            findNeighbours(myN, myS, myE, myW, N, S, E, W, result);
            return result;
        }

        // returns every available North East, South East,
        // South West or North West cell - no squeezing through
        // "cracks" between two diagonals
        function DiagonalNeighbours(myN, myS, myE, myW, N, S, E, W, result){
            if(myN)
            {
                if(myE && canWalkHere(E, N))
                result.push({x:E, y:N});
                if(myW && canWalkHere(W, N))
                result.push({x:W, y:N});
            }
            if(myS)
            {
                if(myE && canWalkHere(E, S))
                result.push({x:E, y:S});
                if(myW && canWalkHere(W, S))
                result.push({x:W, y:S});
            }
        }

        // returns every available North East, South East,
        // South West or North West cell including the times that
        // you would be squeezing through a "crack"
        function DiagonalNeighboursFree(myN, myS, myE, myW, N, S, E, W, result){
            myN = N > -1;
            myS = S < worldHeight;
            myE = E < worldWidth;
            myW = W > -1;
            if(myE)
            {
                if(myN && canWalkHere(E, N))
                result.push({x:E, y:N});
                if(myS && canWalkHere(E, S))
                result.push({x:E, y:S});
            }
            if(myW)
            {
                if(myN && canWalkHere(W, N))
                result.push({x:W, y:N});
                if(myS && canWalkHere(W, S))
                result.push({x:W, y:S});
            }
        }

        // returns boolean value (world cell is available and open)
        function canWalkHere(x, y){
            return ((world[x] != null) &&
                (world[x][y] != null) &&
                (world[x][y] <= maxWalkableTileNum));
        }

        // Node function, returns a new object with Node properties
        // Used in the calculatePath function to store route costs, etc.
        function Node(Parent, Point){
            var newNode = {
                // pointer to another Node object
                Parent:Parent,
                // array index of this Node in the world linear array
                value:Point.x + (Point.y * worldWidth),
                // the location coordinates of this Node
                x:Point.x,
                y:Point.y,
                // the heuristic estimated cost
                // of an entire path using this node
                f:0,
                // the distanceFunction cost to get
                // from the starting point to this node
                g:0
            };

            return newNode;
        }

        // Path function, executes AStar algorithm operations
        function calculatePath(){
            // create Nodes from the Start and End x,y coordinates
            var mypathStart = Node(null, {x:pathStart[0], y:pathStart[1]});
            var mypathEnd = Node(null, {x:pathEnd[0], y:pathEnd[1]});
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
            while(length = Open.length)
            {
                max = worldSize;
                min = -1;
                for(i = 0; i < length; i++)
                {
                    if(Open[i].f < max)
                    {
                        max = Open[i].f;
                        min = i;
                    }
                }
                // grab the next node and remove it from Open array
                myNode = Open.splice(min, 1)[0];
                // is it the destination node?
                if(myNode.value === mypathEnd.value)
                {
                    myPath = Closed[Closed.push(myNode) - 1];
                    do
                    {
                        result.push([myPath.x, myPath.y]);
                    }
                    while (myPath = myPath.Parent);
                    // clear the working arrays
                    AStar = Closed = Open = [];
                    // we want to return start to finish
                    result.reverse();
                }
                else // not the destination
                {
                    // find which nearby nodes are walkable
                    myNeighbours = Neighbours(myNode.x, myNode.y);
                    // test each one that hasn't been tried already
                    for(i = 0, j = myNeighbours.length; i < j; i++)
                    {
                        myPath = Node(myNode, myNeighbours[i]);
                        if (!AStar[myPath.value])
                        {
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