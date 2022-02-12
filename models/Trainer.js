const mongoose = require('mongoose')

const Trainer = mongoose.Schema({
    
    user:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    
    clients:[{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
    
})

module.exports = mongoose.model('Trainer', Trainer)
