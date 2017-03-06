var gulp = require('gulp');
var shell = require('shelljs');
var path = require('path');
var open = require('open');
var fs = require('fs-extra');

gulp.task('serve', function () {
    fs.removeSync( path.join(__dirname, 'src/dist') );
    var port = 3000
    open('http://localhost:'+port+'/src');
    shell.exec('node_modules/.bin/webpack-dev-server --inline --progress --port 3000 --content-base .');
})

gulp.task('build', function () {
    shell.exec('webpack --progress');
})