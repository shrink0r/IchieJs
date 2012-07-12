/*global module:false, __dirname:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    meta: {
      version: '0.1.0',
      banner: '/*! IchieJs - v<%= meta.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
        '* https://github.com/shrink/IchieJs/\n' +
        '* Copyright (c) <%= grunt.template.today("yyyy") %> ' +
        '"Shrink0r" Thorsten Schmitt-Rink; Licensed MIT */'
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
          'src/SelectionOverlay.js',  
          'src/ResizeInteraction.js',
          'src/DefaultMode.js', 
          'src/LockedRatioMode.js', 
          'src/CommandQueue.js', 
          'src/FilterCommand.js',
          'src/CropCommand.js',
          'src/PasteCommand.js',
          'src/ImageFilters.js',
          'src/exports.js', 
          'src/closure_close'
        ],
        dest: 'dist/ichie.js'
      }
    },
    min: {
      dist: {
        src: ['<banner:meta.banner>', '<config:concat.dist.dest>'],
        dest: 'dist/ichie.min.js'
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
        $: true,
        _: true,
        console: true,
        ImageData: true,
        Kinetic: true
      }
    },
    copy: {
      src: "dist/ichie.js",
      dest: "example/js/ichie.min.js"
    }
  });
  
  grunt.registerTask('copy', 'Copy the current dist file to the showcase.', function() {
    var realPath = function(rel) { return __dirname + '/' + rel; };
    var src = grunt.config(['copy', 'src']);
    var dest = grunt.config(['copy', 'dest']);
    grunt.file.write(
      realPath(dest), 
      grunt.file.read(realPath(src))
    );
    grunt.log.writeln('Copied dist-file to "' + dest + '"');
  });

  // Default task.
  grunt.registerTask('default', 'lint concat min copy');
};