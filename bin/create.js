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
    label: 'Project name',
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
        console.log('\n------------------------------------------------------------');
    }).catch(function(err){
        util.exit(err);
    }).then(function(){
        return creator.download(dir);
    });
}

creator.copyProject = function(dir){
    return new Promise(function(resolve, reject){
        var templateDir = path.resolve(__dirname, '../template');
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
    return {
        "name": name,
        "description": name + " project by simplize",
        "version": "0.0.1",
        "keywords": ["simplize"],
        "repository": {
            "type": "git",
            "url": ""
        },
        "timestamp": new Date().getTime(),
        "dependencies": {
            "simplize": "*"
        },
        "devDependencies": {},
        "scripts": {
            "build": "spz build",
            "dev": "spz server -i 0.0.0.0 -p 8000"
        },
        "engine-strict": true,
        "engines": {
            "node": ">= 4.0.0"
        },
        "licenses": [
            { "type": "MIT" }
        ]
    }
}
