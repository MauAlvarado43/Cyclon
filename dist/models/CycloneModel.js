"use strict";Object.defineProperty(exports,"__esModule",{value:true});exports.CycloneModel=undefined;var _mongoose=require("mongoose");var _mongoose2=_interopRequireDefault(_mongoose);var _cipher=require("../utils/cipher");var _regex=require("../utils/regex");function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj}}var Schema=_mongoose2.default.Schema;var CycloneSchema=new Schema({appearance:Date,lastUpdate:Date,origin:{lat:Number,lng:Number},predictedTrajectory:Array,realTrajectory:Array,category:String});var CycloneModel=_mongoose2.default.model("User",CycloneSchema);exports.CycloneModel=CycloneModel;