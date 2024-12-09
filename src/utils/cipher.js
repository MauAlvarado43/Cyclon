import crypto from 'crypto'
import * as CryptoJS from 'crypto-js'
import { errorLog } from './logger'
import tokenGenerator from 'jsonwebtoken'

const algorithm = 'aes-256-cbc'
const passwordAES = ''
const IV = ''

const _key = ''
const _iv = ''

const encryptAndroid = plainText => {
    let key = CryptoJS.enc.Base64.parse(_key)
    let iv = CryptoJS.enc.Base64.parse(_iv)
    return CryptoJS.AES.encrypt(plainText.trim(),key,{ iv: iv }).toString()
}

const decryptAndroid = cryptedText => {
    let key = CryptoJS.enc.Base64.parse(_key)
    let iv = CryptoJS.enc.Base64.parse(_iv)
    return CryptoJS.AES.decrypt(cryptedText, key,{ iv: iv }).toString(CryptoJS.enc.Utf8)
}

const encryptFromFront = plainText => {
    try{

        global.navigator = {appName: 'nodejs'}
        global.window = {}
        const JSEncrypt = require ('./JSEncrypt').default

        const cipher = new JSEncrypt ()
        cipher.setPublicKey(publicKeyuser)
        return cipher.encrypt(plainText)

    }catch(err){
        if(err) errorLog.error(err)
        return null
    }
}

const encryptFront = plainText => {
    try{

        global.navigator = {appName: 'nodejs'}
        global.window = {}
        const JSEncrypt = require ('./JSEncrypt').default

        const cipher = new JSEncrypt ()
        cipher.setPublicKey(publicKeyServer)
        return cipher.encrypt(plainText)

    }catch(err){
        if(err) errorLog.error(err)
        return null
    }
}

const decryptFront = cryptedText => {
    try{

        global.navigator = {appName: 'nodejs'}
        global.window = {}
        const JSEncrypt = require ('./JSEncrypt').default

        const cipher = new JSEncrypt ()
        cipher.setPrivateKey(privateKeyServer)
        return cipher.decrypt(cryptedText).toString('utf8')

    }catch(err){
        if(err) errorLog.error(err)
        return null
    }
}

const encryptAES = plainText => {
    try{

        let cipher = crypto.createCipheriv(algorithm, passwordAES, IV)
        let encrypted = cipher.update(plainText, 'utf8', 'base64')
        encrypted += cipher.final('base64')
        return encrypted

    }catch(err){
        if(err) errorLog.error(err)
        return null
    }
}

const decryptAES = cryptedText => {
    try{

        let decipher = crypto.createDecipheriv(algorithm, passwordAES, IV)
        let decrypted = decipher.update(cryptedText, 'base64', 'utf8')
        return (decrypted + decipher.final('utf8'))

    }catch(err){
        if(err) errorLog.error(err)
        return null 
    }
}

const generateToken = (duration) => ( tokenGenerator.sign({ foo: crypto.randomBytes , iat: Math.floor(Date.now() / 1000) + duration}, '') )
const validateToken = token => ( tokenGenerator.decode(token, '', (err, decode) => (decode)) )

export { encryptFront, decryptFront, encryptAES, decryptAES, encryptAndroid, decryptAndroid, generateToken, validateToken, encryptFromFront }

const publicKeyServer = `-----BEGIN PUBLIC KEY-----
-----END PUBLIC KEY-----`

const privateKeyServer = `-----BEGIN RSA PRIVATE KEY-----
-----END RSA PRIVATE KEY-----`

const privateKeyUser = `-----BEGIN RSA PRIVATE KEY-----
-----END RSA PRIVATE KEY-----`

const publicKeyuser = `-----BEGIN PUBLIC KEY-----
-----END PUBLIC KEY-----`