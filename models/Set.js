const mongoose = require('mongoose')

const Set = mongoose.Schema({
    
    time_stamp:{ type: Date, default: Date.now },
    
    exercise:{ type: mongoose.Schema.Types.ObjectId, ref: 'Exercise', required: true },
    
    weight:{ type: Number },
    
    reps:{ type: Number },
    
    workout:{ type: mongoose.Schema.Types.ObjectId, ref: 'Workout', required: true },
    
    user:{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    set_group:{ type: mongoose.Schema.Types.ObjectId, ref: 'SetGroup' },

    tags:[{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }]
    
})

module.exports = mongoose.model('Set', Set)
