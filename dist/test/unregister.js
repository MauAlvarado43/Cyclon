"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

var _chai = _interopRequireWildcard(require("chai"));

var _chaiAsPromised = _interopRequireDefault(require("chai-as-promised"));

var _chaiHttp = _interopRequireDefault(require("chai-http"));

var _server = _interopRequireDefault(require("../server"));

var _faker = _interopRequireDefault(require("faker"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

var should = _chai["default"].should();

_chai["default"].use(_chaiHttp["default"]);

_chai["default"].use(_chaiAsPromised["default"]);

describe('POST /api/login', function () {
  it('should POST a login', function (done) {
    var login = {
      username: _faker["default"].lorem.word(),
      password: _faker["default"].lorem.word()
    };

    _chai["default"].request(_server["default"]).post('/api/login').send(login).end(function (err, res) {
      (0, _chai.expect)(err).to.be["null"];
      (0, _chai.expect)(res).to.have.status(200);
      (0, _chai.expect)(res.body).be.a('object');
      (0, _chai.expect)(res.body).to.have.property('code');
      done();
    });
  });
});
//# sourceMappingURL=unregister.js.map