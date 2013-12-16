"use strict";
module.exports = function (grunt) {

	grunt.initConfig({
		uglify: {
			lazy: {
				src: 'jquery.lazy.js',
				dest: 'jquery.lazy.min.js'
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-uglify');

	grunt.registerTask('default', ['uglify']);

};
