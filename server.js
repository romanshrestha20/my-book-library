if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();

}
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

// Increase the limit to handle larger files
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

const expressLayouts = require('express-ejs-layouts');
const ejs = require('ejs');

const indexRouter = require('./routes/routes');
const authorRouter = require('./routes/authors');
const bookRouter = require('./routes/books');

// Database
const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true });
const DB = mongoose.connection;
DB.on('error', (error) => console.error(error));
DB.once('open', () => console.log('Connected to Mongoose'));

// Middleware
app.use(express.json());



app.set('view engine', 'ejs');
app.set('views', __dirname + '/public/views');
app.set('layout', 'layouts/layout');
app.use(expressLayouts); 
const port = process.env.PORT || 3003;

app.use(bodyParser.urlencoded({limit:'10mb',extended:true}))
// Routes
app.use(indexRouter)
app.use('/authors',authorRouter)
app.use('/books',bookRouter)
app.use(express.static('public'));


app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
    }
);
