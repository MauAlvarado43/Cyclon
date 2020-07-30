import {Router} from 'express'
import { spawn } from 'child_process'
import passport from 'passport'
import path from 'path'
import fs from 'fs'

const router = Router()

let child = null
let pythonRunning = false

router.get('/api/admin/run', (req,res) => {
    if(child == null && pythonRunning == false){
        child =  spawn(process.env.PYTHON_ENV, [path.join(__dirname, '../services/index.py')])
        pythonRunning = true

        child.on('close', (code, signal) => {
            console.log(
              `child process terminated due to receipt of signal ${signal}`)
        })
        
        res.send("START")
    }
    else{
        res.send("START'N :v")
    }
})

router.get('/api/admin/stop', (req,res) => {
    if(child != null && pythonRunning == true){
        child.kill('SIGTERM')
        child =  null
        pythonRunning = false
        res.send("STOP")
    }
    else{
        res.send("STOP'N :v")
    }
})
  
module.exports = router