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