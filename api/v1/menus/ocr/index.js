const ocr = require('express').Router();

const getLast = require('./getLast');
const getOne = require('./getOne');
const size = require('./size');
const create = require('./create');

// If query string is present, we redirect it to another end-point
ocr.get('/', getLast);
ocr.get('/size', size);
ocr.get('/:id', getOne);
ocr.post('/', create);

module.exports = ocr;
