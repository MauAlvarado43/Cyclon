import mongoose from 'mongoose';

mongoose.set('useFindAndModify', false);
mongoose.connect('mongodb://localhost:27017/cyclon', {
  useUnifiedTopology: true,  useNewUrlParser: true 
})
  .then(db => console.log('DB is connected'))
  .catch(err => console.log(err));