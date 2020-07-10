import mongoose from 'mongoose'

mongoose.set('useFindAndModify', false)
mongoose.connect(`${process.env.MONGO_URL}`, 
  {
    useUnifiedTopology: true,  
    useNewUrlParser: true 
  }
)
.then(db => console.log('DB is connected'))
.catch(err => console.log(err))