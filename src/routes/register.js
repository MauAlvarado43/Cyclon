import {Router} from 'express'
import path from 'path'
import fs from 'fs'
import { validateToken, decryptAES } from '../utils/cipher'
import { UserModel as User } from '../models/UserModel'
import { errorLog } from '../utils/logger'

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
        context: req.session,
        functions: {
            decryptAES
        }
    })
})

router.get('/verifyAccount', async (req,res) => {

    if(req.query.v && req.query.u){

        let email = decryptAES(req.query.u)
        let docs = await User.find({email: email})

        if(docs.length==1){
            if(!docs[0].verify && validateToken(req.query.v)){
                User.update({email: email}, {$set: { verify: true } }, (err,raw) => {
                    if(err) {
                        errorLog.error(err)
                        req.session.verify = true
                        res.redirect('/')
                    }
                    else {
                        res.redirect('/home') 
                    }
                })         
            }
            else{
                res.redirect('/')
            }
        }
        else{
            res.redirect('/')
        }
    }

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