
const error = (message, code, res) => {
	return res.status(code).json({ error: message })
}

module.exports = error