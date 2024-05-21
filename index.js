if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();

}
const express = require('express');
const app = express();


const expressLayouts = require('express-ejs-layouts');
const ejs = require('ejs');
const indexRouter = require('./routes/routes');

const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true });
const DB = mongoose.connection;
DB.on('error', (error) => console.error(error));
DB.once('open', () => console.log('Connected to Mongoose'));
app.use(express.json());



app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.set('layout', 'layouts/layout');
app.use(expressLayouts); 
app.use(express.static('public')); // Static files
const port = process.env.PORT || 3000;

app.use('/', indexRouter);



app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
    }
);