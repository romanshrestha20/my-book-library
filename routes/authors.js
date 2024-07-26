const express = require('express');
const router = express.Router();
const Author = require('../models/author');
const Book = require('../models/book');

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
        res.redirect(`/authors/${newAuthor.id}`);
    } catch (err) {
        console.error(err);
        res.render('authors/new', {
            author: author,
            errorMessage: 'Error creating Author'
        });
    }
});

router.get('/:id', async (req, res) => {
    // res.send('Show Author ' + req.params.id);
    try {
        const author = await Author.findById(req.params.id);
        const books = await Book.find({ author: author.id }).limit(6).exec();
        res.render('authors/show', { 
            author: author,
             booksByAuthor: books

        });
    } catch (err) {
        console.error(err);
        res.redirect('/authors');
    }
});

// Edit Author Route
router.get('/:id/edit', async (req, res) => {
    // res.send('Edit Author ' + req.params.id);
    try {
        const author = await Author.findById(req.params.id);
        res.render('authors/edit', { author: author });
    } catch (err) {
        console.error(err);
        res.redirect('/authors');
    }
}
);

router.put('/:id', async (req, res) => {
    let author;
    try {
        const author = await Author.findById(req.params.id);
        author.name = req.body.name;
        await author.save();
        res.redirect(`/authors/${author.id}`);
    } catch (err) {
        if (author == null) {
            res.redirect('/');
        } else {
            console.error(err);
            res.render('authors/edit', {
                author: author,
                errorMessage: 'Error updating Author'
            });
        }
    }
});

// Delete Author Route
router.delete('/:id', async (req, res) => {
    try {
        // Find the author by ID
        const author = await Author.findById(req.params.id);
        if (!author) {
            return res.redirect('/authors');
        }

        // Delete all books associated with the author
        await Book.deleteMany({ author: author.id });

        // Delete the author
        await Author.findByIdAndDelete(req.params.id);

        // Redirect to authors list
        res.redirect('/authors');
    } catch (err) {
        console.error(err);
        res.redirect('/');
    }
});


module.exports = router;
