var Promise = require('es6-promise').Promise;
var path = require('path');
var fs = require('fs');

var less = require('less');
var AutoPreFix = require('less-plugin-autoprefix');
var CleanCss = require('less-plugin-clean-css');

var sass = require('node-sass');
var autoprefixer = require('autoprefixer');
var postcss = require('postcss');

var render = module.exports = function(file){
    file = path.resolve(process.cwd(), file);
    var type = path.extname(file).replace(/^\./, '');
    return new Promise(function(resolve, reject){
        fs.exists(file, function(err){
            if ( !err ){
                reject('file not exists: ' + file);
            }
            else {
                if ( render[type] ){
                    render[type](file, resolve, reject);
                }else{
                    reject('css render type error: ' + type);
                }
            }
        });
    });
}

render.css = function(file, resolve, reject){
    fs.readFile(file, 'utf8', function(err, code){
        if ( err ){ reject(err); }
        else {
            resolve(code);
        }
    });
}

render.less = function(file, resolve, reject){
    fs.readFile(file, 'utf8', function(err, code){
        if ( err ) { reject(err); }
        else {
            var Autor = new AutoPreFix({ browsers: ["last 2 versions"] });
            var Cleaner = new CleanCss({ advanced: true });
            less.render(
                code, {
                    paths: ['.'],
                    filename: path.relative(process.cwd(), file),
                    plugins: [Autor, Cleaner]
                },
                function(err, data){
                    if ( err ) { reject(err); }
                    else {
                        resolve(data.css);
                    }
                }
            );
        }
    });
}

render.scss = render.sass = function(file, resolve, reject){
    sass.render({ file: file, outputStyle: 'expanded' }, function(err, result){
        if ( err ) { reject(err); }
        else {
            var processed = postcss([autoprefixer({ browsers: ["last 2 versions"] })]).process(result.css);
            resolve(processed.css);
        }
    });
}
