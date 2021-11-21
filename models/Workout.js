const mongoose = require('mongoose')

const Workout = mongoose.Schema({
    
    start_time:{ type: Date, default: Date.now },
    
    end_time:{ type: Date },
    
    sets:[{ type: mongoose.Schema.Types.ObjectId, ref: 'Set' }],
    
    user:{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
    
})

module.exports = mongoose.model('Workout', Workout)
