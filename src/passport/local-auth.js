  
import passport from 'passport'
import {Strategy as LocalStrategy} from 'passport-local'
import geoip from 'geoip-lite'
import {UserModel as User} from '../models/UserModel'
import { encryptAES, decryptFront, decryptAndroid } from '../utils/cipher'

passport.serializeUser((user, done) => {
  done(null, user.id)
})

passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id)
  done(null, user)
})

passport.use('local-signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, emailCrypted, passwordCrypted, done) => {

    const email = decryptFront(emailCrypted)
    const password = decryptFront(passwordCrypted)

    const user = await User.findOne({'email': encryptAES(email)})

    if(user){
        return done(['EMAIL_TAKEN'], false)
    }
    else{

        const newUser = new User()
        const userValidation = newUser.validateUser(decryptFront(req.body.name), decryptFront(req.body.lastName), email, password)

        if(userValidation.length==0){

            let geo = geoip.lookup(req.clientIp)

            if(!geo && req.body.lat) geo = { ll: [decryptAndroid(req.body.lat), decryptAndroid(req.body.lng)] }
            else geo = {ll: [19, -99]}

            if(geo){

                let userObject = newUser.encryptUser(
                    email,
                    geo.ll[0],
                    geo.ll[1],
                    password
                )
            
                newUser.name = decryptFront(req.body.name)
                newUser.lastName = decryptFront(req.body.lastName)
                newUser.email = userObject.email
                newUser.location.lat = userObject.lat
                newUser.location.lng = userObject.lng
                newUser.password = userObject.password
                newUser.type = 0
                newUser.verify = false
                newUser.register = 0
                newUser.dateRegister = new Date()
            
                await newUser.save()
                done(null, newUser)
			}
			else{
				return done(['BAD_LOCATION'], false)
            }     	
            
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

    const user = await User.findOne({email: encryptAES(decryptFront(email))})

    if(!user){
        return done(['USER_NOT_EXIST'], false)
    }
    
    if(!user.comparePassword(encryptAES(decryptFront(password)), user.password)) {
        return done(['INCORRECT_PASSWORD'], false)
    }

    return done(null, user)

}))