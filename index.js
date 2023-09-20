// NODE_ENV = "production";

import {createRequire} from "module";
import path from 'path';
import { fileURLToPath } from 'url';
const require = createRequire(import.meta.url);

if(process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

import ExpressError from "./ExpressError.js";
import { campgroundRouter } from "./routes/campgrounds.js";
import { reviewRouter } from "./routes/reviews.js";
import { userRouter } from "./routes/users.js";
import User from "./models/users.js";

const express = require('express');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const MongoStore = require('connect-mongo');

const dbUrl = process.env.DB_URL;
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 'mongodb://127.0.0.1:27017/yelp-camp'
mongoose.connect(dbUrl)
    .then(() => {
        console.log("MONGO CONNECTED SUCCESSFULLY");
    })
    .catch(() => {
        console.log("ERROR IN CONNECTION");
    })

const store = MongoStore.create({
    mongoUrl : dbUrl,
    touchAfter : 24*60*60,
    crypto : {
        secret : process.env.SESSION_SECRET
    }
});

const sessionConfig = {
    store,
    name : 'session',
    secret : process.env.SESSION_SECRET,
    resave : false,
    saveUninitialized : true,
    cookie : {
        httpOnly : true,        
        secure : true,
        expires : Date.now() + 1000*60*60*24*7,
        maxAge : 1000*60*60*24*7
    }
};

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    // "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];

const styleSrcUrls = [
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://cdn.jsdelivr.net",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
    "https://ka-f.fontawesome.com/"
];
const fontSrcUrls = [
    "https://ka-f.fontawesome.com/",
    "https://fonts.gstatic.com/"
];

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.engine('ejs', ejsMate);

app.use(session(sessionConfig));
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dvskfijru/",
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

app.use(flash());
app.use(mongoSanitize({
    replaceWith : '_'
}))

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.use(express.urlencoded({extended : true}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));

app.use('/campgrounds', campgroundRouter);
app.use('/campgrounds/:id/reviews', reviewRouter);
app.use('/', userRouter);

app.get('/', (req, res) => {
    res.render('home');
})

app.all('*', (req, res) => {
    throw new ExpressError('Page not found', 404);
})

app.use((err, req, res, next) => {
    const {message = 'Something went wrong...', statusCode = 500} = err;
    res.status(statusCode).render('error', {err});
})

app.listen(3000, () => {
    console.log("CONNECTION ESTABLISHED AT PORT 3000");
})