const mongoose = require('mongoose')


function connect() {
    // CONNECT TO DATABASE //
    mongoose.connect(`mongodb://db:27017/${process.env.DB_NAME}`, { useNewUrlParser: true })
    mongoose.connection.once('open', () => {
        console.log("Successful connection to db")
    })
}

module.exports = { connect }