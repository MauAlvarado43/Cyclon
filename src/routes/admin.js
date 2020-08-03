import {Router} from 'express'
import Heroku from 'heroku-client'
import CyclonSocket from '../config/socket'
import path from 'path'
import fs from 'fs'
import { UserModel } from '../models/UserModel'
import { decryptFront, encryptAES } from '../utils/cipher'
  
module.exports = (server) => {

    const socketAppID = '6ca0bf73-c23b-4a76-b94b-0c984f9d66fe'

    const cyclonSocket = new CyclonSocket(server)
    const heroku  = new Heroku({ token: '2d9e3d36-8250-4011-aa1a-cdd0345d2624' })
    const router = Router()

    let pythonRunning = false

    /***************************************
                    Rendering
    ***************************************/

    router.get('/users', (req,res) => {
        let language = req.acceptsLanguages('es', 'en')
        if (!language) language = 'en' 
    
        let assets = JSON.parse(fs.readFileSync(path.join(__dirname,'../assets/'+language+'.json'),'utf-8'))
    
        if(!req.user || req.user.type!=2)
            res.redirect('/')
        else
            res.render('users', {
                title: `Cyclon - ${assets.titles.home}`, 
                assets: assets,
                path: '/users',
                context: req.user
            })
    })

    router.get('/cycloneSettings', (req,res) => {
        let language = req.acceptsLanguages('es', 'en')
        if (!language) language = 'en' 
    
        let assets = JSON.parse(fs.readFileSync(path.join(__dirname,'../assets/'+language+'.json'),'utf-8'))
    
        if(!req.user || req.user.type!=2)
            res.redirect('/')
        else
            res.render('cycloneSettings', {
                title: `Cyclon - ${assets.titles.home}`, 
                assets: assets,
                path: '/cycloneSettings',
                context: req.user
            })
    })

    /***************************************
                     API
    ***************************************/

    router.post('/api/deleteUser', (req,res) => {
        if(!req.user || req.user.type!=2)
            res.json({'code': 401, 'msg': ''})
        else{
            UserModel.findOne({ email: encryptAES(decryptFront(req.body.email)) }, (err,doc) => {
                if (err){
                    console.log(err)
                    res.json({'code': 401, 'msg': '500'})
                }
                else
                    UserModel.deleteOne({_id: doc._id}, () => {
                        if (err) {
                            console.log(err)
                            res.json({'code': 401, 'msg': '500'})
                        }
                        else
                        res.json({'code': 200, 'msg': 'DELETED_SUCCESSFULLY'})
                    })
            })
        }
    })

    router.get('/api/socket/run', (req,res) => {
        if(!req.user || req.user.type!=2)
            res.json({})
        else if(pythonRunning == false){

            pythonRunning = true
            
            heroku.request({
                method: 'DELETE',
                path: '/apps/'+socketAppID+'/dynos/web.1',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/vnd.heroku+json; version=3'        
                },
                parseJSON: false
            }).then(response => {
                  
                setTimeout(() => {
                    cyclonSocket.connectPython()
                }, 300000)

            })

            res.json({})

         }
        else{
            res.json({})
        }
    })

    router.get('/api/socket/stop', (req,res) => {
        if(!req.user || req.user.type!=2)
        res.json({})
        else if(pythonRunning == true){

            pythonRunning = false

            cyclonSocket.disconnectPython()

            heroku.request({
                method: 'POST',
                path: '/apps/'+socketAppID+'/dynos/web.1/actions/stop',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/vnd.heroku+json; version=3'        
                },
                parseJSON: false
            }).then(response => {
                console.log(response)
            })

            res.json({})
        }
        else{
            res.json({})
        }
    })

    return router

}