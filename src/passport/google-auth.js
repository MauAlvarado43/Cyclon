import passport from 'passport'
import {OAuth2Strategy as GoogleStrategy} from 'passport-google-oauth'
import {UserModel as User} from '../models/UserModel'
import {encryptAES} from '../utils/cipher'
import geoip from 'geoip-lite'
import { errorLog } from '../utils/logger'


passport.use('google-auth',new GoogleStrategy({
        clientID: '155001320669-kd32n0gk5u8le64bbmtie7d2ebvfujot.apps.googleusercontent.com',
        clientSecret: 'KAOYHF3jiEHKco7qDSGQ5frg',
        callbackURL: process.env.URL + '/auth/google/callback',
        passReqToCallback: true
    }, async (req, accessToken, refreshToken, profile, done) => {

        User.find({email: encryptAES(profile.emails[0].value)}, async (err,docs) => {

            if(err) errorLog.error(err)

            if(docs.length==0){
                const newUser = new User()

                console.log(req.ip)

                let response = await fetch('http://ipwhois.app/json/'+ req.ip)
                let res = await response.json()

                console.log(res)

                let geo = geoip.lookup(req.ip)

                if(geo){
                    
                    let userObject = newUser.encryptUser(
                        profile.emails[0].value,
                        geo.ll[0],
                        geo.ll[1],
                        profile.id
                    )
                
                    newUser.name = profile.name.givenName
                    newUser.lastName = profile.name.familyName
                    newUser.email = userObject.email
                    newUser.location.lat = userObject.lat
                    newUser.location.lng = userObject.lng
                    newUser.password = userObject.password
                    newUser.type = 0
                    newUser.verify = true
                
                    newUser.save()
                    done(null, newUser)
                }
                else{
                    return done(['BAD_LOCATION'], false)
                }  

            }
            else{
                done(null, docs[0])
            }

        })
    }

))