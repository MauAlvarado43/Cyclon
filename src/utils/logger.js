import winston, { createLogger } from 'winston'
import {configuredFormatter} from 'winston-json-formatter'
import dailyRotate from 'winston-daily-rotate-file'

const infoLogger = winston.createLogger({
    level: 'info',
    transports: [
      new (dailyRotate)({
          'name': 'access-file',
          'level': 'info',
          'filename': './logs/access.log',
          'json': true,
          'datePattern': 'YYYY-MM-DD',
          'prepend': true,
          'maxFiles': '14d',
          "flags": "w",
          timestamp : function() {
            return getDateTime();        
          },
          exitOnError: false
      })
    ]
})

const errorLogger = createLogger({ 
    level: 'error',
    transports: [
      new (dailyRotate)({
          'name': 'error-file',
          'level': 'error',
          'filename': './logs/error.log',
          'json': true,
          'datePattern': 'YYYY-MM-DD',
          'prepend': true,
          'maxFiles': '14d',
          "flags": "w",
          timestamp : function() {
            return getDateTime();        
          },
          exitOnError: false
      })
    ]
})

const options = { 
    service: 'Cyclon', 
    logger: 'Winston-JSON-Formatter',
    version: '1.0.0', 
    typeFormat: 'json'
}

errorLogger.format = configuredFormatter(options);
infoLogger.format = configuredFormatter(options);

infoLogger.stream = {
    write: function(message, encoding){
      infoLogger.info(message);
    }
}

function getDateTime(){
    var currentdate = new Date(); 
    var datetime = currentdate.getDate() + "/"
      + (currentdate.getMonth()+1)  + "/" 
      + currentdate.getFullYear() + " "  
      + currentdate.getHours() + ":"  
      + currentdate.getMinutes() + ":" 
      + currentdate.getSeconds();
    return datetime;  
}

export {infoLogger as infoLog, errorLogger as errorLog}