import {Router} from 'express'
import passport from 'passport'
import {UserModel as User} from '../models/UserModel'
import path from 'path'
import fs from 'fs'

const router = Router()

/***************************************
                Rendering
***************************************/

router.get('/home', (req,res) => {
    let language = req.acceptsLanguages('es', 'en')
    if (!language) language = "en" 

    passport.deserializeUser(function(id, done) {

        console.log(id)

        User.findById(id, function(err, user) {
            console.log(user)
        })

    })

    let assets = JSON.parse(fs.readFileSync(path.join(__dirname,'../assets/'+language+'.json'),'utf-8'))

    res.render('terms', {
        title: `Cyclon - ${assets.titles.terms}`, 
        assets: JSON.parse(fs.readFileSync(path.join(__dirname,'../assets/'+language+'.json'),'utf-8')),
        context: {}
    })
})

module.exports = router