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
