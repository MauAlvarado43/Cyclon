import minifyAll from 'minify-all'
import path from 'path'

minifyAll(path.join(__dirname,'../config'), { silent: true }, function(err){
    if(err){
        console.log(err)
    }
})

minifyAll(path.join(__dirname,'../controller'), { silent: true }, function(err){
    if(err){
        console.log(err)
    }
})

minifyAll(path.join(__dirname,'../models'), { silent: true }, function(err){
    if(err){
        console.log(err)
    }
})

minifyAll(path.join(__dirname,'../passport'), { silent: true }, function(err){
    if(err){
        console.log(err)
    }
})

minifyAll(path.join(__dirname,'../routes'), { silent: true }, function(err){
    if(err){
        console.log(err)
    }
})

minifyAll(path.join(__dirname,'../utils'), { silent: true }, function(err){
    if(err){
        console.log(err)
    }
})

minifyAll(path.join(__dirname,'../views'), { silent: true }, function(err){
    if(err){
        console.log(err)
    }
})