const express = require('express')
const cors = require('cors')
const https = require('https')
const fs = require('fs')
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
const options = {
	key: fs.readFileSync('./config/certs/ca.key'),
	cert: fs.readFileSync('./config/certs/ca.cert')
}
const PORT = process.env.PORT
https.createServer(options, app).listen(PORT, () => {
	console.log("Server is running on port: " + PORT)
})