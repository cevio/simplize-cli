var Browser = module.exports = function(app){
    var homeBrowser = app.$browser('home');
    app.$use(homeBrowser);
    Browser.info(homeBrowser);
    Browser.index(homeBrowser);
}

Browser.index = function(browser){
    browser.$active(function(){
        this.$render('index', {
            before: function(){
                this.$headbar.$reset();
                this.$headbar.center.text = 'Simplize Demo';
                this.$headbar.class = 'white';
                this.$toolbar.status = false;
            }
        })
    });
}

Browser.info = function(browser){
    browser.$active('/info', function(){
        this.$render('info', {
            before: function(){
                this.$headbar.$reset();
                this.$headbar.left.icon = '<i class="fa fa-angle-left">';
                this.$headbar.left.text = 'Back';
                this.$headbar.left.fn = function(){ history.back(); };
                this.$headbar.center.text = 'Welcome';
                this.$headbar.class = 'white';
                this.$toolbar.status = false;
            }
        })
    });
}
