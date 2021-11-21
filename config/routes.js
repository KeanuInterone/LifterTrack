const users = require('../controllers/users.js')
const exercises = require('../controllers/exercises.js')
const sets = require('../controllers/sets.js')
const workouts = require('../controllers/workouts.js')


function setRoutes(app) {

    // APP ROUTES //
    app.get('/', (req, res) => res.send(`Welcome to the ${process.env.APP_NAME} backend`))

    // USERS //
    app.use('/users', users) 

    // EXERCISES //
    app.use('/exercises', exercises)

    // SETS //
    app.use('/sets', sets)

    // WORKOUTS //
    app.use('/workouts', workouts)

}

module.exports = { setRoutes }