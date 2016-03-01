var util = require('../lib/util');
var fs = require('fs-extra');
var path = require('path');
var inquirer = require("inquirer");
var Promise = require('es6-promise').Promise;
var browserify = require('browserify');
var ug = require('uglify-js');
var ejs = require('ejs');
var htmlminify = require('html-minifier').minify;
var cssPromise = require('../lib/css');
var cssmin = require('cssmin');
var clc = require('cli-color');

var builder = module.exports = function(){
    var projectjs = path.resolve(process.cwd(), 'project');

    if ( !fs.existsSync(projectjs + '.js') ){
        util.exit('miss project.js.');
        throw new Error('miss project.js.');
        return;
    }

    var service = new Service(require(projectjs));

    service.prompt()
    .then(service.std.bind(service))
    .then(service.buildHTML.bind(service))
    .then(service.buildJavascript.bind(service))
    .then(service.buildCss.bind(service))
    .then(service.rebuildHTML.bind(service))
    .then(service.resolve.bind(service))
    .then(util.exit)
    .catch(util.exit);
}

function Service(fn){
    this.configs = fn(this);
    this.project = null;
    this.stdin = null;
    this.stdout = null;
    this.code = null;
    this.js = null;
    this.css = null;
    this.js_path = null;
    this.css_path = null;
    this.html_path = null;
}

Service.prototype.find = function(name){
    for ( var i = 0 ; i < this.configs.routes.length ; i++ ){
        var route = this.configs.routes[i];
        if ( route.name === (name || this.project) ){
            return route;
        }
    }
}

Service.prototype.prompt = function(){
    var that = this;
    return new Promise(function(resolve, reject){
        if ( !that.configs.projects ){
            return reject('miss project property.');
        }
        inquirer.prompt(
            [
                {
                    type: "list",
                    name: "project",
                    message: "Choose a project to build",
                    choices: Object.keys(that.configs.projects)
                }
            ],
            function(answers) {
                that.project = answers.project;
                console.log('\n[' + that.project + '] compiling ...');
                resolve();
            }
        );
    });
}

Service.prototype.std = function(){
    var that = this;
    return new Promise(function(resolve, reject){
        that.stdin = that.find();
        that.stdout = that.configs.projects[that.project];
        if ( !that.stdin || !that.stdout ){
            return reject('miss config data.');
        }
        resolve();
    });
}

Service.prototype.buildHTML = function(){
    var that = this;
    return new Promise(function(resolve, reject){
        var file = path.resolve(process.cwd(), that.stdin.template);
        fs.exists(file, function(exists){
            if ( exists ){
                ejs.renderFile(file, that.stdin.data || {}, function(err, code){
                    if ( err ) { reject(err); }
                    else{
                        that.code = code;
                        if ( that.stdin.resource ){
                            that.js = that.stdin.resource.js;
                            that.css = that.stdin.resource.css;
                        }
                        resolve();
                    }
                });
            }else{
                reject('file is not exist: ' + file);
            }
        });
    });
}

Service.prototype.buildJavascript = function(){
    var that = this;
    return new Promise(function(resolve, reject){
        if ( !that.js ) { resolve(); }
        else {
            var js = that.find(that.js);
            if ( !js ){ reject('miss js resource.'); }
            else {
                var file = path.resolve(process.cwd(), js.file);
                fs.exists(file, function(exist){
                    if ( !exist ) { reject('miss js file'); }
                    else{
                        var bundleFile = path.resolve(process.cwd(), js.name + '.js');
                        var outfile = path.resolve(process.cwd(), that.stdout.js);
                        browserify(file, {})
                            .bundle()
                            .pipe(fs.createWriteStream(bundleFile))
                            .on('finish', function(){
                                var result = ug.minify(bundleFile);
                                fs.outputFile(outfile, result.code, 'utf8', function(err){
                                    if ( err ) { reject(err); }
                                    else {
                                        that.js_path = outfile;
                                        fs.unlink(bundleFile, function(err){
                                            if ( err ) { reject(err); }
                                            else{
                                                resolve();
                                            }
                                        });
                                    }
                                })
                            })
                            .on('error', reject);
                    }
                })
            }
        }
    });
}

Service.prototype.buildCss = function(){
    var that = this;
    return new Promise(function(resolve, reject){
        if ( !that.css ) { resolve(); }
        else {
            var css = that.find(that.css);
            if ( !css ) { reject('miss css resource.'); }
            else {
                if ( !Array.isArray(css.file) ){
                    css.file = [css.file];
                }
                var result = new Array(css.file.length), orders = [];
                for ( var i = 0 ; i < css.file.length ; i++ ) orders.push(PromiseOrder(i));

                Promise.all(orders).then(function(){
                    var code = result.join('\n');
                    var outfile = path.resolve(process.cwd(), that.stdout.css);
                    fs.outputFile(outfile, cssmin(code), 'utf8', function(err){
                        if ( err ) { reject(err); }
                        else {
                            that.css_path = outfile;
                            resolve();
                        }
                    })
                }).catch(reject);

                function PromiseOrder(i){
                    return cssPromise(css.file[i]).then(function(code){
                        result[i] = code;
                    });
                }
            }
        }
    });
}

Service.prototype.rebuildHTML = function(){
    var that = this;
    return new Promise(function(resolve, reject){
        var relative, stramp = new Date().getTime();
        that.html_path = path.resolve(process.cwd(), that.stdout.html);
        var dirname = path.dirname(that.html_path);

        if ( that.js_path ){
            relative = path.relative(dirname, that.js_path);
            that.code = that.code.replace(/<\/body>/, '<script src="' + relative + '?' + stramp + '"></script>\n</body>');
        }

        if ( that.css_path ){
            relative = path.relative(dirname, that.css_path);
            that.code = that.code.replace(/<\/head>/, '<link rel="stylesheet" href="' + relative + '?' + stramp + '" />\n</head>');
        }

        that.code = htmlminify(that.code, {
            removeComments: true,
            collapseWhitespace: true,
            minifyJS:true,
            minifyCSS:true
        });

        fs.outputFile(that.html_path, that.code, 'utf8', function(err){
            if ( err ) { reject(err); }
            else {
                resolve();
            }
        });
    });
}

Service.prototype.resolve = function(){
    var that = this;
    return new Promise(function(resolve, reject){
        var result = [];
        if ( that.html_path ){
            var html = fs.statSync(that.html_path);
            var html_size = html.size;
            result.push(clc.green('[' + getSize(html_size) +'] ') + that.html_path);
        }
        if ( that.js_path ){
            var js = fs.statSync(that.js_path);
            var js_size = js.size;
            result.push(clc.green('[' + getSize(js_size) +'] ') + that.js_path);
        }
        if ( that.css_path ){
            var css = fs.statSync(that.css_path);
            var css_size = css.size;
            result.push(clc.green('[' + getSize(css_size) +'] ') + that.css_path);
        }
        if ( result.length ){
            console.log('\n');
            result.forEach(function(text){
                console.log(text);
            });
        }
        resolve();
    });
}

function getSize(code){
  return (code / 1024).toFixed(2) + 'kb';
}