const mongoose = require('mongoose')

const Exercise = mongoose.Schema({
    
    name:{ type: String, required: true },

    type:{ type: String, enum: ['barbell', 'weight', 'bodyweight', 'dumbbell',], required: true },

    track_per_side:{ type: Boolean, default: false },

    weight_input:{ type: String, enum: ['plates', 'value'] },
    
    user:{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    tags:[{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }]
    
})

module.exports = mongoose.model('Exercise', Exercise)
