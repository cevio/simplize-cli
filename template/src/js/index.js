var simplize = require('simplize');
var resource = require('./demo/resource');

var home = require('./demo/home');

simplize.ready(function(){
    simplize.viewport('retina');
    var app = simplize(resource);
    
    app.env.debug = true;
    app.$on('ready', function(){
        console.log('app is ready');
    });

    home(app);
    app.$run();
});
