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