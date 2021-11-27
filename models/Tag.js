const mongoose = require('mongoose')

const Tag = mongoose.Schema({
    
    name:{ type: String, required: true },
    
    user:{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
    
})

module.exports = mongoose.model('Tag', Tag)
