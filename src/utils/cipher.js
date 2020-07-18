import crypto from 'crypto'
import * as CryptoJS from 'crypto-js';  

const algorithm = 'aes-256-cbc';
const passwordAES = 'TStrzyg!zGXNvKyK3xkQW#6arP{q6AcL';
const IV = "5183666c72eec9e4";

const _key = "Y01JNiM0cFRhXmFBN0gwaVFsazlmJG8kckw0Xmk2d2Q=";
const _iv = "AcynMwikMkW4c7+mHtwtfw==";

const encryptAndroid = plainText => {
    let key = CryptoJS.enc.Base64.parse(_key);
    let iv = CryptoJS.enc.Base64.parse(_iv);
    return CryptoJS.AES.encrypt(plainText.trim(),key,{ iv: iv }).toString();
}

const decryptAndroid = cryptedText => {
    let key = CryptoJS.enc.Base64.parse(_key);
    let iv = CryptoJS.enc.Base64.parse(_iv);
    return CryptoJS.AES.decrypt(cryptedText, key,{ iv: iv }).toString(CryptoJS.enc.Utf8);
}

const encryptFront = plainText => {
    try{

        global.navigator = {appName: 'nodejs'};
        global.window = {};
        const JSEncrypt = require ('./JSEncrypt').default;

        const cipher = new JSEncrypt ();
        cipher.setPublicKey(publicKeyServer);
        return cipher.encrypt(plainText);

    }catch(err){
        return null
    }
}

const decryptFront = cryptedText => {
    try{

        global.navigator = {appName: 'nodejs'};
        global.window = {};
        const JSEncrypt = require ('./JSEncrypt').default;

        const cipher = new JSEncrypt ();
        cipher.setPrivateKey(privateKeyServer);
        return cipher.decrypt(cryptedText).toString("utf8");

    }catch(err){
        return null
    }
}

const encryptAES = plainText => {
    try{

        let cipher = crypto.createCipheriv(algorithm, passwordAES, IV);
        let encrypted = cipher.update(plainText, 'utf8', 'base64');
        encrypted += cipher.final('base64');
        return encrypted;

    }catch(err){
        return null
    }
}

const decryptAES = cryptedText => {
    try{

        let decipher = crypto.createDecipheriv(algorithm, passwordAES, IV);
        let decrypted = decipher.update(cryptedText, 'base64', 'utf8');
        return (decrypted + decipher.final('utf8'));

    }catch(err){
        return null 
    }
}

export {encryptFront, decryptFront, encryptAES, decryptAES, encryptAndroid, decryptAndroid}

const publicKeyServer = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0TlmjdegY60EXB2y5IR/
VsAbIlIkWy6+buF3KJAm9Hv+MEasOhqPPpCEOk4e3cv9wm1H2USNm+STEgFelEn7
lEe1oldrkTfrC/2SqoLxHPFKai86ni5BuIXJ8wuhXNA8crCIFvsGZTzZjUyjzq9T
by/muPD3Er8RbPs7eagJPvqoYCiilREl2u2MHhs38n6g9UGDrPQPNcyZ2fS2+1dG
2gVRILlNBtaLpf1ULPH4M6wSUrDXDaK2Jqn8rU4mw2SaMKY2MnBzStxe7PP8IEnM
qk8RCV1+D8STephfMKadTBNqft58Tjye5lEGBu2sINd8ro52A4hAnaWQd1bDoYPK
LQIDAQAB
-----END PUBLIC KEY-----`;

const privateKeyServer = `-----BEGIN RSA PRIVATE KEY-----
MIIEpQIBAAKCAQEAxpQPpHiKrzzWdrbgQy/EYcC6kAnDgTyuc7mGWCM6765HLEpH
5XCwD8IS11YTnTNqgUHoykphmgUOWGcHv39z5FysttLY5x+A+X+hgaM+Tk4I4qLh
wp/pCzaGe9zz2DYukU3Ei/eIx+U0DpT4Gv6HlAhAmheqA9eGtIocLz0cMW9EY4pI
zxsN4xrVm7Sd9u2/88UgZ54sef1gDXSpVYN01+L8/N1g4XB3PQ7My1CxB8fOUp5I
/LpSJwlnfaOqf+unmnyNou4PfAG5lWzy5lFP2cV0KQtscxTE0vRv5PFPOQsH3Ii9
LD6tFH+34Qrz85ncwD/U84RnvRKT8BEM4Xjy2QIDAQABAoIBAQCcETO2DLLahNL9
HD9nLnyGY0V8/N91i+6DrzTBwnaIdw0i5wJYddc5m0rZiKIDs6wqCFXf3tOUjBK5
MchqHc5ElP189ntYMm9YJ5IUY+sM+dGL5X3PS4SJtoG9iWrv661vr5Igexw6Fo5y
Q2w3MwH1OwMi2CRbvqD09XKvQbUNt8QlNYTZZpsDg5Q2sRmjcVr6Y7Z99DMvBGwF
d2KK5PcznG0fN0D7cg8tDBu3G+P3IVBmAkKXKF5DboTgASDVILcF7AnFsTtZ6XRP
FKotyCXhZR3roYZY7Knkrt18udMAV72v4rMjK9PkprhxyLmByYSkLGAjdC1Vubvc
1HuS/XmtAoGBAPfgxgkZxJ95mu/OSPfRTw2j2BPQBvXY3c2JM0cVTXrQmIm17FuI
kIQwUmuiKQLRHEA0dLSUC/WnMIgorC83RdjQnu+/gqafoJnvj1FbmxzHn/2dZOi+
YeedGM4l1Pvt9nyo1+vWhgq5EMkbpGVmTSO4bfZHT4Ih6TVaxuo5DibLAoGBAM0V
wcS4oCmBMxRjAcrGTS2fxM5bY2DmXDLYiHUkIvrnxEayOzXF9ymAsbMjXJkM46ax
n/tVrN5AnMa0+dz086kDCZ6TWYL/mB4mM4yvRp2BRmdq3+9uw1JDBS1G5RkOf/HS
zgCqrAoWeUe5pnUNYvUSc3MMgfNwSxWZFIPO2LRrAoGBAIEQ3IyoiiSvYOk0c/H1
XkAv67aFPtqLzRHUOorsoKcuLf6mZydR+E2cC45XpRr+XsNfjNTpsUB7iV2cL+t1
0DyQg/E5uoGf5DPC9NDb7ewSVU/swDofx0KeHehY8okq4okOMT9vN+QlcIQGjJbv
qYLL6RWvE8sidRd+6MvUYXX5AoGBALswQp52DeoUPTU8cSRN/5/HFnFrxLdrS3g1
X8fb5fmxldsZTyXzvXcqOgfSHPCtbRR3SBi1yIVL4E0WXoGpKsV3Ok59G9SPyp6q
K58bVI7qsgIu8JqwNKNe/Niovu8x5uIokVLWdRT4Ela/QwnP4CTkZG/8WJiERGRA
RxNPt0hlAoGAdX11NW6fhNomRPJGtkFD4oY/vWdMgaokoYR8L+RgFXAH8eX4S9EA
zPnX95EowZTsFdnMZLbiwHgLA77UsVBwhnc/8PGC0TTfT4usdLhyAYVY9RQ6SRSE
c1jdNZYeM6v6ddFuUZ+qHP0VFu7CsJiOoKhYIInTD7IT4gM2vIlSPxw=
-----END RSA PRIVATE KEY-----`;