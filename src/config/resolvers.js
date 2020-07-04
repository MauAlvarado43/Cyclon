import {CycloneModel} from '../models/CycloneModel'

export const resolvers = {
    Query:{
        async activeCyclones(root, args, context, info){
            console.log(context)
            return await CycloneModel.find({active: true})
        }
    }
}