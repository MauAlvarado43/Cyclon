'use strict';

var _minifyAll = require('minify-all');

var _minifyAll2 = _interopRequireDefault(_minifyAll);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

console.log("DIRECTORY: " + __dirname);

(0, _minifyAll2.default)(_path2.default.join(__dirname, "../config"), { silent: true }, function (err) {
    if (err) {
        console.log(err);
    }
});

(0, _minifyAll2.default)(_path2.default.join(__dirname, "../controller"), { silent: true }, function (err) {
    if (err) {
        console.log(err);
    }
});

(0, _minifyAll2.default)(_path2.default.join(__dirname, "../models"), { silent: true }, function (err) {
    if (err) {
        console.log(err);
    }
});

(0, _minifyAll2.default)(_path2.default.join(__dirname, "../passport"), { silent: true }, function (err) {
    if (err) {
        console.log(err);
    }
});

(0, _minifyAll2.default)(_path2.default.join(__dirname, "../routes"), { silent: true }, function (err) {
    if (err) {
        console.log(err);
    }
});

(0, _minifyAll2.default)(_path2.default.join(__dirname, "../utils"), { silent: true }, function (err) {
    if (err) {
        console.log(err);
    }
});

(0, _minifyAll2.default)(_path2.default.join(__dirname, "../views"), { silent: true }, function (err) {
    if (err) {
        console.log(err);
    }
});
//# sourceMappingURL=minify.js.map