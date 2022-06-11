"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = _interopRequireDefault(require("express"));

var _http = _interopRequireDefault(require("http"));

var _compression = _interopRequireDefault(require("compression"));

var _expressSession = _interopRequireDefault(require("express-session"));

var _expressRateLimit = _interopRequireDefault(require("express-rate-limit"));

var _helmet = _interopRequireDefault(require("helmet"));

var _bodyParser = _interopRequireDefault(require("body-parser"));

var _cookieParser = _interopRequireDefault(require("cookie-parser"));

var _sessionMemoryStore = _interopRequireDefault(require("session-memory-store"));

var _cors = _interopRequireDefault(require("cors"));

var _passport = _interopRequireDefault(require("passport"));

var _morgan = _interopRequireDefault(require("morgan"));

var _connectFlash = _interopRequireDefault(require("connect-flash"));

var _path = _interopRequireDefault(require("path"));

var _expressGraphql = _interopRequireDefault(require("express-graphql"));

var _schema = _interopRequireDefault(require("./config/schema"));

var _logger = require("./utils/logger");

var _cipher = require("./utils/cipher");

var _requestIp = _interopRequireDefault(require("request-ip"));

var _nodeFetch = _interopRequireDefault(require("node-fetch"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

// Initialzing packages
var app = (0, _express["default"])();

var server = _http["default"].createServer(app);

var store = (0, _sessionMemoryStore["default"])(_expressSession["default"]);
var corsOptions = {
  origin: '*'
};
var limiter = (0, _expressRateLimit["default"])({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: "DDOS detected"
});

require('dotenv').config();

require('./config/database');

require('./passport/local-auth');

require('./passport/google-auth');

require('./passport/facebook-auth'); // Middlewares


app.use((0, _expressSession["default"])({
  name: 'JSESSION',
  secret: 'secret',
  resave: true,
  saveUninitialized: true,
  store: new store({
    expires: 60 * 60 * 12
  })
}));
app.use('*', function (req, res, next) {
  if (!req.user && req.cookies && req.cookies.user) {
    req.logIn((0, _cipher.decryptAES)(JSON.parse(req.cookies.user)), function (err) {
      next();
    });
  } else next();
});
app.use('/graphql', function (req, res, next) {
  (0, _expressGraphql["default"])({
    graphiql: false,
    schema: _schema["default"],
    context: req.session
  })(req, res, next);
});
app.use(function (req, res, next) {
  res.set('Cache-Control', 'no-store');
  next();
}); // Settings

app.set('port', process.env.PORT || 3000);
app.use((0, _helmet["default"])());
app.use((0, _compression["default"])());
app.use(_bodyParser["default"].urlencoded({
  extended: true
}));
app.use(_bodyParser["default"].json());
app.use((0, _cookieParser["default"])('secret'));
app.use(_passport["default"].initialize());
app.use(_passport["default"].session());
app.use((0, _morgan["default"])('combined', {
  'stream': _logger.infoLog.stream
}));
app.use((0, _cors["default"])(corsOptions));
app.use(_express["default"]["static"](_path["default"].join(__dirname, 'public')));
app.use((0, _connectFlash["default"])());
app.use(_requestIp["default"].mw());
app.use(limiter);
app.set('view engine', 'ejs');
app.set('views', 'src/views');
app.use('/graphql', _passport["default"].initialize());
app.use('/graphql', _passport["default"].session()); //Routes

app.use(require('./routes/unregister'));
app.use(require('./routes/register'));
app.use(require('./routes/admin')(server));
app.use(require('./routes/investigator'));

var cyclonSocket = require("./config/socket")(server); // Start the server


server.listen(app.get('port'), '0.0.0.0', function () {
  console.log('Server on port', app.get('port'));
});
setInterval(function () {
  (0, _nodeFetch["default"])(process.env.PYTHON_URL).then(function (res) {
    res.text().then(function (text) {
      console.log("Socket found");
    });
  })["catch"](function (reject) {
    return console.log("Socket not found");
  });
  (0, _nodeFetch["default"])(process.env.URL + '/keepAlive').then(function (res) {
    res.text().then(function (text) {
      console.log("Server found");
    });
  })["catch"](function (reject) {
    return console.log("Server not found");
  });
}, 2000 * 60);
var _default = server;
exports["default"] = _default;
//# sourceMappingURL=server.js.map