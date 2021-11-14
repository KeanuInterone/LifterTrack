const experss = require('express')
const router = experss.Router()
const passport = require('passport')
const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')


// CREATE //
router.post('/create', async (req, res) => {

	// password
	if (req.body.email == null || req.body.password == null) {
		res.status(500).json({ error: 'Email and Password must be defined' })
	}
	req.body.password = await encryptPassword(req.body.password)

	const user = new User(req.body)
	user.save().then((user) => {
		res.json(User.filterUser(user))
	}).catch((err) => {
		res.status(500).json({ error: err.message })
	})
})


// READ //
router.get('/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
	var id = req.params.id
	if (id.toLocaleLowerCase() == "me") {
		return res.json(User.filterUser(req.user))
	}

	let user = await User.findById(id)
	res.json(User.filterUser(user))
})

// UPDATE //
router.post('/edit/:id', passport.authenticate('jwt', { session: false }), (req, res) => {

	var id = req.params.id
	if (id.toLocaleLowerCase() == "me") {
		id = req.user._id
	}
	User.findById(id, (err, user) => {
		if (err) {
			res.status(500).send(err.message)
		} else if (!user) {
			res.status(400).send('User was not found')
		} else {

            if (req.body.email != undefined) {
				user.email = req.body.email
			}
			if (req.body.first_name != undefined) {
				user.first_name = req.body.first_name
			}
			if (req.body.last_name != undefined) {
				user.last_name = req.body.last_name
			}

			user.save().then((user) => {
				res.json(User.filterUser(user))
			}).catch((err) => {
				res.status(500).send(err.message)
			})
		}
	})
})

// DELETE //
router.delete('/delete/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
	var id = req.params.id
	if (id.toLocaleLowerCase() == "me") {
		id = req.user._id
	}
	User.findByIdAndDelete(id, function (err) {
		if (err) {
			res.status(500).send(err.message)
		} else {
			res.json({
				success: true,
				message: 'Succesfully deleted user'
			})
		}
	})
})


// LOGIN //
router.post('/login', function (req, res, next) {
	passport.authenticate('local', { session: false }, (err, user) => {
		if (err) { return next(err); }
		if (!user) { return res.status(404).send('Incorrect email or password'); }
		req.logIn(user, () => {
			const jwtBody = { id: user._id, email: user.email }
			const token = jwt.sign(jwtBody, process.env.JWT_SECRET)
			return res.json({ jwt: token })
		});
	})(req, res, next);
})


// HELPER //
function encryptPassword(password) {
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


module.exports = router