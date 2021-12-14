require('dotenv').config();

const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI);

app.set('etag', false);
app.use(bodyParser.json());

const router = require('./routes/auth');
app.use('/api/', router);

app.listen(process.env.PORT, () => console.log(`Listening on port ${process.env.PORT}`));