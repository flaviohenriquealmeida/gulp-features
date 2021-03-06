// Gulp core
var gulp = require('gulp');

// minification and concatenation 
var usemin = require('gulp-usemin');

// utils
var gutil = require('gulp-util');
var clean = require('gulp-clean');
var notify = require('gulp-notify');

// Linting Tools
var jshint = require('gulp-jshint');
var jshintStylish = require('jshint-stylish');
var csslint = require('gulp-csslint');

// Preprocessors
var less = require('gulp-less');
var coffee = require('gulp-coffee');

// Image handling
var imagemin = require('gulp-imagemin');
var cache = require('gulp-cache'); // cache files


/* Tasks in Gulp run concurrently together and have no order in which they’ll 
finish, so we need to make sure the clean task is completed before running 
additional tasks.

Note: Are your tasks running before the dependencies are complete? 
Make sure your dependency tasks are correctly using the async run hints: 
take in a callback or return a promise or event stream.
 */

gulp.task('default', ['copy'], function() {
	gulp.start('imagemin', 'usemin');

});

gulp.task('compile', function() {
	return gulp.start('compile-less-all','compile-coffee-all');
});

gulp.task('compile-less-all', function() {

	return gulp.src('public/less/**/*.less')
	.pipe(less())
	.pipe(gulp.dest('public/css'))
	.pipe(notify({ message: 'Compile-less-all task complete' }));
});

/* Sintax errors on Coffee files will blow up your gulp!
You need to catch de error to avoid this*/
gulp.task('compile-coffee-all', function() {
	
	return gulp.src('public/coffee/**/*.coffee')
	.pipe(coffee().on('error', gutil.log))
	.pipe(gulp.dest('public/js'))
	.pipe(notify({ message: 'Compile-coffe-all task complete' }));
});

gulp.task('clean', function() {
    /* without return, we have a problem. It seems that the next task 
    is executed before this task completes
	*/
	return gulp.src('dist', {read: false})
	.pipe(clean())
	.pipe(notify({ message: 'Clean task complete' }));

});

gulp.task('copy', ['clean', 'compile'], function() {

	return gulp.src('public/**/*')
	.pipe(gulp.dest('dist'))
	.pipe(notify({message: 'Copy task complete'}));
});

gulp.task('imagemin', function() {

	return gulp.src('dist/img/**/*')
    .pipe(cache(imagemin({ optimizationLevel: 7, progressive: true, interlaced: true })))
    .pipe(gulp.dest('dist/img'))
    .pipe(notify({ message: 'Imagemin task complete' }));
});

gulp.task('usemin', function() {
  return gulp.src('dist/**/*.html')
    .pipe(usemin({
      cssmin: true,
      htmlmin: true,
      jsmin: true
    }))
    .pipe(gulp.dest('dist'));
});

gulp.task('server', function() {

	 gulp.watch('public/less/**/*.less', function(event) {
	 	var msg =  'LESS COMPILED: ' + event.path;
	 	gulp.src(event.path)
		.pipe(less())
		.pipe(gulp.dest('public/css'))
		.pipe(notify({ message: msg}));
		gutil.log(msg);

	 });

	 gulp.watch('public/coffee/**/*.coffee', function(event) {
	 	var msg =  'COFFESCRIPT COMPILED: ' + event.path;
	 	gutil.log('File '+event.path+' was '+event.type+', running tasks...');
	 	gulp.src(event.path)
		.pipe(coffee().on('error', gutil.log))
		.pipe(gulp.dest('public/js'))
		.pipe(notify({ message: msg}));
		gutil.log(msg);

	 });

	 gulp.watch('public/js/**/*.js', function(event) {
	 	var msg =  'JSHINTED: ' + event.path;
	 	gulp.src(event.path)
	 	.pipe(jshint())
	 	.pipe(jshint.reporter(jshintStylish))
	 	.pipe(notify({ message: msg}));
		gutil.log(msg);
	 });

	 gulp.watch('public/css/**/*.css', function(event) {
	 	var msg =  'CSSLINTED: ' + event.path;
	 	gulp.src(event.path)
	 	.pipe(csslint())
	 	.pipe(csslint.reporter())
	 	.pipe(notify({ message: msg}));
		gutil.log(msg);
	 });
});


