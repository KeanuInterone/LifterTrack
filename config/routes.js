const users = require('../controllers/users.js')



function setRoutes(app) {

    // APP ROUTES //
    app.get('/', (req, res) => {
        res.send(`Welcome to the ${process.env.APP_NAME} backend`)
    })

    // USERS //
    app.use('/users', users)    

}

module.exports = { setRoutes }