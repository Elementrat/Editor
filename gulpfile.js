var gulp       = require('gulp');
var jshint     = require('gulp-jshint');
var concat     = require('gulp-concat');
var sass       = require('gulp-sass');
var livereload = require('gulp-livereload')

gulp.task('scripts', function(){
	gulp.src(['app/js/editor/*.js'])
		.pipe(concat('all_editor.js'))
		.pipe(gulp.dest('app/js/'))
		.pipe(livereload());

	gulp.src(['app/js/game/*.js'])
		.pipe(concat('all_game.js'))
		.pipe(gulp.dest('app/js/'))
		.pipe(livereload());
});

gulp.task('styles', function(){
	gulp.src(['app/styles/sass/*.scss'])
		.pipe(sass())
		.pipe(gulp.dest('app/styles/'))
		.pipe(livereload())
})

gulp.task('html', function(){
	gulp.src(['app/*.html'])
	.pipe(livereload())
})

gulp.task('watch', function(){
	gulp.watch('app/js/**/*.js', ['scripts'])
	gulp.watch('app/styles/sass/*.scss', ['styles'])
	gulp.watch('app/*.html', ['html']);
})

gulp.task('jshint', function(){
	gulp.src('app/js/*.js')
		.pipe(jshint())
		.pipe(jshint.reporter('default'))
});

gulp.task('default', ['scripts', 'styles','watch'])
