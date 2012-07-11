/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    meta: {
      version: '0.1.0',
      banner: '/*! IchieJs - v<%= meta.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
        '* https://github.com/shrink/IchieJs/\n' +
        '* Copyright (c) <%= grunt.template.today("yyyy") %> ' +
        'Thorsten Schmitt-Rink; Licensed MIT */'
    },
    lint: {
      files: ['grunt.js', 'src/**/*.js', 'test/**/*.js']
    },
    concat: {
      dist: {
        src: [
          'src/closure_open',
          'src/Ichie.js', 
          'src/ImageAreaSelection.js', 
          'src/ResizeInteraction.js', 
          'src/DefaultMode.js', 
          'src/LockedRatioMode.js', 
          'src/exports.js', 
          'src/closure_close'
        ],
        dest: 'dist/Ichie.js'
      }
    },
    min: {
      dist: {
        src: ['<banner:meta.banner>', '<config:concat.dist.dest>'],
        dest: 'dist/Ichie.min.js'
      }
    },
    watch: {
      files: '<config:lint.files>',
      tasks: 'lint qunit'
    },
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true,
        browser: true
      },
      globals: {
        jQuery: true
      }
    },
    uglify: {}
  });

  // Default task.
  grunt.registerTask('default', 'lint concat min');

};
