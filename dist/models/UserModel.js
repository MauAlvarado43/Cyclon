"use strict";Object.defineProperty(exports,"__esModule",{value:true});exports.UserModel=undefined;var _mongoose=require("mongoose");var _mongoose2=_interopRequireDefault(_mongoose);var _cipher=require("../utils/cipher");var _regex=require("../utils/regex");function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{"default":obj}}var Schema=_mongoose2.default.Schema;var UserSchema=new Schema({name:String,lastName:String,email:String,lat:Number,lng:Number,password:String,type:Number});UserSchema.methods.validateUser=function(name,lastName,email,password,type){var errors=[];if(!(0,_regex.checkWords)(name)&&name.length>50)errors.push("BAD_NAME");if(!(0,_regex.checkWords)(lastName)&&lastName.length>50)errors.push("BAD_LASTNAME");if(!(0,_regex.checkEmail)(email)&&email.length>50)errors.push("BAD_EMAIL");if(password.length<8)errors.push("BAD_PASSWORD");return errors};UserSchema.methods.encryptUser=function(email,lat,lng,password){return{email:(0,_cipher.encryptAES)(email),lat:(0,_cipher.encryptAES)(lat.toString()),lng:(0,_cipher.encryptAES)(lng.toString()),password:(0,_cipher.encryptAES)(password)}};UserSchema.methods.comparePassword=function(password){return undefined.password===(0,_cipher.encryptAES)(password)};var UserModel=_mongoose2.default.model("User",UserSchema);exports.UserModel=UserModel;