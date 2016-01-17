module.exports = function(grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		sass: {
			desktop: {
				src: ['css/src/main.scss'],
				dest: 'css/style.css'
			}
		},
		concat: {
			dist: {
				src: ['js/rd/rd.js',
						'js/rd/utils/utils.js',
						'js/rd/utils/resources.js',
						'js/rd/utils/sprite.js',
						'js/rd/game/unit.js',
						'js/rd/game/combat.js',
						'js/rd/game/units.js',
						'js/rd/game/canvas.js',
						'js/rd/game/map.js',
						'js/rd/game/ui.js',
						'js/rd/game/main.js'],
				dest: 'js/compiled.js',
			}
		},
		jsdoc : {
	        dist : {
	            src: ['js/rd/**/*.js'],
	            options: {
	                destination: 'doc'
	            }
	        }
	    },
		watch: {
			sass: {
				files: ['css/src/*.scss'],
				tasks: ['sass:desktop']
			},
			concat: {
				files: ['js/rd/**/*.js'],
				tasks: ['concat']
			}
		}
	});

	grunt.loadNpmTasks('grunt-newer');
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-jsdoc');

	grunt.registerTask('sentry', 'watch');
	grunt.registerTask('doc', 'jsdoc');
	grunt.registerTask('default', ['sass', 'concat']);

};