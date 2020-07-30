"use strict";var _express=require("express");var _child_process=require("child_process");var _socket=require("../config/socket");var _socket2=_interopRequireDefault(_socket);var _passport=require("passport");var _passport2=_interopRequireDefault(_passport);var _path=require("path");var _path2=_interopRequireDefault(_path);var _fs=require("fs");var _fs2=_interopRequireDefault(_fs);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{"default":obj}}module.exports=function(server){var cyclonSocket=new _socket2.default(server);var router=(0,_express.Router)();var child=null;var pythonRunning=false;router.get("/api/admin/run",function(req,res){if(child==null&&pythonRunning==false){child=(0,_child_process.spawn)(process.env.PYTHON_ENV,[_path2.default.join(__dirname,"../services/index.py")]);pythonRunning=true;child.on("close",function(code,signal){console.log("child process terminated due to receipt of signal "+signal)});setTimeout(function(){cyclonSocket.connectPython()},5e3);res.send("START")}else{res.send("START'N :v")}});router.get("/api/admin/stop",function(req,res){if(child!=null&&pythonRunning==true){child.kill("SIGTERM");child=null;pythonRunning=false;cyclonSocket.disconnectPython();res.send("STOP")}else{res.send("STOP'N :v")}});return router};