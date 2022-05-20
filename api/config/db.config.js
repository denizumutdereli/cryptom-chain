const mongoose = require('mongoose');

const mongoOptions = {
    autoIndex: true, 
    useNewUrlParser: true, 
    useUnifiedTopology: true,
    //useFindAndModify: false, 
  }

const mongodb_crendentials = process.env.mongodb_crendentials

module.exports = () => {
    mongoose.connect('mongodb://'+mongodb_crendentials+'@localhost:27017/apidb?authMechanism=DEFAULT&authSource=admin', mongoOptions)
    mongoose.connection.on('open', ()=> {
        //console.log('connected!')
    })
    mongoose.connection.on('error', (err)=> {
        console.log('MongoDB: Not Connected ' + err);
    })
    mongoose.Promise = global.Promise;
}