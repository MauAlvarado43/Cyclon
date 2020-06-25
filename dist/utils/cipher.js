'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.decryptAES = exports.encryptAES = exports.decryptFront = exports.encryptFront = undefined;

var _crypto = require('crypto');

var _crypto2 = _interopRequireDefault(_crypto);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var algorithm = 'aes-256-cbc';
var passwordAES = 'TStrzyg!zGXNvKyK3xkQW#6arP{q6AcL';
var IV = "5183666c72eec9e4";

var encryptFront = function encryptFront(plainText) {
    try {

        global.navigator = { appName: 'nodejs' };
        global.window = {};
        var JSEncrypt = require('./JSEncrypt').default;

        var cipher = new JSEncrypt();
        cipher.setPublicKey(publicKeyServer);
        return cipher.encrypt(plainText);
    } catch (err) {
        return null;
    }
};

var decryptFront = function decryptFront(cryptedText) {
    try {

        global.navigator = { appName: 'nodejs' };
        global.window = {};
        var JSEncrypt = require('./JSEncrypt').default;

        var cipher = new JSEncrypt();
        cipher.setPrivateKey(privateKeyServer);
        return cipher.decrypt(cryptedText).toString("utf8");
    } catch (err) {
        return null;
    }
};

var encryptAES = function encryptAES(plainText) {
    try {

        var cipher = _crypto2.default.createCipheriv(algorithm, passwordAES, IV);
        var encrypted = cipher.update(plainText, 'utf8', 'base64');
        encrypted += cipher.final('base64');
        return encrypted;
    } catch (err) {
        return null;
    }
};

var decryptAES = function decryptAES(cryptedText) {
    try {

        var decipher = _crypto2.default.createDecipheriv(algorithm, passwordAES, IV);
        var decrypted = decipher.update(cryptedText, 'base64', 'utf8');
        return decrypted + decipher.final('utf8');
    } catch (err) {
        return null;
    }
};

exports.encryptFront = encryptFront;
exports.decryptFront = decryptFront;
exports.encryptAES = encryptAES;
exports.decryptAES = decryptAES;


var publicKeyServer = '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0TlmjdegY60EXB2y5IR/\nVsAbIlIkWy6+buF3KJAm9Hv+MEasOhqPPpCEOk4e3cv9wm1H2USNm+STEgFelEn7\nlEe1oldrkTfrC/2SqoLxHPFKai86ni5BuIXJ8wuhXNA8crCIFvsGZTzZjUyjzq9T\nby/muPD3Er8RbPs7eagJPvqoYCiilREl2u2MHhs38n6g9UGDrPQPNcyZ2fS2+1dG\n2gVRILlNBtaLpf1ULPH4M6wSUrDXDaK2Jqn8rU4mw2SaMKY2MnBzStxe7PP8IEnM\nqk8RCV1+D8STephfMKadTBNqft58Tjye5lEGBu2sINd8ro52A4hAnaWQd1bDoYPK\nLQIDAQAB\n-----END PUBLIC KEY-----';

var privateKeyServer = '-----BEGIN RSA PRIVATE KEY-----\nMIIEpQIBAAKCAQEAxpQPpHiKrzzWdrbgQy/EYcC6kAnDgTyuc7mGWCM6765HLEpH\n5XCwD8IS11YTnTNqgUHoykphmgUOWGcHv39z5FysttLY5x+A+X+hgaM+Tk4I4qLh\nwp/pCzaGe9zz2DYukU3Ei/eIx+U0DpT4Gv6HlAhAmheqA9eGtIocLz0cMW9EY4pI\nzxsN4xrVm7Sd9u2/88UgZ54sef1gDXSpVYN01+L8/N1g4XB3PQ7My1CxB8fOUp5I\n/LpSJwlnfaOqf+unmnyNou4PfAG5lWzy5lFP2cV0KQtscxTE0vRv5PFPOQsH3Ii9\nLD6tFH+34Qrz85ncwD/U84RnvRKT8BEM4Xjy2QIDAQABAoIBAQCcETO2DLLahNL9\nHD9nLnyGY0V8/N91i+6DrzTBwnaIdw0i5wJYddc5m0rZiKIDs6wqCFXf3tOUjBK5\nMchqHc5ElP189ntYMm9YJ5IUY+sM+dGL5X3PS4SJtoG9iWrv661vr5Igexw6Fo5y\nQ2w3MwH1OwMi2CRbvqD09XKvQbUNt8QlNYTZZpsDg5Q2sRmjcVr6Y7Z99DMvBGwF\nd2KK5PcznG0fN0D7cg8tDBu3G+P3IVBmAkKXKF5DboTgASDVILcF7AnFsTtZ6XRP\nFKotyCXhZR3roYZY7Knkrt18udMAV72v4rMjK9PkprhxyLmByYSkLGAjdC1Vubvc\n1HuS/XmtAoGBAPfgxgkZxJ95mu/OSPfRTw2j2BPQBvXY3c2JM0cVTXrQmIm17FuI\nkIQwUmuiKQLRHEA0dLSUC/WnMIgorC83RdjQnu+/gqafoJnvj1FbmxzHn/2dZOi+\nYeedGM4l1Pvt9nyo1+vWhgq5EMkbpGVmTSO4bfZHT4Ih6TVaxuo5DibLAoGBAM0V\nwcS4oCmBMxRjAcrGTS2fxM5bY2DmXDLYiHUkIvrnxEayOzXF9ymAsbMjXJkM46ax\nn/tVrN5AnMa0+dz086kDCZ6TWYL/mB4mM4yvRp2BRmdq3+9uw1JDBS1G5RkOf/HS\nzgCqrAoWeUe5pnUNYvUSc3MMgfNwSxWZFIPO2LRrAoGBAIEQ3IyoiiSvYOk0c/H1\nXkAv67aFPtqLzRHUOorsoKcuLf6mZydR+E2cC45XpRr+XsNfjNTpsUB7iV2cL+t1\n0DyQg/E5uoGf5DPC9NDb7ewSVU/swDofx0KeHehY8okq4okOMT9vN+QlcIQGjJbv\nqYLL6RWvE8sidRd+6MvUYXX5AoGBALswQp52DeoUPTU8cSRN/5/HFnFrxLdrS3g1\nX8fb5fmxldsZTyXzvXcqOgfSHPCtbRR3SBi1yIVL4E0WXoGpKsV3Ok59G9SPyp6q\nK58bVI7qsgIu8JqwNKNe/Niovu8x5uIokVLWdRT4Ela/QwnP4CTkZG/8WJiERGRA\nRxNPt0hlAoGAdX11NW6fhNomRPJGtkFD4oY/vWdMgaokoYR8L+RgFXAH8eX4S9EA\nzPnX95EowZTsFdnMZLbiwHgLA77UsVBwhnc/8PGC0TTfT4usdLhyAYVY9RQ6SRSE\nc1jdNZYeM6v6ddFuUZ+qHP0VFu7CsJiOoKhYIInTD7IT4gM2vIlSPxw=\n-----END RSA PRIVATE KEY-----';
//# sourceMappingURL=cipher.js.map