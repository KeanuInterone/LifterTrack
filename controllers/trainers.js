const experss = require('express')
const router = experss.Router()
const Trainer = require('../models/Trainer')
const authenticateUser = require('../config/auth')
const error = require('../utils/error')

// GET CLIENTS //
router.get('/clients', authenticateUser, async (req, res) => {

    let userID = req.user._id
    const trainer = await Trainer
        .findOne({ user: userID })
        .populate({
            path: 'clients',
        })
        .catch(err => error(err.message, 500, res))
    if (!trainer) return error('You are not a trainer', 404, res)

    res.json(trainer.clients)

})


// CREATE //
router.post('/create', authenticateUser, async (req, res) => {

	let trainer = new Trainer(req.body)
    trainer = await trainer.save().catch(err => error(err.message, 500, res))
    if (!trainer) return error('Error creating trainer', 500, res)
    res.json(trainer)

})

// READ //
router.get('/:id', authenticateUser, async (req, res) => {

    const id = req.params.id
    const trainer = await Trainer.findById(id).catch(err => error(err.message, 500, res))
    if (!trainer) return error('Not found', 404, res)
    res.json(trainer)

})

// UPDATE //
router.post('/:id/edit', authenticateUser, async (req, res) => {

    const id = req.params.id
    const trainer = await Trainer.findOneAndUpdate({_id: id}, req.body, {new: true}).catch(err => error(err.message, 500, res))
    if (!trainer) return error('Error editing trainer', 500, res)
    res.json(trainer)

})

// DELETE //
router.delete('/:id/delete', authenticateUser, async (req, res) => {
	
    const id = req.params.id
	await Trainer.findByIdAndDelete(id).catch(err => error(err.message, 500, res))
    res.json({
        success: true,
        message: 'Succesfully deleted trainer'
    })

})



module.exports = router
