import './resource'; // 加载资源文件

// load simplize
import * as simplize from 'simplize';

// load browsers.
import * as browsers from './js/browsers';

simplize.ready(function(){
    const app = simplize.bootstrap(browsers, { SP_animate_switch: 'fade' });
    const indexBrowser = app.$browser('index');

    app.$use(indexBrowser.$define('index'));
    app.$run();
})
