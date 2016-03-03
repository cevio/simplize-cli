exports.home = {
    title: '首页',
    icon: '<i class="fa fa-home"></i>',
    url: '/',
    order: 1,
    webviews: {
        index: {
            events: {
                load: function(){ console.log('index webview load.'); },
                unload: function(){ console.log('index webview unload.'); }
            }
        },
        info: {
            events: {
                load: function(){ console.log('info webview load.'); },
                unload: function(){ console.log('info webview unload.'); }
            }
        }
    }
}
