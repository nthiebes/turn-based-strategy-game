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
            'img/units/primary6.png',
            'img/units/primary7.png',
            'img/units/primary8.png',
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
            'img/main-menu.png',
            'img/animations.png'
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
