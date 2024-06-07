const express = require('express');
const router = express.Router();
const Book = require('../models/book');
const Author = require('../models/author');
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg', 'image/svg', 'image/webp'];

// Route to get the list of books
router.get('/', async (req, res, next) => {
    let query = Book.find();
    if (req.query.title) {
        query = query.regex('title', new RegExp(req.query.title, 'i'));
    }
    if (req.query.publishedBefore) {
        query = query.lte('publishDate', req.query.publishedBefore);
    }
    if (req.query.publishedAfter) {
        query = query.gte('publishDate', req.query.publishedAfter);
    }
    query = query.sort({ createdAt: 'desc' });

    try {
        const books = await query.exec();
        res.render('books/index', {
            books,
            searchOptions: req.query
        });
    } catch (err) {
        next(err);
    }
});

// New Book Route
router.get('/new', async (req, res) => {
    try {
        const authors = await Author.find({});
        const book = new Book();
        res.render('books/new', { authors, book });
    } catch (error) {
        res.redirect('/books');
    }
});

// Create Book Route
router.post('/', async (req, res) => {
    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        description: req.body.description
    });

    saveCover(book, req.body.cover);

    try {
        await book.save();
        res.redirect('/books');
    } catch (error) {
        renderNewPage(res, book, true);
    }
});

// Show Book Route
router.get('/:id', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id).populate('author').exec();
        res.render('books/show', { book });
    } catch (error) {
        console.error(error);
        res.redirect('/books');
    }
});

// Edit Book Route
router.get('/:id/edit', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        renderEditPage(res, book);
    } catch (error) {
        console.error(error);
        res.redirect('/books');
    }
});

// Update Book Route
router.put('/:id', async (req, res) => {
    let book;
    try {
        const book = await Book.findById(req.params.id);
        book.title = req.body.title;
        book.author = req.body.author;
        book.publishDate = new Date(req.body.publishDate);
        book.pageCount = req.body.pageCount;
        book.description = req.body.description;
        if (req.body.cover != null && req.body.cover !== '') {
            saveCover(book, req.body.cover);
        }
        await book.save();
        res.redirect(`/books/${book.id}`);
    } catch (err) {
        if (book != null) {
            renderEditPage(res, book, true);
        } else {
            res.redirect('/');
        }
    }
});

// Delete Book Page
router.delete('/:id', async (req, res) => {
    let book;
    try {
        book = await Book.findById(req.params.id);
        await book.deleteOne(); 
        res.redirect('/books');
    } catch (error) {
        console.error(error);
        if (book != null) {
            res.render('books/show', {
                book,
                errorMessage: 'Could not remove book'
            });
        } else {
            res.redirect('/');
        }
    }
});

async function renderNewPage(res, book, hasError = false) {
    renderFormPage(res, book, 'new', hasError);
}

async function renderEditPage(res, book, hasError = false) {
    renderFormPage(res, book, 'edit', hasError);
}

async function renderFormPage(res, book, form, hasError = false) {
    try {
        const authors = await Author.find({});
        const params = {
            authors,
            book,
            form, // Add the form parameter
        };
        
        if (hasError) {
            if (form === 'edit') {
                params.errorMessage = 'Error Updating Book';
            } else {
                params.errorMessage = 'Error Creating Book';
            }
        }
        res.render(`books/${form}`, params); // Correct the interpolation syntax
    } catch (error) {
        res.redirect('/books');
    }
}


function saveCover(book, coverEncoded) {
    if (coverEncoded == null) return;
    let cover;
    try {
        cover = JSON.parse(coverEncoded);
    } catch (error) {
        console.error("Invalid JSON string provided for cover:", coverEncoded);
        return;
    }
    if (cover != null && imageMimeTypes.includes(cover.type)) {
        book.coverImage = Buffer.from(cover.data, 'base64');
        book.coverImageType = cover.type;
    }
}

// Show Book Route
router.get('/:id', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id).populate('author').exec();
        res.render('books/show', { book });
    } catch (error) {
        res.redirect('/books');
    }
});

module.exports = router;
