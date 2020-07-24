  
import passport from 'passport'
import {Strategy as LocalStrategy} from 'passport-local'
import geoip from 'geoip-lite'
import {UserModel as User} from '../models/UserModel'
import { encryptAES, decryptFront } from '../utils/cipher'

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

            let geo = geoip.lookup(req.ip)

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