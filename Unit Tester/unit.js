/**
 * Ridane Unit Builder
 */
var Unit = function(cfg){
	var me = this,

	init = function(){
		
	};

	me.name = cfg.name;
    me.skin = cfg.skin;
    me.pos = cfg.pos;
    me.gear = cfg.gear;
    me.weapon = cfg.weapon;

    console.log(cfg);
};