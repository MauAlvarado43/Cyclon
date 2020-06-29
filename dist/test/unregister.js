'use strict';

var _chai = require('chai');

var _chai2 = _interopRequireDefault(_chai);

var _chaiAsPromised = require('chai-as-promised');

var _chaiAsPromised2 = _interopRequireDefault(_chaiAsPromised);

var _chaiHttp = require('chai-http');

var _chaiHttp2 = _interopRequireDefault(_chaiHttp);

var _server = require('../server');

var _server2 = _interopRequireDefault(_server);

var _faker = require('faker');

var _faker2 = _interopRequireDefault(_faker);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var should = _chai2.default.should();

_chai2.default.use(_chaiHttp2.default);
_chai2.default.use(_chaiAsPromised2.default);

describe('POST /api/login', function () {
    it('should POST a login', function (done) {
        var login = {
            username: _faker2.default.lorem.word(),
            password: _faker2.default.lorem.word()
        };
        _chai2.default.request(_server2.default).post('/api/login').send(login).end(function (err, res) {
            (0, _chai.expect)(err).to.be.null;
            (0, _chai.expect)(res).to.have.status(200);
            (0, _chai.expect)(res.body).be.a('object');
            (0, _chai.expect)(res.body).to.have.property('code');
            done();
        });
    });
});
//# sourceMappingURL=unregister.js.map