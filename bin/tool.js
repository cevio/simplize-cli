var util = require('../lib/util');
var prompt = require('cli-prompt');
var clc = require('cli-color');
var path = require('path');
var fs = require('fs-extra');
var Promise = require('es6-promise').Promise;
var kexec = require('kexec');

var creator = module.exports = function(){
    prompt.multi([creator.promptMessage], function(options){
        var dir = path.resolve(process.cwd(), options.project);
        if ( !fs.existsSync(dir) ){
            creator.makeProject(options.project, dir);
        }else{
            util.exit('project exsit.');
        }
    });
}

creator.promptMessage = {
    label: 'Tool name',
    key: 'project',
    validate: function (val) {
        if ( !val.length ) {
            throw new Error('please input project name');
        }
    }
}

creator.makeProject = function(project, dir){
    creator.copyProject(dir).then(function(){
        return creator.makePackageJSON(project, dir);
    }).then(function(){
        console.log(clc.green('\n[' + new Date() + ']') + ' Project ' + project + ' created.');
        console.log('\n');
        console.log(clc.magentaBright('> npm install\n'));
        console.log('------------------------------------------------------------');
    }).catch(function(err){
        util.exit(err);
    }).then(function(){
        return creator.download(dir);
    });
}

creator.copyProject = function(dir){
    return new Promise(function(resolve, reject){
        var templateDir = path.resolve(__dirname, '../template/tool');
        fs.copy(templateDir, dir, function(err){
            if ( err ){ reject(err) }
            else{
                resolve();
            }
        });
    });
}

creator.makePackageJSON = function(project, dir){
    return new Promise(function(resolve, reject){
        fs.writeFile(
            path.resolve(dir, 'package.json'),
            JSON.stringify(creator.packageJSON(project), null, 2),
            "utf8",
            function(err){
                if ( err ) { reject(err) }
                else{
                    resolve();
                }
            }
        )
    });
}

creator.download = function(dir){
    return new Promise(function(resolve, reject){
        process.chdir(dir);
        kexec('npm', ['install']);
    });
}

creator.packageJSON = function(name){
    var _name = name.replace(/\-(\w)/g, function(all, letter){
      return letter.toUpperCase();
    });
    return {
      "name": name,
      "version": "1.0.0",
      "description": name + " Tool",
      "main": "build/index.js",
      "scripts": {
        "dev": "cross-env NODE_ENV=dev node_modules/.bin/webpack-dev-server --progress --colors --inline --hot --display-error-details --content-base src/",
        "build": "rimraf ./build && cross-env NODE_ENV=production webpack -p"
      },
      "author": "",
      "license": "MIT",
      "project-type": "umd",
      "project-library": _name,
      "devDependencies": {
          "autoprefixer": "^6.3.6",
          "babel-core": "^6.7.6",
          "babel-loader": "^6.2.4",
          "babel-plugin-add-module-exports": "^0.1.2",
          "babel-preset-es2015": "^6.6.0",
          "cross-env": "^1.0.7",
          "css-loader": "^0.23.1",
          "extract-text-webpack-plugin": "^1.0.1",
          "html-loader": "^0.4.3",
          "html-minify-loader": "^1.1.0",
          "less-loader": "^2.2.3",
          "postcss-loader": "^0.8.2",
          "style-loader": "^0.13.1",
          "webpack": "^1.12.15",
          "less": "^2.6.1",
          "webpack-dev-server": "^1.14.1",
          "rimraf": "*"
      }
    }
}
