const ocr = require('express').Router({mergeParams: true});
const bodyParser = require('body-parser');
const textParser = bodyParser.text();

const getLast = require('./getLast');
const getOne = require('./getOne');
const size = require('./size');
const create = require('./create');

// If query string is present, we redirect it to another end-point
ocr.get('/', getLast);
ocr.get('/size', size);
ocr.get('/:index', getOne);
ocr.post('/', textParser, create);

module.exports = ocr;
