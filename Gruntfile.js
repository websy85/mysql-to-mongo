module.exports = function(grunt) {


  grunt.initConfig({
    includes: {
      files:{
        src: ['main.js'],
        dest: 'public/scripts/build/',
        cwd: 'public/scripts/raw'
      }
    },
    less: {
      development: {
        options: {
          compress: true,
          yuicompress: true,
          optimization: 2
        },
        files: {
          "public/styles/css/main.css": "public/styles/less/main.less" // destination file and source file
        }
      }
    },
    watch: {
      styles: {
        files: ['public/styles/less/**/*.less', 'public/scripts/raw/**/*.js'], // which files to watch
        tasks: ['less','includes'],
        options: {
          nospawn: true
        }
      }
    }
  });
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-includes');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.registerTask('default', ['includes','less', 'watch']);
};
