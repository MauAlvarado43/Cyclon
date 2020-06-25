import {Router} from 'express'
import passport from 'passport'
import path from 'path'
import fs from 'fs'

const router = Router()

router.get('/', (req,res) => {
    let language = req.acceptsLanguages('es', 'en')
    if (!language) language = "en" 
    res.render('index', {title: 'Cyclon', assets: JSON.parse(fs.readFileSync(path.join(__dirname,'../assets/'+language+'.json'),'utf-8')), errors: req.flash('error')})
})

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
        req.flash('error', []) 
        return res.redirect("/") 
    })(req, res, next)
})

router.post('/api/register', (req, res, next) => {
    passport.authenticate('local-signup', function(err, user, info) {
        if (err){
            return res.json({code:200,"msg":err})
        }
        if (!user){ 
            return res.json({code:200,"msg":["BAD_INPUT"]})
        }
        return res.json({code:200,"msg":["SIGNUP_SUCCESS"]})
    })(req, res, next)
})

router.post('/api/login', (req,res,next) => {
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