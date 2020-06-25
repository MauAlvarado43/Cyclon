  
import passport from 'passport'
import {Strategy as LocalStrategy} from 'passport-local'
import geoip from 'geoip-lite'
import User from '../models/UserModel'

passport.serializeUser((user, done) => {
  done(null, user.id);
})

passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
})

passport.use('local-signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, email, password, done) => {

    const user = await User.findOne({'email': email})

    if(user){
        return done('EMAIL_TAKEN', false)
    }
    else{

        const newUser = new User()
        const userValidation = newUser.validateUser(req.body.name, req.body.lastName, email, password)

        if(userValidation.length==0){
            let geo = geoip.lookup(req.ip)

            let userObject = newUser.encryptUser(
                email,
                geo.ll[0],
                geo.ll[1],
                password
            )
        
            newUser.name = req.body.name
            newUser.lastName = req.body.lastName
            newUser.email = userObject.email
            newUser.lat = userObject.lat
            newUser.lng = userObject.lng
            newUser.password = userObject.password
            newUser.type = 0
        
            await newUser.save()
            done(null, newUser)
        }
        else{
            return done(userValidation, false)
        }
        
    }
}))

passport.use('local-signin', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
}, async (req, email, password, done) => {
  const user = await User.findOne({email: email});
  if(!user) {
    return done(null, false, req.flash('signinMessage', 'No User Found'));
  }
  if(!user.comparePassword(password)) {
    return done(null, false, req.flash('signinMessage', 'Incorrect Password'));
  }
  return done(null, user);
}))