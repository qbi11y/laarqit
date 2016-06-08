var gulp        = require('gulp');
var sass        = require('gulp-sass');
var browserSync = require('browser-sync');

gulp.task('sass', function() {
    gulp.src('app/sass/styles.scss')
        .pipe(sass())
        .pipe(gulp.dest('app/css'))
        .pipe(browserSync.reload({
            stream: true
        }))
});

gulp.task('browser-sync', function() {
    browserSync.init(['app/*'], {
        browser: "google chrome canary",
        proxy: 'localhost:3000/',
        port: 5000,
        notify: true,
        files: ['app/**/*'],
        /*server: {
            baseDir: './app'
        }*/
    });
});

gulp.task('watch', ['sass', 'browser-sync'], function() {
    gulp.watch('app/sass/**/*.scss', ['sass']);
})

gulp.task('default', ['watch']);