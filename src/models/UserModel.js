import mongoose from 'mongoose'
import {encryptAES} from '../utils/cipher'
import {checkWords, checkEmail} from '../utils/regex'

const { Schema } = mongoose

const UserSchema = new Schema({
    name: String,
    lastName: String,
    email: String,
    lat: Number,
    lng: Number,
    password: String,
    type: Number
})

UserSchema.methods.validateUser = (name, lastName, email, password, type) => {

    let errors = []

    if(!checkWords(name) && name.length>50) errors.push("BAD_NAME")
    if(!checkWords(lastName) && lastName.length>50) errors.push("BAD_LASTNAME")
    if(!checkEmail(email) && name.length>50) errors.push("BAD_EMAIL")
    if(password.length < 8) errors.push("BAD_PASSWORD")

    return errors

}

UserSchema.methods.encryptUser = (email ,lat ,lng ,password) => ({
    email: encryptAES(email),
    lat: encryptAES(lat),
    lng: encryptAES(lng),
    password: encryptAES(password)
})
  
UserSchema.methods.comparePassword= password => (
    this.password === encryptAES(password)
)

const UserModel = mongoose.model("User", UserSchema)

export {UserModel}