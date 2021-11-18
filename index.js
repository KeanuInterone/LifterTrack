const express = require('express')
const cors = require('cors')
const database = require('./config/database')
const routes = require('./config/routes')
const auth = require('./config/auth')

// CONNECT TO DATABASE //
database.connect()

// APP SET UP //
const app = express()
app.use(cors())
app.use(express.json())

// SET UP AUTH //
auth.setUp(app);

// SET ROUTES //
routes.setRoutes(app)

// APP LISTEN //
const PORT = process.env.PORT
const HOST = process.env.HOST
app.listen(PORT, HOST, () => {
    console.log("Server is running on port: " + PORT)
})