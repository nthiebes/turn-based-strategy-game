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
