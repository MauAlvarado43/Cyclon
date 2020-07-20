import {Router} from 'express'
import path from 'path'
import fs from 'fs'

const router = Router()

/***************************************
                Rendering
***************************************/

router.get('/home', (req,res) => {
    let language = req.acceptsLanguages('es', 'en')
    if (!language) language = "en" 

    let assets = JSON.parse(fs.readFileSync(path.join(__dirname,'../assets/'+language+'.json'),'utf-8'))

    res.render('home', {
        title: `Cyclon - ${assets.titles.home}`, 
        assets: JSON.parse(fs.readFileSync(path.join(__dirname,'../assets/'+language+'.json'),'utf-8')),
        context: req.session
    })
})


router.get('/update', (req,res) => {
    let language = req.acceptsLanguages('es', 'en')
    if (!language) language = "en" 

    let assets = JSON.parse(fs.readFileSync(path.join(__dirname,'../assets/'+language+'.json'),'utf-8'))

    res.render('update', {
        title: `Cyclon - ${assets.titles.update_info}`, 
        assets: assets,
        context: req.session
    })
})

module.exports = router