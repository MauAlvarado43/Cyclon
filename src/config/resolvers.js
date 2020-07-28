import {CycloneModel} from '../models/CycloneModel'

export const resolvers = {
    Query:{
        async activeCyclones(root, args, context, info){
            return await CycloneModel.find({active: true})
        },
        async searchCyclone(root, args, context, info){
            return await CycloneModel.find( { appearance: {$gte: new Date(args.year.toString()), $lte: new Date((args.year + 1).toString()) } } ).sort({appearance: +1}).find((err, docs) => {
                if(err) return []
                else return docs
            })
        }
    }
}