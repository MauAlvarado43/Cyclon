import passport from 'passport'
import {OAuth2Strategy as GoogleStrategy} from 'passport-google-oauth'
import {UserModel as User} from '../models/UserModel'
import geoip from 'geoip-lite'

passport.use('google-auth',new GoogleStrategy({
        clientID: "155001320669-kd32n0gk5u8le64bbmtie7d2ebvfujot.apps.googleusercontent.com",
        clientSecret: "KAOYHF3jiEHKco7qDSGQ5frg",
        callbackURL: "http://localhost:3000/auth/google/callback",
        passReqToCallback: true
    }, async (req, accessToken, refreshToken, profile, done) => {

        User.find({email: profile.emails[0].value}, (err,docs) => {

            console.log(docs)

            if(docs.length==0){
                const newUser = new User()

                let geo = geoip.lookup(req.ip)

                console.log(geo.ll)

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
                    newUser.lat = userObject.lat
                    newUser.lng = userObject.lng
                    newUser.password = userObject.password
                    newUser.type = 0

                    console.log(newUser)
                
                    //newUser.save()
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
    }

))