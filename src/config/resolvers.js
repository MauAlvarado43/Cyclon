import {CycloneModel} from '../models/CycloneModel'

export const resolvers = {
    Query:{
        async activeCyclones(root, args, context, info){
            return await CycloneModel.find({active: true})
        },
        async allCyclones(root, args, context, info){
            return await CycloneModel.find()
        }
    }
}