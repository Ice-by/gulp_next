// Ставим в прект npm i --save-dev gulp, а дальше создаем Переменную, которая позволит обращаться(находить) файлы по указанному пути (src) и выгружать по указанному пути (dest)
// а тыкже следим за изменениями в файлах (watch)
const {src, dest, watch, parallel, series} = require('gulp'); 
// Ставим в прект npm i --save-dev gulp-sass, а дальше создаем Переменную, которая закрепляется за преобразователем из scss в css:
const scss = require('gulp-sass');
// Ставим в прект npm i --save-dev gulp-concat, и создаем переменную concat, которая будет переименовывать файлы чтоб работать с установленным пакетом:
const concat = require('gulp-concat');
// Ставим в прект npm i --save-dev browser-sync, и создаем переменную browserSync, которая будет обновлять странички автоматически
const browserSync = require('browser-sync').create();
// Для подключения скриптов:
const uglify = require('gulp-uglify-es').default;
// Для автоматического добавления вендорных префиксов:
const autoprefixer = require('gulp-autoprefixer');
// Для минификации картинок:
const imagemin = require('gulp-imagemin');
// Для удаления старых файлов:
const del = require('del')


// Функция для удаления старых файлов перед заливкой новых:
function cleanDist() {
    return del('dist')
}
// Функция, которая ищет (src), затем преобразует scss в css (scss()) (в минифицированном стиле 'compressed', если нужно не сжато, то ставим 'expanded') 
// и затем выгружает по указанному пути (dest) и если это все проделано, то обновляем страницу с помощью пакета browserSync
function styles() {
    return src('app/scss/style.scss')
        .pipe(scss({outputStyle: 'compressed'}))
        .pipe(concat('style.min.css'))
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 10 version'],
            grid: true
        }))
        .pipe(dest('app/css'))
        .pipe(browserSync.stream())
}
// Функция которая следит за папкой scss, а точнее за всеми файлами в ней и при изменении в них запускает функцию styles
// Также следим за файлами JS, кроме main.min.js (чтоб не зацикливало), если изменения замечены, то запускаем scripts: 
// Также эта функция следит за html файлами и при изменениях обновляет (reload):
function watching(){
    watch(['add/scss/**/*.scss'], styles)
    watch(['app/js/**/*.js' ,'!add/js/main.min.js'], scripts)
    watch(['app/*.html']).on('change', browserSync.reload)
}
// Функция, которая занимается обновлением страничек:
function browsersync() {
    browserSync.init({
        server : {
            baseDir : 'app/'
        }
    })
}
// Закидываем JS плагины добавляя их код в основной рабочий файл:
function scripts() {
    return src([
        'node_modules/jquery/dist/jquery.js',
        'app/js/main.js'
    ])
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(dest('app/js'))
    .pipe(browserSync.stream())
}
// Функция создания билда проекта:
function build() {
    return src([
        'app/css/style.min.css',
        'app/fonts/**/*',
        'app/js/main.min.js',
        'app/*.html'
    ], {base: 'app'})
    .pipe(dest('dist'))
}
// Функция сжатия картинок:
function images() {
    return src('app/images/**/*')
    .pipe(imagemin([        
        imagemin.gifsicle({interlaced: true}),
        imagemin.mozjpeg({quality: 75, progressive: true}),
        imagemin.optipng({optimizationLevel: 5}),
        imagemin.svgo({
            plugins: [
                {removeViewBox: true},
                {cleanupIDs: false}
            ]
	    })
    ]))
    .pipe(dest('dist/images'))
}

// Для того чтобы функция по преобразованию из sass в css работала, нужно ее вызвать:
exports.styles = styles;
// Для того чтобы функция слежения за файлами работала, нужно ее вызвать (gulp watching в консоли):
exports.watching = watching;
// Для того чтобы вызвать browserSync:
exports.browserSync = browsersync;
// Для складывания скриптов в min.main.js:
exports.scripts = scripts;
// Для запуска сжатия картинок (запускается вручную):
exports.images = images;
// Для запуска очистки старых файлов перед заливкой новых:
exports.cleanDist = cleanDist;

// Для создания билда на заливкуЮ причем с очередностью сначала очистили, потом картинки минифицировали и потом уже с минифицированными картинками только заливаем:
exports.build = series(cleanDist, images, build);

// Чтобы параллельно работали browserSync и watching:
exports.default = parallel(styles, scripts, browsersync, watching);
