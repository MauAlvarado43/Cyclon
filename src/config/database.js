import mongoose from 'mongoose'
import { errorLog } from '../utils/logger'


mongoose.set('useFindAndModify', false)
mongoose.connect(`${process.env.MONGO_URL}`, 
  {
    useUnifiedTopology: true,  
    useNewUrlParser: true 
  }
).then(db => console.log('DB is connected')).catch(err => errorLog.error(err))