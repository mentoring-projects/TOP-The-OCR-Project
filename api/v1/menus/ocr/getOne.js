const DBClient = require('../../../lib/DBClient');

const httpStatus = require('../../../lib/http-status-codes');
const errorMessages = require('../../../lib/error-messages');


module.exports = (req, res, next) => {

    let docId = req.params.id;
    let index = req.params.index;

    // Uploading to box and saving to db
    let dbInstance = new DBClient('menus');

    dbInstance.getById(docId)
        .then((dbEntry) => {
            const ocrLen = dbEntry.ocr ? dbEntry.ocr.length : 0;
            if (ocrLen <= index) {
                const err = new Error(errorMessages.OCR_INDEX_OUT_OF_BOUNDS_ERROR(ocrLen));
                err.status = httpStatus.NOT_FOUND
                return next(err);
            }
            return res.status(httpStatus.OK).send(dbEntry.ocr[index]);
        })
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
