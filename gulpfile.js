const gulp = require('gulp');
const sass = require('gulp-sass');
const glob = require('glob');
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const nunjucksRender = require('gulp-nunjucks-render');
const browserSync = require('browser-sync').create();
const autoprefixer = require('gulp-autoprefixer');

// Static server
gulp.task('serve', ['build'], function () {
    browserSync.init({
        server: {
            baseDir: "./dist"
        }
    });
    gulp.watch("./src/**/*.{html,njk}", ['nunjucks']);
    gulp.watch("./src/**/*.css", ['autoprefixer']);
    gulp.watch("./src/**/*.scss", ['sass']);
    gulp.watch("./dist/**/*.{html,css}").on('change', browserSync.reload);
});

gulp.task('autoprefixer', function () {
    return gulp.src('./src/**/*.css')
        .pipe(autoprefixer({
            browsers: ['last 2 versions']
        }))
        .pipe(gulp.dest('dist'))
})

gulp.task('nunjucks', function () {
    return gulp.src('src/**/*.{html,njk}')
        .pipe(plumber({
            // Notify on error
            errorHandler: function (err) {
                notify.onError({
                    title: "Gulp Error",
                    message: "Error: <%= error.message %>",
                    sound: "Bottle",
                    onLast: true
                })(err);
                this.emit('end');
            }
        }))
        .pipe(nunjucksRender({
            path: glob.sync('src/**/*/') // String or Array
        }))
        .pipe(gulp.dest('dist'));
});

// Compile sass into CSS & auto-inject into browsers
gulp.task('sass', function() {
    return gulp.src("src/**/*.scss")
        .pipe(plumber({
            // Notify on error
            errorHandler: function (err) {
                notify.onError({
                    title: "Gulp Error",
                    message: "Error: <%= error.message %>",
                    sound: "Bottle",
                    onLast: true
                })(err);
                this.emit('end');
            }
        }))
        .pipe(sass())
        .pipe(autoprefixer({
            browsers: ['last 2 versions']
        }))
        .pipe(gulp.dest("dist"))
        .pipe(browserSync.stream());
});

gulp.task('copy', function () {
    return gulp.src(['./src/**/*.*','!./src/**/*.{html,njk,css,scss}'])
        .pipe(gulp.dest('dist'))
})

gulp.task('default', ['serve']);
gulp.task('build', ['nunjucks', 'sass','autoprefixer', 'copy'])