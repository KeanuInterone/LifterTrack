const mongoose = require('mongoose')

const Exercise = mongoose.Schema({
    
    name:{ type: String, required: true },

    type:{ type:String, enum: ['barbell', 'weight', 'weights', 'value', 'bodyweight'], required: true },
    
    user:{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    tags:[{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }]
    
})

module.exports = mongoose.model('Exercise', Exercise)
