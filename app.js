require('dotenv').config();

const express = require('express');
const app = express();
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);

const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI);

const store = new MongoDBStore({
    uri: process.env.MONGODB_URI,
    collection: 'sessions'
});

store.on('error', err => {
    console.log(err);
});

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('etag', false);

app.use(session({
    secret: process.env.SESSION_SECRET,
    cookie: {
        sameSite: 'lax',
        httpOnly: true,
        expires: 1*24*60*60*1000
    },
    store: store,
    resave: false,
    saveUninitialized: false
}));

const authRouter = require('./routes/auth');
const globalRouter = require('./routes/global');
const oidc = require('./routes/oidc');

app.use(oidc.router);
app.use(authRouter);

app.get('/test', (req, res) => {
    res.sendFile('./views/index.html', {
        root: '.'
    });
});
app.use(globalRouter);

oidc.on('error', err => {
    console.log(err);
});

oidc.on('ready', () => {
    app.listen(process.env.PORT, () => console.log('Listening on port', process.env.PORT));
});