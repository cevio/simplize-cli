exports.events = {
    beforeload: function(){
        this.$headbar.$reset();
        this.$headbar.left.icon = '<i class="fa fa-angle-left">';
        this.$headbar.left.text = 'Back';
        this.$headbar.left.fn = function(){ history.back(); };
        this.$headbar.center.text = 'Welcome';
        this.$headbar.class = 'white';
        this.$toolbar.status = false;
    }
}
