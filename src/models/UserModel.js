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
 * @property {Number} type - The kind of user (0 -> Normal, 1 -> Scientist, 2-> Administrator)
 */

const UserSchema = new Schema({
    name: String,
    lastName: String,
    email: String,
    lat: String,
    lng: String,
    password: String,
    type: Number
})

UserSchema.methods.validateUser = (name, lastName, email, password, type) => {

    let errors = []

    if(!checkWords(name) && name.length>50) errors.push("BAD_NAME")
    if(!checkWords(lastName) && lastName.length>50) errors.push("BAD_LASTNAME")
    if(!checkEmail(email) && email.length>50) errors.push("BAD_EMAIL")
    if(password.length < 8) errors.push("BAD_PASSWORD")

    return errors

}

UserSchema.methods.encryptUser = (email ,lat ,lng ,password) => ({
    email: encryptAES(email),
    lat: encryptAES(lat.toString()),
    lng: encryptAES(lng.toString()),
    password: encryptAES(password)
})
  
UserSchema.methods.comparePassword= password => (
    this.password === encryptAES(password)
)

const UserModel = mongoose.model("User", UserSchema)

export {UserModel}