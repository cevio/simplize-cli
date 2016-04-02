module.exports = function(config){
    var result = {};
    // 写入路由规则
    result.routes = [{
            name: 'compare-tool',
            file: './src/js/index.js'
        },
        {
            name: 'index-js',
            type: 'js',
            rule: '/js/index', // js 资源路由
            file: './src/js/index.js' // 加载自定义的js文件逻辑
        },
        {
            name: 'index-css',
            type: 'css',
            rule: '/css/index', // css 资源路由
            file: [
                './src/css/index.scss' // 加载自定义的scss文件样式
            ]
        },
        {
            // html 文档输出
            name: 'index-html',
            type: 'html',
            rule: '/', // 输出地址如果是 http://127.0.0.1的时候匹配到
            template: './src/index.html', // 加载 模板文件
            resource: {
                js: 'index-js', // html文档页面有 index-js 这个资源
                css: 'index-css' // html 文档页面有 index-css 这个资源
            }
        }
    ];
    // 写入项目输入与输出
    result.projects = {
        "index-html": {
            html: "./build/index.html",
            js: "./build/js/index.js",
            css: "./build/css/index.css"
        },
        "compare-tool": {
            tool: true,
            resource: 'compare-tool',
            js: "./build/index.js",
            mode: 'umd',
            library: 'toolname',
            main: 'build/index.js'
        }
    }

    return result;
}
