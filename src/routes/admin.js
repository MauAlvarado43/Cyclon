import {Router} from 'express'
import Heroku from 'heroku-client'
import { spawn } from 'child_process'
import CyclonSocket from '../config/socket'
import passport from 'passport'
import path from 'path'
import fs from 'fs'
  
module.exports = (server) => {

    const socketAppID = '6ca0bf73-c23b-4a76-b94b-0c984f9d66fe'

    const cyclonSocket = new CyclonSocket(server)
    const heroku  = new Heroku({ token: '2d9e3d36-8250-4011-aa1a-cdd0345d2624' })
    const router = Router()

    // STOP

    // heroku.request({
    //     method: 'POST',
    //     path: '/apps/'+socketAppID+'/dynos/web.1/actions/stop',
    //     headers: {
    //         'Content-Type': 'application/json',
    //         'Accept': 'application/vnd.heroku+json; version=3'        
    //     },
    //     parseJSON: false
    // }).then(response => {
    //       console.log(response)
    // })

    // START 

    // heroku.request({
    //     method: 'DELETE',
    //     path: '/apps/'+socketAppID+'/dynos/web.1',
    //     headers: {
    //         'Content-Type': 'application/json',
    //         'Accept': 'application/vnd.heroku+json; version=3'        
    //     },
    //     parseJSON: false
    // }).then(response => {
    //       console.log(response)
    // })

    let pythonRunning = false

    router.get('/api/admin/run', (req,res) => {
        if(pythonRunning == false){

            pythonRunning = true

            setTimeout(() => {
                cyclonSocket.connectPython()
            }, 30000)

            res.send("START")

         }
        else{
            res.send("START'N :v")
        }
    })

    router.get('/api/admin/stop', (req,res) => {
        if(pythonRunning == true){

            pythonRunning = false

            cyclonSocket.disconnectPython()

            res.send("STOP")
        }
        else{
            res.send("STOP'N :v")
        }
    })

    return router

}