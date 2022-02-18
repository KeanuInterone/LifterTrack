const experss = require('express')
const router = experss.Router()
const Exercise = require('../models/Exercise')
const Tag = require('../models/Tag')
const SetGroup = require('../models/SetGroup')
const authenticateUser = require('../config/auth')
const error = require('../utils/error')

// GET ALL EXERCISES //
router.get('/all', authenticateUser, async (req, res) => {
    if (req.user._doc.role != 'super_admin') return error('Unauthorized', 401, res)
    let exercises = await Exercise.find({}).catch(err => error(err.message, 500, res))
    if (!exercises) return error('error getting exercises', 500, res)
    return res.json(exercises)
})

// CREATE //
router.post('/create', authenticateUser, async (req, res) => {

    setUserId(req) 
    if(missingNameAndType(req)) return error('Exercise name and type required to create exercise', 409, res)
    if(exerciseIsWeightTypeAndIsMissingRequiredFields(req)) return error('Exercise with weight type requires track_per_side and weight_input set', 409, res)
    if(req.body.type == 'barbell') {
        setBarbellDefaults(req)
    }
    if(req.body.type == 'bodyweight') {
        setBodyweightDefaults(req)
    }
    if(req.body.type == 'dumbbell') {
        setDumbbellDefaults(req)
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

// ADD TAG //
router.post('/:id/add_tag', authenticateUser, async (req, res) => {
    if (req.user._doc.role != 'super_admin' || !req.body.user) {
        req.body.user = req.user._id
    } 
    const id = req.params.id
    let exercise = await Exercise.findById(id).catch(err => error(err.message, 500, res))
    if (!exercise) return error('Exercise not found', 404, res)
    if(!req.body.name) return error('Name is required to add a tag', 409, res)
    let tag = await Tag.findOne({ name: req.body.name, user: req.body.user }).catch(err => error(err.message, 500, res))
    if(!tag) {
        tag = new Tag(req.body)
        tag = await tag.save().catch(err => error(err.message, 500, res))
        if (!tag) return error('Error creating tag', 500, res)
    }
    if(!exercise._doc.tags.includes(tag._id)) {
        exercise._doc.tags.push(tag._id)
        exercise = await exercise.save().catch(err => error(err.message, 500, res))
    }
    return res.json(exercise)
})

// PROGRESSION 
router.get('/:id/progression', authenticateUser, async (req, res) => {

    let id = req.params.id
    let exercise = await Exercise.findById(id).catch(err => error(err.message, 500, res))
    if (!exercise) return error('Exercise not found', 404, res)
    let userID = req.user._id
    if (!exercise._doc.user.equals(userID)) return error('Unauthorized', 401, res)
    
    // GET ALL THE SET GROUPS
    let setGroups = await SetGroup
        .find({focus_exercise: id})
        .sort({ _id: 1 })
        .populate({
            path: 'sets',
        })
        .exec()

    // GET THE BEST EFORT FROM EACH
    let bestEforts = []
    let minValue
    let maxValue = 0
    let index = 0
    for (let setGroup of setGroups) {

        // FIND MAX VALUE IN SET
        if (setGroup.sets.length == 0) continue

        let setMaxValue = 0
        let setTime
        for (let set of setGroup.sets) {
            let value = set.weight
            if (exercise.type == 'bodyweight') {
                value = set.reps
            }
            if (value > setMaxValue) {
                setMaxValue = value
                setTime = set.time_stamp
            }
        }

        // PUSH BEST EFFORT OF SET INTO EFFORTS
        bestEforts.push({
            index: index++,
            date: setTime,
            value: setMaxValue
        })

        // SET MIN AND MAX VALUES
        if (minValue == undefined || setMaxValue < minValue) {
            minValue = setMaxValue
        }
        if (setMaxValue > maxValue) {
            maxValue = setMaxValue
        }
    }

    // If there are no set groups min isnt defined and needs to be set to 0
    minValue = 0;

    // RETURN THE DATA
    res.json({min: minValue, max: maxValue, efforts: bestEforts})
});



// LAST SET // 
router.get('/:id/last_set', authenticateUser, async (req, res) => {

    let id = req.params.id
    let exercise = await Exercise.findById(id).catch(err => error(err.message, 500, res))
    if (!exercise) return error('Exercise not found', 404, res)
    let userID = req.user._id
    if (!exercise._doc.user.equals(userID)) return error('Unauthorized', 401, res)
    
    // GET THE LAST SET GROUP
    let setGroups = await SetGroup
        .find({focus_exercise: id})
        .limit(2)
        .sort({ _id: -1 })
        .populate({
            path: 'sets',
        })
        .exec()
    
    // CHECK IF THERE IS A PREVIOUS SET
    if (setGroups.length < 2) return res.json({setGroup: null, best: 0})

    // GET THE PREVIOUS SET GROUP
    let setGroup = setGroups[1]; 

    // FIND THE BEST SET
    let setMaxValue = 0
    for (let set of setGroup.sets) {
        let value = set.weight
        if (exercise.type == 'bodyweight') {
            value = set.reps
        }
        if (value > setMaxValue) {
            setMaxValue = value
        }
    }

    res.json({setGroup: setGroup, best: setMaxValue})
});

module.exports = router
function setDumbbellDefaults(req) {
    req.body.track_per_side = true
    req.body.weight_input = 'value'
}

function setBodyweightDefaults(req) {
    delete req.body.track_per_side
    delete req.body.weight_input
}

function setBarbellDefaults(req) {
    req.body.track_per_side = false
    req.body.weight_input = 'plates'
}

function exerciseIsWeightTypeAndIsMissingRequiredFields(req) {
    return req.body.type == 'weight' && (!req.body.hasOwnProperty('track_per_side') || !req.body.weight_input)
}

function missingNameAndType(req) {
    return !req.body.name || !req.body.type
}

function setUserId(req) {
    if (req.user._doc.role != 'super_admin' || !req.body.user) {
        req.body.user = req.user._id
    }
}

