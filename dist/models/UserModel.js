"use strict";Object.defineProperty(exports,"__esModule",{value:true});exports.UserModel=undefined;var _mongoose=require("mongoose");var _mongoose2=_interopRequireDefault(_mongoose);var _cipher=require("../utils/cipher");var _regex=require("../utils/regex");function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{"default":obj}}var Schema=_mongoose2.default.Schema;var UserSchema=new Schema({name:String,lastName:String,email:String,location:{lat:String,lng:String},password:String,type:Number,verify:Boolean});UserSchema.methods.validateUser=function(name,lastName,email,password,type){var errors=[];if(!(0,_regex.checkWords)(name))errors.push({field:"name",error:"BAD_FORMAT"});if(name.length<0)errors.push({field:"name",error:"EMPTY_FORMAT"});if(name.length>50)errors.push({field:"name",error:"MAX_LENGTH"});if(!(0,_regex.checkWords)(lastName))errors.push({field:"lastName",error:"ONLY_LETTERS_LASTNAME"});if(lastName.length==0)errors.push({field:"lastName",error:"EMPTY_LASTNAME"});if(lastName.length>50)errors.push({field:"lastName",error:"MAX_LASTNAME"});if(!(0,_regex.checkEmail)(email))errors.push({field:"email",error:"BAD_FORMAT"});if(email.length==0)errors.push({field:"email",error:"EMPTY_FORMAT"});if(email.length>50)errors.push({field:"email",error:"MAX_LENGTH"});if(password.length<8)errors.push({field:"password",error:"EMPTY_PASSWORD"});if(password.length>50)errors.push({field:"password",error:"MAX_PASSWORD"});return errors};UserSchema.methods.encryptUser=function(email,lat,lng,password){return{email:(0,_cipher.encryptAES)(email),lat:(0,_cipher.encryptAES)(lat.toString()),lng:(0,_cipher.encryptAES)(lng.toString()),password:(0,_cipher.encryptAES)(password)}};UserSchema.methods.comparePassword=function(password,userPassword){return userPassword==password};var UserModel=_mongoose2.default.model("User",UserSchema);exports.UserModel=UserModel;