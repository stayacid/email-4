'use strict';

// Подключение плагинов через переменные (connection of plugins through variables):
var gulp = require('gulp'), // Gulp
    debug = require('gulp-debug'), // Отслеживание работы тасков в терминале (operation tracking of tasks in terminal)
    del = require('del'), // Удаление папок и файлов (delete of folders and files)
    inlineCss = require('gulp-inline-css'), // Создание инлайн-стилей (creating of inline styles)
    notify = require("gulp-notify"), // Вывод надписей при ошибках (displaying errors)
    plumber = require('gulp-plumber'), // Обработка ошибок (error handling)
    pug = require('gulp-pug'), // Pug
    sass = require('gulp-sass'), // Sass
    autoprefixer = require('gulp-autoprefixer');

// Задание путей к используемым файлам и папкам (paths to folders and files):
var paths = {
  dir: {
    app: './src', // Путь к development-папке (path to development folder)
    dist: './build' // Путь к production-папке (path to production folder)
  },
  watch: {
    html: './src/pug/**/*.pug', // Путь для вотчера Pug-файлов (path for watcher to Pug files)
    css: './src/sass/**/*.sass' // Путь для вотчера Sass-файлов (path for watcher to Sass files)
  },
  app: {
    html: { // Пути для таска html (paths for html task)
      src: './src/pug/email.pug', // Путь к Pug-файлам для таска html (path for html task to Pug files)
      dest: './src' // Место сохранения html-шаблона письма (place of saving html template of e-mail)
    },
    css: { // Пути для таска css (paths for css task)
      src: [ // Путь к Sass-файлам для таска css (path for css task to Sass files)
        './src/sass/styles/inline.sass',
        './src/sass/styles/media.sass'
      ],
      dest: './src/css' // Место сохранения CSS-файлов (place of saving CSS files)
    }
  },
  dist: { // Пути для production (paths for production)
    src: './src/email.html', // Исходный HTML-шаблон письма из development-папки (source html template of e-mail from development folder app)
    dest: './build' // Место сохранения HTML-шаблона с встроенными инлайн-стилями для production (place of saving HTML template with inline styles for production)
  }
}

// Подключение Browsersync (connection of Browsersync):
var browserSync = require('browser-sync').create(),
    reload = browserSync.reload;

// Таск для работы Browsersync, автообновление браузера (Browsersync task, autoreload of browser):
gulp.task('serve', function() {
  browserSync.init({
    server: { // Настройки сервера (server settings)
      baseDir: paths.dir.app, // Базовая директория (basic directory)
      index: 'email.html' // Индексный файл (index file)
    }
  });
  gulp.watch([paths.watch.html, paths.watch.css], gulp.series('build')); // Отслеживание изменений Pug и Sass-файлов (change tracking of Pug and Sass files)
  gulp.watch('*.html').on('change', reload); // Обновление браузера в случае изменения индексного файла email.html в development-папке app (autoreload browser)
});

// Таск для работы Pug, преобразование Pug в HTML (Pug to HTML conversion task):
gulp.task('html', function() {
  return gulp.src(paths.app.html.src) // Исходник таска html (source of html task)
    .pipe(plumber()) // Обработка ошибок таска html (error handling of html task) 
    .pipe(debug({title: 'Pug source'})) // Отслеживание исходника таска html (source tracking of html task)
    .pipe(pug({
      pretty: true, // Форматирование разметки в HTML-файле (code formatting in HTML file)
      doctype: 'HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd"' // Установка doctype (setting of doctype)
    }))
    .pipe(debug({title: 'Pug'})) // Отслеживание работы плагина Pug (operation tracking of Pug plugin)
    .pipe(gulp.dest(paths.app.html.dest)) // Сохранение HTML-шаблона письма в папке app (save of HTML template in folder app)
    .pipe(debug({title: 'Pug dest'})) // Отслеживание сохранения HTML-шаблона (saving tracking of HTML template)
    .pipe(browserSync.stream()); // Browsersync
});

// Таск для работы Sass, преобразование Sass в CSS (Sass to CSS conversion task):
gulp.task('css', function() {
  return gulp.src(paths.app.css.src) // Исходник таска css (css task source)
    .pipe(plumber()) // Обработка ошибок таска css (error handling of css task)
    .pipe(debug({title: 'Sass source'})) // Отслеживание исходника таска css (source tracking of css task)
    .pipe(sass().on('error', sass.logError)) // Преобразование Sass в CSS (Sass to CSS conversion)
    .pipe(debug({title: 'Sass'})) // Отслеживание работы плагина Sass (operation tracking of Sass plugin)
    .pipe(autoprefixer())
    .pipe(gulp.dest(paths.app.css.dest)) // Сохранение CSS-файлов в папке app/css (saving of CSS files in folder app/css)
    .pipe(debug({title: 'Sass dest'})) // Отслеживание сохранения (saving tracking)
    .pipe(browserSync.stream()); // Browsersync
});

// Таск для предварительной очистки (удаления) production-папки (task for delete of production folder dist):
gulp.task('del', function() {
  return del(paths.dir.dist);
});

// Таск для формирования инлайн-стилей из внешнего файла inline.css (task for creating of inline styles):
gulp.task('inline', function() {
  return gulp.src(paths.dist.src) // Исходник для таска inline (inline task source)
    .pipe(plumber()) // Обработка ошибок таска inline (error handling of inline task)
    .pipe(debug({title: 'Inline CSS sourse'})) // Отслеживание исходника таска inline (source tracking of inline task)
    .pipe(inlineCss({ // Преобразование стилей из внешнего файла inline.css в инлайн-стили (conversion styles in inline styles)
        preserveMediaQueries: true, // Сохранение медиа-запросов в тегах style HTML-шаблона (saving of media queries)
        applyTableAttributes: true // Преобразование табличных стилей в атрибуты (conversion of table styles in attributes)
    }))
    .pipe(debug({title: 'Inline CSS'})) // Отслеживание преобразования (conversion tracking)
    .pipe(gulp.dest(paths.dist.dest)) // Сохранение результатов в production-папку dist (saving of results in production folder dist)
    .pipe(debug({title: 'Inline CSS dest'})); // Отслеживание сохранения (saving tracking)
});

// Таск для сборки (task for build):
gulp.task('build', gulp.series('html', 'css', 'del', 'inline'));

// Таск для запуска разработки (task for lounch of development):
gulp.task('default', gulp.series('build', 'serve'));