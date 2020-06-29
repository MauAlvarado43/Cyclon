import minifyAll from 'minify-all'

minifyAll("../config", { silent: false }, function(err){
    if(err){
        console.log(err);
    }
});

minifyAll("../controller", { silent: false }, function(err){
    if(err){
        console.log(err);
    }
});

minifyAll("../models", { silent: false }, function(err){
    if(err){
        console.log(err);
    }
});

minifyAll("../passport", { silent: false }, function(err){
    if(err){
        console.log(err);
    }
});

minifyAll("../routes", { silent: false }, function(err){
    if(err){
        console.log(err);
    }
});

minifyAll("../utils", { silent: false }, function(err){
    if(err){
        console.log(err);
    }
});

minifyAll("../views", { silent: false }, function(err){
    if(err){
        console.log(err);
    }
});