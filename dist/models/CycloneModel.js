"use strict";Object.defineProperty(exports,"__esModule",{value:true});exports.CycloneModel=undefined;var _mongoose=require("mongoose");var _mongoose2=_interopRequireDefault(_mongoose);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{"default":obj}}var Schema=_mongoose2.default.Schema;var CycloneSchema=new Schema({id:String,name:String,appearance:Date,lastUpdate:Date,origin:{lat:Number,lng:Number},predictedTrajectory:Array,realTrajectory:Array,active:Boolean,category:String});var CycloneModel=_mongoose2.default.model("Hurricaine",CycloneSchema);exports.CycloneModel=CycloneModel;