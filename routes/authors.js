const express = require('express');
const router = express.Router();
const Author = require('../models/author');

// All Authors Route
router.get('/', async (req, res) => {
    let searchOptions = {};
    if (req.query.name != null && req.query.name !== '') {
        searchOptions.name = new RegExp(req.query.name, 'i');
    }
    try {
        const authors = await Author.find(searchOptions);
        res.render('authors/index', {
            authors: authors,
            searchOptions: req.query // Passing search options to template
        });
    } catch (err) {
        console.error(err);
        res.render('authors/index', {
            authors: [],
            searchOptions: req.query,
            errorMessage: 'Error finding authors'
        });
    }
});

// New Author Route
router.get('/new', (req, res) => {
    res.render('authors/new', { author: new Author() });
});

// Create Author Route
router.post('/', async (req, res) => {
    const author = new Author({
        name: req.body.name // Assuming you're expecting a 'name' field in the request body
    });
    try {
        const newAuthor = await author.save();
        res.redirect(`/authors/new`);
    } catch (err) {
        console.error(err);
        res.render('authors/new', {
            author: author,
            errorMessage: 'Error creating Author'
        });
    }
});

module.exports = router;
