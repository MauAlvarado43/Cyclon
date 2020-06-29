import passport from 'passport'
import {Strategy as FacebookStrategy } from 'passport-facebook'
import {UserModel as User} from '../models/UserModel'
import geoip from 'geoip-lite'

passport.use('facebook-auth',new FacebookStrategy({
    clientID: '3170951326462560',
    clientSecret: 'e201c5704c07e7b3bcdc9f79a890feb2',
    callbackURL: 'http://localhost:3000/auth/facebook/callback',
    passReqToCallback: true,
    profileFields: ["id", "email", "first_name", "last_name"]
  },async (req, accessToken, refreshToken, profile, done) => {

    User.find({email: profile.emails[0].value}, (err,docs) => {

        console.log(docs)

		if(docs.length==0){
			const newUser = new User()

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
				newUser.lat = userObject.lat
				newUser.lng = userObject.lng
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

  }
))