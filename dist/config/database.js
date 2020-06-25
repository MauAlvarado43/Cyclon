'use strict';

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_mongoose2.default.set('useFindAndModify', false);
_mongoose2.default.connect('mongodb://localhost:27017/login-node', {
  useNewUrlParser: true
}).then(function (db) {
  return console.log('DB is connected');
}).catch(function (err) {
  return console.log(err);
});
//# sourceMappingURL=database.js.map