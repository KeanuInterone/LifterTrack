const jwt = require('jsonwebtoken')
const User = require('../models/User')
const error = require('../utils/error')

const authenticateUser = async (req, res, next) => {

    if (reqestIsMissingAuthToken(req)) return error("Missing authentication token", 401, res)
    let token = tokenFromRequest(req)
    let tokenPayload = getTokenPayload(token)
    if (!tokenPayload) return error("Invalid token", 401, res)
    let user = await User.findById(tokenPayload.id).catch(err => error(err.message, 401, res))
    if (!user) return error("Invalid token", 401, res)
    req.user = user
    next()

}

function reqestIsMissingAuthToken(req) {
    return !req.headers.authorization
}

function tokenFromRequest(req) {
    let token = req.headers.authorization
    return token.replace('Bearer ', '')
}

function getTokenPayload(token) {
    try {
        return jwt.verify(token, process.env.JWT_SECRET)
    } catch (err) {
        return null
    }
}


module.exports = authenticateUser