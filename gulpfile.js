var $gulp = require('gulp'); // Сообственно Gulp JS
var $sourceMaps = require('gulp-sourcemaps');
var $autoPrefixer = require('gulp-autoprefixer');
var $sass = require('gulp-sass');
var $imageMin = require('gulp-imagemin');


//server
var $lr = require('tiny-lr');// Минивебсервер для livereload
var $liveReload = require('gulp-livereload');
var $connect = require('connect'); // Webserver
var $serveStatic = require('serve-static');
var $serveIndex = require('serve-index');
var $server = $lr();
//js
var $browserify = require('browserify'); //Concatinate scripts
var $source = require('vinyl-source-stream');

var $vue = require('vue');
var $lodash = require('lodash');
var $axios = require('axios');

$gulp.task('html', function () {
	return $gulp.src('src/**/*.html')
		.pipe($gulp.dest('public'))
		.pipe($liveReload($server));
});
//css
$gulp.task('scss', function () {
	return $gulp.src('./src/scss/style.scss')
		.pipe($sourceMaps.init())
		.pipe($sass({
			'include css': true,
			outputStyle: 'compressed'
		}))
		.pipe($autoPrefixer({browsers: ['last 5 versions']}))
		.pipe($sourceMaps.write('.'))
		.pipe($gulp.dest('src/css')) //доп копия в ветку разработки для адекватного поведения шторма
		.pipe($gulp.dest('public/css'))
		.pipe($liveReload($server)); // даем команду на перезагрузку страницы

});
//js
$gulp.task('ja-browserify', function () {
	return $browserify('./src/js/main.js')
		.bundle()
		.on('error', function (err) {
			console.log(err.toString());
			this.emit("end");
		})
		.pipe($source('bundle.js'))
		.pipe($gulp.dest('public/js'))
		.pipe($liveReload($server)); // даем команду на перезагрузку страницы

});
//media
$gulp.task('media', function () {
	$gulp.src('./scr/media/**/*')
		.pipe($imageMin())
		.pipe($gulp.dest('./public/media'))
});

// Локальный сервер для разработки
$gulp.task('http-server', function () {
	$connect()
		.use(require('connect-livereload')())
		.use($serveStatic('./public'))
		.use($serveIndex('./public'))
		.listen('9000');

	console.log('Server listening on http://localhost:9000');
});
//watch
$gulp.task('watch', function () {
	// Предварительная сборка проекта
	$gulp.run('scss');
	$gulp.run('ja-browserify');
	$gulp.run('media');
	$gulp.run('html');

	// Подключаем Livereload
	$server.listen(35729, function (err) {
		if (err) return console.log(err);

		$gulp.watch('./src/scss/**/*.scss', function () {
			$gulp.run('scss');
		});
		$gulp.watch('./src/js/**/*.js', function () {
			$gulp.run('ja-browserify');
		});
		$gulp.watch('./src/**/*.html', function () {
			$gulp.run('html');
		});
	});
	$gulp.run('http-server');
});
