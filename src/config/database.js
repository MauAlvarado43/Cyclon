import mongoose from 'mongoose'

// mongoose.set('useFindAndModify', false);
// mongoose.connect('mongodb://localhost:27017/cyclon', {
//   useUnifiedTopology: true,  useNewUrlParser: true 
// }).then(db => console.log('DB is connected')).catch(err => console.log(err));

mongoose.set('useFindAndModify', false)
mongoose.connect('mongodb+srv://CyC1:kybmim-hoqhob-2Doswo@cyc1-p6vhd.mongodb.net/cyclon?retryWrites=true&w=majority', 
  {
    useUnifiedTopology: true,  
    useNewUrlParser: true 
  }
)
.then(db => console.log('DB is connected'))
.catch(err => console.log(err))