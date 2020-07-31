"use strict";var _mongoose=require("mongoose");var _mongoose2=_interopRequireDefault(_mongoose);var _CycloneModel=require("../../models/CycloneModel");var _fs=require("fs");var _fs2=_interopRequireDefault(_fs);var _path=require("path");var _path2=_interopRequireDefault(_path);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{"default":obj}}function _asyncToGenerator(fn){return function(){var gen=fn.apply(this,arguments);return new Promise(function(resolve,reject){function step(key,arg){try{var info=gen[key](arg);var value=info.value}catch(error){reject(error);return}if(info.done){resolve(value)}else{return Promise.resolve(value).then(function(value){step("next",value)},function(err){step("throw",err)})}}return step("next")})}}require("dotenv").config();require("../../config/database");_fs2.default.readFile(_path2.default.join(__dirname,"./hurricaines.json"),function(err,file){var cyclones=JSON.parse(file);cyclones.forEach(function(){var _ref=_asyncToGenerator(regeneratorRuntime.mark(function _callee(element,index){var cyclone;return regeneratorRuntime.wrap(function _callee$(_context){while(1){switch(_context.prev=_context.next){case 0:cyclone=new _CycloneModel.CycloneModel;cyclone.id=element.id;cyclone.name=element.name;element.realTrajectory.forEach(function(element){cyclone.realTrajectory.push({position:{lat:element.lat,lng:element.lng},windSpeed:element.wind,hurrSpeed:0,temperature:element.temperature,pressure:element.pressure,date:element.date})});cyclone.appearance=element.realTrajectory[0].date;cyclone.lastUpdate=element.lastUpdate;cyclone.origin=element.origin;cyclone.predictedTrajectory=[];cyclone.active=element.active;cyclone.category=element.category;_context.next=12;return cyclone.save();case 12:console.log("Cyclone #"+index+" saved");if(index==cyclones.length-1){console.log("Process finished");process.exit(0)}case 14:case"end":return _context.stop()}}},_callee,undefined)}));return function(_x,_x2){return _ref.apply(this,arguments)}}())});