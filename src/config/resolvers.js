import { CycloneModel } from '../models/CycloneModel'
import { UserModel } from '../models/UserModel'
import { encryptFront, encryptAES, decryptAES } from '../utils/cipher'

export const resolvers = {
    Query:{
        async activeCyclones(root, args, context, info){
            if(context.type==0 || context.type && context.passport.user)
                return await CycloneModel.find({active: true})
            else 
                return null
        },
        async searchCyclone(root, args, context, info){
            if(context.type && context.passport.user)
                return await CycloneModel.find( { appearance: {$gte: new Date(args.year.toString()), $lte: new Date((args.year + 1).toString()) } } ).sort({appearance: +1}).find((err, docs) => {
                    if(err) return []
                    else return docs
                })
            else
                return null
        },
        async pageUser(root, args, context, info){

            if(context.type==2 && context.passport.user){
                let docs = await UserModel.find( {type: args.type }).limit(100).skip(args.page * 100)

                let users = []
    
                docs.forEach(element => {
                    users.push({
                        name: encryptFront(element.name),
                        lastName: encryptFront(element.lastName),
                        email: encryptFront(decryptAES(element.email)),
                        location: {
                            lat: encryptFront(decryptAES(element.location.lat)),
                            lng: encryptFront(decryptAES(element.location.lng))
                        },
                        type: element.type,
                        verify: element.verify,
                        register: element.register
                    })
                })
                
                return users
            }
            else 
                return null
        
        },
        countUser(root, args, context, info){
            if(context.type==2 && context.passport.user)
                return new Promise((resolve, reject) => {
                    UserModel.find({ type: args.type }).countDocuments((err, count) => {
                        if(err) resolve({})
                        else resolve({count: count})
                    })
                })
            else
                return null
        },
        async getGraphUserType (root, args, context, info) {
            if(context.type==2 && context.passport.user)
                return new Promise( async (resolve, reject) => {

                    let date = new Date(new Date().toDateString()).getTime()
                    let response = { normal: [], scientist: [] }

                    for(var i = 14; i >= 0 ; i--) {

                        let firstDate = new Date((date - ( i  * (24*60*60*1000))))
                        let secondDate = new Date((date - ( (i - 1) * (24*60*60*1000))))

                        await UserModel.find({ dateRegister: {$gte: firstDate, $lte: secondDate }, type: 0 }).countDocuments((err, count) => {
                            if(err) console.log(err)
                            else response.normal.push({ date: firstDate.toISOString(), count: count })
                            return true
                        })
                        await UserModel.find({ dateRegister: {$gte: firstDate, $lte: secondDate }, type: 1 }).countDocuments((err, count) => {
                            if(err) console.log(err)
                            else response.scientist.push({ date: firstDate.toISOString(), count: count })
                            return true
                        })
                    }

                    resolve(response)
                    
                })
            else 
                return null
        },
        async getGraphUserRegister(root, args, context, info) {
            if(context.type==2 && context.passport.user)
                return new Promise( async (resolve, reject) => {

                    let date = new Date(new Date().toDateString()).getTime()
                    let response = { facebook: [], google: [], local: [] }

                    for(var i = 14; i >= 0 ; i--) {

                        let firstDate = new Date((date - ( i  * (24*60*60*1000))))
                        let secondDate = new Date((date - ( (i - 1) * (24*60*60*1000))))

                        await UserModel.find({ dateRegister: {$gte: firstDate, $lte: secondDate }, register: 0 }).countDocuments((err, count) => {
                            if(err) console.log(err)
                            else response.local.push({ date: firstDate.toISOString(), count: count })
                            return true
                        })
                        await UserModel.find({ dateRegister: {$gte: firstDate, $lte: secondDate }, register: 1 }).countDocuments((err, count) => {
                            if(err) console.log(err)
                            else response.facebook.push({ date: firstDate.toISOString(), count: count })
                            return true
                        })
                        await UserModel.find({ dateRegister: {$gte: firstDate, $lte: secondDate }, register: 2 }).countDocuments((err, count) => {
                            if(err) console.log(err)
                            else response.google.push({ date: firstDate.toISOString(), count: count })
                            return true
                        })
                    }

                    resolve(response)
                    
                })
            else
                return null
        },
        async getGraphUserVerified(root, args, context, info) {
            if(context.type==2 && context.passport.user)
                return new Promise( async (resolve, reject) => {

                    let date = new Date(new Date().toDateString()).getTime()
                    let response = { verified: [], unverified: [] }

                    for(var i = 14; i >= 0 ; i--) {

                        let firstDate = new Date((date - ( i  * (24*60*60*1000))))
                        let secondDate = new Date((date - ( (i - 1) * (24*60*60*1000))))

                        await UserModel.find({ dateRegister: {$gte: firstDate, $lte: secondDate }, verify: true }).countDocuments((err, count) => {
                            if(err) console.log(err)
                            else response.verified.push({ date: firstDate.toISOString(), count: count })
                            return true
                        })
                        await UserModel.find({ dateRegister: {$gte: firstDate, $lte: secondDate }, verify: false }).countDocuments((err, count) => {
                            if(err) console.log(err)
                            else response.unverified.push({ date: firstDate.toISOString(), count: count })
                            return true
                        })
                    }

                    resolve(response)
                    
                })
            else
                return null
        },
        async searchUser(root, args, context, info) {
            if(context.type==2 && context.passport.user){
                let docs = await UserModel.find( { email: encryptAES(args.email), $and: [{ $or: [ {type: 0 }, {type: 1 } ] }] })

                let users = []
    
                docs.forEach(element => {
                    users.push({
                        name: encryptFront(element.name),
                        lastName: encryptFront(element.lastName),
                        email: encryptFront(decryptAES(element.email)),
                        location: {
                            lat: encryptFront(decryptAES(element.location.lat)),
                            lng: encryptFront(decryptAES(element.location.lng))
                        },
                        type: element.type,
                        verify: element.verify,
                        register: element.register
                    })
                })
                
                return users
            }
            else
                return null
        }
    }
}