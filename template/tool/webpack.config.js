var ExtractTextPlugin = require('extract-text-webpack-plugin');
var AutoPrefixer = require('autoprefixer');
var options = require('./project');
var pkg = require('./package.json');

var env = process.env.NODE_ENV
    , jshash = '.[hash:10]'
    , plugins = []
    , loaders = [
        { test: /\.js$/, exclude: /node_modules/, loader: "babel" }
    ];

if ( env != 'production' ){
    jshash  = '';
    plugins = [];
    loaders.push(
        { test: /\.css$/, loader: "style!css!postcss" },
        { test: /\.less$/, loader: "style!css!postcss!less" },
        { test: /\.html$/, loader: "html" }
    );
}
else{
    loaders.push(
        { test: /\.css$/, loader: ExtractTextPlugin.extract("style", "css!postcss") },
        { test: /\.less$/, loader: ExtractTextPlugin.extract("style", "css!postcss!less") },
        { test: /\.html$/, loader: "html!html-minify" }
    );

    if ( options.css ){
        var ext = '.[contenthash:10].css';
        if ( pkg['project-type'] === 'umd' ){
            ext = '.css';
        }
        plugins.push(new ExtractTextPlugin(options.css + ext));
    }
}

var result = {
    entry: options.js.from[env],
    output: {
        path: options.output,
        filename: options.js.to + (env == 'production' ? '' : jshash) + '.js'
    },
    module: { loaders: loaders },
    postcss: function(){
        return [AutoPrefixer({ browsers: ['last 20 versions'] })]
    },
    plugins: plugins
};

if ( env != 'production' ){
    result.output.library = pkg['project-library'];
    result.output.libraryTarget = 'var';
}else{
    result.output.library = pkg['project-library'];
    result.output.libraryTarget = 'umd';
}
module.exports = result;
