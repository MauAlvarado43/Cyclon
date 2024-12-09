const privateKeyUser = `-----BEGIN RSA PRIVATE KEY-----
-----END RSA PRIVATE KEY-----`

const publicKeyuser = `-----BEGIN PUBLIC KEY-----
-----END PUBLIC KEY-----`

const encrypt = txt => {
    let cipher = new JSEncrypt()
    cipher.setPublicKey(publicKeyuser) 
    return cipher.encrypt(txt)
}

const decrypt = (txt) =>{
    var cipher = new JSEncrypt()
    cipher.setPrivateKey(privateKeyUser)
    return cipher.decrypt(txt)
}