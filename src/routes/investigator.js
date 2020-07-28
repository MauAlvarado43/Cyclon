import {Router} from 'express'
import passport from 'passport'
import path from 'path'
import fs from 'fs'

const router = Router()

/***************************************
                Rendering
***************************************/

router.get('/records', (req,res) => {

    let language = req.acceptsLanguages('es', 'en')
    if (!language) language = 'en' 

    let assets = JSON.parse(fs.readFileSync(path.join(__dirname,'../assets/'+language+'.json'),'utf-8'))

    if(!req.user)
        res.redirect('/')
    else
        res.render('records', {
            title: `Cyclon - ${assets.titles.home}`, 
            assets: assets,
            path: '/records',
            context: req.user
        })
})

module.exports = router