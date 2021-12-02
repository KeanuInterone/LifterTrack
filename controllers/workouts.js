const experss = require('express')
const router = experss.Router()
const Workout = require('../models/Workout')
const Exercise = require('../models/Exercise')
const Set = require('../models/Set')
const SetGroup = require('../models/SetGroup')
const authenticateUser = require('../config/auth')
const error = require('../utils/error')

// CREATE //
router.post('/create', authenticateUser, async (req, res) => {

    if (req.user._doc.role != 'super_admin' || !req.body.user) {
        req.body.user = req.user._id
    } 
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

// ADD SET GROUP //
router.post('/:id/add_set_group', authenticateUser, async (req, res) => {

    let id = req.params.id
    let workout = await Workout.findById(id).catch(err => error(err.message, 500, res))
    if (!workout) return error('could not find workout with that id', 404, res)
    req.body.workout = workout._id

    if (req.user._doc.role != 'super_admin' || !req.body.user) {
        req.body.user = req.user._id
    } 

    if (!req.body.focus_exercise) return error('focus_exercise is required to create set group', 400, res)
    let exercise = await Exercise.findById(req.body.focus_exercise).catch(err => error(err.message, 500, res))
    if (!exercise) return error('Focus exercise was not found', 404, res)


    let setGroup = new SetGroup(req.body)
    setGroup = await setGroup.save().catch(err => error(err.message, 500, res))
    if (!setGroup) return error('error creating set group', 500, res)

    workout._doc.set_groups.push(setGroup._id)
    await workout.save().catch(err => error(err.message, 500, res))

    return res.json(setGroup)
})

// ADD SET //
router.post('/:id/add_set', authenticateUser, async (req, res) => {

    let exercise = null
    if (req.body.exercise_id) {
        exercise = await Exercise.findById(req.body.exercise_id).catch(err => error(err.message, 500, res))
        if (!exercise) return error('exercise with that id was not found', 404, res)
    } else {
        return error('missing exercise id', 400, res)
    }

    let setGroup = null
    if (req.body.set_group_id) {
        setGroup = await SetGroup.findById(req.body.set_group_id).catch(err => error(err.message, 500, res))
        if (!setGroup) return error('set group with that id was not found', 404, res)
    } else {
        return error('missing set group id', 400, res)
    }

    let id = req.params.id
    let workout = await Workout.findById(id).catch(err => error(err.message, 500, res))
    if (!workout) return error('could not find workout with that id', 404, res)

    req.body.exercise = exercise._id
    req.body.workout = workout._id
    req.body.user = req.user._id
    req.body.set_group = setGroup._id
    let set = new Set(req.body)
    set = await set.save().catch(err => error(err.message, 500, res))
    if (!set) return error('error creating set', 500, res)

    workout._doc.sets.push(set._id)
    await workout.save().catch(err => error(err.message, 500, res))

    setGroup._doc.sets.push(set._id)
    await setGroup.save().catch(err => error(err.message, 500, res))

    return res.json(set)    

})

module.exports = router
