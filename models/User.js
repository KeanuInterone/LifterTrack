const mongoose = require('mongoose')

const User = mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    first_name: {
        type: String
    },
    last_name: {
        type: String
    }
})

User.statics.filterUser = (user) => {
	const { password, __v, ...returnUser } = user._doc // exludes password and version
	return returnUser
}

module.exports = mongoose.model('User', User)