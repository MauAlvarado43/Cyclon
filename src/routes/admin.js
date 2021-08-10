import {Router} from 'express'
import path from 'path'
import fs from 'fs'
import { UserModel } from '../models/UserModel'
import { decryptFront, encryptAES } from '../utils/cipher'
  
module.exports = () => {

    const router = Router()

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
                title: `Cyclon - ${assets.titles.users}`, 
                assets: assets,
                path: '/users',
                context: req.user
            })
    })

    /***************************************
                     API
    ***************************************/

   router.post('/api/upgradeUser', (req,res) => {
        if(!req.user || req.user.type!=2)
            res.json({'code': 402, 'msg': ''})
        else{
            UserModel.updateOne({email: encryptAES(decryptFront(req.body.email)) }, {$set: { type: 2 } }, (err,raw) => {
                if(err) {
                    errorLog.error(err)
                    res.json({'code': 401, 'msg': '500'})
                }
                else
                    res.json({'code': 200, 'msg': 'DELETED_SUCCESSFULLY'})
            }) 
        }
    })

    router.post('/api/deleteUser', (req,res) => {
        if(!req.user || req.user.type!=2)
            res.json({'code': 402, 'msg': ''})
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

    return router

}