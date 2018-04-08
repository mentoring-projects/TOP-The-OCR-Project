// File upload configurations
const MulterConfig = require('../../lib/MulterConfig');
const upload = new MulterConfig('menus');

const httpStatus = require('../../lib/http-status-codes');

const menus = require('express').Router();

const getAll = require('./getAll');
const getOne = require('./getOne');
const slice = require('./slice');
const create = require('./create');
const del = require('./delete');

const ocr = require('./ocr');

// If query string is present, we redirect it to another end-point
menus.get('/', (req, res, next) => {
    if (req.query.from || req.query.size) return slice(req, res, next);
    return getAll(req, res, next);
});
menus.get('/:id', getOne);
menus.post('/', upload.single('file'), create);
menus.delete('/:id', del);
menus.use('/:id/ocr', ocr);

// Error Handler for menus
menus.use(function (err, req, res, next) {
    /*
        This is not ideal, it's replacing the busboy error when a file is too large.
        I couldn't find another way to send the error I wanted when this happened.
        We should think about improving it later on.
    */
    if (err.code === 'LIMIT_FILE_SIZE') {
        err.message += `, maximum file size: ${upload.limits.fileSize/1024/1024}MB`;
        err.status = httpStatus.BAD_REQUEST;
    }

    console.log(err.stack);
    res.status(err.status || httpStatus.INTERNAL_SERVER_ERROR).send(err.message);
});

module.exports = menus;
