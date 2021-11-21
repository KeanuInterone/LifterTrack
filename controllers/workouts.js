const experss = require('express')
const router = experss.Router()
const Workout = require('../models/Workout')
const Exercise = require('../models/Exercise')
const Set = require('../models/Set')
const authenticateUser = require('../config/auth')
const error = require('../utils/error')

// CREATE //
router.post('/create', authenticateUser, async (req, res) => {

    req.body.user = req.user._id
	let workout = new Workout(req.body)
    workout = await workout.save().catch(err => error(err.message, 500, res))
    if (!workout) return error('Error creating workout', 500, res)
    res.json(workout)

})

// READ //
router.get('/:id', authenticateUser, async (req, res) => {

    const id = req.params.id
    const workout = await Workout.findById(id).populate({ 
        path: 'sets',
        populate: {
          path: 'exercise',
        } 
     }).exec().catch(err => error(err.message, 500, res))
    if (!workout) return error('Not found', 404, res)
    res.json(workout)

})

// UPDATE //
router.post('/:id/edit', authenticateUser, async (req, res) => {

    const id = req.params.id
    const workout = await Workout.findOneAndUpdate({_id: id}, req.body, {new: true}).catch(err => error(err.message, 500, res))
    if (!workout) return error('Error editing workout', 500, res)
    res.json(workout)

})

// DELETE //
router.delete('/:id/delete', authenticateUser, async (req, res) => {
	
    const id = req.params.id
	await Workout.findByIdAndDelete(id).catch(err => error(err.message, 500, res))
    res.json({
        success: true,
        message: 'Succesfully deleted workout'
    })

})

// ADD SET //
router.post('/:id/add_set', authenticateUser, async (req, res) => {

    let exercise = null
    if (req.body.exercise_id) {
        exercise = await Exercise.findById(req.body.exercise_id).catch(err => error(err.message, 500, res))
        if (!exercise) return error('exercise with that id was not found', 404, res)
    } else if (req.body.exercise_name) {
        exercise = await Exercise.findOne({name: req.body.exercise_name}).catch(err => error(err.message, 500, res))
        if (!exercise) {
            exercise = new Exercise({name: req.body.exercise_name, user: req.user._id})
            exercise = await exercise.save().catch(err => error(err.message, 500, res))
            if (!exercise) return error('error creating new exercise', 500, res)
        }
    } else {
        return error('missing exercise id or name', 400, res)
    }

    let id = req.params.id
    let workout = await Workout.findById(id).catch(err => error(err.message, 500, res))
    if (!workout) return error('could not find workout with that id', 404, res)

    req.body.exercise = exercise._id
    req.body.workout = workout._id
    req.body.user = req.user._id
    let set = new Set(req.body)
    set = await set.save().catch(err => error(err.message, 500, res))
    if (!set) return error('error creating set', 500, res)

    workout._doc.sets.push(set._id)
    await workout.save().catch(err => error(err.message, 500, res))

    return res.json(set)    

})

module.exports = router
