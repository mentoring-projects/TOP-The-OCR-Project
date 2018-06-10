const DBClient = require('../../../lib/DBClient');

const httpStatus = require('../../../lib/http-status-codes');
const errorMessages = require('../../../lib/error-messages');


module.exports = (req, res, next) => {

    let docId = req.params.id
    let ocr = req.body

    // Uploading to box and saving to db
    let dbInstance = new DBClient('menus');

    dbInstance.getById(docId)
        .then((dbEntry) => {
            if (!dbEntry.ocr) dbEntry.ocr = [];
            dbEntry.ocr.push(ocr)
            return dbEntry
        })
        .then((dbEntry) => dbInstance.update(dbEntry))
        .then(dbEntry => res.status(httpStatus.OK_CREATED).send(dbEntry))
        .catch((err) => {
            if (err.message === 'missing') {
                err = new Error(errorMessages.DB_DOC_NOT_FOUND(req.params.id));
                err.status = httpStatus.NOT_FOUND;
            } else {
                err = new Error(errorMessages.INTERNAL_SERVER_ERROR());
            }
            return next(err)
        });
};
