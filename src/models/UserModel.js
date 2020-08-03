import mongoose from 'mongoose'
import {encryptAES} from '../utils/cipher'
import {checkWords, checkEmail} from '../utils/regex'

const { Schema } = mongoose

/**
 * Represents an user.
 * @constructor
 * @property {String} name - The user's name
 * @property {String} lastName - The user's last name
 * @property {String} email - The user's email
 * @property {Number} lat - The user's GPS latitude
 * @property {Number} lng - The user's GPS longitude
 * @property {String} password - The user's password
 * @property {Number} type - The kind of user (0 -> Normal, 1 -> Scientist, 2 -> Administrator)
 * @property {Number} register - The kind of register (0 -> Local, 1 -> Facebook, 2 -> Google)
 */

const UserSchema = new Schema({
    name: String,
    lastName: String,
    email: String,
    location:{
        lat: String,
        lng: String
    },
    password: String,
    type: Number,
    verify: Boolean,
    register: Number,
    dateRegister: Date
})

UserSchema.methods.validateUser = (name, lastName, email, password, type) => {

    let errors = []

    if(!checkWords(name)) errors.push({field:'name', error: 'BAD_FORMAT'})
    if(name.length<0) errors.push({field:'name', error: 'EMPTY_FORMAT'})
    if(name.length>50) errors.push({field:'name', error: 'MAX_LENGTH'})

    if(!checkWords(lastName)) errors.push({field:'lastName', error: 'ONLY_LETTERS_LASTNAME'})
    if(lastName.length==0) errors.push({field:'lastName', error: 'EMPTY_LASTNAME'})
    if(lastName.length>50) errors.push({field:'lastName', error: 'MAX_LASTNAME'})

    if(!checkEmail(email)) errors.push({field:'email', error: 'BAD_FORMAT'})
    if(email.length==0) errors.push({field:'email', error: 'EMPTY_FORMAT'})
    if(email.length>50) errors.push({field:'email', error: 'MAX_LENGTH'})

    if(password.length<8) errors.push({field:'password', error: 'EMPTY_PASSWORD'})
    if(password.length>50) errors.push({field:'password', error: 'MAX_PASSWORD'})

    return errors

}

UserSchema.methods.encryptUser = (email ,lat ,lng ,password) => ({
    email: encryptAES(email),
    lat: encryptAES(lat.toString()),
    lng: encryptAES(lng.toString()),
    password: encryptAES(password)
})
  
UserSchema.methods.comparePassword = (password, userPassword) => (
    userPassword == password
)

const UserModel = mongoose.model('User', UserSchema)

export {UserModel}