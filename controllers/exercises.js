const experss = require('express')
const router = experss.Router()
const Exercise = require('../models/Exercise')
const authenticateUser = require('../config/auth')
const error = require('../utils/error')

// GET ALL EXERCISES //
router.get('/all', authenticateUser, async (req, res) => {
    let exercises = await Exercise.find({}).catch(err => error(err.message, 500, res))
    if (!exercises) return error('error getting exercises', 500, res)
    return res.json(exercises)
})

// CREATE //
router.post('/create', authenticateUser, async (req, res) => {

    if (req.user._doc.role != 'super_admin' || !req.body.user) {
        req.body.user = req.user._id
    } 
    if(!req.body.name || !req.body.type) return error('Exercise name and type required to create exercise', 409, res)
    if(req.body.type == 'weight' && (!req.body.hasOwnProperty('track_per_side') || !req.body.weight_input)) return error('Exercise with weight type requires track_per_side and weight_input set', 409, res)
    if(req.body.type == 'barbell') {
        req.body.track_per_side = false
        req.body.weight_input = 'plates'
    }
    if(req.body.type == 'bodyweight') {
        delete req.body.track_per_side
        delete req.body.weight_input
    }
    let exercise = await Exercise.findOne({name: req.body.name, user: req.body.user}).catch(err => error(err.message, 500, res))
    if (exercise) return error('Exercise with that name already exists', 409, res)
	exercise = new Exercise(req.body)
    exercise = await exercise.save().catch(err => error(err.message, 500, res))
    if (!exercise) return error('Error creating exercise', 500, res)
    res.json(exercise)

})

// READ //
router.get('/:id', authenticateUser, async (req, res) => {

    const id = req.params.id
    const exercise = await Exercise.findById(id).catch(err => error(err.message, 500, res))
    if (!exercise) return error('Not found', 404, res)
    res.json(exercise)

})

// UPDATE //
router.post('/:id/edit', authenticateUser, async (req, res) => {

    const id = req.params.id
    const exercise = await Exercise.findOneAndUpdate({_id: id}, req.body, {new: true}).catch(err => error(err.message, 500, res))
    if (!exercise) return error('Error editing exercise', 500, res)
    res.json(exercise)

})

// DELETE //
router.delete('/:id/delete', authenticateUser, async (req, res) => {
	
    const id = req.params.id
	await Exercise.findByIdAndDelete(id).catch(err => error(err.message, 500, res))
    res.json({
        success: true,
        message: 'Succesfully deleted exercise'
    })

})

// GET USERS EXERCISES //
router.get('/', authenticateUser, async (req, res) => {
    let exercises = await Exercise.find({user: req.user._id}).catch(err => error(err.message, 500, res))
    if (!exercises) return error('error getting exercises', 500, res)
    return res.json(exercises)
})



module.exports = router
