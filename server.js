require('dotenv').config();
const express = require('express'),
    api = require('./api'),
    bodyParser = require('body-parser'),
    morgan = require('morgan');
    
const app = express();
app.use(express.static("public"));
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Configuring API routes
app.use('/api', api);

app.listen(process.env.PORT, () => console.log(`Server listening at port ${process.env.PORT}`));
