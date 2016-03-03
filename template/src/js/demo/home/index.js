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
                this.$headbar.left.icon = '';
                this.$headbar.left.text = '';
                this.$headbar.left.fn = function(){};
                this.$headbar.center.text = 'Simplize Demo Homepage';
                this.$headbar.center.fn = function(){};
                this.$headbar.right.icon = '<i class="fa fa-list"></i>';
                this.$headbar.right.text = '';
                this.$headbar.right.fn = function(){
                    alert('you had click list-button');
                };
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
                this.$headbar.left.icon = '<i class="fa fa-angle-left">';
                this.$headbar.left.text = 'Back';
                this.$headbar.left.fn = function(){
                    history.back();
                };
                this.$headbar.center.text = 'Simplize Demo Infopage';
                this.$headbar.center.fn = function(){};
                this.$headbar.right.icon = '';
                this.$headbar.right.text = '';
                this.$headbar.right.fn = function(){};
                this.$headbar.class = 'white';
                this.$toolbar.status = false;
            }
        })
    });
}
