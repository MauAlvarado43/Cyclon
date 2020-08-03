import {Router} from 'express'
import path from 'path'
import fs from 'fs'
import { validateToken, decryptAES, decryptFront, encryptAES } from '../utils/cipher'
import { UserModel as User } from '../models/UserModel'
import { errorLog } from '../utils/logger'
import { sendEmail } from '../utils/email'
import geoip from 'geoip-lite'


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
            title: `Cyclon - ${assets.titles.records}`, 
            assets: assets,
            context: req.user,
            path: '/home',
            functions: {
                decryptAES
            }
        })
})

router.get('/recoverPassword', async (req,res) => {

    let language = req.acceptsLanguages('es', 'en')
    if (!language) language = 'en'

    let assets = JSON.parse(fs.readFileSync(path.join(__dirname,'../assets/'+language+'.json'),'utf-8'))

    if(req.query.v && req.query.u){

        let email = decryptAES(req.query.u)
        let docs = await User.find({email: email})

        if(docs.length==1){
            if(validateToken(req.query.v)){

                req.session.tokenRecover = req.query.v
                req.session.userRecover = email

                res.render('recoverForm', {
                    title: `Cyclon - ${assets.titles.recoverPassword}`,
                    path: '/recoverPassword',
                    assets: assets
                })

            }
            else{
                res.render('tokenExpired', {
                    title: `Cyclon - ${assets.errors.TOKEN_INVALID}`, 
                    path: '/recoverPassword',
                    assets: assets
                })
            }
        }
        else{
            res.redirect('/')
        }

    }
    
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
            path: '/update',
            functions: {
                decryptAES
            }
        })
    }

})

/***************************************
                   API
***************************************/

router.get('/api/resendVerificationEmail', (req,res) => {

    let language = req.acceptsLanguages('es', 'en')
    if (!language) language = 'en' 

    sendEmail(decryptAES(req.user.email), 'verification', language, req.user.name + ' ' + req.user.lastName, req.user.type, req.user.email)
    res.json({'code': 200, 'msg': 'RESENDED_VEMAIL' }) 

})

router.get('/api/updateLocation', (req,res) => {

    let geo = geoip.lookup(req.ip)

    geo = {
        ll: [19, -99]
    }

    User.updateOne({email: req.user.email}, {$set: { lat: encryptAES(geo[0]), lng: encryptAES(geo[1]) } }, (err,raw) => {
        if(err) 
            res.json({'code': 401, 'msg': '500'})
        else{
            res.json({'code': 200, 'msg': 'UPDATED_LOCATION' }) 
            req.session.destroy()
            req.logout()
        }
    }) 

})

router.post('/api/updatePassword', (req,res) => {

    let language = req.acceptsLanguages('es', 'en')
    if (!language) language = 'en' 

    if(req.session.allowChanges){

        let password = decryptFront(req.body.password)

        const user = new User()
        const userValidation = user.validateUser( req.user.name, req.user.lastName, decryptAES(req.user.email), password)

        if(userValidation.length==0){
            User.updateOne({email: req.user.email}, {$set: { password: encryptAES(password) } }, (err,raw) => {
                if(err) 
                    res.json({'code': 401, 'msg': '500'})
                else{
                    res.json({'code': 201, 'msg': 'LOGIN_AGAIN' }) 
                    req.session.destroy()
                    req.logout()
                }
            }) 
        }
        else
            res.json({'code': 401, 'msg': 'BAD_INPUT'})

    }

    req.session.allowChanges = false

})

router.post('/api/updateInfo', async (req,res) => {

    let language = req.acceptsLanguages('es', 'en')
    if (!language) language = 'en' 

    let newName = decryptFront(req.body.name)
    let newApat = decryptFront(req.body.lastName)
    let newEmail = decryptFront(req.body.email)

    const user = new User()

    const userValidation = user.validateUser( newName, newApat, newEmail, decryptAES(req.user.password))

    if(req.session.allowChanges){

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
    }
    else if(req.user.register==1 || req.user.register==2){
        User.updateOne({email: req.user.email}, {$set: { lastName: newApat, name: newName } }, (err,raw) => {
            if(err) 
                res.json({'code': 401, 'msg': '500'})
            else
                res.json({'code': 200, 'msg': 'UPDATE_SUCCESS' })
        }) 
    }

    req.session.allowChanges = false

})

router.post('/api/verifyPassword', (req,res) => {
    if(!req.user){
        res.json({ 'code': 402, 'msg': '' })
        req.session.allowChanges = false
    }
    else{
        if(req.user.password != encryptAES(decryptFront(req.body.password))){
            req.session.allowChanges = false
            res.json({ 'code': 401, 'msg': 'INCORRECT_PASSWORD' })
        }
        else{
            req.session.allowChanges = true
            res.json({ 'code': 200, 'msg': '' })
        }
    }

})

router.post('/api/changePassword', (req,res) => {
    
    if(req.session.tokenRecover && req.session.userRecover){

        let password = decryptFront(req.body.password)

        const user = new User()
        const userValidation = user.validateUser("rootroot", "rootroot", decryptAES(req.session.userRecover), password)

        if(userValidation.length==0){
            User.updateOne({email: req.session.userRecover}, {$set: { password: encryptAES(password) } }, (err,raw) => {
                if(err) 
                    res.json({'code': 401, 'msg': '500'})
                else{
                    res.json({'code': 201, 'msg': 'LOGIN_AGAIN' }) 
                    req.logout()
                    req.session.destroy()
                }
            }) 
        }
        else
            res.json({'code': 401, 'msg': 'BAD_INPUT'})

    }
    
})

router.post('/api/requestRecoverPassword', async (req,res) => {

    let language = req.acceptsLanguages('es', 'en')
    if (!language) language = 'en' 

    let email = encryptAES(decryptFront(req.body.email))
    let docs = await User.find({ email: encryptAES(decryptFront(req.body.email)) })

    if(docs.length==0)
        res.json({ 'code': 401, 'msg': 'USER_NOT_EXIST'})
    else{
        sendEmail(decryptAES(email), 'recover', language, docs[0].name + ' ' + docs[0].lastName, docs[0].type, email)
        res.json({ 'code': 200, 'msg': 'recover_acepted'})
    }

})

router.get('/api/upgradeUser', async (req,res) => {
    User.updateOne({email: req.user.email, verify: true}, {$set: { type: 1 } }, (err,raw) => {
        if(err) 
            res.json({'code': 401, 'msg': '500'})
        else{
            res.json({'code': 201, 'msg': 'LOGIN_AGAIN' }) 
            req.logout()
            req.session.destroy()
        }
    })
})

module.exports = router