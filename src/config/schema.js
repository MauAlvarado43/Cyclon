import { makeExecutableSchema } from 'graphql-tools'
import { resolvers } from './resolvers'
import fs from 'fs'
import path from 'path'

const typeDefs = fs.readFileSync(path.join(__dirname,'/schema.gql'),'utf-8')

export default makeExecutableSchema({
    typeDefs: typeDefs,
    resolvers: resolvers
})