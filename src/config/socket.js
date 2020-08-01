import ioClient from 'socket.io-client'
import ioServer from 'socket.io'

export default class CyclonSocket {

    constructor(http){

        this.io = ioServer(http)

        this.io.on('connection', client => {
            client.on('/alert', data => {  })
            client.on('disconnect', () => { })
        })

    }

    connectPython(){
        this.client = ioClient('https://mlcyclonsocket.herokuapp.com/')

        this.client.on('connect', function(){
            console.log("CONNECTED")
        })

        this.client.on('/alert', function(data){})
        
        this.client.on('disconnect', function(){
            console.log("DISCONNECTED")
        })
    }

    disconnectPython(){
        this.client.disconnect()
    }


}

