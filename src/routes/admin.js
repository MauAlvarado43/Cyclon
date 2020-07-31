import {Router} from 'express'
import { spawn } from 'child_process'
import CyclonSocket from '../config/socket'
import passport from 'passport'
import path from 'path'
import fs from 'fs'
  
module.exports = (server) => {

    const cyclonSocket = new CyclonSocket(server)
    const router = Router()

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