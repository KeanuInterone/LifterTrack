const experss = require('express')
const router = experss.Router()
const User = require('../models/User')
const authenticateUser = require('../config/auth')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const error = require('../utils/error')
const Tag = require('../models/Tag')
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_OATH_CLIENT_ID);
const verifyAppleToken = require('verify-apple-id-token').default;


// CREATE //
router.post('/create', async (req, res) => {

	if (missingEmailOrPassword(req)) return error("Email and password must be defined", 500, res)
	req.body.password = await createEncryptedPassword(req.body.password)
	const { role, ...filterCreateUser } = req.body // exclude role fom create, defaults to free_user
	let user = new User(filterCreateUser)
	user = await user.save().catch((err) => error(err.message, 500, res))
	if (!user) return error("Error creating user", 500, res)
	createDefaultTagsForUser(user, res)
	return filteredUser(res, user)

})

// READ //
router.get('/:id', authenticateUser, async (req, res) => {

	var id = req.params.id
	id = myIdIfMe(id, req)
	if (userDoesNotHavePermission(req.user, id)) return error("Unauthorized", 401, res)
	const user = await User.findById(id).catch((err) => error(err.message, 500, res))
	if (!user) return error("Error creating user", 500, res)
	return filteredUser(res, user)
})

// UPDATE //
router.post('/:id/edit', authenticateUser, async (req, res) => {

	var id = req.params.id
	id = myIdIfMe(id, req)
	if (userDoesNotHavePermission(req.user, id)) return error("Unauthorized", 401, res)
	if (req.user._doc.role != "super_admin") {
		const { role, ...filterEditUser } = req.body
		req.body = filterEditUser
	}
	const user = await User.findOneAndUpdate({ _id: id }, req.body, { new: true }).catch((err) => error(err.message, 500, res))
	if (!user) return error("Error creating user", 500, res)
	return filteredUser(res, user)

})

// DELETE //
router.delete('/:id/delete', authenticateUser, async (req, res) => {

	var id = req.params.id
	id = myIdIfMe(id, req)
	if (userDoesNotHavePermission(req.user, id)) return error("Unauthorized", 401, res)
	await User.findByIdAndDelete(id).catch((err) => error(err.message, 500, res))
	res.json({ success: true, message: 'Succesfully deleted user' })

})

// LOGIN //
router.post('/login', async (req, res, next) => {

	if (missingEmailOrPassword(req)) return error("Email and password are required", 404, res)
	const email = req.body.email
	const password = req.body.password
	const user = await User.findOne({ email: email }).catch((err) => error(err.message, 500, res))
	if (!user) return error("Incorrect email or password", 404, res)
	if (await passwordIsValid(password, user.password)) return authToken(user, res)
	else return error("Incorrect email or password", 404, res)

})

function authToken(user, res) {
	const jwtBody = { id: user._id, email: user.email }
	const token = jwt.sign(jwtBody, process.env.JWT_SECRET)
	return res.json({ jwt: token, user: User.filterUser(user) })
}

function passwordIsValid(password, hash) {
	return new Promise(resolve => {
		bcrypt.compare(password, hash, function (err, result) {
			if (err) {
				console.log(err)
			} else {
				resolve(result)
			}
		});
	})
}

// AUTHORIZE OATH TOKEN //
router.post('/authorizeOAuthToken', async (req, res) => {
	if (missingOauthFields(req)) return error("token, and provider fields are required", 409, res)
	let token = req.body.token
	let provider = req.body.provider
	let email
	let first_name
	let last_name
	switch (provider) {
		case "google":
			try {
				const ticket = await client.verifyIdToken({
					idToken: token,
					requiredAudience: [process.env.GOOGLE_IOS_CLIENT_ID, process.env.GOOGLE_ANDROID_CLIENT_ID],
				})
				let payload = ticket.getPayload()
				email = payload.email
				first_name = payload.given_name
				last_name = payload.family_name
			} catch (err) {
				return error("There was an error authenticating with google: " + err.message, 500, res)
			}
			break
		case "apple":
			try {
				const jwtClaims = await verifyAppleToken({
					idToken: token,
					clientId: 'com.liftertrack.app',
				});
				email = jwtClaims.email
				first_name = req.body.first_name
				last_name = req.body.last_name
			} catch (err) {
				return error("There was an error authenticating with apple: " + err.message, 500, res)
			}
			break			
		default:
			return error("Provider was not recognized", 409, res)
	}
	let user = await User.findOne({ email: email }).catch((err) => error(err.message, 500, res))
	if (!user) {
		user = new User({email: email, first_name: first_name, last_name: last_name})
		user = await user.save().catch((err) => error(err.message, 500, res))
		if (!user) return error("Error creating user", 500, res)
		createDefaultTagsForUser(user, res)
	}
	return authToken(user, res)
})

// PERMISSIONS //
function userDoesNotHavePermission(user, id) {
	return !(user._id.equals(id) || user._doc.role == 'super_admin')
}


// HELPER FUNCTIONS //
function filteredUser(res, user) {
	return res.json(User.filterUser(user))
}
function missingEmailOrPassword(req) {
	return !req.body.email || !req.body.password
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
async function createDefaultTagsForUser(user, res) {
	let defaultTags = ['Push', 'Pull', 'Legs']
	for (const tagString of defaultTags) {
		let tag = new Tag({ name: tagString, user: user._id })
		await tag.save().catch(err => error(err.message, 500, res))
	}
}
function missingOauthFields(req) {
	return !req.body.token || !req.body.provider
}

module.exports = router