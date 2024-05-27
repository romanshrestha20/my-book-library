const express = require('express');
const router = express.Router();
const path = require('path');
const Book = require('../models/book');
const Author = require('../models/author');
const multer = require('multer');
const fs = require('fs');

// Set the path for the uploaded book cover images
const uploadPath = path.join('public', Book.coverImageBasePath);
const imageMimeTypes = ['image/jpeg', 'image/png', 'images/gif', 'image/jpg', 'image/svg', 'image/webp'];
const upload = multer({
    dest: uploadPath,
    fileFilter: (req, file, callback) => {
        callback(null, imageMimeTypes.includes(file.mimetype));
    }
});

// Route to get the list of books
router.get('/', async (req, res, next) => {
    let query = Book.find();
    // Check if the title field is not empty
    if (req.query.title != null && req.query.title !== '') {
        // Use regex to search for the title in the database
      query = query.regex('title', new RegExp(req.query.title, 'i'));
    }
    // Check if the publishedBefore and publishedAfter fields are not empty
    if (req.query.publishedBefore != null && req.query.publishedBefore !== '') {
        // Use the lte (less than or equal to) method to search for books published before the specified date
      query = query.lte('publishDate', req.query.publishedBefore);
    }
    if (req.query.publishedAfter != null && req.query.publishedAfter !== '') {
        // Use the gte (greater than or equal to) method to search for books published after the specified date
        query = query.gte('publishDate', req.query.publishedAfter);
    }

    query = query.sort({ createdAt: 'desc' });
    try {
      const books = await query.exec(); // Fetch books from the database
      res.render('books/index', { books,
        searchOptions : req.query
       }); // Pass books to the EJS template
    } catch (err) {
      next(err); // Use next to pass errors to the error handler middleware
    }
  });
// New Book Route
router.get('/new', async (req, res) => {
    try {
        const authors = await Author.find({});
        const book = new Book();
        res.render('books/new', { authors: authors, book: book });
    } catch (error) {
        res.redirect('/books');
    }
});

// Create Book Route
router.post('/', upload.single('cover'), async (req, res) => {
    const fileName = req.file != null ? req.file.filename : null;
    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        coverImageName: fileName,
        description: req.body.description
    });
    try {
        const newBook = await book.save();
        res.redirect('/books');
        // res.redirect(`/books/${newBook.id}`);
    } catch (error) {
        if (book.coverImageName != null) {
            removeBookCover(book.coverImageName);
        }
        renderNewPage(res, book, true);
    }
});

// Remove Book Cover
function removeBookCover(fileName) {
    fs.unlink(path.join(uploadPath, fileName), err => {
        if (err) console.error(err);
    });
}


// 
async function renderNewPage(res, book, hasError = false) {
    try {
        const authors = await Author.find({});
        const params = {
            authors: authors,
            book: book
        }
        if (hasError) params.errorMessage = 'Error Creating Book';
        res.render('books/new', params);

    } catch (error) {
        res.redirect('/books');
    }
}

module.exports = router;