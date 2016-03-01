module.exports = function(config){
    var result = {};

    result.routes = [
        {
            name: 'index-js',
            type: 'js',
            rule: '/js/index',
            file: './src/js/index.js'
        },
        {
            name: 'index-css',
            type: 'css',
            rule: '/css/index',
            file: [
                './node_modules/simplize/build/index.css',
                './src/css/index.css'
            ]
        },
        {
            name: 'index-html',
            type: 'html',
            rule: '/',
            template: './src/index.html',
            resource: {
                js: 'index-js',
                css: 'index-css'
            }
        }
    ];

    result.projects = {
        "index-html": {
            html: "./build/index.html",
            js: "./build/js/index.js",
            css: "./build/css/index.css"
        }
    }

    return result;
}
