require('dotenv').config();

const express = require("express");
const app = express();
const ejs = require("ejs");
const path = require("path");

const expressLayout = require("express-ejs-layouts");
const PORT = process.env.PORT || 3000;
const mongoose = require("mongoose");
const session = require('express-session');
const flash = require('express-flash');
const passport = require('passport')
const MongoDbStore = require('connect-mongo')(session);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_CONNECTION_URL || "mongodb://127.0.0.1:27017/pizza", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false
});

const connection = mongoose.connection;

connection.on("error", (err) => {
  console.error("MongoDB connection failed:", err);
});

connection.once("open", () => {
  console.log("Database connected...");
});

let mongoStore = new MongoDbStore({
  mongooseConnection: connection,
  collection: 'sessions'
});

// Session config
app.use(session({
  secret: process.env.COOKIE_SECRET || 'your-secret-key', // Provide a default value if not set
  resave: false,
  saveUninitialized: false,
  store: mongoStore,
  cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));
const passportInit = require('./app/config/passport')
passportInit(passport)
app.use(passport.initialize())
app.use(passport.session())

app.use(flash())
// Assets
app.use(express.static('public'))
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

// Global middleware
app.use((req, res, next) => {
    res.locals.session = req.session
    res.locals.user = req.user
    next()
})
// Global middleware
app.use((req, res, next) => {
  res.locals.session = req.session;
  res.locals.user = req.user; // Assuming you have user authentication middleware
  next();
});

app.use(flash());
app.use(expressLayout);
app.set("views", path.join(__dirname, "/resources/views"));
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Require and configure routes
require("./routes/web")(app);

app.listen(PORT, () => {
  console.log(`Listening on port number ${PORT}`);
});
