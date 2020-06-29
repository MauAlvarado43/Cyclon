"use strict";var _passport=require("passport");var _passport2=_interopRequireDefault(_passport);var _passportGoogleOauth=require("passport-google-oauth");var _UserModel=require("../models/UserModel");var _geoipLite=require("geoip-lite");var _geoipLite2=_interopRequireDefault(_geoipLite);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj}}function _asyncToGenerator(fn){return function(){var gen=fn.apply(this,arguments);return new Promise(function(resolve,reject){function step(key,arg){try{var info=gen[key](arg);var value=info.value}catch(error){reject(error);return}if(info.done){resolve(value)}else{return Promise.resolve(value).then(function(value){step("next",value)},function(err){step("throw",err)})}}return step("next")})}}_passport2.default.use("google-auth",new _passportGoogleOauth.OAuth2Strategy({clientID:"155001320669-kd32n0gk5u8le64bbmtie7d2ebvfujot.apps.googleusercontent.com",clientSecret:"KAOYHF3jiEHKco7qDSGQ5frg",callbackURL:"http://localhost:3000/auth/google/callback",passReqToCallback:true},function(){var _ref=_asyncToGenerator(regeneratorRuntime.mark(function _callee(req,accessToken,refreshToken,profile,done){return regeneratorRuntime.wrap(function _callee$(_context){while(1){switch(_context.prev=_context.next){case 0:_UserModel.UserModel.find({email:profile.emails[0].value},function(err,docs){console.log(docs);if(docs.length==0){var newUser=new _UserModel.UserModel;var geo=_geoipLite2.default.lookup(req.ip);console.log(geo.ll);if(geo){var userObject=newUser.encryptUser(profile.emails[0].value,geo.ll[0],geo.ll[1],profile.id);newUser.name=profile.name.givenName;newUser.lastName=profile.name.familyName;newUser.email=userObject.email;newUser.lat=userObject.lat;newUser.lng=userObject.lng;newUser.password=userObject.password;newUser.type=0;console.log(newUser);done(null,newUser)}else{return done(["BAD_LOCATION"],false)}}else{done(null,docs[0])}});case 1:case"end":return _context.stop()}}},_callee,undefined)}));return function(_x,_x2,_x3,_x4,_x5){return _ref.apply(this,arguments)}}()));