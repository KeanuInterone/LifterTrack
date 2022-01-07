const users = require('../controllers/users.js')
const exercises = require('../controllers/exercises.js')
const sets = require('../controllers/sets.js')
const workouts = require('../controllers/workouts.js')
const setgroups = require('../controllers/setgroups.js')
const tags = require('../controllers/tags.js')




function setRoutes(app) {

    // APP ROUTES //
    app.get('/', (req, res) => res.send(`<H1>Welcome to the ${process.env.APP_NAME} backend</H1><p>If you need to, email me at keanu@liftertrack.com</p>`))

    // USERS //
    app.use('/users', users) 

    // EXERCISES //
    app.use('/exercises', exercises)

    // SETS //
    app.use('/sets', sets)

    // WORKOUTS //
    app.use('/workouts', workouts)

    // SETGROUPS //
    app.use('/setgroups', setgroups)

    // TAGS //
    app.use('/tags', tags)
}

module.exports = { setRoutes }