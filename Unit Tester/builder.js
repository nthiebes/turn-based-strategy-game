/**
 * Ridane Unit Builder
 */
var unitBuilder = function(){
	var speed = 5,
		baseUrl = '../img/units/';

	var init = function(){

		nico = new Unit({
			name: 'Nico',
			pos: [0, 0],
			skin: new Sprite(baseUrl + 'human1.png', [0, 128], [64, 64], speed, [0], 'horizontal', false, false), // url, pos, size, speed, frames, dir, once, inProgress
			dirt: false,
			blood: true,
			gear: {
				head: new Sprite(baseUrl + 'head0.png', [0, 128], [64, 64], speed, [0], 'horizontal', false, false),
				torso: new Sprite(baseUrl + 'torso0.png', [0, 128], [64, 64], speed, [0], 'horizontal', false, false),
				leg: new Sprite(baseUrl + 'leg0.png', [0, 128], [64, 64], speed, [0], 'horizontal', false, false)
			},
			weapon: {
				primary: new Sprite(baseUrl + 'primary0.png', [0, 237], [100, 100], speed, [0], 'horizontal', false, false),
				secondary: new Sprite(baseUrl + 'secondary0.png', [0, 237], [100, 100], speed, [0], 'horizontal', false, false),
			},
			attributes: {
				strength: 1
			},
			skills: null
		});

		units.push(nico);

		lastTime = Date.now();
		main();
	};




var gameTime = 0,
	nico,
	fps,
	side = 0,
	sideWeapon = 0,
	sideWeaponLeft = 0,
	elmFps = document.getElementById('fps'),
	units = [],
	lastTime;

// units.push({
//     sprite: new Sprite('units.png', [0, 0], [151, 46], 0, [0], 'horizontal', false, false)
// });


$('button', '#builder-skin').on('click', function(){
	var skin = $(this).attr('data-skin'),
		race = $(this).attr('data-race');

	nico.skin.url = baseUrl + race + skin + '.png';
});

$('button', '#builder-head').on('click', function(){
	var head = $(this).attr('data-head');

	nico.gear.head.url = baseUrl + 'head' + head + '.png';
});

$('button', '#builder-torso').on('click', function(){
	var torso = $(this).attr('data-torso');

	nico.gear.torso.url = baseUrl + 'torso' + torso + '.png';
});

$('button', '#builder-leg').on('click', function(){
	var leg = $(this).attr('data-leg');

	nico.gear.leg.url = baseUrl + 'leg' + leg + '.png';
});

$('button', '#builder-weapon-primary').on('click', function(){
	var weapon = $(this).attr('data-weapon');

	nico.weapon.primary.url = baseUrl + 'primary' + weapon + '.png';
});

$('button', '#builder-weapon-secondary').on('click', function(){
	var weapon = $(this).attr('data-weapon');

	nico.weapon.secondary.url = baseUrl + 'secondary' + weapon + '.png';
});

$('#builder-500').on('click', function(){
	$('#builder-canvas').removeClass('auto');
});

$('#builder-auto').on('click', function(){
	$('#builder-canvas').addClass('auto');
});


$('#builder-idle').on('click', function(){
	nico.skin.pos = [0, 128 + side];
	nico.skin.frames = [0];

	nico.gear.head.pos = [0, 128 + side];
	nico.gear.head.frames = [0];

	nico.gear.torso.pos = [0, 128 + side];
	nico.gear.torso.frames = [0];

	nico.gear.leg.pos = [0, 128 + side];
	nico.gear.leg.frames = [0];

	nico.weapon.primary.pos = [0 + sideWeaponLeft, 237 + sideWeapon];
	nico.weapon.primary.frames = [0];

	nico.weapon.secondary.pos = [0 + sideWeaponLeft, 237 + sideWeapon];
	nico.weapon.secondary.frames = [0];
});

$('#builder-walk').on('click', function(){
	nico.skin.pos = [0, 0 + side];
	nico.skin.frames = [0, 1, 2, 3];

	nico.gear.head.pos = [0, 0 + side];
	nico.gear.head.frames = [0, 1, 2, 3];

	nico.gear.torso.pos = [0, 0 + side];
	nico.gear.torso.frames = [0, 1, 2, 3];

	nico.gear.leg.pos = [0, 0 + side];
	nico.gear.leg.frames = [0, 1, 2, 3];

	nico.weapon.primary.pos = [0 + sideWeaponLeft, 36 + sideWeapon];
	nico.weapon.primary.frames = [0, 1, 2, 3];

	nico.weapon.secondary.pos = [0 + sideWeaponLeft, 36 + sideWeapon];
	nico.weapon.secondary.frames = [0, 1, 2, 3];
});

$('#builder-attack').on('click', function(){
	nico.skin.pos = [0, 128 + side];
	nico.skin.frames = [0, 1, 2];

	nico.gear.head.pos = [0, 128 + side];
	nico.gear.head.frames = [0, 1, 2];

	nico.gear.torso.pos = [0, 128 + side];
	nico.gear.torso.frames = [0, 1, 2];

	nico.gear.leg.pos = [0, 128 + side];
	nico.gear.leg.frames = [0, 1, 2];

	nico.weapon.primary.pos = [0 + sideWeaponLeft, 237 + sideWeapon];
	nico.weapon.primary.frames = [0, 1, 2];

	nico.weapon.secondary.pos = [0 + sideWeaponLeft, 237 + sideWeapon];
	nico.weapon.secondary.frames = [0, 1, 2];
});

$('#builder-left').on('click', function(){
	side = 64;
	sideWeapon = 100;
	sideWeaponLeft = 36;

	// nico.skin.pos = [0, 192];
	// nico.gear.head.pos = [0, 192];
	// nico.gear.torso.pos = [0, 192];
	// nico.gear.leg.pos = [0, 192];
});

$('#builder-right').on('click', function(){
	side = 0;
	sideWeapon = 0;
	sideWeaponLeft = 0;

	// nico.skin.pos = [0, 128];
	// nico.gear.head.pos = [0, 128];
	// nico.gear.torso.pos = [0, 128];
	// nico.gear.leg.pos = [0, 128];
});




//console.log(nico);

function render(){
    // Clear canvas hack
    canvas.width = canvas.width;
    renderEntities(units);
}

var test = 0;
function main() {
    var now = Date.now();
    var dt = (now - lastTime) / 1000.0;

    update(dt);
    render();

    lastTime = now;

    requestAnimFrame(main);

    // test++;

    // if(test === 10){
    // 	test = 0;
	   //  fps = 1/dt;
	   //  elmFps.innerHTML = Math.round(fps);
    // }

}


function update(dt) {
    gameTime += dt;

    updateEntities(dt);
}

function updateEntities(dt) {
    
    // Update all the enemies
    for( var i=0; i<units.length; i++ ){
        units[i].skin.update(dt);
        units[i].gear.head.update(dt);
        units[i].gear.torso.update(dt);
        units[i].gear.leg.update(dt);
        units[i].weapon.primary.update(dt);
        units[i].weapon.secondary.update(dt);
    }
}


function renderEntities(list) {
    for(var i=0; i<list.length; i++) {
        renderEntity(list[i], list[i].weapon.secondary, list[i].skin, list[i].gear.leg, list[i].gear.torso, list[i].gear.head, list[i].weapon.primary);
    }    
}

function renderEntity() {
    ctx.save();
    ctx.translate(arguments[0].pos[0], arguments[0].pos[1]);

	for (var i=1; i<arguments.length; i++) {
		arguments[i].render(ctx);
	}
    ctx.restore();
}

function loaded(){
	init();
}


// Initialize if all ressources are loaded
resources.load([
    baseUrl + 'human0.png',
    baseUrl + 'human1.png',
    baseUrl + 'human2.png',
    baseUrl + 'human3.png',
    baseUrl + 'human4.png',
    baseUrl + 'human5.png',
    baseUrl + 'human6.png',
    baseUrl + 'ghost0.png',
    baseUrl + 'zombie0.png',
    baseUrl + 'zombie1.png',
    baseUrl + 'zombie2.png',
    baseUrl + 'zombie3.png',
    baseUrl + 'zombie4.png',
    baseUrl + 'zombie5.png',
    baseUrl + 'zombie6.png',
    baseUrl + 'vampire0.png',
    baseUrl + 'elf0.png',
    baseUrl + 'orc0.png',
    baseUrl + 'orc1.png',
    baseUrl + 'orc2.png',
    baseUrl + 'orc3.png',
    baseUrl + 'head0.png',
    baseUrl + 'head1.png',
    baseUrl + 'head2.png',
    baseUrl + 'torso0.png',
    baseUrl + 'torso1.png',
    baseUrl + 'leg0.png',
    baseUrl + 'leg1.png',
    baseUrl + 'primary0.png',
    baseUrl + 'primary1.png',
    baseUrl + 'primary2.png',
    baseUrl + 'primary3.png',
    baseUrl + 'secondary0.png',
    baseUrl + 'secondary1.png'
]);
resources.onReady(loaded);



	var canvas = document.getElementById('builder-canvas');
	var ctx = canvas.getContext('2d');

	return {
		init: init
	};
}();




//////////////////////////////////////////////
// A cross-browser requestAnimationFrame    //
//////////////////////////////////////////////
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


//////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Behaves the same as setTimeout except uses requestAnimationFrame() where possible for better performance //
// @param {function} fn The callback function                                                               //
// @param {int} delay The delay in milliseconds                                                             //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
window.requestTimeout = function( fn, delay ){
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