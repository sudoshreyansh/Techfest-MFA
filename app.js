require('dotenv').config();

const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.set('etag', false);
app.use(bodyParser.json());

const router = require('./routes/auth');
app.use('/api/', router);

app.listen(process.env.PORT, () => console.log(`Listening on port ${process.env.PORT}`));