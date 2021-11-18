const experss = require('express')
const router = experss.Router()
const passport = require('passport')
const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')


// CREATE //
router.post('/create', async (req, res) => {

	if (missingEmailOrPassword(req)) {
		return error("Email and password must be defined", 500, res)
	}

	req.body.password = await createEncryptedPassword(req.body.password)

	let user = new User(req.body)
	user = await user.save().catch((err) => error(err.message, 500, res))
    
	if (userIsNull(user)) {
		return error("Error creating user", 500, res)
	}

    return filteredUser(res, user)

})


// READ //
router.get('/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
	
	var id = req.params.id
	id = myIdIfMe(id, req)

	if (userDoesNotHavePermission(req.user, id)) {
		return error("Unauthorized", 401, res)
	}

	const user = await User.findById(id).catch((err) => error(err.message, 500, res))
    
	if (userIsNull(user)) {
		return error("Error creating user", 500, res)
	}

	return filteredUser(res, user)
})

// UPDATE //
router.post('/:id/edit', passport.authenticate('jwt', { session: false }), async (req, res) => {

	var id = req.params.id
	id = myIdIfMe(id, req)

	if (userDoesNotHavePermission(req.user, id)) {
		return error("Unauthorized", 401, res)
	}

    const user = await User.findOneAndUpdate({_id: id}, req.body, {new: true}).catch((err) => error(err.message, 500, res))

	if (userIsNull(user)) {
		return error("Error saving user", 500, res)
	}

	return filteredUser(res, user)

})

// DELETE //
router.delete('/:id/delete', passport.authenticate('jwt', { session: false }), async (req, res) => {
	var id = req.params.id
	id = myIdIfMe(id, req)

	if (userDoesNotHavePermission(req.user, id)) {
		return error("Unauthorized", 401, res)
	}

	await User.findByIdAndDelete(id).catch((err) => error(err.message, 500, res))

	res.json({success: true, message: 'Succesfully deleted user'})

})

// LOGIN //
router.post('/login', function (req, res, next) {
	if (missingEmailOrPassword(req)) {
		return error("Email and password are required", 404, res)
	}
	passport.authenticate('local', { session: false }, (err, user) => {
		if (err) { return next(err); }
		if (!user) { return error('Incorrect email or password', 404, res) }
		req.logIn(user, () => {
			const jwtBody = { id: user._id, email: user.email }
			const token = jwt.sign(jwtBody, process.env.JWT_SECRET)
			return res.json({ jwt: token })
		});
	})(req, res, next);
})


// HELPER FUNCTIONS //
function filteredUser(res, user) {
	return res.json(User.filterUser(user))
}

function missingEmailOrPassword(req) {
	return !req.body.email || !req.body.password
}

function userDoesNotHavePermission(user, id) {
	return !user._id.equals(id)
}

function userIsNull(user) {
	return !user
}

function myIdIfMe(id, req) {
	if (id.toLocaleLowerCase() == "me") {
		id = req.user._id
	}
	return id
}

function createEncryptedPassword(password) {
	return new Promise(resolve => {
		bcrypt.hash(password, 10, function (err, hash) {
			if (err) {
				console.log(err)
			} else {
				resolve(hash)
			}
		});
	})
}

// ERROR //
function error(message, code, res) {
	return res.status(code).json({ error: message })
}

module.exports = router