/**
 *  依赖获取
 *  模块获取
 *  建议分模块写逻辑代码
 */
var simplize = require('simplize');
var resource = require('./demo/resource');
var home = require('./demo/home');

/**
 *  domReady事件
 *  当节点全部加载完毕后执行操作
 */
simplize.ready(function(){
    /**
     *  设置retina模式
     *  高清分辨率支持，css使用请参考文档
     */
    simplize.viewport('retina');

    /**
     *  初始化simplize
     *  获得app对象，可用于后续路由绑定
     */
    var app = simplize(resource);

    /**
     *  设置debug模式
     *  将打印vue信息
     */
    app.env.debug = true;

    /**
     *  绑定app事件
     *  ready: app引擎运行完毕后执行
     *  可用于移除过度动画效果等等...
     */
    app.$on('ready', function(){ console.log('app is ready'); });

    /**
     *  加载home路由
     *  分文件编写内容，便于代码维护
     */
    home(app);

    /**
     *  运行app
     *  之后项目就启动了
     *  直接可以通过 npm run dev 查看页面 并且调试程序
     */
    app.$run();
});
