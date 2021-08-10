import {Router} from 'express'
import passport from 'passport'
import {UserModel as User} from '../models/UserModel'
import geoip from 'geoip-lite'
import path from 'path'
import fs from 'fs'
import { encryptFront, decryptFront, encryptAES, decryptAES, encryptAndroid, decryptAndroid, encryptFromFront} from '../utils/cipher'
import { errorLog } from '../utils/logger'
import { sendEmail } from '../utils/email'

const router = Router()

/***************************************
                Rendering
***************************************/

router.get('/', (req,res) => {
    
    if(!req.session.error)
        req.session.error = []

    let language = req.acceptsLanguages('es', 'en')
    if (!language) language = 'en'
    
    if(req.user)
        res.redirect('/home')
    else{

        let assets = JSON.parse(fs.readFileSync(path.join(__dirname,'../assets/'+language+'.json'),'utf-8'))

        res.render('index', {
            title: `Cyclon - ${assets.titles.index}`,
            assets: assets, 
            path: '/',
            errors: (req.session.error)?req.session.error:[]
        })
    }
    
})

router.get('/privacy', (req,res) => {
    let language = req.acceptsLanguages('es', 'en')
    if (!language) language = 'en'

    let assets = JSON.parse(fs.readFileSync(path.join(__dirname,'../assets/'+language+'.json'),'utf-8'))

    res.render('privacy', {
        title: `Cyclon - ${assets.titles.privacy}`, 
        path: '/privacy',
        assets: assets
    })
})

router.get('/terms', (req,res) => {
    let language = req.acceptsLanguages('es', 'en')
    if (!language) language = 'en'

    let assets = JSON.parse(fs.readFileSync(path.join(__dirname,'../assets/'+language+'.json'),'utf-8'))

    res.render('terms', {
        title: `Cyclon - ${assets.titles.terms}`, 
        path: '/terms',
        assets: assets
    })
})

/***************************************
                    API
***************************************/

router.get('/assets', (req,res) => {
    let language = req.acceptsLanguages('es', 'en')
    if (!language) language = 'en'
    res.send(JSON.parse(fs.readFileSync(path.join(__dirname,'../assets/'+language+'.json'),'utf-8')))
})

/***************************************
          API Auth Navigator
***************************************/

router.get('/auth/facebook', passport.authenticate('facebook-auth', { authType: 'rerequest', scope:['email']}))

router.get('/auth/facebook/callback', (req, res, next) => {
    passport.authenticate('facebook-auth', function(err, user, info) {

        if (err){
            req.session.error = err 
            return res.redirect('/?action=login')
        }
        if (!user){ 
            req.session.error = ['BAD_INPUT']
            return res.redirect('/?action=login') 
        }

        req.logIn(user, function(err) {
            if (err) return next({'code':401,'msg':err})
            req.session.error = []
            req.session.type = user.type
            return res.redirect('/home') 
        })
        
    })(req, res, next)
})

router.get('/auth/google',passport.authenticate('google-auth', { scope: ['https://www.googleapis.com/auth/userinfo.profile','https://www.googleapis.com/auth/userinfo.email'] }))

router.get('/auth/google/callback', (req, res, next) => {
    passport.authenticate('google-auth', function(err, user, info) {
        if (err){
            req.session.error = err 
            return res.redirect('/?action=login')
        }
        if (!user){ 
            req.session.error = ['BAD_INPUT']
            return res.redirect('/?action=login') 
        }

        req.logIn(user, function(err) {
            if (err) return next({'code':401,'msg':err})
            req.session.error = []
            req.session.type = user.type
            return res.redirect('/home') 
        })
        
    })(req, res, next)
})

/***************************************
     API Auth Navigator & Mobile
***************************************/

router.post('/auth/mobile/facebook', (req,res) => {

    User.find({email: encryptAES(decryptAndroid(req.body.email))}, (err,docs) => {

        if(err) errorLog.error(err)

		if(docs.length==0) {

            const newUser = new User()
            
            let geo = [decryptAndroid(req.body.lat), decryptAndroid(req.body.lng)]
            
			if(geo){

				let userObject = newUser.encryptUser(
					decryptAndroid(req.body.email),
					geo[0],
					geo[1],
					decryptAndroid(req.body.id)
				)
			
				newUser.name = decryptAndroid(req.body.name)
				newUser.lastName = decryptAndroid(req.body.last_name)
				newUser.email = userObject.email
				newUser.location.lat = userObject.lat
				newUser.location.lng = userObject.lng
				newUser.password = userObject.password
                newUser.type = 0
                newUser.register = 1
                newUser.verify = true
			
				newUser.save()
				res.json({'code':200,'msg':'ACCOUNT_CREATED'})
			}
			else
                res.json({'code':401,'msg':'BAD_LOCATION'})
			    		
		}
		else
			res.json({'code':200,'msg':'LOGIN_SUCCESS'})

	})

})

router.post('/auth/mobile/google', (req,res) => {

    User.find({email: encryptAES(decryptAndroid(req.body.email))}, (err,docs) => {

        if(err) errorLog.error(err)

		if(docs.length==0){
			const newUser = new User()

            let geo = [decryptAndroid(req.body.lat), decryptAndroid(req.body.lng)]

            if(geo){

				let userObject = newUser.encryptUser(
					decryptAndroid(req.body.email),
					geo[0],
					geo[1],
					decryptAndroid(req.body.id)
				)
			
				newUser.name = decryptAndroid(req.body.name)
				newUser.lastName = decryptAndroid(req.body.last_name)
				newUser.email = userObject.email
				newUser.location.lat = userObject.lat
				newUser.location.lng = userObject.lng
				newUser.password = userObject.password
                newUser.type = 0
                newUser.register = 2
                newUser.verify = true
                
				newUser.save()
                
                res.json({'code':200,'msg':'ACCOUNT_CREATED'})
                
			}
			else
				res.json({'code':401,'msg':'BAD_LOCATION'})
			     		
		}
		else
			res.json({'code':200,'msg':'LOGIN_SUCCESS'})

	})

})

router.post('/auth/mobile/register', (req,res, next) => {

    let language = req.acceptsLanguages('es', 'en')
    if (!language) language = 'en' 

    req.body.email = encryptFromFront(decryptAndroid(req.body.email))
    req.body.password = encryptFromFront(decryptAndroid(req.body.password))
    req.body.name = encryptFromFront(decryptAndroid(req.body.name))
    req.body.lastName = encryptFromFront(decryptAndroid(req.body.lastName))

    passport.authenticate('local-signup', function(err, user, info) {
        
        if (err)
            return res.json({'code':401,'msg': err})
        
        if (!user)
            return res.json({'code':401,'msg': ['BAD_INPUT']})
        

        sendEmail(decryptAES(user.email), 'verification', language, user.name + ' ' + user.lastName, user.type, user.email)

        req.logIn(user, function(err) {
            if (err) return next(err)
            req.session.type = user.type
            return res.json({'code':200,'msg':'SIGNUP_SUCCESS'})
        })

    })(req, res, next)

})

router.post('/auth/mobile/login', (req,res, next) => {

    let language = req.acceptsLanguages('es', 'en')
    if (!language) language = 'en' 

    req.body.email = encryptFromFront(decryptAndroid(req.body.email))
    req.body.password = encryptFromFront(decryptAndroid(req.body.password))

    passport.authenticate('local-signin', function(err, user, info) {
        if (err)  return res.send({'code':401,'msg':err})
        if (!user) return res.json({'code':401,'msg':['BAD_INPUT']})

        req.logIn(user, function(err) {
          if (err) return next({'code':401,'msg':err})
          req.session.type = user.type
          res.cookie('auth', encryptAES(JSON.stringify(user)))
          return res.json({'code':200,'msg':['LOGIN_SUCCESS']})
        })
    })(req, res, next)

})

router.post('/auth/register', (req, res, next) => {

    let language = req.acceptsLanguages('es', 'en')
    if (!language) language = 'en' 

    passport.authenticate('local-signup', function(err, user, info) {
        
        if (err)
            return res.json({'code':401,'msg':err})
        
        if (!user)
            return res.json({'code':401,'msg':['BAD_INPUT']})
        

        sendEmail(decryptAES(user.email), 'verification', language, user.name + ' ' + user.lastName, user.type, user.email)

        req.logIn(user, function(err) {
            if (err) return next(err)
            req.session.type = user.type
            return res.json({'code':200,'msg':'SIGNUP_SUCCESS'})
        })

    })(req, res, next)
})

router.post('/auth/login', (req,res,next) => {
    passport.authenticate('local-signin', function(err, user, info) {
        if (err)  return res.send({'code':401,'msg':err})
        if (!user) return res.json({'code':401,'msg':['BAD_INPUT']})

        req.logIn(user, function(err) {
          if (err) return next({'code':401,'msg':err})
          req.session.type = user.type
          res.cookie('auth', encryptAES(JSON.stringify(user)))
          return res.json({'code':200,'msg':['LOGIN_SUCCESS']})
        })
    })(req, res, next)
})

router.get('/logout', (req, res) => {
    req.session.destroy()
    req.logout()
    res.clearCookie('auth')
    res.redirect('/')
})

router.get('/mapRender', (req,res) => {
    res.render('mapRender')
})

router.get('/mapMobile', (req,res) => {
    let language = req.acceptsLanguages('es', 'en')
    if (!language) language = 'en'
    res.render('MapMobile', {
        assets: JSON.parse(fs.readFileSync(path.join(__dirname,'../assets/'+language+'.json'),'utf-8')),
        path: '/home',
        context: {
            location:{
                lat: encryptAES((19).toString()),
                lng: encryptAES((-99).toString())
            }
        },
        functions: {
            decryptAES
        }
    })
})

router.get('/downloadAPK', (req,res) => {
    res.download(path.join(__dirname,'../assets/Cyclon.apk'))
})

router.get('/twitterMobile', (req,res) => {
    let language = req.acceptsLanguages('es', 'en')
    if (!language) language = 'en'
    res.render('TwitterMobile', {
        assets: JSON.parse(fs.readFileSync(path.join(__dirname,'../assets/'+language+'.json'),'utf-8'))    })
})

router.get('/keepAlive' , (req,res) => {
    res.send('Running')
})

module.exports = router