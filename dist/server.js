'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _compression = require('compression');

var _compression2 = _interopRequireDefault(_compression);

var _expressSession = require('express-session');

var _expressSession2 = _interopRequireDefault(_expressSession);

var _helmet = require('helmet');

var _helmet2 = _interopRequireDefault(_helmet);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _cookieParser = require('cookie-parser');

var _cookieParser2 = _interopRequireDefault(_cookieParser);

var _sessionMemoryStore = require('session-memory-store');

var _sessionMemoryStore2 = _interopRequireDefault(_sessionMemoryStore);

var _cors = require('cors');

var _cors2 = _interopRequireDefault(_cors);

var _unregister = require('./routes/unregister');

var _unregister2 = _interopRequireDefault(_unregister);

var _passport = require('passport');

var _passport2 = _interopRequireDefault(_passport);

var _morgan = require('morgan');

var _morgan2 = _interopRequireDefault(_morgan);

var _logger = require('./utils/logger');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Initialzing packages
var app = (0, _express2.default)();
var server = _http2.default.createServer(app);
var store = (0, _sessionMemoryStore2.default)(_expressSession2.default);
var corsOptions = {
    origin: '*'
};
require("./config/database");
require('./passport/local-auth');

// Middlewares
app.use((0, _expressSession2.default)({
    name: 'JSESSION',
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
    store: new store({
        expires: 60 * 60 * 12
    })
}));

// Settings
app.set('port', process.env.PORT || 3000);
app.use((0, _helmet2.default)());
app.use((0, _compression2.default)());
app.use(_bodyParser2.default.urlencoded({ extended: true }));
app.use(_bodyParser2.default.json());
app.use((0, _cookieParser2.default)('secret'));
app.use(_express2.default.static('client'));
app.use(_passport2.default.initialize());
app.use(_passport2.default.session());
app.use((0, _morgan2.default)("combined", { "stream": _logger.infoLog.stream }));
app.use((0, _cors2.default)(corsOptions));

//Routes


// Start the server
server.listen(app.get('port'), "0.0.0.0", function () {
    console.log('Server on port', app.get('port'));
});

exports.default = server;
//# sourceMappingURL=server.js.map