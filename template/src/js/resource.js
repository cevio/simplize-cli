exports.home = {
    title: '首页',
    icon: '<i class="fa fa-home"></i>',
    url: '/',
    order: 1,
    webviews: {
        index: require('./home'),
        info: require('./info')
    }
}
