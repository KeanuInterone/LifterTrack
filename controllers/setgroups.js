const experss = require('express')
const router = experss.Router()
const SetGroup = require('../models/SetGroup')
const authenticateUser = require('../config/auth')
const error = require('../utils/error')

// CREATE //
router.post('/create', authenticateUser, async (req, res) => {

    if (req.user._doc.role != 'super_admin') {
        req.body.user = req.user._id
    }
	let setgroup = new SetGroup(req.body)
    setgroup = await setgroup.save().catch(err => error(err.message, 500, res))
    if (!setgroup) return error('Error creating setgroup', 500, res)
    res.json(setgroup)

})

// READ //
router.get('/:id', authenticateUser, async (req, res) => {

    const id = req.params.id
    const setgroup = await SetGroup.findById(id).catch(err => error(err.message, 500, res))
    if (!setgroup) return error('Not found', 404, res)
    res.json(setgroup)

})

// UPDATE //
router.post('/:id/edit', authenticateUser, async (req, res) => {

    const id = req.params.id
    const setgroup = await SetGroup.findOneAndUpdate({_id: id}, req.body, {new: true}).catch(err => error(err.message, 500, res))
    if (!setgroup) return error('Error editing setgroup', 500, res)
    res.json(setgroup)

})

// DELETE //
router.delete('/:id/delete', authenticateUser, async (req, res) => {
	
    const id = req.params.id
	await SetGroup.findByIdAndDelete(id).catch(err => error(err.message, 500, res))
    res.json({
        success: true,
        message: 'Succesfully deleted setgroup'
    })

})

module.exports = router
