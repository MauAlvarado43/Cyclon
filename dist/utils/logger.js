'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.errorLog = exports.infoLog = undefined;

var _winston = require('winston');

var _winston2 = _interopRequireDefault(_winston);

var _winstonJsonFormatter = require('winston-json-formatter');

var _winstonDailyRotateFile = require('winston-daily-rotate-file');

var _winstonDailyRotateFile2 = _interopRequireDefault(_winstonDailyRotateFile);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var infoLogger = _winston2.default.createLogger({
    level: 'info',
    transports: [new _winstonDailyRotateFile2.default({
        'name': 'access-file',
        'level': 'info',
        'filename': './logs/access.log',
        'json': true,
        'datePattern': 'YYYY-MM-DD',
        'prepend': true,
        'maxFiles': '14d',
        "flags": "w",
        timestamp: function timestamp() {
            return getDateTime();
        },
        exitOnError: false
    })]
});

var errorLogger = (0, _winston.createLogger)({
    level: 'error',
    transports: [new _winstonDailyRotateFile2.default({
        'name': 'error-file',
        'level': 'error',
        'filename': './logs/error.log',
        'json': true,
        'datePattern': 'YYYY-MM-DD',
        'prepend': true,
        'maxFiles': '14d',
        "flags": "w",
        timestamp: function timestamp() {
            return getDateTime();
        },
        exitOnError: false
    })]
});

var options = {
    service: 'Cyclon',
    logger: 'Winston-JSON-Formatter',
    version: '1.0.0',
    typeFormat: 'json'
};

errorLogger.format = (0, _winstonJsonFormatter.configuredFormatter)(options);
infoLogger.format = (0, _winstonJsonFormatter.configuredFormatter)(options);

infoLogger.stream = {
    write: function write(message, encoding) {
        infoLogger.info(message);
    }
};

function getDateTime() {
    var currentdate = new Date();
    var datetime = currentdate.getDate() + "/" + (currentdate.getMonth() + 1) + "/" + currentdate.getFullYear() + " " + currentdate.getHours() + ":" + currentdate.getMinutes() + ":" + currentdate.getSeconds();
    return datetime;
}

exports.infoLog = infoLogger;
exports.errorLog = errorLogger;
//# sourceMappingURL=logger.js.map