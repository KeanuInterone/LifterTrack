const mongoose = require('mongoose')

const SetGroup = mongoose.Schema({
    
    workout:{ type: mongoose.Schema.Types.ObjectId, ref: 'Workout', require: true },
    
    user:{ type: mongoose.Schema.Types.ObjectId, ref: 'User', require: true },
    
    sets:[{ type: mongoose.Schema.Types.ObjectId, ref: 'Set' }],

    tags:[{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }]
    
})

module.exports = mongoose.model('SetGroup', SetGroup)
