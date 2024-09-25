if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const methodOverride = require("method-override");
const expressLayouts = require("express-ejs-layouts");
const mongoose = require("mongoose");

// Middleware for method override
app.use(methodOverride("_method"));

// Increase the limit to handle larger files
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// View engine setup
app.set("view engine", "ejs");
app.set("views", __dirname + "/public/views");
app.set("layout", "layouts/layout");
app.use(expressLayouts);

// Routes
const indexRouter = require("./routes/routes");
const authorRouter = require("./routes/authors");
const bookRouter = require("./routes/books");

// Static assets
app.use(express.static("public"));

// Database connection
mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("Error connecting to MongoDB:", error));

// Routes middleware
app.use("/", indexRouter);
app.use("/authors", authorRouter);
app.use("/books", bookRouter);

// Server setup
const port = process.env.PORT || 3003;
app.listen(port, () => {
  console.log(`My Book Library app is running at http://localhost:${port}`);
});
