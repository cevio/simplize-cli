#!/usr/bin/env node

'use strict';

var program = require('commander');
var pkg = require('../package.json');

require.sync = function(name){
    var that = this;
    return function(){
        return require(name).apply(that, arguments);
    }
}

program.version(pkg.version);

program
    .command('create')
    .description('Create a new project by simplize.')
    .action(require.sync('./create'));

program
    .command('server')
    .description('start debug service')
    .option('-p, --port <port>', 'server port')
    .option('-i, --ip <ip>', 'server ip')
    .action(require.sync('./server'));

program
    .command('build')
    .description('Create a new project using simplize.')
    .action(require.sync('./build'));

program.parse(process.argv);