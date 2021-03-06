module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        sass: {
            dist: {
                src: ['css/main.scss'],
                dest: 'css/style.css'
            },
            options: {
                sourcemap: 'none'
            }
        },
        concat: {
            dist: {
                src: [
                    'js/rd/rd.js',
                    'js/rd/utils/utils.js',
                    'js/rd/utils/resources.js',
                    'js/rd/utils/sprite.js',
                    'js/rd/canvas/main.js',
                    'js/rd/game/unit.js',
                    'js/rd/game/combat.js',
                    'js/rd/game/units.js',
                    'js/rd/game/animations.js',
                    'js/rd/game/map.js',
                    'js/rd/game/ui.js',
                    'js/rd/game/main.js',
                    'js/rd/ui/menu.js',
                    'js/rd/splash.js',
                    'js/rd/main.js',
                    'js/libs/howler.js'
                ],
                dest: 'js/compiled.js'
            }
        },
        jsdoc: {
            dist: {
                src: ['js/rd/**/*.js'],
                options: {
                    destination: 'doc'
                }
            }
        },
        watch: {
            sass: {
                files: ['css/*.scss'],
                tasks: ['sass']
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
