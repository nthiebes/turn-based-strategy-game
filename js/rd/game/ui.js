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