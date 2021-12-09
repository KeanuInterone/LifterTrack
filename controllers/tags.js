const experss = require('express')
const router = experss.Router()
const Tag = require('../models/Tag')
const authenticateUser = require('../config/auth')
const error = require('../utils/error')

// CREATE //
router.post('/create', authenticateUser, async (req, res) => {

    if (req.user._doc.role != 'super_admin' || !req.body.user) {
        req.body.user = req.user._id
    }
    if(!req.body.name) return error('Name is required to create a tag', 409, res)
    let tag = await Tag.findOne({ name: req.body.name, user: req.body.user }).catch(err => error(err.message, 500, res))
    if (tag) return error('Tag with that name already exists', 409, res)
    tag = new Tag(req.body)
    tag = await tag.save().catch(err => error(err.message, 500, res))
    if (!tag) return error('Error creating tag', 500, res)
    res.json(tag)

})

// READ //
router.get('/:id', authenticateUser, async (req, res) => {

    const id = req.params.id
    const tag = await Tag.findById(id).catch(err => error(err.message, 500, res))
    if (!tag) return error('Not found', 404, res)
    res.json(tag)

})

// UPDATE //
router.post('/:id/edit', authenticateUser, async (req, res) => {

    const id = req.params.id
    const tag = await Tag.findOneAndUpdate({ _id: id }, req.body, { new: true }).catch(err => error(err.message, 500, res))
    if (!tag) return error('Error editing tag', 500, res)
    res.json(tag)

})

// DELETE //
router.delete('/:id/delete', authenticateUser, async (req, res) => {

    const id = req.params.id
    await Tag.findByIdAndDelete(id).catch(err => error(err.message, 500, res))
    res.json({
        success: true,
        message: 'Succesfully deleted tag'
    })

})

module.exports = router
