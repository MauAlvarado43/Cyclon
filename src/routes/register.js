import {Router} from 'express'
import path from 'path'
import fs from 'fs'
import { validateToken, decryptAES, decryptFront, encryptAES } from '../utils/cipher'
import { UserModel as User } from '../models/UserModel'
import { errorLog } from '../utils/logger'
import { sendEmail } from '../utils/email'

const router = Router()

/***************************************
                Rendering
***************************************/

router.get('/home', (req,res) => {
    let language = req.acceptsLanguages('es', 'en')
    if (!language) language = 'en'

    let assets = JSON.parse(fs.readFileSync(path.join(__dirname,'../assets/'+language+'.json'),'utf-8'))

    if(!req.user)
        res.redirect('/')
    else
        res.render('home', {
            title: `Cyclon - ${assets.titles.home}`, 
            assets: JSON.parse(fs.readFileSync(path.join(__dirname,'../assets/'+language+'.json'),'utf-8')),
            context: req.user,
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
                User.updateOne({email: email}, {$set: { verify: true } }, (err,raw) => {
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
    else{
        res.redirect('/')
    }

})

router.get('/update', (req,res) => {

    if(!req.user){
        res.redirect('/')
    }
    else{
        let language = req.acceptsLanguages('es', 'en')
        if (!language) language = 'en' 

        let assets = JSON.parse(fs.readFileSync(path.join(__dirname,'../assets/'+language+'.json'),'utf-8'))
            
        res.render('update', {
            title: `Cyclon - ${assets.titles.update_info}`, 
            assets: assets,
            context: req.user,
            functions: {
                decryptAES
            }
        })
    }

})

/***************************************
                   API
***************************************/

router.post('/updateInfo', async (req,res) => {

    let language = req.acceptsLanguages('es', 'en')
    if (!language) language = 'en' 

    let newName = decryptFront(req.body.name)
    let newApat = decryptFront(req.body.lastName)
    let newEmail = decryptFront(req.body.email)

    const user = new User()

    const userValidation = user.validateUser( newName, newApat, newEmail, decryptAES(req.user.password))

    if(userValidation.length==0){

        newEmail = encryptAES(newEmail)

        if(req.user.email == newEmail){
            User.updateOne({email: req.user.email}, {$set: { lastName: newApat, name: newName } }, (err,raw) => {
                if(err) 
                    res.json({'code': 401, 'msg': '500'})
                else 
                    res.json({'code': 200, 'msg': 'UPDATE_SUCCESS' })
            }) 
        }
        else{
            let docs = await User.find({ email: newEmail })

            if(docs.length==0){
                User.updateOne({email: req.user.email}, {$set: { verify: false, email: newEmail, lastName: newApat, name: newName } }, (err,raw) => {
                    if(err) 
                        res.json({'code': 401, 'msg': '500'})                    
                    else {
                        sendEmail(decryptAES(newEmail), 'verification', language, newName + ' ' + newApat, req.user.type, newEmail)
                        res.json({'code': 201, 'msg': 'LOGIN_AGAIN' }) 
                        req.session.destroy()
                        req.logout()
                    }
                }) 
            }
            else
                res.json({'code': 401, 'msg': 'EMAIL_TAKEN'})
        }    

    }
    else
        res.json({'code': 401, 'msg': 'BAD_INPUT'})

})

router.post('/verifyPassword', (req,res) => {
    if(!req.user){
        res.json({ 'code': 402, 'msg': '' })
    }
    else{
        if(req.user.password != encryptAES(decryptFront(req.body.password)))
            res.json({ 'code': 401, 'msg': 'INCORRECT_PASSWORD' })
        else
            res.json({ 'code': 200, 'msg': '' })
    }
})

module.exports = router