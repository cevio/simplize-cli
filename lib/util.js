exports.exit = function(err){
    if ( err ){
        console.error(err);
        return process.exit(0);
    }
    process.exit(0);
}

exports.resolve = function(err, fn){
    if ( err ){
        return console.error(err);
    }
    fn();
}
