const experss = require('express')
const router = experss.Router()
const Set = require('../models/Set')
const authenticateUser = require('../config/auth')
const error = require('../utils/error')

// GET ALL SETS //
router.get('/all', authenticateUser, async (req, res) => {
    let sets = await Set.find({}).catch(err => error(err.message, 500, res))
    if (!sets) return error('error getting exercises', 500, res)
    return res.json(sets)
})

// CREATE //
router.post('/create', authenticateUser, async (req, res) => {

	let set = new Set(req.body)
    set = await set.save().catch(err => error(err.message, 500, res))
    if (!set) return error('Error creating set', 500, res)
    res.json(set)

})

// READ //
router.get('/:id', authenticateUser, async (req, res) => {

    const id = req.params.id
    const set = await Set.findById(id).catch(err => error(err.message, 500, res))
    if (!set) return error('Not found', 404, res)
    res.json(set)

})

// UPDATE //
router.post('/:id/edit', authenticateUser, async (req, res) => {

    const id = req.params.id
    const set = await Set.findOneAndUpdate({_id: id}, req.body, {new: true}).catch(err => error(err.message, 500, res))
    if (!set) return error('Error editing set', 500, res)
    res.json(set)

})

// DELETE //
router.delete('/:id/delete', authenticateUser, async (req, res) => {
	
    const id = req.params.id
	await Set.findByIdAndDelete(id).catch(err => error(err.message, 500, res))
    res.json({
        success: true,
        message: 'Succesfully deleted set'
    })

})

module.exports = router
