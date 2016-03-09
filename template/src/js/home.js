exports.events = {
    beforeload: function(){
        this.$headbar.$reset();
        this.$headbar.center.text = 'Simplize Demo';
        this.$headbar.class = 'white';
        this.$toolbar.status = false;
    }
}
