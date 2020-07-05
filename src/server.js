import express from 'express'
import http from 'http'
import compression from 'compression'
import session from 'express-session'
import helmet from 'helmet'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import memoryStore from 'session-memory-store'
import cors from 'cors'
import passport from 'passport'
import morgan from 'morgan'
import flash from 'connect-flash'
import path from 'path'
import graphqlHTTP from 'express-graphql'
import schema from './config/schema'
import {errorLog, infoLog} from './utils/logger'

// Initialzing packages
const app = express()
const server = http.createServer(app)
const store = memoryStore(session)
const corsOptions = {
    origin: '*'
}

require("./config/database")
require('./passport/local-auth')
require('./passport/google-auth')
require('./passport/facebook-auth')

// Middlewares
app.use(session({
    name: 'JSESSION',
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
    store: new store({
        expires: 60 * 60 * 12
    })
}))

app.use('/graphql', (req,res,next) => { 
    graphqlHTTP({
            graphiql: false,
            schema: schema,
            context: req.session
        })(req, res, next)
    }
)

// Settings
app.set('port', process.env.PORT || 3000)
app.use(helmet())
app.use(compression())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(cookieParser('secret'))
app.use(passport.initialize())
app.use(passport.session())
app.use(morgan("combined", { "stream": infoLog.stream }))
app.use(cors(corsOptions))
app.use(express.static(path.join(__dirname, 'public')))
app.use(flash())
app.set('view engine','ejs')
app.set('views','src/views')

//Routes
app.use(require('./routes/unregister'))

// Start the server
server.listen(app.get('port'),"0.0.0.0", () => {
    console.log('Server on port', app.get('port'))
})

export default server