var gulp = require('gulp');
var concat = require('gulp-concat');
var filter = require('gulp-filter');
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');
var babel = require('gulp-babel');
var csso = require('gulp-csso');
var htmlmin = require('gulp-htmlmin');
var htmlhint = require('gulp-htmlhint');

gulp.task('scripts', function() {
    var filterMinified = filter(['**/*','!**/*.min.js'], {restore: true});
    return gulp.src(['./src/js/lib/jquery.min.js', './src/js/lib/*.js', './src/js/**/*.js'])
        .pipe(filterMinified)
        .pipe(jshint({ 
            'esversion': 6 
        }))
        .pipe(jshint.reporter('default'))
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(uglify())
        .pipe(filterMinified.restore)
        .pipe(concat('client.js'))
        .pipe(gulp.dest('./build'));
});

gulp.task('styles', function() {
    var filterMinified = filter(['**/*','!**/*.min.css'], {restore: true});
    return gulp.src(['./src/styles/lib/*.css', './src/styles/**/*.css'])
        .pipe(filterMinified)
        .pipe(csso({restructure: false}))
        .pipe(filterMinified.restore)
        .pipe(concat('client.css'))
        .pipe(gulp.dest('./build'));
});

gulp.task('templates', function() {
    return gulp.src(['./src/templates/**/*.html'])
        .pipe(htmlhint())
        .pipe(htmlhint.reporter())
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest('./build'));
});

gulp.task('views', function() {
    return gulp.src(['./src/views/**/*'])
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest('./views'));
});

gulp.task('images', function() {
    return gulp.src(['./src/images/**/*'])
        .pipe(gulp.dest('./build/images'));
});

gulp.task('favicons', function() {
    return gulp.src(['./src/favicons/**/*'])
        .pipe(gulp.dest('./build/favicons'));
});

gulp.task('fonts', function() {
    return gulp.src(['./src/fonts/**/*'])
        .pipe(gulp.dest('./build/fonts'));
});

gulp.task('watch', function() {
    gulp.watch('./src/js/**/*.js', ['scripts']);
    gulp.watch('./src/styles/**/*', ['styles']);
    gulp.watch('./src/templates/**/*', ['templates']);
    gulp.watch('./src/views/**/*', ['views']);
    gulp.watch('./src/fonts/**/*', ['fonts']);
    gulp.watch('./src/images/**/*', ['images']);
    gulp.watch('./src/favicons/**/*', ['favicons']); 
});

gulp.task('default', ['scripts', 'styles', 'templates', 'views', 'images', 'fonts', 'favicons', 'watch']);


