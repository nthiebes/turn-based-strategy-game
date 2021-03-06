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