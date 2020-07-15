import {Router} from 'express'
import passport from 'passport'
import {UserModel as User} from '../models/UserModel'
import geoip from 'geoip-lite'
import path from 'path'
import fs from 'fs'

const router = Router()

/***************************************
                Rendering
***************************************/

router.get('/', (req,res) => {
    let language = req.acceptsLanguages('es', 'en')
    if (!language) language = "en" 

    let assets = JSON.parse(fs.readFileSync(path.join(__dirname,'../assets/'+language+'.json'),'utf-8'))

    res.render('index', {
        title: `Cyclon - ${assets.titles.index}`,
        assets: assets, 
        errors: req.flash('error')
    })
})

router.get('/privacy', (req,res) => {
    let language = req.acceptsLanguages('es', 'en')
    if (!language) language = "en" 

    let assets = JSON.parse(fs.readFileSync(path.join(__dirname,'../assets/'+language+'.json'),'utf-8'))

    res.render('privacy', {
        title: `Cyclon - ${assets.titles.privacy}`, 
        assets: JSON.parse(fs.readFileSync(path.join(__dirname,'../assets/'+language+'.json'),'utf-8'))
    })
})

router.get('/terms', (req,res) => {
    let language = req.acceptsLanguages('es', 'en')
    if (!language) language = "en" 

    let assets = JSON.parse(fs.readFileSync(path.join(__dirname,'../assets/'+language+'.json'),'utf-8'))

    res.render('terms', {
        title: `Cyclon - ${assets.titles.terms}`, 
        assets: JSON.parse(fs.readFileSync(path.join(__dirname,'../assets/'+language+'.json'),'utf-8'))
    })
})


/***************************************
          API Auth Navigator
***************************************/

router.get('/auth/facebook', passport.authenticate('facebook-auth', { authType: 'rerequest', scope:['email']}))

router.get('/auth/facebook/callback', (req, res, next) => {
    passport.authenticate('facebook-auth', function(err, user, info) {
        if (err){
            req.flash('error', err) 
            return res.redirect("/?action=login")
        }
        if (!user){ 
            req.flash('error', ["BAD_INPUT"]) 
            return res.redirect("/?action=login") 
        }
        req.flash('error', []) 
        return res.redirect("/") 
    })(req, res, next)
})

router.get('/auth/google',passport.authenticate('google-auth', { scope: ['https://www.googleapis.com/auth/userinfo.profile','https://www.googleapis.com/auth/userinfo.email'] }))

router.get('/auth/google/callback', (req, res, next) => {
    passport.authenticate('google-auth', function(err, user, info) {
        if (err){
            req.flash('error', err) 
            return res.redirect("/?action=login")
        }
        if (!user){ 
            req.flash('error', ["BAD_INPUT"]) 
            return res.redirect("/?action=login") 
        }
        req.flash('error', [""]) 
        return res.redirect("/") 
    })(req, res, next)
})

/***************************************
     API Auth Navigator & Mobile
***************************************/

router.post('/auth/mobile/facebook', (req,res) => {

    User.find({email: req.body.email}, (err,docs) => {

        console.log(docs)

		if(docs.length==0){
			const newUser = new User()

			let geo = geoip.lookup(req.ip)
			
			if(geo){

				let userObject = newUser.encryptUser(
					req.body.email,
					geo.ll[0],
					geo.ll[1],
					req.body.id
				)
			
				newUser.name = req.body.givenName
				newUser.lastName = req.body.familyName
				newUser.email = userObject.email
				newUser.location.lat = userObject.lat
				newUser.location.lng = userObject.lng
				newUser.password = userObject.password
				newUser.type = 0

				console.log(newUser)
			
				newUser.save()
				done(null, newUser)
			}
			else{
				return done(["BAD_LOCATION"], false)
			}     		
		}
		else{
			done(null, docs[0])
		}

	})

})

router.post('/auth/mobile/google', (req,res) => {

    User.find({email: req.body.email}, (err,docs) => {

        console.log(docs)

		if(docs.length==0){
			const newUser = new User()

			let geo = geoip.lookup(req.ip)
			
			if(geo){

				let userObject = newUser.encryptUser(
					req.body.email,
					geo.ll[0],
					geo.ll[1],
					req.body.id
				)
			
				newUser.name = req.body.givenName
				newUser.lastName = req.body.familyName
				newUser.email = userObject.email
				newUser.location.lat = userObject.lat
				newUser.location.lng = userObject.lng
				newUser.password = userObject.password
				newUser.type = 0

				console.log(newUser)
			
				newUser.save()
                
                res.json({code:200,"msg":["ACCOUNT_CREATED"]})
                
			}
			else{
				res.json({code:200,"msg":["BAD_LOCATION"]})
			}     		
		}
		else{
			res.json({code:200,"msg":["LOGIN_SUCCESS"]})
		}

	})

})

router.post('/auth/register', (req, res, next) => {
    passport.authenticate('local-signup', function(err, user, info) {
        if (err){
            return res.json({code:401,"msg":err})
        }
        if (!user){ 
            return res.json({code:401,"msg":["BAD_INPUT"]})
        }
        req.logIn(user, function(err) {
            if (err) return next(err)
            return res.json({code:200,"msg":"SIGNUP_SUCCESS"})
          })
    })(req, res, next)
})

router.post('/auth/login', (req,res,next) => {
    passport.authenticate('local-signin', function(err, user, info) {
        if (err)  return next(err)
        if (!user) { return res.json({code:401,"msg":"BAD"}) }
        req.logIn(user, function(err) {
          if (err) return next(err)
          return res.json({code:200,"msg":"LOGIN_SUCCESS"})
        })
    })(req, res, next)
})

router.get('/logout', function(req, res){
    req.session.destroy()
    req.logout()
    res.redirect('/')
});

module.exports = router