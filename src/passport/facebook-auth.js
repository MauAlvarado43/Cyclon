import passport from 'passport'
import {Strategy as FacebookStrategy } from 'passport-facebook'
import {UserModel as User} from '../models/UserModel'
import geoip from 'geoip-lite'
import {encryptAES} from '../utils/cipher'
import { errorLog } from '../utils/logger'

passport.use('facebook-auth',new FacebookStrategy({
    clientID: '3170951326462560',
    clientSecret: 'e201c5704c07e7b3bcdc9f79a890feb2',
    callbackURL: process.env.URL + '/auth/facebook/callback',
    passReqToCallback: true,
    profileFields: ['id', 'email', 'first_name', 'last_name']
}, async (req, accessToken, refreshToken, profile, done) => {

	console.log(req.clientIp)


    User.find({email: encryptAES(profile.emails[0].value)}, async (err,docs) => {

		if(err) errorLog.error(err)

		if(docs.length==0){

			const newUser = new User()

			let geo = geoip.lookup(req.clientIp)
			
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
				newUser.register = 1
				newUser.dateRegister = new Date()
							
				await newUser.save()
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