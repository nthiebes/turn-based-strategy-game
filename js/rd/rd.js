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
 * @param {int} 	 delay The delay in milliseconds
 */
window.requestTimeout = function(fn, delay) {
    if( !window.requestAnimationFrame       && 
        !window.webkitRequestAnimationFrame && 
        !(window.mozRequestAnimationFrame && window.mozCancelRequestAnimationFrame) && // Firefox 5 ships without cancel support
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
 * @namespace rd.utils
 */


/**
 * @namespace rd.game
 */