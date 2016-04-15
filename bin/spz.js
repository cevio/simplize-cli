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
    .command('tool')
    .description('Create component or tools.')
    .action(require.sync('./tool'));

program.parse(process.argv);
