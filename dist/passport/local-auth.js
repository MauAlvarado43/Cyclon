'use strict';

var _passport = require('passport');

var _passport2 = _interopRequireDefault(_passport);

var _passportLocal = require('passport-local');

var _geoipLite = require('geoip-lite');

var _geoipLite2 = _interopRequireDefault(_geoipLite);

var _UserModel = require('../models/UserModel');

var _UserModel2 = _interopRequireDefault(_UserModel);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

_passport2.default.serializeUser(function (user, done) {
    done(null, user.id);
});

_passport2.default.deserializeUser(function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(id, done) {
        var user;
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _context.next = 2;
                        return _UserModel2.default.findById(id);

                    case 2:
                        user = _context.sent;

                        done(null, user);

                    case 4:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, undefined);
    }));

    return function (_x, _x2) {
        return _ref.apply(this, arguments);
    };
}());

_passport2.default.use('local-signup', new _passportLocal.Strategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function () {
    var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(req, email, password, done) {
        var user, newUser, userValidation, geo, userObject;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        _context2.next = 2;
                        return _UserModel2.default.findOne({ 'email': email });

                    case 2:
                        user = _context2.sent;

                        if (!user) {
                            _context2.next = 7;
                            break;
                        }

                        return _context2.abrupt('return', done('EMAIL_TAKEN', false));

                    case 7:
                        newUser = new _UserModel2.default();
                        userValidation = newUser.validateUser(req.body.name, req.body.lastName, email, password);

                        if (!(userValidation.length == 0)) {
                            _context2.next = 24;
                            break;
                        }

                        geo = _geoipLite2.default.lookup(req.ip);
                        userObject = newUser.encryptUser(email, geo.ll[0], geo.ll[1], password);


                        newUser.name = req.body.name;
                        newUser.lastName = req.body.lastName;
                        newUser.email = userObject.email;
                        newUser.lat = userObject.lat;
                        newUser.lng = userObject.lng;
                        newUser.password = userObject.password;
                        newUser.type = 0;

                        _context2.next = 21;
                        return newUser.save();

                    case 21:
                        done(null, newUser);
                        _context2.next = 25;
                        break;

                    case 24:
                        return _context2.abrupt('return', done(userValidation, false));

                    case 25:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, undefined);
    }));

    return function (_x3, _x4, _x5, _x6) {
        return _ref2.apply(this, arguments);
    };
}()));

_passport2.default.use('local-signin', new _passportLocal.Strategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function () {
    var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(req, email, password, done) {
        var user;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        _context3.next = 2;
                        return _UserModel2.default.findOne({ email: email });

                    case 2:
                        user = _context3.sent;

                        if (user) {
                            _context3.next = 5;
                            break;
                        }

                        return _context3.abrupt('return', done(null, false, req.flash('signinMessage', 'No User Found')));

                    case 5:
                        if (user.comparePassword(password)) {
                            _context3.next = 7;
                            break;
                        }

                        return _context3.abrupt('return', done(null, false, req.flash('signinMessage', 'Incorrect Password')));

                    case 7:
                        return _context3.abrupt('return', done(null, user));

                    case 8:
                    case 'end':
                        return _context3.stop();
                }
            }
        }, _callee3, undefined);
    }));

    return function (_x7, _x8, _x9, _x10) {
        return _ref3.apply(this, arguments);
    };
}()));
//# sourceMappingURL=local-auth.js.map