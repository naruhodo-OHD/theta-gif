gulp = require 'gulp'
gutil = require 'gulp-util'

browserSync = require 'browser-sync'
coffeeLint = require 'gulp-coffeelint'
coffee = require 'gulp-coffee'
concat = require 'gulp-concat'
uglify = require 'gulp-uglify'
runSequence = require 'run-sequence'

cordova = require('cordova-lib').cordova.raw
sources =
  coffee: 'coffee/*.coffee'

destinations = 
  js: 'www/js'

gulp.task 'browser-sync', ->
  browserSync 
    open: true
    server:
      baseDir: "./platforms/browser/www"
    watchOptions:
      debounceDelay: 1000

gulp.task 'lint', ->
  gulp.src(sources.coffee)
  .pipe(coffeeLint())
  .pipe(coffeeLint.reporter())

gulp.task 'src', ->
  gulp.src(sources.coffee)
  .pipe(coffee({bare: true}).on('error', gutil.log))
  .pipe(concat('index-coffee.js'))
  .pipe(uglify())
  .pipe(gulp.dest(destinations.js))

gulp.task 'watch', ->
  gulp.watch sources.coffee, ['lint', 'src', 'build']
  gulp.watch './platforms/browser/www/js/**', (file) ->
    browserSync.reload(file.path) if file.type is "changed"

gulp.task 'build', ->
  runSequence ['lint', 'src']
  cordova.build()

gulp.task 'default', ['build', 'browser-sync', 'watch']
