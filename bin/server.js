var util = require('../lib/util');
var express = require('express');
var clc = require('cli-color');
var clip = require('../lib/cliboard');
var path = require('path');
var fs = require('fs');
var ejs = require('ejs');
var browserify = require('browserify');
var Promise = require('es6-promise').Promise;
var compression = require('compression');
var css = require('../lib/css');
var _port = 8000, _ip = '0.0.0.0';

var server = module.exports = function(options){
    var app = express();
    var service = new Service(app);

    var port = options.port || _port;
    var ip = options.ip || _ip;
    var __ip = ip === '0.0.0.0' ? '127.0.0.1' : ip;
    var __port = port === 80 ? '' : ':' + port;
    var url = 'http://' + __ip + __port;

    app.engine('html', ejs.renderFile);
    app.use(compression());
    app.set('views', '.');
    service.init();
    app.use(express.static('./src'));
    app.listen(port, ip);
    clip(url);
    console.log(clc.yellow('\nOpen: ' + url));
}

function Service(app){

    var projectjs = path.resolve(process.cwd(), 'project');

    if ( !fs.existsSync(projectjs + '.js') ){
        util.exit('miss project.js.');
        throw new Error('miss project.js.');
    }



    this.app = app;
    this.config = require(path.resolve(process.cwd(), 'project'))(this);
}

Service.prototype.init = function(){
    var result = this.config;
    var that = this;
    if ( result.routes ){
        result.routes.forEach(function(route){
            var type = route.type.toLowerCase(),
                rule = route.rule,
                method = (route.method || 'get').toLowerCase(),
                callback = route.callback || function(){};

            that.create(type, rule, method, callback, route);
        });
    }
}

Service.prototype.create = function(type, rule, method, callback, route){
    var that = this;
    this.app[method](rule, function(req, res){
        if ( typeof callback === 'function' ){
            callback(req, res);
        }
        switch (type) {
            case 'html':
                that.buildHTML(route, req, res);
                break;
            case 'js':
                that.buildJavascript(route, req, res);
                break;
            case 'css':
                that.buildCss(route, req, res);
                break;
        }
    });
}

Service.prototype.find = function(name){
    for ( var i = 0 ; i < this.config.routes.length ; i++ ){
        var route = this.config.routes[i];
        if ( route.name === name ){
            return route;
        }
    }
}

Service.prototype.buildJavascript = function(route, req, res){
    var that = this;
    var file = path.resolve(process.cwd(), route.file);
    var bundleFile = path.resolve(process.cwd(), route.name + '.js');
    var bundle = new Promise(function(resolve, reject){
        browserify(file, {})
            .bundle()
            .pipe(fs.createWriteStream(bundleFile))
            .on('finish', resolve)
            .on('error', reject);
    });

    bundle.then(function(){
        return new Promise(function(resolve, reject){
            fs.readFile(bundleFile, 'utf8', function(err, code){
                if ( err ) { reject(err); }
                else {
                    resolve(code);
                }
            });
        });
    }).then(function(code){
        return new Promise(function(resolve, reject){
            fs.unlink(bundleFile, function(err){
                if ( err ){ reject(err); }
                else {
                    res.type('js');
                    res.status(200).send(code);
                    resolve();
                }
            });
        });
    }).catch(function(err){
        res.status(500).send('please view console to catching error.');
        console.error(err);
    });
}

Service.prototype.buildCss = function(route, req, res){
    var file = route.file,
        result = new Array(file.length),
        orders = [];

    if ( !Array.isArray(file) ) file = [file];
    for ( var i = 0 ; i < file.length ; i++ ) orders.push(PromiseOrder(i));

    Promise.all(orders).then(function(){
        res.type('css');
        res.status(200).send(result.join('\n'));
    }).catch(function(err){
        res.status(500).send('please view console to catching error.');
        console.error(err);
    });

    function PromiseOrder(i){
        return css(file[i]).then(function(code){
            code = '/*from: ' + file[i] + '*/\n' + code;
            result[i] = code;
        });
    }
}

Service.prototype.buildHTML = function(route, req, res){
    var that = this;
    res.render(route.template, route.data || {}, function(err, code){
        var resource = route.resource || {};
        if ( err ){
            res.status(500).send('please view console to catching error.');
            console.error(err);
        }else{
            if ( resource.js ){
                var jsRouter = that.find(resource.js);
                if ( jsRouter ){
                    code = code.replace(/\<\/body\>/, '<script src="' + jsRouter.rule + '"></script>\n</body>');
                }
            }
            if ( resource.css ){
                var cssRouter = that.find(resource.css);
                if ( cssRouter ){
                    code = code.replace(/\<\/head\>/, '<link rel="stylesheet" href="' + cssRouter.rule + '" />\n</head>');
                }
            }
            res.type('html');
            res.status(200).send(code);
        }
    });
}
