const mongoose = require('mongoose');

// create a sceheme for the author
const authorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Author', authorSchema);
// Path: models/book.js