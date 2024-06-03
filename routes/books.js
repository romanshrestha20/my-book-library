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

async function renderNewPage(res, book, hasError = false) {
    try {
        const authors = await Author.find({});
        const params = { authors, book };
        if (hasError) params.errorMessage = 'Error Creating Book';
        res.render('books/new', params);
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

module.exports = router;
