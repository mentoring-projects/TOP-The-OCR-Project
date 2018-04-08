const httpStatus = require('../../lib/http-status-codes');

const menus = require('express').Router();

const getAll = require('./getAll');
const getOne = require('./getOne');
const slice = require('./slice');
const create = require('./create');
const del = require('./delete');

const ocr = require('./ocr');

// If query string is present, we redirect it to another end-point
menus.get('/', (req, res) => {
    if (req.query.from || req.query.size) return slice(req, res);
    return getAll(req, res);
});
menus.get('/:id', getOne);
menus.post('/', create);
menus.delete('/:id', del);
menus.use('/:id/ocr', ocr);

// Error Handler for menus
menus.use(function (err, req, res, next) {
    console.log(err.stack);
    res.status(err.status || httpStatus.INTERNAL_SERVER_ERROR).send(err.message);
});

module.exports = menus;
