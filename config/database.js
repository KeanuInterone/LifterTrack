const mongoose = require('mongoose')


function connect() {
    // CONNECT TO DATABASE //
    //mongodb://${process.env.DB_HOST}:27017/${process.env.DB_NAME}
    
    mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_CLUSTER}.gammg.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`, { useNewUrlParser: true })
    mongoose.connection.once('open', () => {
        console.log("Successful connection to db")
    })
}

module.exports = { connect }